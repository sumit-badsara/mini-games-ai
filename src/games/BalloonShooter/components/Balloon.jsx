import React, { useRef, useState, forwardRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Colors for balloons with more vibrant options
const COLORS = [
  '#FF4136', // Vibrant Red
  '#00BFFF', // Deep Sky Blue
  '#FFDC00', // Bright Yellow
  '#2ECC40', // Bright Green
  '#B10DC9', // Purple
  '#FF851B', // Orange
  '#F012BE'  // Fuchsia
];

const Balloon = forwardRef(({ position, balloonId, colorIndex }, ref) => {
  const balloonRef = useRef();
  const groupRef = useRef();
  // Use provided colorIndex or choose random if not provided
  const [color] = useState(() => {
    if (colorIndex !== undefined && colorIndex >= 0 && colorIndex < COLORS.length) {
      return COLORS[colorIndex];
    }
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  });
  
  // Rotation settings - we'll keep rotation for visual appeal
  const rotationSpeed = useRef((Math.random() - 0.5) * 0.01);
  
  // Handle proper cleanup of refs when component unmounts
  useEffect(() => {
    return () => {
      if (ref) {
        // Set the ref to null when the component unmounts
        if (typeof ref === 'function') {
          ref(null);
        } else if (ref.current) {
          ref.current = null;
        }
      }
    };
  }, [ref]);
  
  // Expose the mesh ref to parent component
  React.useImperativeHandle(ref, () => ({
    current: balloonRef.current
  }), []);
  
  // Just handle rotation - position updates come from parent
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle rotation
      groupRef.current.rotation.y += rotationSpeed.current;
    }
  });
  
  return (
    <group 
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      userData={{ balloonId }}
    >
      {/* Main balloon body - using sphere for better physics and visuals */}
      <mesh 
        ref={balloonRef} 
        castShadow 
        userData={{ balloonId, type: 'balloon' }}
      >
        {/* Larger balloon with better hit detection */}
        <sphereGeometry args={[1, 16, 16]} /> {/* Reduced geometry complexity for better performance */}
        <meshStandardMaterial 
          color={color}
          roughness={0.2}
          metalness={0.1}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Balloon tie */}
      <mesh position={[0, -1.1, 0]} castShadow userData={{ balloonId, type: 'balloon-part' }}>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Balloon string - simpler geometry */}
      <mesh position={[0, -2, 0]} castShadow userData={{ balloonId, type: 'balloon-part' }}>
        <cylinderGeometry args={[0.02, 0.02, 1.5, 6]} /> {/* Reduced segment count */}
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Balloon highlight - optional, can be removed for performance */}
      <mesh 
        position={[0.4, 0.4, 0.4]} 
        castShadow 
        userData={{ balloonId, type: 'balloon-part' }}
      >
        <sphereGeometry args={[0.15, 8, 8]} /> {/* Reduced geometry complexity */}
        <meshStandardMaterial 
          color="#FFFFFF" 
          opacity={0.6} 
          transparent 
        />
      </mesh>
    </group>
  );
});

export default Balloon; 