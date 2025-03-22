import React from 'react';
import styled from 'styled-components';
import { useGameContext } from './GameContext';

const HUDContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  color: white;
  font-family: 'Minecraft', 'Press Start 2P', monospace;
  pointer-events: none;
  z-index: 15;
`;

const ScoreDisplay = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 0px #000;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const TimeDisplay = styled.div`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 0px #000;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Crosshair = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-radius: 50%;
  opacity: ${props => props.visible ? 1 : 0};
  
  &::before, &::after {
    content: '';
    position: absolute;
    background-color: white;
  }
  
  &::before {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: 10px;
  }
  
  &::after {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 2px;
  }
`;

const GameOverContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 25;
  pointer-events: all;
`;

const GameOverTitle = styled.h1`
  font-size: 3rem;
  color: #ff6b6b;
  margin-bottom: 20px;
  text-shadow: 2px 2px 0px #000;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const FinalScore = styled.div`
  font-size: 2rem;
  color: white;
  margin-bottom: 40px;
  text-shadow: 2px 2px 0px #000;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
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
  pointer-events: all;
  margin: 10px;
  
  &:hover {
    transform: translateY(2px);
    box-shadow: 0px 2px 0px ${props => props.shadowColor || '#2E7D32'};
  }
  
  &:active {
    transform: translateY(4px);
    box-shadow: none;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 15px;
`;

const HUD = ({ 
  gunType, 
  gunColor, 
  pointerLocked, 
  onRestart
}) => {
  const { score, timeLeft, gameOver } = useGameContext();
  
  return (
    <>
      <HUDContainer>
        <ScoreDisplay>Score: {score}</ScoreDisplay>
        <TimeDisplay>Time: {timeLeft}</TimeDisplay>
        <Crosshair visible={pointerLocked && !gameOver} />
      </HUDContainer>
      
      {gameOver && (
        <GameOverContainer>
          <GameOverTitle>Game Over!</GameOverTitle>
          <FinalScore>Final Score: {score}</FinalScore>
          <ButtonsContainer>
            <Button 
              onClick={onRestart}
              color="#4CAF50" 
              shadowColor="#2E7D32"
            >
              Play Again
            </Button>
          </ButtonsContainer>
        </GameOverContainer>
      )}
    </>
  );
};

export default HUD; 