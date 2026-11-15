import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface Book3DProceduralProps {
  color?: string;
  accentColor?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  autoRotate?: boolean;
}

export const Book3DProcedural: React.FC<Book3DProceduralProps> = ({
  color = '#1F8A70', // emerald
  accentColor = '#E6BC5C', // brass
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Front Cover */}
      <mesh position={[0, 0, 0.12]}>
        <boxGeometry args={[1.5, 2.1, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.65} metalness={0.1} />
      </mesh>

      {/* Back Cover */}
      <mesh position={[0, 0, -0.12]}>
        <boxGeometry args={[1.5, 2.1, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.65} metalness={0.1} />
      </mesh>

      {/* Spine */}
      <mesh position={[-0.73, 0, 0]}>
        <boxGeometry args={[0.04, 2.1, 0.26]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.15} />
      </mesh>

      {/* Gilded Spine Bands */}
      <mesh position={[-0.75, 0.6, 0]}>
        <boxGeometry args={[0.02, 0.06, 0.28]} />
        <meshStandardMaterial color={accentColor} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.75, -0.6, 0]}>
        <boxGeometry args={[0.02, 0.06, 0.28]} />
        <meshStandardMaterial color={accentColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Pages Block (Cream parchment block) */}
      <mesh position={[0.03, 0, 0]}>
        <boxGeometry args={[1.42, 2.0, 0.22]} />
        <meshStandardMaterial color="#F6EAD3" roughness={0.9} />
      </mesh>

      {/* Ribbon Bookmark */}
      <mesh position={[0.2, -1.15, 0]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.08, 0.4, 0.01]} />
        <meshStandardMaterial color="#C2334D" roughness={0.4} />
      </mesh>
    </group>
  );
};
