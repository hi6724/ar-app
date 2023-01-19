import React, { useEffect, useRef, useState } from 'react';
import {
  AmbientLight,
  DirectionalLight,
  Matrix4,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const MAP_OPTION: google.maps.MapOptions = {
  tilt: 30,
  heading: 0,
  zoom: 18,
  center: { lat: 35.6594945, lng: 139.6999859 },
  mapId: 'da92ac680ee5382b',
  disableDefaultUI: true,
  keyboardShortcuts: false,
};

function ThreeGlobe() {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    let logs = [];
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

        const source =
          'https://raw.githubusercontent.com/googlemaps/js-samples/main/assets/pin.gltf';

        loader.load(source, (gltf: any) => {
          gltf.scene.scale.set(10, 10, 10);
          gltf.scene.rotation.x = Math.PI; // Rotations are in radians.
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

        loader.manager.onLoad = () => {
          renderer.setAnimationLoop((e: any) => {
            navigator.geolocation.getCurrentPosition(
              ({ coords: { latitude, longitude } }) => {
                MAP_OPTION.center = { lat: latitude, lng: longitude };
              }
            );

            webglOverlayView.requestRedraw();
            const { center } = MAP_OPTION;
            map.moveCamera({ center });
          });
        };
      };

      webglOverlayView.onDraw = ({ gl, transformer }) => {
        const latLngAltitudeLiteral: any = {
          lat: MAP_OPTION!.center!.lat,
          lng: MAP_OPTION!.center!.lng,
          altitude: 100,
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
