import React from 'react';
import { usePlane } from '@react-three/cannon';
import * as THREE from 'three';

const Ground = ({ position = [0, 0, 0] }) => {
  // Create a physics plane for the ground
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0], // rotate to be flat
    position: [position[0], position[1], position[2]], // Explicitly set position
    type: 'static', // ground doesn't move
  }));

  // Size of ground grid
  const size = 100;
  const divisions = 100;

  // Create grid helper for visual reference
  const gridHelper = new THREE.GridHelper(size, divisions, '#888888', '#444444');
  
  // Create texture for ground
  const textureLoader = new THREE.TextureLoader();
  const grassTexture = new THREE.MeshStandardMaterial({
    color: '#507D38', // grass green
    roughness: 0.8,
    metalness: 0.2,
  });

  return (
    <group>
      {/* Physics-enabled ground plane */}
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial {...grassTexture} />
      </mesh>
      
      {/* Visual grid for reference */}
      <primitive object={gridHelper} />
      
      {/* Horizon mountains in the distance */}
      <mesh position={[0, 10, -45]} rotation={[0, 0, 0]} receiveShadow>
        <torusGeometry args={[40, 20, 16, 100, Math.PI]} />
        <meshStandardMaterial color="#6b818c" roughness={1} />
      </mesh>
      
      {/* More distant mountains */}
      <mesh position={[-35, 15, -50]} rotation={[0, 0, 0]} receiveShadow>
        <torusGeometry args={[30, 15, 16, 100, Math.PI * 0.8]} />
        <meshStandardMaterial color="#546E7A" roughness={1} />
      </mesh>
      
      <mesh position={[35, 12, -48]} rotation={[0, 0, 0]} receiveShadow>
        <torusGeometry args={[25, 12, 16, 100, Math.PI * 0.7]} />
        <meshStandardMaterial color="#455A64" roughness={1} />
      </mesh>
    </group>
  );
};

export default Ground; 