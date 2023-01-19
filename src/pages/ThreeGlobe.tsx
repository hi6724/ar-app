import React, { useEffect, useRef, useState } from 'react';
import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  MathUtils,
  Matrix4,
  MeshNormalMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import * as THREE from 'three';
import { latLngToVector3, ThreeJSOverlayView } from '@googlemaps/three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import stickMan from '../assets/scene.gltf';

const MAP_OPTION: google.maps.MapOptions = {
  tilt: 30,
  heading: 0,
  zoom: 18,
  center: { lat: 37.4935145, lng: 126.7567966 },
  mapId: 'da92ac680ee5382b',
  disableDefaultUI: true,
  keyboardShortcuts: false,
};

function ThreeGlobe() {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    // window.addEventListener(
    //   'deviceorientationabsolute',
    //   (e: any) => {
    //     compass = 360 - e.alpha;
    //   },
    //   true
    // );

    function initWebglOverlayView(map: any) {
      let scene: any, renderer: any, camera: any, loader: any;

      const webglOverlayView = new google.maps.WebGLOverlayView();
      webglOverlayView.onAdd = () => {
        // Set up the scene.
        scene = new Scene();
        camera = new PerspectiveCamera();

        const ambientLight = new AmbientLight(0xffffff, 0.75); // Soft white light.
        scene.add(ambientLight);
        const directionalLight = new DirectionalLight(0xffffff, 0.25);
        directionalLight.position.set(0.5, -1, 0.5);
        scene.add(directionalLight);

        loader = new GLTFLoader();
        loader.load('/stickman/scene.gltf', (gltf: any) => {
          model = gltf;
          gltf.scene.scale.set(300, 300, 300);
          gltf.scene.rotation.x = Math.PI / 2;
          scene.add(gltf.scene);

          mixer = new THREE.AnimationMixer(gltf.scene);
          const clip = THREE.AnimationClip.findByName(gltf.animations, 'Idle');
          mixer.clipAction(clip).play();
        });

        loader.load('/tree/scene.gltf', (gltf: any) => {
          model = gltf;
          gltf.scene.scale.set(10, 10, 10);
          gltf.scene.rotation.x = Math.PI / 2;
          scene.add(gltf.scene);
        });
      };

      webglOverlayView.onContextRestored = ({ gl }) => {
        renderer = new WebGLRenderer({
          canvas: gl.canvas,
          context: gl,
          ...gl.getContextAttributes(),
        });
        renderer.autoClear = false;
        // Wait to move the camera until the 3D model loads.

        const box = new THREE.Mesh(
          new BoxGeometry(10, 500, 10),
          new MeshNormalMaterial()
        );
        box.position.copy(
          latLngToVector3({ lat: 37.4935145, lng: 126.7567966 })
        );
        scene.add(box);

        loader.manager.onLoad = () => {
          const clock = new THREE.Clock();
          // console.log('hh');

          renderer.setAnimationLoop((e: any) => {
            console.log(compass);
            model.scene.rotation.y = (Math.PI / 180) * compass;

            mixer.update(clock.getDelta());
            if (!MAP_OPTION.center?.lat) return;
            MAP_OPTION.center.lat = Number(MAP_OPTION.center?.lat) + 0.000001;

            // navigator.geolocation.getCurrentPosition(
            //   ({ coords: { latitude, longitude } }) => {
            //     MAP_OPTION.center = { lat: latitude, lng: longitude };
            //   }
            // );

            webglOverlayView.requestRedraw();
          });
        };
      };

      webglOverlayView.onDraw = ({ gl, transformer }) => {
        // center: { lat: 37.4935145, lng: 126.7567966 },

        const latLngAltitudeLiteral: any = {
          lat: MAP_OPTION!.center!.lat,
          lng: MAP_OPTION!.center!.lng,
          altitude: 10,
        };

        const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);

        camera.projectionMatrix = new Matrix4().fromArray(matrix);
        webglOverlayView.requestRedraw();
        renderer.render(scene, camera);
        renderer.resetState();
      };

      webglOverlayView.setMap(map);
    }

    if (ref.current && !map) {
      const temp: any = new google.maps.Map(ref.current, MAP_OPTION);
      const scene = new THREE.Scene();
      const clock = new THREE.Clock();
      let mixer: any;
      new ThreeJSOverlayView({
        scene,
        map: temp,
        THREE,
      });

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
      directionalLight.position.set(0, 10, 50);
      scene.add(directionalLight);

      const loader = new GLTFLoader();
      const url = '/stickman/scene.gltf';
      loader.load(url, (gltf) => {
        gltf.scene.scale.set(100, 100, 100);
        gltf.scene.position.copy(
          latLngToVector3({ lat: 37.4935145, lng: 126.7567966 })
        );
        gltf.scene.position.setY(100);
        mixer = new THREE.AnimationMixer(gltf.scene);
        const clip = THREE.AnimationClip.findByName(gltf.animations, 'Idle');
        mixer.clipAction(clip).play();
        scene.add(gltf.scene);
      });

      let mesh = new THREE.Mesh(
        new THREE.BoxGeometry(10, 200, 10),
        new MeshNormalMaterial()
      );
      [1, 2, 3, 4, 5].forEach((el) => {
        const box = mesh.clone();
        box.position.copy(
          latLngToVector3({ lat: 37.4935145 + el / 1000, lng: 126.7567966 })
        );
        box.position.setY(25);
        scene.add(box);
      });

      const animate = () => {
        mixer?.update(clock.getDelta());
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);

      setMap(temp);
    }
  }, []);

  return (
    <div ref={ref} id='map' style={{ height: '100vh', width: '100vw' }}></div>
  );
}

export default ThreeGlobe;
