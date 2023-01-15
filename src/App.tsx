import { useEffect, useState } from 'react';
import * as THREE from 'three';
// eslint-disable-next-line
import { ARButton } from 'three/examples/jsm/webxr/ARButton';
function App() {
  useEffect(() => {
    let container;
    let camera: any, scene: any, renderer: any;
    let controller;
    let reticle: any;
    let hitTestSource: any = null;
    let hitTestSourceRequested = false;
    let raycaster: any;
    const tempMatrix: any = new THREE.Matrix4();
    let group: any;

    init();
    animate();

    function init() {
      container = document.createElement('div');
      document.body.appendChild(container);

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.01,
        20
      );

      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      light.position.set(0.5, 1, 0.25);
      scene.add(light);

      group = new THREE.Group();
      scene.add(group);

      const geometries = [
        new THREE.BoxGeometry(0.2, 0.2, 0.2),
        new THREE.ConeGeometry(0.2, 0.2, 64),
        new THREE.CylinderGeometry(0.2, 0.2, 0.2, 64),
        new THREE.IcosahedronGeometry(0.2, 8),
        new THREE.TorusGeometry(0.2, 0.04, 64, 32),
      ];

      for (let i = 0; i < 50; i++) {
        const geometry =
          geometries[Math.floor(Math.random() * geometries.length)];
        const material = new THREE.MeshStandardMaterial({
          color: Math.random() * 0xffffff,
          roughness: 0.7,
          metalness: 0.0,
        });

        const object = new THREE.Mesh(geometry, material);

        object.position.x = Math.random() * 4 - 2;
        object.position.y = Math.random() * 4 - 2;
        object.position.z = Math.random() * 4 - 2;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.setScalar(Math.random() + 0.5);

        group.add(object);
      }
      //

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      container.appendChild(renderer.domElement);

      //

      document.body.appendChild(
        ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] })
      );

      //

      const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 32).translate(
        0,
        0.1,
        0
      );

      function onSelect(event: any) {
        const tempController = event.target;
        const intersections = getIntersections(tempController);

        if (intersections.length > 0) {
          const intersection = intersections[0];
          const object = intersection.object;
          const hex = 0xffffff * Math.random();
          object.material.color.setHex(hex);
        } else {
          const material = new THREE.MeshPhongMaterial({
            color: 0xffffff * Math.random(),
          });
          const mesh = new THREE.Mesh(geometry, material);
          reticle.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
          mesh.scale.y = Math.random() * 2 + 1;
          scene.add(mesh);
        }
      }

      function onSelectStart(event: any) {
        const tempController = event.target;

        const intersections = getIntersections(tempController);

        if (intersections.length > 0) {
          const intersection = intersections[0];
          const object = intersection.object;
          object.material.emissive.b = 1;
          tempController.attach(object);

          tempController.userData.selected = object;
        }
      }

      function onSelectEnd(event: any) {
        const tempController = event.target;

        if (tempController.userData.selected !== undefined) {
          const object = tempController.userData.selected;
          object.material.emissive.b = 0;
          group.attach(object);

          tempController.userData.selected = undefined;
        } else {
          const material = new THREE.MeshPhongMaterial({
            color: 0xffffff * Math.random(),
          });
          const mesh = new THREE.Mesh(geometry, material);
          reticle.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
          mesh.scale.y = Math.random() * 2 + 1;
          scene.add(mesh);
        }
      }

      function getIntersections(controller: any) {
        tempMatrix.identity().extractRotation(controller.matrixWorld);

        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

        return raycaster.intersectObjects(group.children, false);
      }

      controller = renderer.xr.getController(0);
      controller.addEventListener('select', onSelect);
      raycaster = new THREE.Raycaster();
      scene.add(controller);

      reticle = new THREE.Mesh(
        new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial()
      );
      reticle.matrixAutoUpdate = false;
      reticle.visible = false;
      scene.add(reticle);

      //

      window.addEventListener('resize', onWindowResize);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    //

    function animate() {
      renderer.setAnimationLoop(render);
    }

    function render(timestamp: any, frame: any) {
      if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (hitTestSourceRequested === false) {
          session
            .requestReferenceSpace('viewer')
            .then(function (referenceSpace: any) {
              session
                .requestHitTestSource({ space: referenceSpace })
                .then(function (source: any) {
                  hitTestSource = source;
                });
            });

          session.addEventListener('end', function () {
            hitTestSourceRequested = false;
            hitTestSource = null;
          });

          hitTestSourceRequested = true;
        }

        if (hitTestSource) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);

          if (hitTestResults.length) {
            const hit = hitTestResults[0];

            reticle.visible = true;
            reticle.matrix.fromArray(
              hit.getPose(referenceSpace).transform.matrix
            );
          } else {
            reticle.visible = false;
          }
        }
      }

      renderer.render(scene, camera);
    }
  }, []);

  return (
    <div id='info'>
      <a href='https://threejs.org' target='_blank' rel='noopener'>
        three.js
      </a>{' '}
      ar - hit test
      <br />
      (Chrome Android 81+)
    </div>
  );
}

export default App;
