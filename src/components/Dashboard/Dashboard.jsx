import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import GameTile from './GameTile';

const DashboardContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 200px); /* Adjust based on header/footer height */
  display: flex;
  flex-direction: column;
  
  @media (max-width: 1200px) {
    padding: 20px 40px;
  }
  
  @media (max-width: 768px) {
    padding: 15px;
    min-height: calc(100vh - 180px);
  }
`;

const Title = styled.h1`
  text-align: center;
  color: #2c3e50;
  margin: 30px 0;
  font-size: 2.5rem;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin: 20px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
    margin: 15px 0;
  }
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
    margin-top: 15px;
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  padding: 50px 0;
  
  @media (max-width: 768px) {
    padding: 30px 0;
  }
`;

const EmptyStateText = styled(motion.h2)`
  color: #7f8c8d;
  font-size: 1.8rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const Dashboard = ({ games = [] }) => {
  return (
    <DashboardContainer>
      <Title>Mini Games Collection</Title>
      
      {games.length > 0 ? (
        <GamesGrid>
          {games.map(game => (
            <GameTile key={game.id} game={game} />
          ))}
        </GamesGrid>
      ) : (
        <EmptyStateContainer>
          <EmptyStateText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Games coming soon!
          </EmptyStateText>
        </EmptyStateContainer>
      )}
    </DashboardContainer>
  );
};

export default Dashboard; 