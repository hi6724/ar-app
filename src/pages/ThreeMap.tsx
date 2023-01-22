import React, { useEffect, useRef, useState } from 'react';

import * as THREE from 'three';
import { latLngToVector3, ThreeJSOverlayView } from '@googlemaps/three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
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

async function initMap(ref: any) {
  const temp: any = new google.maps.Map(ref, MAP_OPTION);
  const scene = new THREE.Scene();
  const clock = new THREE.Clock();
  let mixer: any;

  const webglOverlayView = new ThreeJSOverlayView({
    scene,
    map: temp,
    THREE,
  });

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
  directionalLight.position.set(0, 10, 50);
  scene.add(directionalLight);
  let mesh = new THREE.Mesh(
    new THREE.BoxGeometry(10, 200, 10),
    new THREE.MeshNormalMaterial()
  );
  const box = mesh.clone();
  box.position.copy(latLngToVector3({ lat: 37.4835, lng: 126.7567 }));
  box.position.setY(25);
  scene.add(box);
  // user 렌더링
  const loader = new GLTFLoader();
  const url = '/stickman/scene.gltf';
  loader.load(url, (gltf) => {
    gltf.scene.scale.set(100, 100, 100);
    mixer = new THREE.AnimationMixer(gltf.scene);
    const clip = THREE.AnimationClip.findByName(gltf.animations, 'Run');
    mixer.clipAction(clip).play();
    gltf.scene.position.copy(latLngToVector3({ lat: 37.4935, lng: 126.7567 }));
    console.log(gltf.scene.position);
    scene.add(gltf.scene);

    const animate = () => {
      mixer?.update(clock.getDelta());
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  });
}

function ThreeMap() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let compass: any;
    window.addEventListener(
      'deviceorientationabsolute',
      (e: any) => {
        compass = 360 - e.alpha;
      },
      true
    );
    initMap(ref.current);
  }, []);

  return (
    <div ref={ref} id='map' style={{ height: '100vh', width: '100vw' }}></div>
  );
}

export default ThreeMap;
