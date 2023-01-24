import React, { useEffect, useRef, useState } from 'react';
// foursquare API KEY : fsq3iJar1CJBvm52BcpMK6dUQy28sq0wJiBCtdOPLoY135g=
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import { latLngToVector3Relative } from '@googlemaps/three';
import { DB } from '../db';
import { getDistance } from '../utils/calc';
import { Link } from 'react-router-dom';
// import stickMan from '../assets/scene.gltf';

let CENTER = { lat: 37.493, lng: 126.756 };
const TEST_POS = { lat: 37.493, lng: 126.756 };
const MAP_OPTION: google.maps.MapOptions = {
  tilt: 30,
  heading: 20,
  zoom: 21,
  center: CENTER,
  mapId: 'c93e550b0413e551',
  disableDefaultUI: true,
  keyboardShortcuts: false,
};

function ThreeGlobe() {
  const ref = useRef<HTMLDivElement>(null);
  let compass: any, map: any, userModel: any;
  let locations: any,
    boxes: any = [];

  let mixer: THREE.AnimationMixer,
    webglOverlayView: google.maps.WebGLOverlayView | null,
    scene: THREE.Scene,
    clock: THREE.Clock,
    loader: GLTFLoader,
    renderer: THREE.WebGLRenderer,
    camera: THREE.PerspectiveCamera;

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshNormalMaterial()
  );
  mesh.scale.set(10, 10, 100);
  let isAdded = false;
  let prevPosition = { lat: 0, lng: 0 };

  useEffect(() => {
    function initWebglOverlayView(map: any) {
      if (webglOverlayView === null) return;
      webglOverlayView = new google.maps.WebGLOverlayView();
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
        loader.load('/stickman/scene.gltf', (gltf) => {
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
          clock = new THREE.Clock();
          renderer.setAnimationLoop((e: any) => {
            userModel.rotation.y = (Math.PI * compass) / 180;
            mixer?.update(clock.getDelta());
            if (!MAP_OPTION.center?.lat) return;
          });
        };
      };

      webglOverlayView.onContextRestored = ({ gl }) => {
        renderer = new THREE.WebGLRenderer({
          canvas: gl.canvas,
          context: gl,
          powerPreference: 'low-power',
          ...gl.getContextAttributes(),
        });
        renderer.autoClear = false;
      };

      webglOverlayView.onDraw = async ({ transformer }) => {
        console.log('draw');
        const pos = { ...CENTER, altitude: 0 };
        navigator.geolocation.getCurrentPosition(
          async ({ coords: { latitude, longitude } }) => {
            const distance = getDistance({
              lat1: CENTER.lat,
              lon1: CENTER.lng,
              lat2: latitude,
              lon2: longitude,
            });
            const apiDistance = getDistance({
              lat1: prevPosition.lat,
              lon1: prevPosition.lng,
              lat2: latitude,
              lon2: longitude,
            });
            // 10cm 이상일 때 UI 업데이트
            if (distance > 0.0001) {
              // alert(distance);
              CENTER = { lat: latitude, lng: longitude };
              alert('MOVED!');
            }
            //1km 이상일 때 API 다시 호출
            if (apiDistance > 1) {
              prevPosition = { lat: latitude, lng: longitude };
              const { results } = await (
                await fetch(
                  `https://api.foursquare.com/v3/places/search?ll=${latitude}%2C${longitude}&radius=1000`,
                  {
                    headers: {
                      Authorization:
                        'fsq3iJar1CJBvm52BcpMK6dUQy28sq0wJiBCtdOPLoY135g=',
                    },
                  }
                )
              ).json();
              isAdded = false;
              locations = results;
            }
          }
        );
        if (!isAdded) {
          boxes.forEach(({ box }: any) => {
            const selectedObject = scene.getObjectByName(box.name);
            if (selectedObject) {
              scene.remove(selectedObject);
            }
          });

          locations?.forEach(({ geocodes, fsq_id }: any) => {
            const box = mesh.clone();
            const location = {
              lat: geocodes.main.latitude,
              lng: geocodes.main.longitude,
            };
            boxes.push({ box, location });
            box.name = fsq_id;
            scene.add(box);
          });
          isAdded = true;
        }
        boxes.forEach(({ box, location }: any) => {
          const { x, z } = latLngToVector3Relative(pos, location);
          box.position.set(-x * 0.7934375, z * 0.7934375, 0);
        });

        const matrix = transformer.fromLatLngAltitude(pos);
        camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
        webglOverlayView?.requestRedraw();
        renderer.render(scene, camera);
        renderer.resetState();
      };
      webglOverlayView.onRemove = () => {
        webglOverlayView = null;
      };
      webglOverlayView.setMap(map);
    }

    const handleCompass = (e: any) => (compass = 360 - e.alpha);
    if (!ref.current) return;
    window.addEventListener('deviceorientationabsolute', handleCompass, true);
    map = new google.maps.Map(ref.current, MAP_OPTION);
    initWebglOverlayView(map);
    return () => {
      webglOverlayView?.setMap(null);
      window.removeEventListener('deviceorientationabsolute', handleCompass);
    };
  }, []);
  console.log('hello');
  const handleCenter = () => {
    map.moveCamera({ center: CENTER });
    console.log(CENTER);
  };

  return (
    <>
      <div ref={ref} id='map' style={{ height: '90vh', width: '100vw' }}></div>
      <button onClick={handleCenter}>to Center</button>
      <Link to={'/'}>home</Link>
    </>
  );
}

export default ThreeGlobe;
