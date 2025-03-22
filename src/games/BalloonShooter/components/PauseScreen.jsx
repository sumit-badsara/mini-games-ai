import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 40;
`;

const PauseContainer = styled.div`
  width: 500px;
  background-color: rgba(30, 30, 30, 0.9);
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 30px;
  color: #ff6b6b;
  text-shadow: 2px 2px 0px #000;
  text-align: center;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
`;

const Button = styled.button`
  background-color: ${props => props.color || '#4CAF50'};
  border: none;
  color: white;
  padding: 15px 25px;
  text-align: center;
  text-decoration: none;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 5px;
  font-family: 'Minecraft', 'Press Start 2P', monospace;
  box-shadow: 0px 4px 0px ${props => props.shadowColor || '#2E7D32'};
  transition: all 0.1s;
  width: 100%;
  
  &:hover {
    transform: translateY(2px);
    box-shadow: 0px 2px 0px ${props => props.shadowColor || '#2E7D32'};
  }
  
  &:active {
    transform: translateY(4px);
    box-shadow: none;
  }
`;

const PauseScreen = ({ 
  onResume, 
  onChangeGun, 
  onChangeMap, 
  onRestart, 
  onQuit 
}) => {
  // Prevent clicks from propagating through the overlay
  const handleOverlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle button clicks with proper event handling
  const handleButtonClick = (handler) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add a small delay to ensure event handling completes before action
    setTimeout(() => {
      if (typeof handler === 'function') {
        handler();
      }
    }, 50);
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <PauseContainer onClick={handleOverlayClick}>
        <Title>Game Paused</Title>
        <ButtonsContainer>
          <Button 
            onClick={handleButtonClick(onResume)}
            color="#4CAF50" 
            shadowColor="#2E7D32"
          >
            Resume Game
          </Button>
          
          <Button 
            onClick={handleButtonClick(onChangeGun)} 
            color="#2196F3" 
            shadowColor="#1565C0"
          >
            Change Weapon
          </Button>
          
          <Button 
            onClick={handleButtonClick(onChangeMap)} 
            color="#9C27B0" 
            shadowColor="#6A1B9A"
          >
            Change Map
          </Button>
          
          <Button 
            onClick={handleButtonClick(onRestart)} 
            color="#FF9800" 
            shadowColor="#EF6C00"
          >
            Restart Game
          </Button>
          
          <Button 
            onClick={handleButtonClick(onQuit)} 
            color="#F44336" 
            shadowColor="#C62828"
          >
            Quit to Menu
          </Button>
        </ButtonsContainer>
      </PauseContainer>
    </Overlay>
  );
};

export default PauseScreen; 