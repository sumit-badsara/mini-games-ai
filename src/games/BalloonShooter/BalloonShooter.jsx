import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, PointerLockControls, Stats } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import styled from 'styled-components';
import Scene from './components/Scene';
import HUD from './components/HUD';
import { GameProvider } from './components/GameContext';
import GunSelection from './components/GunSelection';
import MapSelection from './components/MapSelection';
import PauseScreen from './components/PauseScreen';

const GameContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #87CEEB;
  z-index: 10;
`;

const StartScreen = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
  color: white;
  font-family: 'Minecraft', 'Press Start 2P', monospace;
  text-align: center;
`;

const GameTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 2rem;
  color: #ff6b6b;
  text-shadow: 2px 2px 0px #000;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const StartButton = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 1.5rem;
  margin: 1rem;
  cursor: pointer;
  border-radius: 5px;
  font-family: 'Minecraft', 'Press Start 2P', monospace;
  box-shadow: 0px 5px 0px #2E7D32;
  transition: all 0.1s;
  
  &:hover {
    background-color: #43A047;
    transform: translateY(2px);
    box-shadow: 0px 3px 0px #2E7D32;
  }
  
  &:active {
    transform: translateY(5px);
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 12px 24px;
  }
`;

const Instructions = styled.div`
  max-width: 600px;
  margin: 1rem;
  font-size: 1.1rem;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const LoadingScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #87CEEB;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 2rem;
  font-family: 'Minecraft', 'Press Start 2P', monospace;
  text-shadow: 2px 2px 0px #000;
  z-index: 25;
`;

const ClickToPlayOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 15;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 1.5rem;
  font-family: 'Minecraft', 'Press Start 2P', monospace;
  cursor: pointer;
`;

const GunInfo = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 10px 15px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const GunIcon = styled.div`
  width: 40px;
  height: 24px;
  background-color: ${props => props.color || '#4285F4'};
  border-radius: 4px;
`;

const MapInfo = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  padding: 5px 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: ${props => {
    if (props.mapType === 'desert') return '#FFC107';
    if (props.mapType === 'mountain') return '#4CAF50';
    if (props.mapType === 'city') return '#607D8B';
    return 'white';
  }};
  border-radius: 5px;
  font-size: 14px;
`;

const BalloonShooter = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [showGunSelection, setShowGunSelection] = useState(false);
  const [showMapSelection, setShowMapSelection] = useState(false);
  const [selectedGun, setSelectedGun] = useState('pistol');
  const [selectedMap, setSelectedMap] = useState('desert');
  const [pointerLocked, setPointerLocked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const controlsRef = useRef();
  const resumeRequestedRef = useRef(false);
  const gameStartedRef = useRef(false);
  const lastTimeLockStateChanged = useRef(Date.now());

  useEffect(() => {
    if (isPlaying && !gameOver && !isPaused) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameOver(true);
            controlsRef.current?.unlock();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isPlaying, gameOver, isPaused]);

  useEffect(() => {
    const handleLockChange = () => {
      const isLocked = !!document.pointerLockElement;
      setPointerLocked(isLocked);
      
      const now = Date.now();
      
      if (isLocked) {
        gameStartedRef.current = true;
        lastTimeLockStateChanged.current = now;
      }
      
      if (!isLocked && 
          gameStartedRef.current && 
          isPlaying && 
          !gameOver && 
          !isPaused && 
          !resumeRequestedRef.current &&
          now - lastTimeLockStateChanged.current > 500) {
        setIsPaused(true);
      }
      
      if (isLocked && resumeRequestedRef.current) {
        resumeRequestedRef.current = false;
        lastTimeLockStateChanged.current = now;
      }
    };
    
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, [isPlaying, gameOver, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPlaying && !gameOver) {
        if (!isPaused) {
          setIsPaused(true);
          if (controlsRef.current && pointerLocked) {
            controlsRef.current.unlock();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver, isPaused, pointerLocked]);

  useEffect(() => {
    if (gameOver && document.pointerLockElement) {
      resumeRequestedRef.current = true;
      document.exitPointerLock();
    }
  }, [gameOver]);

  useEffect(() => {
    if (!isPlaying) {
      gameStartedRef.current = false;
    }
  }, [isPlaying]);

  const startGame = () => {
    setShowGunSelection(true);
  };

  const handleGunSelect = (gunType) => {
    setSelectedGun(gunType);
    setShowGunSelection(false);
    setShowMapSelection(true);
  };

  const handleMapSelect = (mapType) => {
    setSelectedMap(mapType);
    setShowMapSelection(false);
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setIsPaused(false);
    gameStartedRef.current = false;
  };

  const handleScoreUpdate = (points) => {
    setScore((prev) => prev + points);
  };

  const handleGameOver = () => {
    setGameOver(true);
    if (controlsRef.current) {
      resumeRequestedRef.current = true;
      controlsRef.current.unlock();
    }
  };

  const lockControls = () => {
    if (controlsRef.current && isPlaying && !gameOver && !isPaused) {
      controlsRef.current.lock();
    }
  };

  const handleResume = () => {
    resumeRequestedRef.current = true;
    
    setIsPaused(false);
    
    setTimeout(() => {
      if (controlsRef.current && isPlaying && !gameOver) {
        try {
          controlsRef.current.lock();
        } catch (err) {
          console.error("Error locking controls:", err);
          setTimeout(() => {
            if (controlsRef.current) {
              try {
                controlsRef.current.lock();
              } catch (e) {
                console.error("Second lock attempt failed:", e);
                setIsPaused(false);
              }
            }
          }, 200);
        }
      }
    }, 150);
  };

  const handleChangeGun = () => {
    resumeRequestedRef.current = true;
    setIsPaused(false);
    setIsPlaying(false);
    setShowGunSelection(true);
    gameStartedRef.current = false;
  };

  const handleChangeMap = () => {
    resumeRequestedRef.current = true;
    setIsPaused(false);
    setIsPlaying(false);
    setShowMapSelection(true);
    gameStartedRef.current = false;
  };

  const handleRestart = () => {
    resumeRequestedRef.current = true;
    setIsPaused(false);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    gameStartedRef.current = false;
    
    setTimeout(() => {
      if (controlsRef.current) {
        controlsRef.current.lock();
      }
    }, 150);
  };

  const handleQuit = () => {
    resumeRequestedRef.current = true;
    setIsPaused(false);
    setIsPlaying(false);
    setGameOver(false);
    setScore(0);
    setTimeLeft(60);
    gameStartedRef.current = false;
  };

  const getGunColor = useCallback(() => {
    switch(selectedGun) {
      case 'rifle': return '#EA4335';
      case 'shotgun': return '#1B5E20';
      default: return '#4285F4';
    }
  }, [selectedGun]);

  const gameState = {
    score,
    timeLeft,
    gameOver,
    updateScore: handleScoreUpdate,
    handleGameOver
  };

  return (
    <GameProvider value={gameState}>
      <GameContainer>
        {!isPlaying && !showGunSelection && !showMapSelection ? (
          <StartScreen>
            <GameTitle>Balloon Shooter</GameTitle>
            <Instructions>
              <p>Use your weapon to shoot as many balloons as you can before time runs out!</p>
              <p>Click to shoot | Move: WASD | Sprint: Shift | Jump: Space | ESC to pause</p>
            </Instructions>
            <StartButton onClick={startGame}>START GAME</StartButton>
          </StartScreen>
        ) : showGunSelection ? (
          <GunSelection 
            onSelect={handleGunSelect} 
            onCancel={() => setShowGunSelection(false)} 
          />
        ) : showMapSelection ? (
          <MapSelection 
            onSelect={handleMapSelect}
            onCancel={() => {
              setShowMapSelection(false);
              setShowGunSelection(true);
            }}
          />
        ) : (
          <>
            <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }}>
              <Suspense fallback={null}>
                <Sky sunPosition={[100, 20, 100]} />
                <Physics>
                  <Scene selectedGun={selectedGun} selectedMap={selectedMap} />
                </Physics>
                {isPlaying && !gameOver && !isPaused && (
                  <PointerLockControls 
                    ref={controlsRef}
                    onLock={() => setPointerLocked(true)}
                    onUnlock={() => setPointerLocked(false)}
                  />
                )}
                {import.meta.env.DEV && <Stats />}
              </Suspense>
            </Canvas>
            
            {!pointerLocked && !gameOver && !isPaused && (
              <ClickToPlayOverlay onClick={lockControls}>
                Click to play
              </ClickToPlayOverlay>
            )}
            
            {isPaused && isPlaying && !gameOver && (
              <PauseScreen 
                onResume={handleResume}
                onChangeGun={handleChangeGun}
                onChangeMap={handleChangeMap}
                onRestart={handleRestart}
                onQuit={handleQuit}
              />
            )}
            
            <HUD
              score={score}
              timeLeft={timeLeft}
              gameOver={gameOver}
              gunType={selectedGun}
              gunColor={getGunColor()}
              pointerLocked={pointerLocked}
              onRestart={() => {
                resumeRequestedRef.current = true;
                setShowGunSelection(true);
                setIsPlaying(false);
                gameStartedRef.current = false;
              }}
            />
            
            <MapInfo mapType={selectedMap}>
              {selectedMap === 'desert' && 'Desert Oasis'}
              {selectedMap === 'mountain' && 'Mountain Forest'}
              {selectedMap === 'city' && 'Abandoned City'}
            </MapInfo>
          </>
        )}
      </GameContainer>
    </GameProvider>
  );
};

export default BalloonShooter; 