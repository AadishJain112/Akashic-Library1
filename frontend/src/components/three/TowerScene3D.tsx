import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DustParticles } from './DustParticles';

export const TowerScene3D: React.FC = () => {
  const towerRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!towerRef.current) return;
    towerRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
  });

  return (
    <group ref={towerRef}>
      {/* Deep Plum & Midnight Night-watch Lighting */}
      <ambientLight intensity={0.4} color="#3B2A50" />
      <pointLight position={[0, 2, 0]} intensity={1.8} color="#F3D27E" distance={7} />
      <directionalLight position={[-3, 4, -2]} intensity={0.5} color="#6366F1" />

      {/* Tower Chamber Wall & Arched Narrow Window */}
      <mesh position={[0, 0, -3.5]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#1E152A" roughness={0.9} />
      </mesh>

      {/* Tall Slit Window showing Deep Indigo Night Sky */}
      <group position={[0, 1.2, -3.4]}>
        <mesh>
          <planeGeometry args={[0.7, 2.5]} />
          <meshBasicMaterial color="#0F0A1C" />
        </mesh>
        {/* Distant Star */}
        <mesh position={[0.1, 0.4, 0.01]}>
          <circleGeometry args={[0.03, 16]} />
          <meshBasicMaterial color="#E0E7FF" />
        </mesh>
      </group>

      {/* Warden's Heavy Oak Desk */}
      <group position={[0, -0.8, -0.5]}>
        <mesh>
          <boxGeometry args={[3.2, 0.15, 1.6]} />
          <meshStandardMaterial color="#3A2312" roughness={0.7} />
        </mesh>
        {/* Desk Legs */}
        {[-1.4, 1.4].map((x, i) =>
          [-0.6, 0.6].map((z, j) => (
            <mesh key={`${i}-${j}`} position={[x, -0.6, z]}>
              <boxGeometry args={[0.12, 1.1, 0.12]} />
              <meshStandardMaterial color="#241409" roughness={0.8} />
            </mesh>
          ))
        )}
      </group>

      {/* Brass Lantern on Desk */}
      <group position={[-0.9, 0, -0.4]}>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.05, 16]} />
          <meshStandardMaterial color="#E6BC5C" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.3, 16]} />
          <meshBasicMaterial color="#FEF08A" transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.12, 0.1, 16]} />
          <meshStandardMaterial color="#C9972B" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Rolls of Parchment Report Scrolls on Desk */}
      {[-0.2, 0.15, 0.45].map((x, i) => (
        <mesh key={i} position={[x, -0.65, -0.4]} rotation={[0, 0.2 * i, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.55, 16]} />
          <meshStandardMaterial color="#F6EAD3" roughness={0.9} />
        </mesh>
      ))}

      {/* Floating Golden Dust in the Lantern Light */}
      <DustParticles count={35} />
    </group>
  );
};
