import React, { useEffect, useRef, useState } from 'react';
import {
  AmbientLight,
  DirectionalLight,
  Matrix4,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import * as THREE from 'three';
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
    let mixer: any;
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
        // Load the model.

        loader = new GLTFLoader();

        loader.load('/stickman/scene.gltf', (gltf: any) => {
          gltf.scene.scale.set(100, 100, 100);
          gltf.scene.rotation.x = Math.PI / 2;
          scene.add(gltf.scene);

          mixer = new THREE.AnimationMixer(gltf.scene);
          const clip = THREE.AnimationClip.findByName(gltf.animations, 'Idle');
          console.log('Clip', clip);
          const action = mixer.clipAction(clip);
          mixer.clipAction(gltf.animations[1]).play();
          console.log(gltf.animations);
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

        loader.manager.onLoad = () => {
          const clock = new THREE.Clock();
          renderer.setAnimationLoop((e: any) => {
            mixer.update(clock.getDelta());
            if (!MAP_OPTION.center?.lat) return;
            // MAP_OPTION.center.lat = Number(MAP_OPTION.center?.lat) + 0.000001;
            // if (MAP_OPTION.center?.lat) MAP_OPTION?.center?.lat = 0.01;

            navigator.geolocation.getCurrentPosition(
              ({ coords: { latitude, longitude } }) => {
                MAP_OPTION.center = { lat: latitude, lng: longitude };
              }
            );

            webglOverlayView.requestRedraw();
            const { center } = MAP_OPTION;
            // map.moveCamera({ center });
          });
        };
      };

      webglOverlayView.onDraw = ({ gl, transformer }) => {
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
      const temp = new google.maps.Map(ref.current, MAP_OPTION);
      setMap(temp);
      initWebglOverlayView(temp);
    }
  }, []);

  return (
    <div ref={ref} id='map' style={{ height: '100vh', width: '100vw' }}></div>
  );
}

export default ThreeGlobe;
