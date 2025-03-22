import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TileContainer = styled(motion.div)`
  background-color: #2c3e50;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  position: relative;
  aspect-ratio: 1 / 1;
  
  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 480px) {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
`;

const GameImage = styled.img`
  width: 100%;
  height: 70%;
  object-fit: cover;
  display: block;
`;

const GameInfo = styled.div`
  padding: 15px;
  background-color: #34495e;
  height: 30%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const GameTitle = styled.h3`
  margin: 0;
  color: white;
  font-size: 1.2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const GameTile = ({ game }) => {
  if (!game) return null;
  
  return (
    <Link to={`/game/${game.id}`} style={{ textDecoration: 'none' }}>
      <TileContainer
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <GameImage src={game.imageUrl} alt={game.name} />
        <GameInfo>
          <GameTitle>{game.name}</GameTitle>
        </GameInfo>
      </TileContainer>
    </Link>
  );
};

export default GameTile;