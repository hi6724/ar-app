import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import globe from '../assets/globe.jpg';

function ThreeGlobe() {
  const ref = useRef<any>(null);
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      innerWidth / innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(innerWidth, innerHeight);
    ref.current?.appendChild(renderer.domElement);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(5, 50, 50),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(globe),
      })
    );
    scene.add(sphere);
    camera.position.z = 10;
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
  }, []);

  return <div ref={ref}>ThreeGlobe</div>;
}

export default ThreeGlobe;
