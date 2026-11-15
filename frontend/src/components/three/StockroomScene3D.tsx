import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const StockroomScene3D: React.FC = () => {
  const stockRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!stockRef.current) return;
    stockRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.12;
  });

  return (
    <group ref={stockRef} position={[0, -0.5, 0]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 3]} intensity={1.2} color="#F3D27E" />

      {/* Stacked Wooden Crates */}
      {/* Base Crate 1 */}
      <group position={[-0.9, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.4, 1.2, 1.4]} />
          <meshStandardMaterial color="#8A5A33" roughness={0.8} />
        </mesh>
        {/* Brass Corner Brackets */}
        <mesh position={[0, 0, 0.71]}>
          <planeGeometry args={[1.3, 1.1]} />
          <meshStandardMaterial color="#B9824A" roughness={0.7} />
        </mesh>
      </group>

      {/* Base Crate 2 */}
      <group position={[0.8, 0, -0.2]}>
        <mesh>
          <boxGeometry args={[1.5, 1.2, 1.4]} />
          <meshStandardMaterial color="#A36F38" roughness={0.8} />
        </mesh>
      </group>

      {/* Top Stacked Crate */}
      <group position={[-0.1, 1.25, 0]} rotation={[0, 0.1, 0]}>
        <mesh>
          <boxGeometry args={[1.3, 1.1, 1.3]} />
          <meshStandardMaterial color="#B9824A" roughness={0.75} />
        </mesh>
        {/* Stencil 'AKASHIC STORE' badge */}
        <mesh position={[0, 0, 0.66]}>
          <planeGeometry args={[0.9, 0.35]} />
          <meshStandardMaterial color="#EBD8B7" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};
