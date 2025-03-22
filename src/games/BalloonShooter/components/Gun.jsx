import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import GunModel from './GunModel';

// Gun component with support for different gun types
const Gun = ({ onShoot, gunType = 'pistol', playerMovementState }) => {
  const group = useRef();
  const { camera, gl } = useThree();
  const [shooting, setShooting] = useState(false);
  const [recoil, setRecoil] = useState(0);
  const [shouldResetRecoil, setShouldResetRecoil] = useState(false);
  const recoilTimer = useRef(null);
  const raycaster = useRef(new THREE.Raycaster());
  const isLocked = useRef(false);
  
  // Reference vectors for position smoothing
  const targetPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());
  const lastCameraPosition = useRef(new THREE.Vector3());
  const lastCameraQuaternion = useRef(new THREE.Quaternion());
  
  // Swaying and bobbing effects
  const swayOffset = useRef(new THREE.Vector3(0, 0, 0));
  const bobOffset = useRef(new THREE.Vector3(0, 0, 0));
  const lastMovementTime = useRef(0);
  const bobCycle = useRef(0);
  
  // Gun properties based on type - memoized to prevent recalculation
  const gunProperties = useMemo(() => ({
    pistol: {
      recoilAmount: 0.08,
      recoilRecovery: 0.75,
      shootDelay: 150,
      position: new THREE.Vector3(0.3, -0.2, -0.5),
      scale: 1,
      swayAmount: 0.015,
      bobAmount: 0.012
    },
    rifle: {
      recoilAmount: 0.15,
      recoilRecovery: 0.7,
      shootDelay: 120,
      position: new THREE.Vector3(0.2, -0.15, -0.6),
      scale: 0.9,
      swayAmount: 0.02,
      bobAmount: 0.015
    },
    shotgun: { // Now AWP Sniper Rifle
      recoilAmount: 0.25,
      recoilRecovery: 0.6,
      shootDelay: 1200, // Much slower fire rate for the AWP
      position: new THREE.Vector3(0.2, -0.1, -0.65),
      scale: 0.85,
      swayAmount: 0.03,
      bobAmount: 0.02
    }
  }), []);
  
  // Get properties for the current gun
  const currentGun = gunProperties[gunType] || gunProperties.pistol;
  
  // Initialize position and rotation references
  useEffect(() => {
    if (camera) {
      lastCameraPosition.current.copy(camera.position);
      lastCameraQuaternion.current.copy(camera.quaternion);
      
      const offset = new THREE.Vector3(
        currentGun.position.x,
        currentGun.position.y,
        currentGun.position.z
      );
      offset.applyQuaternion(camera.quaternion);
      currentPosition.current.copy(camera.position).add(offset);
      targetPosition.current.copy(currentPosition.current);
      
      if (group.current) {
        group.current.position.copy(currentPosition.current);
        group.current.quaternion.copy(camera.quaternion);
      }
    }
  }, [camera, currentGun.position]);
  
  // Set up shooting event listeners
  useEffect(() => {
    // Track pointer lock status
    const updateLockStatus = () => {
      isLocked.current = !!document.pointerLockElement;
    };
    document.addEventListener('pointerlockchange', updateLockStatus);
    
    // Track shooting cooldown
    let canShoot = true;
    let cooldownTimer = null;
    
    const handleShoot = (event) => {
      // Only process clicks when pointer is locked (in game) and not in cooldown
      if (!isLocked.current || !canShoot) return;
      
      if (event.button === 0) { // Left click only
        // Apply cooldown
        canShoot = false;
        cooldownTimer = setTimeout(() => {
          canShoot = true;
        }, currentGun.shootDelay);
        
        setShooting(true);
        
        // Reset any existing recoil recovery timer
        if (recoilTimer.current) {
          clearTimeout(recoilTimer.current);
        }
        
        // Set recoil to full value for this shot
        setRecoil(currentGun.recoilAmount);
        setShouldResetRecoil(true);
        
        // Set up raycaster from camera center
        raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
        
        // For AWP (previously shotgun), create penetration raycasters
        if (gunType === 'shotgun') {
          // AWP has perfect accuracy but can penetrate multiple targets
          // Keep the same raycaster but allow for penetration in the Scene component
          if (onShoot) {
            // Create a slight spread for AWP's penetration effect
            const spreadRaycasters = [];
            
            // Small precise spread for AWP (much smaller than shotgun)
            for (let i = 0; i < 3; i++) {
              const spread = new THREE.Vector2(
                (Math.random() - 0.5) * 0.01, // Very small spread
                (Math.random() - 0.5) * 0.01
              );
              const spreadRaycaster = new THREE.Raycaster();
              spreadRaycaster.setFromCamera(spread, camera);
              spreadRaycasters.push(spreadRaycaster);
            }
            
            onShoot(raycaster.current, spreadRaycasters);
          }
        } 
        // For rifle (AK-47), add slight spread
        else if (gunType === 'rifle') {
          // AK has some spread when firing
          const spread = new THREE.Vector2(
            (Math.random() - 0.5) * 0.03,
            (Math.random() - 0.5) * 0.03
          );
          
          // Apply the spread to our raycaster
          const spreadRaycaster = new THREE.Raycaster();
          spreadRaycaster.setFromCamera(spread, camera);
          
          if (onShoot) {
            onShoot(spreadRaycaster);
          }
        }
        else {
          // Call onShoot with single raycaster for pistol
          if (onShoot) {
            onShoot(raycaster.current);
          }
        }
        
        // Clear shooting state after a short delay
        setTimeout(() => setShooting(false), 150);
      }
    };
    
    // Use document for better click capture
    document.addEventListener('mousedown', handleShoot);
    
    return () => {
      document.removeEventListener('mousedown', handleShoot);
      document.removeEventListener('pointerlockchange', updateLockStatus);
      if (cooldownTimer) clearTimeout(cooldownTimer);
      if (recoilTimer.current) clearTimeout(recoilTimer.current);
    };
  }, [camera, gl, onShoot, gunType, currentGun]);

  // Position gun in front of camera with realistic movement
  useFrame((state, delta) => {
    if (!group.current || !camera) return;
    
    // Handle recoil recovery with improved animation
    if (shouldResetRecoil) {
      // For smoother recoil recovery, use exponential decay
      setRecoil(prev => {
        const newRecoil = prev * currentGun.recoilRecovery;
        
        // When recoil gets very small, completely reset it and mark recoil as complete
        if (newRecoil < 0.001) {
          setShouldResetRecoil(false);
          return 0;
        }
        return newRecoil;
      });
    }
    
    // Get player movement state
    const movementInfo = playerMovementState?.current || {
      isMoving: false,
      isSprinting: false,
      isJumping: false,
      velocityMagnitude: 0,
      movementDirection: new THREE.Vector3(0, 0, 0),
      lastUpdateTime: 0
    };
    
    // Calculate movement-based effects (sway and bob)
    const now = performance.now();
    const deltaTime = (now - lastMovementTime.current) / 1000;
    lastMovementTime.current = now;
    
    // Reset sway and bob offsets
    swayOffset.current.set(0, 0, 0);
    bobOffset.current.set(0, 0, 0);
    
    // Calculate weapon sway based on movement state
    if (movementInfo.isMoving) {
      // Calculate movement-based sway
      const swayFactor = movementInfo.isSprinting ? 1.5 : 1.0;
      const swaySpeed = movementInfo.isSprinting ? 4.0 : 2.5;
      
      bobCycle.current += deltaTime * swaySpeed * movementInfo.velocityMagnitude;
      
      // Horizontal sway based on movement direction
      swayOffset.current.x = Math.sin(bobCycle.current) * currentGun.swayAmount * swayFactor;
      
      // Vertical bob for walking/running
      bobOffset.current.y = Math.abs(Math.sin(bobCycle.current * 2)) * currentGun.bobAmount * swayFactor;
    } else {
      // Subtle idle sway when not moving
      bobCycle.current += deltaTime * 0.8;
      
      swayOffset.current.x = Math.sin(bobCycle.current * 0.5) * 0.002;
      swayOffset.current.y = Math.sin(bobCycle.current * 0.7) * 0.0015;
    }
    
    // Additional effects for jumping or falling
    if (movementInfo.isJumping) {
      // Upward lift when initiating jump
      if (movementInfo.lastUpdateTime - lastMovementTime.current < 300) {
        swayOffset.current.y += 0.03;
      }
      
      // Weapon sinks down when falling
      const fallAmount = Math.min(deltaTime * 4, 0.05);
      bobOffset.current.y -= fallAmount;
    }
    
    // Calculate base position offset
    const offset = new THREE.Vector3(
      currentGun.position.x + swayOffset.current.x,
      currentGun.position.y + bobOffset.current.y,
      currentGun.position.z + recoil
    );
    
    // Apply subtle breathing animation (reduced when moving)
    if (!shooting && !movementInfo.isMoving) {
      const breathAmount = Math.sin(state.clock.elapsedTime * 1.5) * 0.001;
      offset.y += breathAmount;
    }
    
    // Apply camera quaternion to offset
    offset.applyQuaternion(camera.quaternion);
    targetPosition.current.copy(camera.position).add(offset);
    
    // Calculate position interpolation factors based on player state
    let positionLerpFactor;
    
    if (movementInfo.isJumping) {
      // More responsive during jumps
      positionLerpFactor = Math.min(20.0 * delta, 1.0);
    } else if (movementInfo.isSprinting) {
      // More lag when sprinting (heavier movement feel)
      positionLerpFactor = Math.min(8.0 * delta, 1.0);
    } else if (movementInfo.isMoving) {
      // Standard movement interpolation
      positionLerpFactor = Math.min(12.0 * delta, 1.0);
    } else {
      // Very smooth when standing still
      positionLerpFactor = Math.min(15.0 * delta, 1.0);
    }
    
    // Smoothly interpolate position
    currentPosition.current.lerp(targetPosition.current, positionLerpFactor);
    group.current.position.copy(currentPosition.current);
    
    // Apply recoil effect to rotation (more pronounced for AWP/rifle)
    const recoilMultiplier = gunType === 'shotgun' ? 12 : gunType === 'rifle' ? 8 : 4;
    const recoilQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-recoil * recoilMultiplier, 0, 0)
    );
    
    // Base rotation from camera
    group.current.quaternion.copy(camera.quaternion);
    
    // Apply subtle rotation based on movement (weapon tilt)
    if (movementInfo.isMoving) {
      // Tilt gun slightly based on movement direction
      const tiltAmount = movementInfo.isSprinting ? 0.05 : 0.02;
      const tiltQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          0, 
          0, 
          swayOffset.current.x * 3 // Roll based on side-to-side motion
        )
      );
      group.current.quaternion.multiply(tiltQuaternion);
    }
    
    // Apply recoil if active
    if (recoil > 0.001) {
      group.current.quaternion.multiply(recoilQuaternion);
    }
    
    // Update last camera position and rotation for next frame
    lastCameraPosition.current.copy(camera.position);
    lastCameraQuaternion.current.copy(camera.quaternion);
  });

  return (
    <group ref={group}>
      {/* Use GunModel component to render the appropriate gun */}
      <GunModel gunType={gunType} scale={currentGun.scale} />
      
      {/* Muzzle flash - only visible when shooting */}
      {shooting && (
        <>
          <pointLight 
            position={[0, 0, -0.8]} 
            intensity={gunType === 'shotgun' ? 8 : gunType === 'rifle' ? 5 : 3} 
            color={gunType === 'shotgun' ? '#FFE082' : gunType === 'rifle' ? '#FF5722' : '#FFA726'} 
            distance={gunType === 'shotgun' ? 8 : gunType === 'rifle' ? 6 : 4} 
          />
          <mesh position={[0, 0, -0.8]} rotation={[0, 0, 0]}>
            <sphereGeometry args={[
              gunType === 'shotgun' ? 0.15 : 
              gunType === 'rifle' ? 0.10 : 0.08, 
              12, 12
            ]} />
            <meshBasicMaterial color={
              gunType === 'shotgun' ? '#FFC107' : 
              gunType === 'rifle' ? '#FF5722' : '#FFA726'
            } />
          </mesh>
          
          {/* Ejected shell or bullet effect */}
          {gunType === 'pistol' && (
            <mesh 
              position={[0.15, 0, 0]} 
              rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
            >
              <cylinderGeometry args={[0.02, 0.02, 0.06, 6]} />
              <meshStandardMaterial color="#FFCC00" metalness={0.9} roughness={0.1} />
            </mesh>
          )}
          
          {gunType === 'rifle' && (
            <>
              {/* Multiple ejected shells for AK-47 */}
              <mesh 
                position={[0.2, -0.05, 0.1]} 
                rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
              >
                <cylinderGeometry args={[0.025, 0.025, 0.07, 6]} />
                <meshStandardMaterial color="#FFCC00" metalness={0.9} roughness={0.1} />
              </mesh>
            </>
          )}
          
          {gunType === 'shotgun' && (
            <>
              {/* Sniper bullet tracer effect */}
              <mesh position={[0, 0, -2]} rotation={[0, 0, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 3, 6]} rotation={[Math.PI / 2, 0, 0]} />
                <meshBasicMaterial color="#FFFF00" transparent opacity={0.6} />
              </mesh>
            </>
          )}
        </>
      )}
    </group>
  );
};

export default Gun; 