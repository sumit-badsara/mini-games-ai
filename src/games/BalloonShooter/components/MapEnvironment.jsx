import React from 'react';
import { usePlane, useBox } from '@react-three/cannon';
import * as THREE from 'three';

// Desert map with dunes, water body and trees
const DesertMap = () => {
  // Create completely flat base plane
  const baseGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
  
  // Use useMemo to ensure desert elements are generated only once
  const desertAssets = React.useMemo(() => {
    // Generate cacti
    const cacti = Array(30).fill().map((_, i) => {
      const distance = 40 * Math.sqrt(Math.random());
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // Set all cacti at ground level
      const scale = 0.5 + Math.random() * 0.6;
      const cactusType = Math.floor(Math.random() * 2); // 0: Saguaro, 1: Barrel
      
      // Base height offset
      // For Saguaro cactus, the position accounts for the trunk being at y=1
      // For Barrel cactus, the position accounts for the barrel being at y=0.5
      const baseOffset = cactusType === 0 ? 1 : 0.5;
      
      return {
        index: i,
        position: [x, 0, z], // Ground level - completely flat
        scale: [scale, scale * (1 + Math.random() * 0.5), scale],
        rotation: [0, Math.random() * Math.PI * 2, 0],
        cactusType: cactusType,
        baseOffset: baseOffset
      };
    });
    
    // Generate rocks
    const rocks = Array(20).fill().map((_, i) => {
      const distance = 40 * Math.sqrt(Math.random());
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // Set rocks at ground level
      const scale = 0.3 + Math.random() * 0.5;
      return {
        index: i,
        position: [x, 0, z], // Ground level - completely flat
        scale: [scale, scale * 0.6, scale],
        rotation: [Math.random() * 0.3, Math.random() * Math.PI * 2, Math.random() * 0.3]
      };
    });
    
    return {
      cacti,
      rocks
    };
  }, []); // Empty dependency array ensures this runs only once
  
  return (
    <group>
      {/* Completely flat desert ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <primitive object={baseGeometry} />
        <meshStandardMaterial color="#e6c992" roughness={1} />
      </mesh>
      
      {/* Cacti */}
      {desertAssets.cacti.map((cactus) => (
        <group key={`cactus-${cactus.index}`} position={cactus.position} scale={cactus.scale} rotation={cactus.rotation}>
          {cactus.cactusType === 0 ? ( // Saguaro cactus
            <>
              {/* Main trunk - position adjusted to sit on ground */}
              <mesh castShadow position={[0, cactus.baseOffset, 0]}>
                <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
                <meshStandardMaterial color="#2e7d32" roughness={0.8} />
              </mesh>
              
              {/* Left arm */}
              <mesh castShadow position={[-0.2, cactus.baseOffset + 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
                <cylinderGeometry args={[0.15, 0.2, 1, 8]} />
                <meshStandardMaterial color="#2e7d32" roughness={0.8} />
              </mesh>
              
              {/* Right arm */}
              <mesh castShadow position={[0.2, cactus.baseOffset + 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
                <cylinderGeometry args={[0.15, 0.2, 1.2, 8]} />
                <meshStandardMaterial color="#2e7d32" roughness={0.8} />
              </mesh>
            </>
          ) : ( // Barrel cactus
            <mesh castShadow position={[0, cactus.baseOffset, 0]}>
              <cylinderGeometry args={[0.4, 0.5, 1, 10]} />
              <meshStandardMaterial color="#388e3c" roughness={0.8} />
            </mesh>
          )}
        </group>
      ))}
      
      {/* Rocks - placed at ground level */}
      {desertAssets.rocks.map((rock) => (
        <group key={`rock-${rock.index}`} position={rock.position} rotation={rock.rotation}>
          <mesh castShadow receiveShadow position={[0, 0.5 * rock.scale[1], 0]} scale={rock.scale}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#a1887f" roughness={0.9} />
          </mesh>
        </group>
      ))}
      
      {/* Desert boundary walls - solid and visible */}
      <group>
        {/* North wall */}
        <mesh position={[0, 5, -50]} receiveShadow castShadow>
          <boxGeometry args={[100, 10, 1]} />
          <meshStandardMaterial color="#d2b48c" roughness={0.9} />
        </mesh>
        
        {/* South wall */}
        <mesh position={[0, 5, 50]} receiveShadow castShadow>
          <boxGeometry args={[100, 10, 1]} />
          <meshStandardMaterial color="#d2b48c" roughness={0.9} />
        </mesh>
        
        {/* East wall */}
        <mesh position={[50, 5, 0]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 100]} />
          <meshStandardMaterial color="#d2b48c" roughness={0.9} />
        </mesh>
        
        {/* West wall */}
        <mesh position={[-50, 5, 0]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 100]} />
          <meshStandardMaterial color="#d2b48c" roughness={0.9} />
        </mesh>
        
        {/* Wall corners */}
        <mesh position={[-50, 5, -50]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 1]} />
          <meshStandardMaterial color="#d2b48c" roughness={0.9} />
        </mesh>
        <mesh position={[50, 5, -50]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 1]} />
          <meshStandardMaterial color="#d2b48c" roughness={0.9} />
        </mesh>
        <mesh position={[-50, 5, 50]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 1]} />
          <meshStandardMaterial color="#d2b48c" roughness={0.9} />
        </mesh>
        <mesh position={[50, 5, 50]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 1]} />
          <meshStandardMaterial color="#d2b48c" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

// Mountainous landscape with trees and rocks
const MountainMap = () => {
  // Create completely flat base plane
  const baseGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
  
  // Use useMemo to ensure terrain elements are generated only once
  const mountainAssets = React.useMemo(() => {
    // Generate trees
    const trees = Array(40).fill().map((_, i) => {
      const distance = 40 * Math.sqrt(Math.random());
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // Set all trees at ground level
      const scale = 0.8 + Math.random() * 0.5;
      const treeType = Math.floor(Math.random() * 3); // 0: Pine, 1: Oak, 2: Birch
      
      return {
        index: i,
        position: [x, 0, z], // Ground level - completely flat
        scale: [scale, scale, scale],
        rotation: [0, Math.random() * Math.PI * 2, 0],
        treeType: treeType
      };
    });
    
    // Generate rocks
    const rocks = Array(15).fill().map((_, i) => {
      const distance = 40 * Math.sqrt(Math.random());
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // Set rocks at ground level
      const scale = 0.4 + Math.random() * 0.6;
      return {
        index: i,
        position: [x, 0, z], // Ground level - completely flat
        scale: [scale, scale * 0.7, scale],
        rotation: [Math.random() * 0.3, Math.random() * Math.PI * 2, Math.random() * 0.3]
      };
    });
    
    return {
      trees,
      rocks
    };
  }, []); // Empty dependency array ensures this runs only once
  
  return (
    <group>
      {/* Completely flat mountain ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <primitive object={baseGeometry} />
        <meshStandardMaterial color="#5d8a64" roughness={0.8} />
      </mesh>
      
      {/* Trees */}
      {mountainAssets.trees.map((tree) => (
        <group key={`tree-${tree.index}`} position={tree.position} scale={tree.scale} rotation={tree.rotation}>
          {tree.treeType === 0 ? ( // Pine tree
            <>
              {/* Trunk */}
              <mesh castShadow position={[0, 1, 0]}>
                <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
                <meshStandardMaterial color="#5D4037" roughness={0.8} />
              </mesh>
              
              {/* Foliage - cone */}
              <mesh castShadow position={[0, 2.5, 0]}>
                <coneGeometry args={[1, 3, 8]} />
                <meshStandardMaterial color="#2D4F25" roughness={0.8} />
              </mesh>
            </>
          ) : tree.treeType === 1 ? ( // Oak tree
            <>
              {/* Trunk */}
              <mesh castShadow position={[0, 1.2, 0]}>
                <cylinderGeometry args={[0.3, 0.4, 2.4, 8]} />
                <meshStandardMaterial color="#795548" roughness={0.8} />
              </mesh>
              
              {/* Foliage - sphere */}
              <mesh castShadow position={[0, 3, 0]}>
                <sphereGeometry args={[1.3, 8, 8]} />
                <meshStandardMaterial color="#33691E" roughness={0.8} />
              </mesh>
            </>
          ) : ( // Birch tree
            <>
              {/* Trunk */}
              <mesh castShadow position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.2, 0.25, 3, 8]} />
                <meshStandardMaterial color="#E0E0E0" roughness={0.6} />
              </mesh>
              
              {/* Foliage - ellipsoid */}
              <mesh castShadow position={[0, 3.2, 0]}>
                <sphereGeometry args={[1.1, 8, 8]} />
                <meshStandardMaterial color="#7CB342" roughness={0.8} />
              </mesh>
            </>
          )}
        </group>
      ))}
      
      {/* Rocks - placed at ground level */}
      {mountainAssets.rocks.map((rock) => (
        <group key={`rock-${rock.index}`} position={rock.position} rotation={rock.rotation}>
          <mesh castShadow receiveShadow position={[0, 0.5 * rock.scale[1], 0]} scale={rock.scale}>
            <dodecahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color="#757575" roughness={0.9} />
          </mesh>
        </group>
      ))}
      
      {/* Mountain boundary walls */}
      <group>
        {/* North wall */}
        <mesh position={[0, 5, -50]} receiveShadow castShadow>
          <boxGeometry args={[100, 10, 1]} />
          <meshStandardMaterial color="#5d8a64" roughness={0.9} />
        </mesh>
        
        {/* South wall */}
        <mesh position={[0, 5, 50]} receiveShadow castShadow>
          <boxGeometry args={[100, 10, 1]} />
          <meshStandardMaterial color="#5d8a64" roughness={0.9} />
        </mesh>
        
        {/* East wall */}
        <mesh position={[50, 5, 0]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 100]} />
          <meshStandardMaterial color="#5d8a64" roughness={0.9} />
        </mesh>
        
        {/* West wall */}
        <mesh position={[-50, 5, 0]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 100]} />
          <meshStandardMaterial color="#5d8a64" roughness={0.9} />
        </mesh>
        
        {/* Wall corners */}
        <mesh position={[-50, 5, -50]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 1]} />
          <meshStandardMaterial color="#5d8a64" roughness={0.9} />
        </mesh>
        <mesh position={[50, 5, -50]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 1]} />
          <meshStandardMaterial color="#5d8a64" roughness={0.9} />
        </mesh>
        <mesh position={[-50, 5, 50]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 1]} />
          <meshStandardMaterial color="#5d8a64" roughness={0.9} />
        </mesh>
        <mesh position={[50, 5, 50]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 1]} />
          <meshStandardMaterial color="#5d8a64" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

// Abandoned city street with buildings and cars
const CityMap = () => {
  // Create base plane
  const baseGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
  
  // Use useMemo to ensure buildings and cars are generated only once
  const cityAssets = React.useMemo(() => {
    // Generate building data
    const leftBuildings = Array(5).fill().map((_, i) => {
      const height = 10 + Math.random() * 10;
      const width = 10 + Math.random() * 5;
      return {
        index: i,
        height,
        width,
        position: [-20 - i * 15, height/2, -30 + i * 15],
        color: i % 2 === 0 ? "#607D8B" : "#455A64",
        windows: Math.floor(height/3)
      };
    });
    
    const rightBuildings = Array(5).fill().map((_, i) => {
      const height = 10 + Math.random() * 10;
      const width = 10 + Math.random() * 5;
      return {
        index: i,
        height,
        width,
        position: [20 + i * 15, height/2, -30 + i * 15],
        color: i % 2 === 0 ? "#78909C" : "#546E7A",
        windows: Math.floor(height/3)
      };
    });
    
    // Generate building data for the walls
    const northBuildings = Array(6).fill().map((_, i) => {
      const height = 8 + Math.random() * 6;
      const width = 8 + Math.random() * 4;
      const posX = -40 + i * 16;
      return {
        index: i,
        height,
        width,
        position: [posX, height/2, -46],
        color: i % 2 === 0 ? "#607D8B" : "#455A64"
      };
    });
    
    const southBuildings = Array(6).fill().map((_, i) => {
      const height = 8 + Math.random() * 6;
      const width = 8 + Math.random() * 4;
      const posX = -40 + i * 16;
      return {
        index: i,
        height,
        width,
        position: [posX, height/2, 46],
        color: i % 2 === 0 ? "#78909C" : "#546E7A"
      };
    });
    
    const eastBuildings = Array(4).fill().map((_, i) => {
      const height = 8 + Math.random() * 6;
      const width = 8 + Math.random() * 4;
      const posZ = -30 + i * 20;
      return {
        index: i,
        height,
        width,
        position: [46, height/2, posZ],
        color: i % 2 === 0 ? "#607D8B" : "#455A64"
      };
    });
    
    const westBuildings = Array(4).fill().map((_, i) => {
      const height = 8 + Math.random() * 6;
      const width = 8 + Math.random() * 4;
      const posZ = -30 + i * 20;
      return {
        index: i,
        height,
        width,
        position: [-46, height/2, posZ],
        color: i % 2 === 0 ? "#78909C" : "#546E7A"
      };
    });
    
    // Generate car data
    const cars = Array(8).fill().map((_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const posX = side * (3 + Math.random() * 2);
      const posZ = -40 + i * 10;
      const carColors = ["#F44336", "#9C27B0", "#2196F3", "#FFEB3B", "#FF9800"];
      const carColor = carColors[Math.floor(Math.random() * carColors.length)];
      return {
        index: i,
        position: [posX, 0.6, posZ],
        rotation: [0, side === -1 ? Math.PI * 0.1 : Math.PI * -0.1, 0],
        color: carColor
      };
    });
    
    return {
      leftBuildings,
      rightBuildings,
      northBuildings,
      southBuildings,
      eastBuildings,
      westBuildings,
      cars
    };
  }, []); // Empty dependency array ensures this runs only once
  
  return (
    <group>
      {/* City Street base - fully opaque */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <primitive object={baseGeometry} />
        <meshStandardMaterial color="#4b4b4b" roughness={0.8} />
      </mesh>
      
      {/* Road markings */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 100]} />
        <meshStandardMaterial color="#606060" roughness={0.6} />
      </mesh>
      
      {/* Road dashed lines */}
      {[...Array(10)].map((_, i) => (
        <mesh key={i} position={[0, 0.02, -40 + i * 10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[0.5, 3]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>
      ))}
      
      {/* Add sidewalks along the edges */}
      <mesh position={[0, 0.05, -49]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 2]} />
        <meshStandardMaterial color="#555555" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.05, 49]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 2]} />
        <meshStandardMaterial color="#555555" roughness={0.7} />
      </mesh>
      <mesh position={[-49, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2, 100]} />
        <meshStandardMaterial color="#555555" roughness={0.7} />
      </mesh>
      <mesh position={[49, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2, 100]} />
        <meshStandardMaterial color="#555555" roughness={0.7} />
      </mesh>
      
      {/* Buildings - Left side */}
      {cityAssets.leftBuildings.map((building) => (
        <group key={`left-${building.index}`} position={building.position}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[building.width, building.height, building.width]} />
            <meshStandardMaterial color={building.color} roughness={0.7} />
          </mesh>
          {/* Windows */}
          {[...Array(building.windows)].map((_, j) => (
            <mesh key={`left-window-${building.index}-${j}`} position={[0, -building.height/2 + 3 + j * 3, building.width/2 + 0.1]} castShadow>
              <planeGeometry args={[building.width * 0.7, 1.5]} />
              <meshStandardMaterial color="#212121" roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Buildings - Right side */}
      {cityAssets.rightBuildings.map((building) => (
        <group key={`right-${building.index}`} position={building.position}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[building.width, building.height, building.width]} />
            <meshStandardMaterial color={building.color} roughness={0.7} />
          </mesh>
          {/* Windows */}
          {[...Array(building.windows)].map((_, j) => (
            <mesh key={`right-window-${building.index}-${j}`} position={[0, -building.height/2 + 3 + j * 3, building.width/2 + 0.1]} castShadow>
              <planeGeometry args={[building.width * 0.7, 1.5]} />
              <meshStandardMaterial color="#212121" roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Additional buildings along each wall to create a more enclosed city feel */}
      {/* North wall buildings */}
      {cityAssets.northBuildings.map((building) => (
        <group key={`north-${building.index}`} position={building.position}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[building.width, building.height, building.width/2]} />
            <meshStandardMaterial color={building.color} roughness={0.7} />
          </mesh>
        </group>
      ))}
      
      {/* South wall buildings */}
      {cityAssets.southBuildings.map((building) => (
        <group key={`south-${building.index}`} position={building.position}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[building.width, building.height, building.width/2]} />
            <meshStandardMaterial color={building.color} roughness={0.7} />
          </mesh>
        </group>
      ))}
      
      {/* East wall buildings */}
      {cityAssets.eastBuildings.map((building) => (
        <group key={`east-${building.index}`} position={building.position}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[building.width/2, building.height, building.width]} />
            <meshStandardMaterial color={building.color} roughness={0.7} />
          </mesh>
        </group>
      ))}
      
      {/* West wall buildings */}
      {cityAssets.westBuildings.map((building) => (
        <group key={`west-${building.index}`} position={building.position}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[building.width/2, building.height, building.width]} />
            <meshStandardMaterial color={building.color} roughness={0.7} />
          </mesh>
        </group>
      ))}
      
      {/* Abandoned cars */}
      {cityAssets.cars.map((car) => (
        <group key={`car-${car.index}`} position={car.position} rotation={car.rotation}>
          {/* Car body */}
          <mesh castShadow>
            <boxGeometry args={[2, 1, 4]} />
            <meshStandardMaterial color={car.color} roughness={0.7} metalness={0.3} />
          </mesh>
          {/* Car top */}
          <mesh position={[0, 0.7, -0.5]} castShadow>
            <boxGeometry args={[1.8, 0.8, 2]} />
            <meshStandardMaterial color={car.color} roughness={0.7} metalness={0.3} />
          </mesh>
          {/* Wheels */}
          <mesh position={[-1.1, -0.3, 1]} rotation={[Math.PI/2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
            <meshStandardMaterial color="#212121" roughness={0.9} />
          </mesh>
          <mesh position={[1.1, -0.3, 1]} rotation={[Math.PI/2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
            <meshStandardMaterial color="#212121" roughness={0.9} />
          </mesh>
          <mesh position={[-1.1, -0.3, -1]} rotation={[Math.PI/2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
            <meshStandardMaterial color="#212121" roughness={0.9} />
          </mesh>
          <mesh position={[1.1, -0.3, -1]} rotation={[Math.PI/2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
            <meshStandardMaterial color="#212121" roughness={0.9} />
          </mesh>
        </group>
      ))}
      
      {/* City boundary walls - solid and visible */}
      <group>
        {/* North wall */}
        <mesh position={[0, 5, -50]} receiveShadow castShadow>
          <boxGeometry args={[100, 10, 1]} />
          <meshStandardMaterial color="#4b4b4b" roughness={0.9} />
        </mesh>
        {/* South wall */}
        <mesh position={[0, 5, 50]} receiveShadow castShadow>
          <boxGeometry args={[100, 10, 1]} />
          <meshStandardMaterial color="#4b4b4b" roughness={0.9} />
        </mesh>
        {/* East wall */}
        <mesh position={[50, 5, 0]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 100]} />
          <meshStandardMaterial color="#4b4b4b" roughness={0.9} />
        </mesh>
        {/* West wall */}
        <mesh position={[-50, 5, 0]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 100]} />
          <meshStandardMaterial color="#4b4b4b" roughness={0.9} />
        </mesh>
        
        {/* Wall corners */}
        <mesh position={[-50, 5, -50]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 1]} />
          <meshStandardMaterial color="#4b4b4b" roughness={0.9} />
        </mesh>
        <mesh position={[50, 5, -50]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 1]} />
          <meshStandardMaterial color="#4b4b4b" roughness={0.9} />
        </mesh>
        <mesh position={[-50, 5, 50]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 1]} />
          <meshStandardMaterial color="#4b4b4b" roughness={0.9} />
        </mesh>
        <mesh position={[50, 5, 50]} receiveShadow castShadow>
          <boxGeometry args={[1, 10, 1]} />
          <meshStandardMaterial color="#4b4b4b" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

const MapEnvironment = ({ mapType = 'desert', position = [0, 0, 0] }) => {
  // Create physics plane for the ground
  const [ref, api] = usePlane(() => ({
    mass: 0, // Static (immovable) ground
    position: [0, 0, 0], // Flat ground at y=0
    rotation: [-Math.PI / 2, 0, 0], // Face upward
    type: 'Static',
    material: {
      friction: 0, // No friction for smoother movement
      restitution: 0.1 // Slight bounce for better jump feel
    },
    userData: { id: 'ground' }, // Tag to identify in collision callbacks
    onCollide: (e) => {
      // Log ground collisions for debugging
      if (e.body.userData?.isPlayer) {
        console.log("Ground collision detected in MapEnvironment");
      }
    }
  }));

  // Physics boundaries for the map - keep player from falling off edges
  const [northWall, northWallApi] = useBox(() => ({
    args: [100, 10, 2], // Width, height, depth
    position: [0, 5, -50], // North wall
    type: 'Static',
    material: { friction: 0 } // No friction on walls
  }));
  
  const [southWall, southWallApi] = useBox(() => ({
    args: [100, 10, 2],
    position: [0, 5, 50], // South wall
    type: 'Static',
    material: { friction: 0 }
  }));
  
  const [eastWall, eastWallApi] = useBox(() => ({
    args: [2, 10, 100],
    position: [50, 5, 0], // East wall
    type: 'Static',
    material: { friction: 0 }
  }));
  
  const [westWall, westWallApi] = useBox(() => ({
    args: [2, 10, 100],
    position: [-50, 5, 0], // West wall 
    type: 'Static',
    material: { friction: 0 }
  }));
  
  // Corner collision boxes to prevent getting stuck in corners
  const [neCorner, neCornerApi] = useBox(() => ({
    args: [2, 10, 2],
    position: [50, 5, -50], // Northeast corner
    type: 'Static',
    material: { friction: 0 }
  }));
  
  const [nwCorner, nwCornerApi] = useBox(() => ({
    args: [2, 10, 2],
    position: [-50, 5, -50], // Northwest corner
    type: 'Static',
    material: { friction: 0 }
  }));
  
  const [seCorner, seCornerApi] = useBox(() => ({
    args: [2, 10, 2],
    position: [50, 5, 50], // Southeast corner
    type: 'Static',
    material: { friction: 0 }
  }));
  
  const [swCorner, swCornerApi] = useBox(() => ({
    args: [2, 10, 2],
    position: [-50, 5, 50], // Southwest corner
    type: 'Static',
    material: { friction: 0 }
  }));

  return (
    <group>
      {/* Physics plane for collision detection - invisible */}
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} visible={false}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#000000" transparent={false} opacity={1} />
      </mesh>
      
      {/* Physics-enabled boundary walls - these will block the player */}
      <mesh ref={northWall} position={[0, 5, -50]} visible={false}>
        <boxGeometry args={[100, 10, 2]} />
        <meshStandardMaterial color="#000000" transparent={false} opacity={1} />
      </mesh>
      
      <mesh ref={southWall} position={[0, 5, 50]} visible={false}>
        <boxGeometry args={[100, 10, 2]} />
        <meshStandardMaterial color="#000000" transparent={false} opacity={1} />
      </mesh>
      
      <mesh ref={eastWall} position={[50, 5, 0]} visible={false}>
        <boxGeometry args={[2, 10, 100]} />
        <meshStandardMaterial color="#000000" transparent={false} opacity={1} />
      </mesh>
      
      <mesh ref={westWall} position={[-50, 5, 0]} visible={false}>
        <boxGeometry args={[2, 10, 100]} />
        <meshStandardMaterial color="#000000" transparent={false} opacity={1} />
      </mesh>
      
      {/* Corner physics bodies */}
      <mesh ref={neCorner} position={[50, 5, -50]} visible={false}>
        <boxGeometry args={[2, 10, 2]} />
        <meshStandardMaterial color="#000000" transparent={false} opacity={1} />
      </mesh>
      
      <mesh ref={nwCorner} position={[-50, 5, -50]} visible={false}>
        <boxGeometry args={[2, 10, 2]} />
        <meshStandardMaterial color="#000000" transparent={false} opacity={1} />
      </mesh>
      
      <mesh ref={seCorner} position={[50, 5, 50]} visible={false}>
        <boxGeometry args={[2, 10, 2]} />
        <meshStandardMaterial color="#000000" transparent={false} opacity={1} />
      </mesh>
      
      <mesh ref={swCorner} position={[-50, 5, 50]} visible={false}>
        <boxGeometry args={[2, 10, 2]} />
        <meshStandardMaterial color="#000000" transparent={false} opacity={1} />
      </mesh>
      
      {/* Render the selected map environment */}
      {mapType === 'desert' && <DesertMap />}
      {mapType === 'mountain' && <MountainMap />}
      {mapType === 'city' && <CityMap />}
    </group>
  );
};

export default MapEnvironment; 