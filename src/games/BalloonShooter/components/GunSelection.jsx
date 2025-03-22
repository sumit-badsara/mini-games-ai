import React from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Import gun models that will be displayed in the selection screen
import GunModel from './GunModel';

// Styled components for the selection UI
const SelectionContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 20px;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin: 20px 0;
  color: #ff6b6b;
  text-shadow: 2px 2px 0px #000;
  text-align: center;
`;

const GunGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
`;

const GunCard = styled.div`
  width: 250px;
  height: 350px;
  background-color: #1e2a3a;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  ${props => props.selected && `
    border: 3px solid #4CAF50;
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(76, 175, 80, 0.5);
  `}
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
  }
`;

const GunPreview = styled.div`
  height: 180px;
  width: 100%;
  position: relative;
  background-color: #2c3e50;
`;

const GunInfo = styled.div`
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const GunName = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: #4CAF50;
`;

const GunStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatLabel = styled.span`
  font-size: 0.9rem;
  color: #b0bec5;
`;

const StatBar = styled.div`
  height: 8px;
  width: 120px;
  background-color: #2c3e50;
  border-radius: 4px;
  overflow: hidden;
`;

const StatFill = styled.div`
  height: 100%;
  width: ${props => props.value}%;
  background-color: ${props => props.color || '#4CAF50'};
`;

const SelectButton = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 12px 30px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 1.2rem;
  margin: 20px 0;
  cursor: pointer;
  border-radius: 5px;
  font-family: 'Minecraft', 'Press Start 2P', monospace;
  box-shadow: 0px 4px 0px #2E7D32;
  transition: all 0.1s;
  
  &:hover {
    background-color: #43A047;
    transform: translateY(2px);
    box-shadow: 0px 2px 0px #2E7D32;
  }
  
  &:active {
    transform: translateY(4px);
    box-shadow: none;
  }
  
  &:disabled {
    background-color: #757575;
    box-shadow: none;
    cursor: not-allowed;
  }
`;

// Define the guns with their properties
const gunOptions = [
  {
    id: 'pistol',
    name: 'Tactical Pistol',
    description: 'Balanced performance with quick fire rate',
    damage: 60,
    fireRate: 70,
    accuracy: 75,
    recoil: 30,
    color: '#4285F4', // Blue
    model: 'pistol'
  },
  {
    id: 'rifle',
    name: 'AK-47 Assault Rifle',
    description: 'High damage with moderate accuracy',
    damage: 85,
    fireRate: 65,
    accuracy: 75,
    recoil: 70,
    color: '#EA4335', // Red
    model: 'rifle'
  },
  {
    id: 'shotgun',
    name: 'AWP Sniper Rifle',
    description: 'High damage and accuracy with slow fire rate',
    damage: 100,
    fireRate: 20,
    accuracy: 95,
    recoil: 85,
    color: '#1B5E20', // Green
    model: 'shotgun'
  }
];

// Gun preview component that renders the 3D model
const GunPreviewCanvas = ({ gunType }) => {
  return (
    <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <spotLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <GunModel gunType={gunType} />
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.5}
        autoRotate
        autoRotateSpeed={3}
      />
    </Canvas>
  );
};

const GunSelection = ({ onSelect, onCancel }) => {
  const [selectedGun, setSelectedGun] = React.useState(null);

  const handleSelectGun = () => {
    if (selectedGun) {
      onSelect(selectedGun.id);
    }
  };

  return (
    <SelectionContainer>
      <Title>Choose Your Weapon</Title>
      
      <GunGrid>
        {gunOptions.map(gun => (
          <GunCard 
            key={gun.id} 
            selected={selectedGun?.id === gun.id}
            onClick={() => setSelectedGun(gun)}
          >
            <GunPreview>
              <GunPreviewCanvas gunType={gun.model} />
            </GunPreview>
            <GunInfo>
              <GunName>{gun.name}</GunName>
              <p style={{ fontSize: '0.8rem', color: '#78909c', marginBottom: '10px' }}>
                {gun.description}
              </p>
              <GunStats>
                <StatRow>
                  <StatLabel>Damage</StatLabel>
                  <StatBar>
                    <StatFill value={gun.damage} color={gun.color} />
                  </StatBar>
                </StatRow>
                <StatRow>
                  <StatLabel>Fire Rate</StatLabel>
                  <StatBar>
                    <StatFill value={gun.fireRate} color={gun.color} />
                  </StatBar>
                </StatRow>
                <StatRow>
                  <StatLabel>Accuracy</StatLabel>
                  <StatBar>
                    <StatFill value={gun.accuracy} color={gun.color} />
                  </StatBar>
                </StatRow>
                <StatRow>
                  <StatLabel>Recoil</StatLabel>
                  <StatBar>
                    <StatFill value={gun.recoil} color={gun.color} />
                  </StatBar>
                </StatRow>
              </GunStats>
            </GunInfo>
          </GunCard>
        ))}
      </GunGrid>
      
      <div>
        <SelectButton onClick={handleSelectGun} disabled={!selectedGun}>
          Select Weapon
        </SelectButton>
        <SelectButton onClick={onCancel} style={{ backgroundColor: '#757575', marginLeft: '10px' }}>
          Back
        </SelectButton>
      </div>
    </SelectionContainer>
  );
};

export default GunSelection; 