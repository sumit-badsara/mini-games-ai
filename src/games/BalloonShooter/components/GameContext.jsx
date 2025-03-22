import React, { createContext, useContext } from 'react';

// Create a context for the game state
export const GameContext = createContext({
  score: 0,
  timeLeft: 60,
  gameOver: false,
  updateScore: () => {},
  restartGame: () => {}
});

// Custom hook to use the game context
export const useGameContext = () => useContext(GameContext);

// Provider component that wraps the game and provides the state
export const GameProvider = ({ children, value }) => {
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}; 