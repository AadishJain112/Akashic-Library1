import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Book3DProcedural } from './Book3DProcedural';
import { DustParticles } from './DustParticles';

export const GrandHallScene: React.FC = () => {
  const hallRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!hallRef.current) return;
    // Gentle mouse parallax
    const targetX = state.pointer.x * 0.25;
    const targetY = state.pointer.y * 0.15;
    hallRef.current.rotation.y = THREE.MathUtils.lerp(hallRef.current.rotation.y, targetX, 0.05);
    hallRef.current.rotation.x = THREE.MathUtils.lerp(hallRef.current.rotation.x, -targetY, 0.05);
  });

  // Floating jewel-tone books
  const floatingBooks = [
    { color: '#1F8A70', pos: [-2.2, 0.8, -1] as [number, number, number], rot: [0.2, 0.6, -0.1] as [number, number, number] },
    { color: '#C2334D', pos: [2.4, 0.4, -0.5] as [number, number, number], rot: [-0.15, -0.7, 0.2] as [number, number, number] },
    { color: '#2F5DA8', pos: [-1.4, -1.2, 0.5] as [number, number, number], rot: [0.3, 0.4, 0.1] as [number, number, number] },
    { color: '#7A4FB5', pos: [1.8, -0.9, 0.2] as [number, number, number], rot: [-0.2, -0.5, -0.1] as [number, number, number] },
    { color: '#C97716', pos: [0, 1.6, -1.8] as [number, number, number], rot: [0.1, 0.2, 0.3] as [number, number, number] },
  ];

  return (
    <group ref={hallRef}>
      {/* Warm Ambient & Spotlights */}
      <ambientLight intensity={0.7} color="#FFFDF7" />
      <directionalLight position={[5, 8, 4]} intensity={1.2} color="#F3D27E" />
      <pointLight position={[0, 4, -2]} intensity={0.8} color="#E6BC5C" />

      {/* Indigo Skylight Oculus (Allowed dark celestial accent) */}
      <mesh position={[0, 4.5, -3]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 2.4, 32]} />
        <meshBasicMaterial color="#1E152A" side={THREE.DoubleSide} />
      </mesh>
      {/* Skylight Stars Dot */}
      <mesh position={[0, 4.52, -3]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.18, 32]} />
        <meshBasicMaterial color="#120D20" />
      </mesh>

      {/* Grand Arch Windows in Background */}
      <group position={[0, 0, -4.5]}>
        {/* Warm wall */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[14, 8]} />
          <meshStandardMaterial color="#EBD8B7" roughness={0.9} />
        </mesh>
        {/* Arched Window cutouts / glow */}
        {[-3, 0, 3].map((x, i) => (
          <group key={i} position={[x, 1, 0.05]}>
            <mesh position={[0, 0, 0]}>
              <planeGeometry args={[1.6, 3]} />
              <meshBasicMaterial color="#BAE6FD" transparent opacity={0.35} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <circleGeometry args={[0.8, 16, 0, Math.PI]} />
              <meshBasicMaterial color="#BAE6FD" transparent opacity={0.35} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Bookcase Wings (Left & Right) */}
      <group position={[-4, 0, -1.5]} rotation={[0, 0.3, 0]}>
        <mesh>
          <boxGeometry args={[0.5, 6, 3]} />
          <meshStandardMaterial color="#8A5A33" roughness={0.7} />
        </mesh>
      </group>
      <group position={[4, 0, -1.5]} rotation={[0, -0.3, 0]}>
        <mesh>
          <boxGeometry args={[0.5, 6, 3]} />
          <meshStandardMaterial color="#8A5A33" roughness={0.7} />
        </mesh>
      </group>

      {/* Floating Orbiting Books */}
      {floatingBooks.map((b, i) => (
        <Book3DProcedural
          key={i}
          color={b.color}
          position={b.pos}
          rotation={b.rot}
          scale={0.75}
          autoRotate
        />
      ))}

      {/* Atmospheric Dust Particles */}
      <DustParticles count={75} />
    </group>
  );
};
