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

function ThreeMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  async function initMap() {
    if (!ref.current) return;
    let userModel: any;
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

    // user 렌더링
    const loader = new GLTFLoader();
    const url = '/stickman/scene.gltf';
    loader.load(url, (gltf) => {
      userModel = gltf.scene;
      gltf.scene.scale.set(100, 100, 100);
      gltf.scene.position.copy(
        latLngToVector3({ lat: 37.4935145, lng: 126.7567966 })
      );
      gltf.scene.position.setY(100);
      mixer = new THREE.AnimationMixer(gltf.scene);
      const clip = THREE.AnimationClip.findByName(gltf.animations, 'Run');
      mixer.clipAction(clip).play();
      scene.add(gltf.scene);
    });

    // 빌딩 렌더링

    const treeUrl = '/tree/scene.gltf';
    let treeModel: any;
    treeModel = await loader.loadAsync(treeUrl);

    let mesh = new THREE.Mesh(
      new THREE.BoxGeometry(10, 200, 10),
      new THREE.MeshNormalMaterial()
    );

    [1, 2, 3, 4, 5].forEach((el) => {
      if (treeModel) {
        const box = mesh.clone();
        const tree = SkeletonUtils.clone(treeModel.scene);
        box.position.copy(
          latLngToVector3({ lat: 37.4935145 + el / 1000, lng: 126.7567966 })
        );
        box.position.setY(25);
        scene.add(box);
      }
    });

    let prevPos = { lat: 37.4935145, lng: 126.7567966 };
    const animate = () => {
      mixer?.update(clock.getDelta());
      const newPos = { lat: prevPos.lat - 0.000001, lng: 126.7567966 };
      prevPos = newPos;
      userModel?.position.copy(latLngToVector3(newPos));

      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    setMap(temp);
  }

  useEffect(() => {
    let compass: any;
    window.addEventListener(
      'deviceorientationabsolute',
      (e: any) => {
        compass = 360 - e.alpha;
      },
      true
    );

    if (ref.current && !map) {
      initMap();
    }
  }, []);

  return (
    <div ref={ref} id='map' style={{ height: '100vh', width: '100vw' }}></div>
  );
}

export default ThreeMap;
