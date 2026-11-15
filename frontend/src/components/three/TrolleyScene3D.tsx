import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Book3DProcedural } from './Book3DProcedural';

export const TrolleyScene3D: React.FC<{ itemCount?: number }> = ({ itemCount = 3 }) => {
  const trolleyRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!trolleyRef.current) return;
    trolleyRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.2 + 0.3;
  });

  return (
    <group ref={trolleyRef} position={[0, -0.6, 0]}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 2]} intensity={1.2} color="#F3D27E" />

      {/* Wooden Trolley Shelves & Frame */}
      {/* Upper shelf tray */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2.2, 0.08, 1.2]} />
        <meshStandardMaterial color="#B9824A" roughness={0.6} />
      </mesh>
      {/* Lower shelf tray */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[2.2, 0.08, 1.2]} />
        <meshStandardMaterial color="#8A5A33" roughness={0.6} />
      </mesh>

      {/* Brass Rails and Upright Handles */}
      {[-1.05, 1.05].map((x, i) => (
        <group key={i} position={[x, 0.6, 0]}>
          <mesh position={[0, 0, -0.55]}>
            <cylinderGeometry args={[0.03, 0.03, 1.6, 16]} />
            <meshStandardMaterial color="#E6BC5C" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.55]}>
            <cylinderGeometry args={[0.03, 0.03, 1.6, 16]} />
            <meshStandardMaterial color="#E6BC5C" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 1.15, 16]} />
            <meshStandardMaterial color="#E6BC5C" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Trolley Wheels */}
      {[-0.9, 0.9].map((x, i) =>
        [-0.45, 0.45].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, -0.4, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.08, 16]} />
            <meshStandardMaterial color="#5A381B" roughness={0.5} />
          </mesh>
        ))
      )}

      {/* Books Stacked on the Trolley */}
      {itemCount > 0 && (
        <Book3DProcedural
          color="#1F8A70"
          position={[-0.4, 1.05, 0]}
          rotation={[0, 0.1, 0]}
          scale={0.65}
        />
      )}
      {itemCount > 1 && (
        <Book3DProcedural
          color="#C2334D"
          position={[0.2, 1.05, 0.05]}
          rotation={[0, -0.15, 0]}
          scale={0.62}
        />
      )}
      {itemCount > 2 && (
        <Book3DProcedural
          color="#2F5DA8"
          position={[0, 0.15, 0]}
          rotation={[Math.PI / 2, 0, 0.2]}
          scale={0.6}
        />
      )}
    </group>
  );
};
