import React, { useEffect, useRef, useState } from 'react';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import { latLngToVector3Relative } from '@googlemaps/three';
import { DB } from '../db';
// import stickMan from '../assets/scene.gltf';

let CENTER = { lat: 37.493, lng: 126.756 };
const TEST_POS = { lat: 37.493, lng: 126.756 };
const MAP_OPTION: google.maps.MapOptions = {
  tilt: 30,
  heading: 20,
  zoom: 21,
  center: CENTER,
  mapId: 'da92ac680ee5382b',
  disableDefaultUI: true,
  keyboardShortcuts: false,
};

function ThreeGlobe() {
  const ref = useRef<HTMLDivElement>(null);
  let scene: any, compass: any, map: any, userModel: any;

  useEffect(() => {
    let mixer: any;
    function initWebglOverlayView(map: any) {
      let renderer: any, camera: any, loader: any;
      let treeModel: any;
      const webglOverlayView = new google.maps.WebGLOverlayView();
      new google.maps.Marker({
        position: TEST_POS,
        map,
      });

      webglOverlayView.onAdd = async () => {
        // scene 기본
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera();
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75); // Soft white light.
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
        directionalLight.position.set(0.5, -1, 0.5);
        scene.add(directionalLight);

        // 유저 에셋 로드
        loader = new GLTFLoader();
        loader.load('/stickman/scene.gltf', (gltf: any) => {
          userModel = gltf.scene;
          userModel.scale.set(10, 10, 10);
          userModel.rotation.x = Math.PI / 2;
          mixer = new THREE.AnimationMixer(userModel);
          const clip = THREE.AnimationClip.findByName(gltf.animations, 'Run');
          mixer.clipAction(clip).play();
          scene.add(userModel);
        });
        // 애니메이션 추가
        loader.manager.onLoad = () => {
          const clock = new THREE.Clock();
          renderer.setAnimationLoop((e: any) => {
            userModel.rotation.y = (Math.PI * compass) / 180;
            mixer?.update(clock.getDelta());
            if (!MAP_OPTION.center?.lat) return;
            webglOverlayView.requestRedraw();
          });
        };
      };

      webglOverlayView.onContextRestored = ({ gl }) => {
        renderer = new THREE.WebGLRenderer({
          canvas: gl.canvas,
          context: gl,
          ...gl.getContextAttributes(),
        });
        renderer.autoClear = false;
      };

      let isAdded = false;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshNormalMaterial()
      );
      const boxes: any = [];
      mesh.scale.set(30, 30, 30);
      webglOverlayView.onDraw = ({ gl, transformer }) => {
        const pos = { ...CENTER, altitude: 0 };
        navigator.geolocation.getCurrentPosition(
          ({ coords: { latitude, longitude } }) => {
            CENTER = { lat: latitude, lng: longitude };
          }
        );
        if (!isAdded) {
          DB.datas.forEach((location) => {
            const box = mesh.clone();
            boxes.push({ box, location });
            scene.add(box);
          });
          isAdded = true;
        }
        boxes.forEach(({ box, location }: any) => {
          const { x, z } = latLngToVector3Relative(pos, location);
          box.position.set(-x * 0.7934375, z * 0.7934375, 0);
        });
        const { x, z } = latLngToVector3Relative(pos, TEST_POS);
        mesh.position.set(-x * 0.7934375, z * 0.7934375, 0);

        const matrix = transformer.fromLatLngAltitude(pos);

        camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);

        webglOverlayView.requestRedraw();
        renderer.render(scene, camera);
        renderer.resetState();
      };

      webglOverlayView.setMap(map);
    }

    if (!ref.current) return;
    window.addEventListener(
      'deviceorientationabsolute',
      (e: any) => (compass = 360 - e.alpha),
      true
    );
    map = new google.maps.Map(ref.current, MAP_OPTION);
    initWebglOverlayView(map);
  }, []);
  const handleCenter = () => {
    map.moveCamera({ center: CENTER });
  };

  return (
    <>
      <div ref={ref} id='map' style={{ height: '90vh', width: '100vw' }}></div>
      <button onClick={handleCenter}>to Center</button>
    </>
  );
}

export default ThreeGlobe;
