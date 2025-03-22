import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Physics, useSphere } from '@react-three/cannon';
import { useGameContext } from './GameContext';
import Gun from './Gun';
import MapEnvironment from './MapEnvironment';
import Balloon from './Balloon';
import * as THREE from 'three';

// Sound effects setup - using digital sound synthesis directly
const createAudio = (soundType) => {
  return {
    play: () => {
      // Generate synthetic sound directly without trying to load external files
      playDigitalSound(soundType);
    }
  };
};

// Digital sound generator using Web Audio API
const playDigitalSound = (type) => {
  try {
    // Create Web Audio API context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    if (type === 'shoot') {
      // Weapon sounds based on gun type
      if (type.includes('pistol')) {
        // Pistol - higher pitch, quick decay
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        
        // Connect and play
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
      } 
      else if (type.includes('rifle')) {
        // Rifle - mid range, rapid fire sound
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(180, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        
        // Connect and play
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
      }
      else if (type.includes('shotgun')) {
        // AWP - deep, powerful boom
        // Create multiple oscillators for a complex sound
        const lowOsc = audioCtx.createOscillator();
        lowOsc.type = 'sine';
        lowOsc.frequency.setValueAtTime(80, audioCtx.currentTime);
        lowOsc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.4);
        
        const midOsc = audioCtx.createOscillator();
        midOsc.type = 'square';
        midOsc.frequency.setValueAtTime(120, audioCtx.currentTime);
        midOsc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.3);
        
        // Gain for low frequency
        const lowGain = audioCtx.createGain();
        lowGain.gain.setValueAtTime(0.6, audioCtx.currentTime);
        lowGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        
        // Gain for mid frequency
        const midGain = audioCtx.createGain();
        midGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        midGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        
        // Connect and play
        lowOsc.connect(lowGain);
        midOsc.connect(midGain);
        lowGain.connect(audioCtx.destination);
        midGain.connect(audioCtx.destination);
        
        lowOsc.start();
        midOsc.start();
        lowOsc.stop(audioCtx.currentTime + 0.4);
        midOsc.stop(audioCtx.currentTime + 0.3);
        
        return; // Exit early since we've handled everything
      }
      else {
        // Default gun sound
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        
        // Connect and play
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
      }
    } 
    else { // pop sound
      // Balloon pop sound
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      
      // Connect and play
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    }
  } catch (e) {
    console.warn("Digital sound generation failed:", e);
  }
};

// Player physics body with jumping and movement controls
const PlayerController = () => {
  const { camera } = useThree();
  const [playerRef, api] = useSphere(() => ({
    mass: 75,
    position: [0, 3, 0], // Start slightly above ground to let physics settle
    type: 'Dynamic',
    args: [0.5], // Collision radius
    material: {
      friction: 0,
      restitution: 0.1 // Slight bounce
    },
    linearDamping: 0, // No air resistance for smoother air movement
    fixedRotation: true, // Don't rotate the player
    sleepSpeedLimit: 0.01, // Performance optimization
    onCollide: (e) => {
      // When player collides with an object
      if (e.contact.bi.id === playerRef.current?.uuid || e.contact.bj.id === playerRef.current?.uuid) {
        // Get the collision normal (direction)
        const normal = e.contact.ni;
        
        // If the collision is coming from below (the ground), mark as grounded
        // Normal Y component will be positive when hitting from below
        if (normal[1] > 0.5) {
          isOnGround.current = true;
          lastJumpTime.current = 0; // Reset jump cooldown
          canJump.current = true;
          console.log("Ground collision detected"); // Debug log
        }
      }
    }
  }));
  
  // Store velocity and keys for movement
  const velocity = useRef([0, 0, 0]);
  const keys = useRef({});
  const baseSpeed = 5.5; // Base movement force
  const sprintSpeed = 9.0; // Sprint movement force
  const jumpForce = 12; // Increased jump force for more satisfying jumps
  
  // Jump control and ground detection refs
  const isOnGround = useRef(false);
  const canJump = useRef(true);
  const lastJumpTime = useRef(0);
  const isSprinting = useRef(false);
  const jumpCooldown = 250; // ms before allowing another jump (prevents rapid jump spam)
  
  // Position tracker for debugging
  const position = useRef([0, 0, 0]);
  
  // Ground check timer to periodically reset jump ability if stuck
  const groundCheckTimer = useRef(null);
  
  // Set up keyboard controls
  useEffect(() => {
    // Subscribe to position and velocity changes
    const unsubscribePosition = api.position.subscribe((p) => {
      position.current = p;
      
      // Additional ground check - if very close to the ground, consider as grounded
      if (p[1] <= 0.6) {
        isOnGround.current = true;
        canJump.current = true;
      }
    });
    
    const unsubscribeVelocity = api.velocity.subscribe((v) => {
      velocity.current = v;
      
      // If falling very slowly or moving upward very slowly, probably on ground
      if (Math.abs(v[1]) < 0.2) {
        isOnGround.current = true;
      }
      
      // If moving upwards significantly, definitely not on ground
      if (v[1] > 2) {
        isOnGround.current = false;
      }
    });
    
    // Set up a periodic ground check to prevent getting stuck unable to jump
    groundCheckTimer.current = setInterval(() => {
      // If player is very close to y=0 (ground) and hasn't jumped recently, reset jump ability
      if (position.current[1] <= 0.55 && performance.now() - lastJumpTime.current > 500) {
        isOnGround.current = true; 
        canJump.current = true;
      }
    }, 1000);
    
    const handleKeyDown = (e) => {
      keys.current[e.code] = true;
      
      // Set sprinting when Shift is pressed
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        isSprinting.current = true;
      }
      
      // Jump when spacebar is pressed
      if (e.code === 'Space') {
        const now = performance.now();
        
        // Alternative emergency jump if player is stuck
        if (position.current[1] <= 0.55 && now - lastJumpTime.current > 1000) {
          // Force a jump if we're clearly on the ground but jump state is wrong
          console.log("Emergency jump triggered"); // Debug log
          
          // Apply jump force with a technique to "unstick" from ground first
          // First apply a small upward velocity as a pre-jump
          api.velocity.set(velocity.current[0], 0.5, velocity.current[2]);
          
          // Then apply the main jump force after a tiny delay
          setTimeout(() => {
            api.velocity.set(velocity.current[0], jumpForce, velocity.current[2]);
            isOnGround.current = false;
            lastJumpTime.current = now;
          }, 10);
          
          return;
        }
        
        // Normal jump logic
        if (isOnGround.current && canJump.current && now - lastJumpTime.current > jumpCooldown) {
          console.log("Normal jump triggered"); // Debug log
          
          // Apply jump force with a technique to "unstick" from ground first
          // First apply a small upward velocity as a pre-jump
          api.velocity.set(velocity.current[0], 0.5, velocity.current[2]);
          
          // Then apply the main jump force after a tiny delay
          setTimeout(() => {
            api.velocity.set(velocity.current[0], jumpForce, velocity.current[2]);
            isOnGround.current = false;
            canJump.current = false;
            lastJumpTime.current = now;
          }, 10);
        }
      }
    };
    
    const handleKeyUp = (e) => {
      keys.current[e.code] = false;
      
      // Reset sprinting when Shift is released
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        isSprinting.current = false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      unsubscribePosition();
      unsubscribeVelocity();
      if (groundCheckTimer.current) {
        clearInterval(groundCheckTimer.current);
      }
    };
  }, [api]);
  
  // Update movement based on keys
  useFrame(() => {
    // Create vectors for movement
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3();
    const sideVector = new THREE.Vector3();
    
    // Forward/backward movement
    const forward = keys.current['KeyW'] || keys.current['ArrowUp'] ? 1 : 0;
    const backward = keys.current['KeyS'] || keys.current['ArrowDown'] ? 1 : 0;
    frontVector.set(0, 0, backward - forward);
    
    // Left/right movement
    const left = keys.current['KeyA'] || keys.current['ArrowLeft'] ? 1 : 0;
    const right = keys.current['KeyD'] || keys.current['ArrowRight'] ? 1 : 0;
    sideVector.set(left - right, 0, 0);
    
    // Determine current speed (sprint or normal)
    const currentSpeed = isSprinting.current ? sprintSpeed : baseSpeed;
    
    // Combine movement vectors and normalize
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(currentSpeed);
    
    // Rotate movement vector based on camera rotation
    direction.applyEuler(camera.rotation);
    
    // Apply forces to the player physics body
    if (isOnGround.current) {
      // Apply full movement forces when on ground
      api.velocity.set(
        direction.x,
        velocity.current[1], // Maintain vertical velocity
        direction.z
      );
    } else {
      // Apply improved air control when jumping/falling (using full control in air as well)
      api.velocity.set(
        direction.x,  // Full movement control in air for better feel
        velocity.current[1],
        direction.z
      );
    }
    
    // Additional continuous ground check - reset jump ability when landing
    if (position.current[1] <= 0.6 && velocity.current[1] <= 0.1) {
      isOnGround.current = true; 
      canJump.current = true;
    }
  });
  
  // Update camera position from physics body
  useFrame(() => {
    if (playerRef.current) {
      const position = new THREE.Vector3();
      playerRef.current.getWorldPosition(position);
      
      // Update camera x and z, but keep y at eye level
      camera.position.x = position.x;
      camera.position.y = position.y + 1.1; // Add offset for eye level
      camera.position.z = position.z;
    }
  });
  
  // Make invisible mesh for physics
  return (
    <mesh ref={playerRef} visible={false}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial wireframe />
    </mesh>
  );
};

// Particle system for balloon popping effect
const BalloonParticles = ({ position, color, onComplete }) => {
  const particlesRef = useRef();
  const particles = useRef([]);
  const [active, setActive] = useState(true);
  
  // Initialize particles - use useMemo to avoid recreation on re-renders
  useMemo(() => {
    particles.current = Array(20).fill().map(() => ({
      position: [0, 0, 0],
      velocity: [
        (Math.random() - 0.5) * 0.3,
        Math.random() * 0.2,
        (Math.random() - 0.5) * 0.3
      ],
      size: Math.random() * 0.1 + 0.05
    }));
  }, []);
  
  // Cleanup particles after 1 second
  useEffect(() => {
    const timeout = setTimeout(() => {
      setActive(false);
      if (onComplete) onComplete();
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, [onComplete]);
  
  // Animate particles
  useFrame(() => {
    if (!particlesRef.current || !active) return;
    
    const positions = particlesRef.current.geometry.attributes.position;
    const sizes = particlesRef.current.geometry.attributes.size;
    
    if (!positions || !sizes) return;
    
    particles.current.forEach((particle, i) => {
      // Update position
      particle.velocity[1] -= 0.01; // Gravity
      particle.position[0] += particle.velocity[0];
      particle.position[1] += particle.velocity[1];
      particle.position[2] += particle.velocity[2];
      
      // Write to buffer
      positions.setXYZ(
        i, 
        position[0] + particle.position[0],
        position[1] + particle.position[1],
        position[2] + particle.position[2]
      );
      
      // Shrink particles over time
      particle.size *= 0.96;
      sizes.setX(i, particle.size);
    });
    
    positions.needsUpdate = true;
    sizes.needsUpdate = true;
  });
  
  if (!active) return null;
  
  // Pre-initialize buffers with proper sizes to avoid errors
  const particlePositions = new Float32Array(particles.current.length * 3);
  const particleSizes = new Float32Array(particles.current.length);
  
  // Initialize positions with actual values
  particles.current.forEach((particle, i) => {
    particlePositions[i * 3] = position[0] + particle.position[0];
    particlePositions[i * 3 + 1] = position[1] + particle.position[1];
    particlePositions[i * 3 + 2] = position[2] + particle.position[2];
    particleSizes[i] = particle.size;
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.current.length}
          array={particlePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particles.current.length}
          array={particleSizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

// Colors for balloons (imported from Balloon.jsx to maintain consistency)
const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#6BFF6B', // Green
  '#6B6BFF', // Blue
  '#FF6BFF', // Purple
  '#FFA96B'  // Orange
];

const Scene = ({ selectedGun = 'pistol', selectedMap = 'desert' }) => {
  const { updateScore, gameOver } = useGameContext();
  const [balloons, setBalloons] = useState([]);
  const balloonsRef = useRef({});
  const { camera } = useThree();
  const [particles, setParticles] = useState([]);
  
  // Create sound effects references
  const popSound = useRef(createAudio('pop'));
  const shootSound = useRef(createAudio(selectedGun || 'shoot'));
  
  // Update shoot sound when gun changes
  useEffect(() => {
    shootSound.current = createAudio(selectedGun || 'shoot');
  }, [selectedGun]);

  // Position camera at player height
  useEffect(() => {
    camera.position.set(0, 1.6, 0); // Typical standing eye height
  }, [camera]);

  // Generate initial balloons
  useEffect(() => {
    generateBalloons();
  }, []);

  // Add a new balloon every few seconds
  useEffect(() => {
    if (gameOver) return;
    
    const interval = setInterval(() => {
      if (balloons.length < 20) {
        addBalloon();
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [balloons, gameOver]);

  const generateBalloons = () => {
    const initialBalloons = [];
    
    // Generate balloons in different areas of the map for better distribution
    // Divide the map into sections and place balloons in each section
    const mapSections = [
      // Left side of map
      { minX: -45, maxX: -25, minZ: -45, maxZ: -25 },
      { minX: -45, maxX: -25, minZ: -15, maxZ: 5 },
      { minX: -45, maxX: -25, minZ: 15, maxZ: 45 },
      // Middle of map
      { minX: -15, maxX: 5, minZ: -45, maxZ: -25 },
      { minX: -15, maxX: 5, minZ: -15, maxZ: 5 },
      { minX: -15, maxX: 5, minZ: 15, maxZ: 45 },
      // Right side of map
      { minX: 15, maxX: 45, minZ: -45, maxZ: -25 },
      { minX: 15, maxX: 45, minZ: -15, maxZ: 5 },
      { minX: 15, maxX: 45, minZ: 15, maxZ: 45 },
    ];
    
    // Distribute balloons across different map sections
    for (let i = 0; i < 15; i++) {
      // Choose a section (with wrap-around for extra balloons)
      const section = mapSections[i % mapSections.length];
      
      // Generate random position within the section
      const x = section.minX + Math.random() * (section.maxX - section.minX);
      const z = section.minZ + Math.random() * (section.maxZ - section.minZ);
      
      // Vary height between 5 and 20 units
      const y = Math.random() * 15 + 5;
      
      // Generate a random movement vector (direction and speed)
      const movementX = (Math.random() - 0.5) * 0.05;
      const movementY = (Math.random() - 0.5) * 0.02;
      const movementZ = (Math.random() - 0.5) * 0.05;
      
      initialBalloons.push({
        id: Math.random().toString(36).substr(2, 9),
        position: [x, y, z],
        movement: [movementX, movementY, movementZ],
        color: THREE.MathUtils.randInt(0, 6) // Index for color array
      });
    }
    
    setBalloons(initialBalloons);
  };

  const addBalloon = () => {
    // When adding a new balloon, place it at edge of map and give it movement toward center
    
    // Pick a random edge (0 = north, 1 = east, 2 = south, 3 = west)
    const edge = Math.floor(Math.random() * 4);
    
    let x, z, movementX, movementZ;
    
    // North edge
    if (edge === 0) {
      x = (Math.random() - 0.5) * 90;
      z = -45;
      movementX = (Math.random() - 0.5) * 0.04;
      movementZ = Math.random() * 0.03 + 0.01; // Positive Z movement (south)
    } 
    // East edge
    else if (edge === 1) {
      x = 45;
      z = (Math.random() - 0.5) * 90;
      movementX = -(Math.random() * 0.03 + 0.01); // Negative X movement (west)
      movementZ = (Math.random() - 0.5) * 0.04;
    } 
    // South edge
    else if (edge === 2) {
      x = (Math.random() - 0.5) * 90;
      z = 45;
      movementX = (Math.random() - 0.5) * 0.04;
      movementZ = -(Math.random() * 0.03 + 0.01); // Negative Z movement (north)
    } 
    // West edge
    else {
      x = -45;
      z = (Math.random() - 0.5) * 90;
      movementX = Math.random() * 0.03 + 0.01; // Positive X movement (east)
      movementZ = (Math.random() - 0.5) * 0.04;
    }
    
    // Vary the Y position and movement
    const y = Math.random() * 15 + 5;
    const movementY = (Math.random() - 0.5) * 0.02;
    
    setBalloons(prevBalloons => [
      ...prevBalloons,
      {
        id: Math.random().toString(36).substr(2, 9),
        position: [x, y, z],
        movement: [movementX, movementY, movementZ],
        color: THREE.MathUtils.randInt(0, 6)
      }
    ]);
  };

  const handleBalloonHit = (balloonId, scoreMultiplier = 1) => {
    // Find the balloon that was hit
    const hitBalloon = balloons.find(balloon => balloon.id === balloonId);
    
    if (hitBalloon) {
      try {
        // Play pop sound - wrap in try/catch to prevent hanging
        popSound.current.play();
      } catch (e) {
        console.warn("Error playing pop sound", e);
      }
      
      // Add particles at balloon position
      const particleId = Math.random().toString(36).substr(2, 9);
      setParticles(prev => [
        ...prev.filter(p => p.id !== particleId), // ensure no duplicates
        {
          id: particleId,
          position: [...hitBalloon.position],
          color: COLORS[hitBalloon.color]
        }
      ]);
      
      // Remove the hit balloon
      setBalloons(prevBalloons => 
        prevBalloons.filter(balloon => balloon.id !== balloonId)
      );
      
      // Update score - with multiplier based on gun type
      updateScore(10 * scoreMultiplier);
      
      // Add a new balloon after a short delay
      setTimeout(() => {
        addBalloon();
      }, 1000);
    }
  };

  // Store balloon refs - ensure cleanup of old refs
  useEffect(() => {
    // Clean up balloon refs when component unmounts
    return () => {
      balloonsRef.current = {};
    };
  }, []);

  // Remove particles after they're done
  const removeParticle = (particleId) => {
    setParticles(prev => prev.filter(p => p.id !== particleId));
  };

  // Process raycaster hits for any gun type
  const processRaycasterHits = (raycaster, isSpread = false) => {
    const hits = [];
    
    // Check each balloon for intersection with the raycaster
    Object.entries(balloonsRef.current).forEach(([id, balloon]) => {
      if (balloon && balloon.current) {
        try {
          const intersects = raycaster.intersectObject(balloon.current, true);
          if (intersects.length > 0) {
            hits.push({
              id,
              distance: intersects[0].distance
            });
          }
        } catch (e) {
          console.warn("Error checking balloon intersection", e);
        }
      }
    });
    
    return hits;
  };

  // Add a frame handler to update balloon positions
  useFrame((state, delta) => {
    if (gameOver) return;
    
    // Update balloon positions based on their movement vectors
    setBalloons(prevBalloons => 
      prevBalloons.map(balloon => {
        // Create new position by adding movement
        const newX = balloon.position[0] + balloon.movement[0];
        const newY = balloon.position[1] + balloon.movement[1];
        const newZ = balloon.position[2] + balloon.movement[2];
        
        // Check if balloon is still within map bounds
        const isOutOfBounds = 
          newX < -50 || newX > 50 || 
          newY < 2 || newY > 30 || 
          newZ < -50 || newZ > 50;
        
        // If balloon is out of bounds, replace it
        if (isOutOfBounds) {
          // Choose a random edge (0 = north, 1 = east, 2 = south, 3 = west)
          const edge = Math.floor(Math.random() * 4);
          
          let x, z, movementX, movementZ;
          
          // North edge
          if (edge === 0) {
            x = (Math.random() - 0.5) * 90;
            z = -45;
            movementX = (Math.random() - 0.5) * 0.04;
            movementZ = Math.random() * 0.03 + 0.01; // Positive Z movement (south)
          } 
          // East edge
          else if (edge === 1) {
            x = 45;
            z = (Math.random() - 0.5) * 90;
            movementX = -(Math.random() * 0.03 + 0.01); // Negative X movement (west)
            movementZ = (Math.random() - 0.5) * 0.04;
          } 
          // South edge
          else if (edge === 2) {
            x = (Math.random() - 0.5) * 90;
            z = 45;
            movementX = (Math.random() - 0.5) * 0.04;
            movementZ = -(Math.random() * 0.03 + 0.01); // Negative Z movement (north)
          } 
          // West edge
          else {
            x = -45;
            z = (Math.random() - 0.5) * 90;
            movementX = Math.random() * 0.03 + 0.01; // Positive X movement (east)
            movementZ = (Math.random() - 0.5) * 0.04;
          }
          
          // Vary the Y position and movement
          const y = Math.random() * 15 + 5;
          const movementY = (Math.random() - 0.5) * 0.02;
          
          // Generate a new balloon
          return {
            ...balloon, // Keep the ID and color
            position: [x, y, z],
            movement: [movementX, movementY, movementZ]
          };
        }
        
        // If still in bounds, update position
        return {
          ...balloon,
          position: [newX, newY, newZ]
        };
      })
    );
  }, [gameOver]);

  return (
    <Physics gravity={[0, -20, 0]} defaultContactMaterial={{ friction: 0, restitution: 0.1 }}>
      {/* Player physics body with movement and jumping */}
      <PlayerController />
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.5} />
      
      {/* Main directional light (sun) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Gun - positioned relative to the camera */}
      <Gun 
        gunType={selectedGun} 
        onShoot={(mainRaycaster, spreadRaycasters) => {
          try {
            // Play shoot sound - wrap in try/catch to prevent hanging
            shootSound.current.play();
          } catch (e) {
            console.warn("Error playing shoot sound", e);
          }
          
          // Process main raycaster
          const mainHits = processRaycasterHits(mainRaycaster);
          
          // For shotgun, also process spread raycasters
          const allHits = [...mainHits];
          if (selectedGun === 'shotgun' && spreadRaycasters) {
            spreadRaycasters.forEach(raycaster => {
              const spreadHits = processRaycasterHits(raycaster, true);
              allHits.push(...spreadHits);
            });
          }
          
          // Remove duplicates (a balloon might be hit by multiple rays)
          const uniqueHits = [];
          const hitIds = new Set();
          
          allHits.forEach(hit => {
            if (!hitIds.has(hit.id)) {
              hitIds.add(hit.id);
              uniqueHits.push(hit);
            }
          });
          
          if (uniqueHits.length > 0) {
            // Sort hits by distance and handle the closest one
            uniqueHits.sort((a, b) => a.distance - b.distance);
            
            // Handle the closest hit for basic guns
            if (selectedGun === 'pistol') {
              handleBalloonHit(uniqueHits[0].id, 1);
            } 
            // For rifle, higher score multiplier
            else if (selectedGun === 'rifle') {
              handleBalloonHit(uniqueHits[0].id, 1.5);
            }
            // For AWP sniper (previously shotgun), handle multiple hits with higher damage
            else if (selectedGun === 'shotgun') {
              // AWP is a high-powered sniper - can penetrate and hit multiple balloons in a line
              let hitCount = 0;
              
              uniqueHits.forEach((hit, index) => {
                if (index < 3) { // Can hit up to 3 balloons per shot if they're lined up
                  // Staggered handling for visual effect
                  setTimeout(() => {
                    handleBalloonHit(hit.id, 2.0); // Higher multiplier for AWP
                  }, index * 50);
                  hitCount++;
                }
              });
              
              // Additional score for penetration kills
              if (hitCount > 1) {
                updateScore(hitCount * 5); // Bonus for penetration hits
              }
            }
          }
        }} 
      />
      
      {/* Map Environment */}
      <MapEnvironment mapType={selectedMap} position={[0, 0, 0]} />
      
      {/* Balloons */}
      {balloons.map(balloon => (
        <Balloon
          key={balloon.id}
          balloonId={balloon.id}
          position={balloon.position}
          colorIndex={balloon.color}
          ref={(ref) => {
            if (ref) {
              balloonsRef.current[balloon.id] = ref;
            }
          }}
        />
      ))}
      
      {/* Particle effects for popped balloons - limit to 5 active particle systems at once */}
      {particles.slice(0, 5).map(particle => (
        <BalloonParticles
          key={particle.id}
          position={particle.position}
          color={particle.color}
          onComplete={() => removeParticle(particle.id)}
        />
      ))}
    </Physics>
  );
};

export default Scene; 