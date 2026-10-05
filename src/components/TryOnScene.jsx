import { Canvas } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { BONES } from '../utils/constants';
import { normalizedToWorld } from '../utils/coords';
import { smoothKeypoints } from '../utils/smoothing';
import { shoulderMetrics } from '../utils/math';

export default function TryOnScene({ keypoints, stream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !stream) return;
    videoRef.current.srcObject = stream;
    videoRef.current.play().catch(() => {});
  }, [stream]);

  return (
    <>
      <video ref={videoRef} className="tryon-camera-video" autoPlay playsInline muted />
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={1} />
        <SceneContent keypoints={keypoints} />
      </Canvas>
    </>
  );
}

function SceneContent({ keypoints }) {
  const { viewport } = useThree();
  const [smoothing, setSmoothing] = useState({ input: null, output: null });

  const texture = useTexture(`${import.meta.env.BASE_URL}garment.png`);

  if (keypoints && keypoints !== smoothing.input) {
    setSmoothing({
      input: keypoints,
      output: smoothKeypoints(smoothing.output, keypoints)
    });
  }

  const kps = smoothing.output;
  if (!kps) return null;

  const aspect = viewport.width / viewport.height;
  const world = kps.map(k => normalizedToWorld(1 - k.x, k.y, aspect));
  const { center, width, angle } = shoulderMetrics(kps, aspect);
  const garmentWidth = width * 1.7;
  const garmentHeight = garmentWidth * texture.image.height / texture.image.width;

  return (
    <group>
      {/* Joints */}
      {world.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      ))}

      {/* Bones */}
      {BONES.map(([a, b], i) => (
        <line key={i}>
          <bufferGeometry
            onUpdate={g => {
              g.setAttribute('position', new THREE.Float32BufferAttribute(
                [world[a].x, world[a].y, 0, world[b].x, world[b].y, 0], 3
              ));
            }}
          />
          <lineBasicMaterial color="#ffffff" />
        </line>
      ))}

      {/* Garment anchored to shoulders */}
      <mesh
        position={[center.x, center.y - garmentHeight / 4, 0.1]}
        rotation={[0, 0, angle]}
      >
        <planeGeometry args={[garmentWidth, garmentHeight]} />
        <meshBasicMaterial map={texture} transparent depthTest={false} />
      </mesh>
    </group>
  );
}