import React, { Suspense, useState } from "react";
import {
  Interactive,
  XR,
  ARButton,
  Controllers,
  useHitTest,
} from "@react-three/xr";
import { Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Link from "next/link";

function Box({ color, size, scale, children, ...rest }) {
  return (
    <mesh scale={scale} {...rest}>
      <boxBufferGeometry args={size} />
      <meshPhongMaterial color={color} />
      {children}
    </mesh>
  );
}

function Button(props) {
  const [hover, setHover] = useState(false);
  const [color, setColor] = useState("blue");

  const onSelect = () => {
    setColor((Math.random() * 0xffffff) | 0);
  };

  return (
    <Interactive
      onHover={() => setHover(true)}
      onBlur={() => setHover(false)}
      onSelect={onSelect}
    >
      <Box
        color={color}
        scale={hover ? [0.6, 0.6, 0.6] : [0.5, 0.5, 0.5]}
        size={[0.4, 0.1, 0.1]}
        {...props}
      >
        <Suspense fallback={null}>
          <Text
            position={[0, 0, 0.06]}
            fontSize={0.05}
            color="#000"
            anchorX="center"
            anchorY="middle"
          >
            Hello react-xr!
          </Text>
        </Suspense>
      </Box>
    </Interactive>
  );
}

function HitTest() {
  useHitTest((hitMatrix, hitResult) => {
    console.log(hitResult);
  });
  return <></>;
}

const addFlower = (event) => {
  console.log(event);
  console.log(pos);
};

export default function App() {
  return (
    <>
      <Link style={{ fontSize: "2rem", color: "#000" }} href={"hit"}>
        hit-test
      </Link>
      <ARButton />
      <Canvas>
        <XR
          onSessionStart={({ target: session }) => {
            session.addEventListener("select", addFlower);
            session.requestReferenceSpace("local").then((refSpace) => {
              xrRefSpace = refSpace;
            });
          }}
          referenceSpace="local"
        >
          <HitTest />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Button position={[0, 0.1, -0.2]} />
          <Controllers />
        </XR>
      </Canvas>
    </>
  );
}
