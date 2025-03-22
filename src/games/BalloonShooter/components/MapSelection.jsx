import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import styled from 'styled-components';
import * as THREE from 'three';

// Map previews using simplified versions of the actual map elements
const DesertMapPreview = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Desert base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#D2B48C" />
      </mesh>
      
      {/* Water body */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, -0.9, 2]}>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial color="#4A9AD2" metalness={0.6} roughness={0.2} />
      </mesh>
      
      {/* Add a few palm trees */}
      {[...Array(3)].map((_, i) => {
        const angle = (i / 3) * Math.PI * 2;
        const radius = 3.5;
        const x = 2 + Math.cos(angle) * radius;
        const z = 2 + Math.sin(angle) * radius;
        return (
          <group key={i} position={[x, -1, z]}>
            {/* Tree trunk */}
            <mesh>
              <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Palm leaves */}
            <group position={[0, 1.5, 0]}>
              {[...Array(5)].map((_, j) => {
                const leafAngle = (j / 5) * Math.PI * 2;
                return (
                  <mesh key={j} position={[Math.cos(leafAngle) * 0.8, 0, Math.sin(leafAngle) * 0.8]} rotation={[0.5, 0, leafAngle]}>
                    <boxGeometry args={[1.2, 0.1, 0.3]} />
                    <meshStandardMaterial color="#228B22" />
                  </mesh>
                );
              })}
            </group>
          </group>
        );
      })}
    </group>
  );
};

const MountainMapPreview = () => {
  // Create a simple heightmap for mountains
  const mountainGeometry = new THREE.PlaneGeometry(15, 15, 20, 20);
  
  // Generate heightmap for preview
  const vertices = mountainGeometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const z = vertices[i+2];
    
    // Simple height calculation for preview
    const height = 
      Math.sin(x * 0.5) * Math.sin(z * 0.5) * 0.7 +
      Math.sin(x * 0.25) * Math.sin(z * 0.25) * 0.3;
    vertices[i+1] = height;
  }
  
  return (
    <group position={[0, -0.5, 0]}>
      {/* Mountain terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={mountainGeometry} />
        <meshStandardMaterial color="#5D6D7E" />
      </mesh>
      
      {/* Green overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#2E7D32" transparent opacity={0.6} />
      </mesh>
      
      {/* A few trees */}
      {[...Array(8)].map((_, i) => {
        const x = (Math.random() - 0.5) * 12;
        const z = (Math.random() - 0.5) * 12;
        const height = 1 + Math.random();
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Tree trunk */}
            <mesh>
              <cylinderGeometry args={[0.1, 0.2, height, 8]} />
              <meshStandardMaterial color="#5D4037" />
            </mesh>
            {/* Tree top */}
            <mesh position={[0, height * 0.7, 0]}>
              <coneGeometry args={[0.6, height, 8]} />
              <meshStandardMaterial color="#1B5E20" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const CityMapPreview = () => {
  return (
    <group position={[0, -1, 0]}>
      {/* City Street */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#4b4b4b" />
      </mesh>
      
      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[3, 15]} />
        <meshStandardMaterial color="#606060" />
      </mesh>
      
      {/* Road lines */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -5 + i * 2.5]}>
          <planeGeometry args={[0.1, 1]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      ))}
      
      {/* Buildings - simplified */}
      {[...Array(3)].map((_, i) => {
        const height = 3 + Math.random() * 2;
        return (
          <group key={`left-${i}`} position={[-4 - i * 3, height/2, -3 + i * 3]}>
            <mesh>
              <boxGeometry args={[2, height, 2]} />
              <meshStandardMaterial color={i % 2 === 0 ? "#607D8B" : "#455A64"} />
            </mesh>
          </group>
        );
      })}
      
      {[...Array(3)].map((_, i) => {
        const height = 3 + Math.random() * 2;
        return (
          <group key={`right-${i}`} position={[4 + i * 3, height/2, -3 + i * 3]}>
            <mesh>
              <boxGeometry args={[2, height, 2]} />
              <meshStandardMaterial color={i % 2 === 0 ? "#78909C" : "#546E7A"} />
            </mesh>
          </group>
        );
      })}
      
      {/* Simplified cars */}
      {[...Array(3)].map((_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const posX = side * 1;
        const posZ = -4 + i * 3;
        const carColor = ["#F44336", "#2196F3", "#FFEB3B"][i];
        return (
          <group key={`car-${i}`} position={[posX, 0.3, posZ]}>
            <mesh>
              <boxGeometry args={[0.8, 0.4, 1.5]} />
              <meshStandardMaterial color={carColor} />
            </mesh>
            <mesh position={[0, 0.3, -0.2]}>
              <boxGeometry args={[0.7, 0.3, 0.7]} />
              <meshStandardMaterial color={carColor} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const MapSelection = ({ onSelect, onCancel }) => {
  const [selectedMap, setSelectedMap] = useState('desert');
  const controlsRef = useRef();
  
  // Map data
  const maps = [
    {
      id: 'desert',
      name: 'Desert Oasis',
      description: 'A vast desert landscape with sand dunes and a refreshing oasis in the center.',
      features: ['Sand dunes', 'Water oasis', 'Palm trees'],
      difficulty: 'Easy'
    },
    {
      id: 'mountain',
      name: 'Mountain Forest',
      description: 'Mountainous terrain covered in lush green forests with varied elevation.',
      features: ['Uneven terrain', 'Dense forest', 'Mountain peaks'],
      difficulty: 'Medium'
    },
    {
      id: 'city',
      name: 'Abandoned City',
      description: 'An eerie abandoned city with tall buildings and empty streets.',
      features: ['Urban landscape', 'Abandoned cars', 'Towering buildings'],
      difficulty: 'Hard'
    }
  ];
  
  const handleSelect = (mapId) => {
    setSelectedMap(mapId);
  };
  
  const handleConfirm = () => {
    if (onSelect) {
      onSelect(selectedMap);
    }
  };
  
  return (
    <SelectionContainer>
      <Title>Select Your Battlefield</Title>
      
      <MapsContainer>
        {maps.map(map => (
          <MapCard
            key={map.id}
            onClick={() => handleSelect(map.id)}
            selected={selectedMap === map.id}
          >
            <MapPreview>
              <Canvas camera={{ position: [0, 5, 10], fov: 40 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={0.8} />
                {map.id === 'desert' && <DesertMapPreview />}
                {map.id === 'mountain' && <MountainMapPreview />}
                {map.id === 'city' && <CityMapPreview />}
                <OrbitControls 
                  ref={controlsRef}
                  enableZoom={false}
                  autoRotate
                  autoRotateSpeed={1}
                  minPolarAngle={Math.PI / 6}
                  maxPolarAngle={Math.PI / 2.5}
                />
              </Canvas>
            </MapPreview>
            
            <MapInfo>
              <MapName>{map.name}</MapName>
              <MapDescription>{map.description}</MapDescription>
              
              <FeaturesContainer>
                <FeatureTitle>Features:</FeatureTitle>
                <FeatureList>
                  {map.features.map((feature, index) => (
                    <FeatureItem key={index}>{feature}</FeatureItem>
                  ))}
                </FeatureList>
              </FeaturesContainer>
              
              <DifficultyContainer>
                <DifficultyLabel>Difficulty:</DifficultyLabel>
                <DifficultyValue difficulty={map.difficulty}>{map.difficulty}</DifficultyValue>
              </DifficultyContainer>
            </MapInfo>
          </MapCard>
        ))}
      </MapsContainer>
      
      <ButtonContainer>
        <ConfirmButton onClick={handleConfirm}>
          Confirm Selection
        </ConfirmButton>
        {onCancel && (
          <BackButton onClick={onCancel}>
            Back
          </BackButton>
        )}
      </ButtonContainer>
    </SelectionContainer>
  );
};

// Styled Components
const SelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: white;
`;

const Title = styled.h1`
  font-size: 36px;
  margin-bottom: 30px;
  text-align: center;
  color: #FFFFFF;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
`;

const MapsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  gap: 30px;
  width: 100%;
  margin-bottom: 30px;
`;

const MapCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 500px;
  background-color: rgba(30, 30, 30, 0.8);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  transform: ${props => props.selected ? 'scale(1.05)' : 'scale(1)'};
  box-shadow: ${props => props.selected ? '0 0 20px rgba(255, 255, 255, 0.5)' : '0 0 10px rgba(0, 0, 0, 0.5)'};
  border: ${props => props.selected ? '2px solid #FFFFFF' : '2px solid transparent'};
  cursor: pointer;
  
  &:hover {
    transform: ${props => props.selected ? 'scale(1.05)' : 'scale(1.02)'};
  }
`;

const MapPreview = styled.div`
  width: 100%;
  height: 200px;
`;

const MapInfo = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MapName = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
  color: #FFFFFF;
`;

const MapDescription = styled.p`
  font-size: 14px;
  margin-bottom: 15px;
  color: #CCCCCC;
  flex: 1;
`;

const FeaturesContainer = styled.div`
  margin-bottom: 15px;
`;

const FeatureTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 5px;
  color: #FFFFFF;
`;

const FeatureList = styled.ul`
  margin: 0;
  padding-left: 20px;
`;

const FeatureItem = styled.li`
  font-size: 14px;
  color: #CCCCCC;
`;

const DifficultyContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
`;

const DifficultyLabel = styled.span`
  font-size: 16px;
  margin-right: 10px;
  color: #FFFFFF;
`;

const DifficultyValue = styled.span`
  font-size: 16px;
  font-weight: bold;
  color: ${props => {
    if (props.difficulty === 'Easy') return '#4CAF50';
    if (props.difficulty === 'Medium') return '#FF9800';
    if (props.difficulty === 'Hard') return '#F44336';
    return '#FFFFFF';
  }};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const ConfirmButton = styled.button`
  padding: 15px 30px;
  font-size: 18px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #0D8BF0;
    transform: scale(1.05);
  }
`;

const BackButton = styled.button`
  padding: 15px 30px;
  font-size: 18px;
  background-color: #757575;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #616161;
    transform: scale(1.05);
  }
`;

export default MapSelection; 