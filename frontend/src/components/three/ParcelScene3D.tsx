import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface ParcelScene3DProps {
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';
  isWrapping?: boolean;
}

export const ParcelScene3D: React.FC<ParcelScene3DProps> = ({
  status = 'CONFIRMED',
  paymentStatus = 'PAID',
  isWrapping = false,
}) => {
  const parcelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!parcelRef.current) return;
    if (isWrapping) {
      parcelRef.current.rotation.y += 0.02;
    } else {
      parcelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  const sealColor =
    paymentStatus === 'PAID' ? '#1F8A70' : paymentStatus === 'FAILED' ? '#C2334D' : '#F0A21B';

  return (
    <group ref={parcelRef} position={[0, -0.2, 0]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 3]} intensity={1.2} color="#F3D27E" />

      {/* Main Kraft Paper Box */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.8, 1.2, 1.4]} />
        <meshStandardMaterial color="#D8C096" roughness={0.85} />
      </mesh>

      {/* Twine String (Crossed) */}
      {/* Horizontal string wrap */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.82, 0.06, 1.42]} />
        <meshStandardMaterial color="#8A5A33" roughness={0.9} />
      </mesh>
      {/* Vertical string wrap */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.06, 1.22, 1.42]} />
        <meshStandardMaterial color="#8A5A33" roughness={0.9} />
      </mesh>

      {/* Red/Green Wax Seal Stamp on Top */}
      <group position={[0, 0.62, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 24]} />
          <meshStandardMaterial color={sealColor} roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Seal Monogram */}
        <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 0.16, 16]} />
          <meshStandardMaterial color="#E6BC5C" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Parchment Shipping Tag on twine */}
      <group position={[0.4, 0.61, 0.3]} rotation={[0, 0.3, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 0.3]} />
          <meshStandardMaterial color="#FFFDF7" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};
