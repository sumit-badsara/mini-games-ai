import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// This component renders different gun models based on the gunType prop
const GunModel = ({ gunType = 'pistol', scale = 1 }) => {
  const ref = useRef();
  
  // Memoize materials to prevent recreation
  const materials = useMemo(() => ({
    body: new THREE.MeshStandardMaterial({ color: '#333333', roughness: 0.4, metalness: 0.8 }),
    grip: new THREE.MeshStandardMaterial({ color: '#222222', roughness: 0.7, metalness: 0.3 }),
    barrel: new THREE.MeshStandardMaterial({ color: '#1A1A1A', roughness: 0.3, metalness: 0.9 }),
    handle: new THREE.MeshStandardMaterial({ color: '#2A2A2A', roughness: 0.6, metalness: 0.4 }),
    scope: new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.2, metalness: 0.9 }),
    glass: new THREE.MeshStandardMaterial({ 
      color: '#3A81CC', 
      roughness: 0.1, 
      metalness: 0.9,
      transparent: true,
      opacity: 0.8 
    }),
  }), []);

  // Memoize gun components based on type
  const GunModelComponent = useMemo(() => {
    switch(gunType) {
      case 'pistol':
        return <PistolModel materials={materials} />;
      case 'rifle':
        return <RifleModel materials={materials} />;
      case 'shotgun':
        return <ShotgunModel materials={materials} />;
      default:
        return <PistolModel materials={materials} />;
    }
  }, [gunType, materials]);

  // Remove complex animations that could cause jitter - use only minimal rotation
  useFrame(() => {
    if (!ref.current) return;
    
    // We're removing the hover animation to reduce jitter
    // The position will be handled by the parent Gun component
  });

  return (
    <group 
      ref={ref} 
      scale={scale}
      renderOrder={2} // Higher render order to ensure the gun is drawn on top
    >
      {GunModelComponent}
    </group>
  );
};

// Modern Tactical Pistol Model (inspired by Glock/Desert Eagle)
const PistolModel = ({ materials }) => {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0, 0]} material={materials.body}>
        <boxGeometry args={[0.12, 0.08, 0.25]} />
      </mesh>
      
      {/* Barrel */}
      <mesh position={[0, 0.04, -0.2]} material={materials.barrel}>
        <boxGeometry args={[0.05, 0.05, 0.2]} />
      </mesh>
      
      {/* Handle/Grip */}
      <mesh position={[0, -0.12, 0.06]} rotation={[0.3, 0, 0]} material={materials.grip}>
        <boxGeometry args={[0.1, 0.2, 0.08]} />
      </mesh>
      
      {/* Trigger */}
      <mesh position={[0, -0.02, 0.05]} material={materials.handle}>
        <boxGeometry args={[0.02, 0.04, 0.04]} />
      </mesh>
      
      {/* Sight */}
      <mesh position={[0, 0.09, -0.1]} material={materials.handle}>
        <boxGeometry args={[0.03, 0.02, 0.03]} />
      </mesh>
    </group>
  );
};

// AK-47 Style Assault Rifle
const RifleModel = ({ materials }) => {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0, 0]} material={materials.body}>
        <boxGeometry args={[0.12, 0.08, 0.4]} />
      </mesh>
      
      {/* Barrel */}
      <mesh position={[0, 0.02, -0.32]} material={materials.barrel}>
        <boxGeometry args={[0.05, 0.05, 0.3]} />
      </mesh>
      
      {/* Handle/Grip */}
      <mesh position={[0, -0.12, 0.06]} rotation={[0.3, 0, 0]} material={materials.grip}>
        <boxGeometry args={[0.1, 0.2, 0.08]} />
      </mesh>
      
      {/* Magazine */}
      <mesh position={[0, -0.08, -0.05]} material={materials.grip}>
        <boxGeometry args={[0.08, 0.15, 0.12]} />
      </mesh>
      
      {/* Stock */}
      <mesh position={[0, 0, 0.25]} material={materials.handle}>
        <boxGeometry args={[0.1, 0.08, 0.2]} />
      </mesh>
      
      {/* Sight */}
      <mesh position={[0, 0.09, -0.1]} material={materials.handle}>
        <boxGeometry args={[0.03, 0.03, 0.08]} />
      </mesh>
      
      {/* Handguard */}
      <mesh position={[0, 0, -0.15]} material={materials.handle}>
        <boxGeometry args={[0.11, 0.06, 0.12]} />
      </mesh>
    </group>
  );
};

// AWP-Inspired Sniper Rifle
const ShotgunModel = ({ materials }) => {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0, 0]} material={materials.body}>
        <boxGeometry args={[0.1, 0.1, 0.6]} />
      </mesh>
      
      {/* Barrel (longer for AWP) */}
      <mesh position={[0, 0.02, -0.4]} material={materials.barrel}>
        <boxGeometry args={[0.05, 0.05, 0.4]} />
      </mesh>
      
      {/* Handle/Grip */}
      <mesh position={[0, -0.12, 0.1]} rotation={[0.3, 0, 0]} material={materials.grip}>
        <boxGeometry args={[0.1, 0.2, 0.08]} />
      </mesh>
      
      {/* Stock */}
      <mesh position={[0, 0, 0.35]} material={materials.handle}>
        <boxGeometry args={[0.1, 0.1, 0.18]} />
      </mesh>
      
      {/* Scope */}
      <mesh position={[0, 0.14, -0.1]} material={materials.scope}>
        <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} rotation={[Math.PI / 2, 0, 0]} />
      </mesh>
      
      {/* Scope lenses */}
      <mesh position={[0, 0.14, -0.20]} rotation={[Math.PI / 2, 0, 0]} material={materials.glass}>
        <circleGeometry args={[0.04, 16]} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.glass}>
        <circleGeometry args={[0.04, 16]} />
      </mesh>
      
      {/* Magazine */}
      <mesh position={[0, -0.05, 0]} material={materials.grip}>
        <boxGeometry args={[0.08, 0.1, 0.15]} />
      </mesh>
    </group>
  );
};

export default React.memo(GunModel); 