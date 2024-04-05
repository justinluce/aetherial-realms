import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Physics, RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useGLTF, Html, Plane, PerspectiveCamera } from '@react-three/drei';
import maleModel from "../../models/CasualMale.glb";
import './MainGame.css';

const Player = forwardRef<THREE.Group, PlayerProps>(({ modelPath }, ref) => {
    const characterRef = useRef<THREE.Group>(null);
    const rigidbodyRef = useRef<THREE.Object3D | null>(null);
    const isOnFloor = useRef<boolean>(false);
  
    useImperativeHandle(ref, () => characterRef.current!);
  
    const { scene } = useGLTF(modelPath);
  
    return (
      <group>
        <RigidBody
          ref={rigidbodyRef as any}
          colliders={false}
          scale={[0.5, 0.5, 0.5]}
          enabledRotations={[false, false, false]}
          onCollisionEnter={() => {
            isOnFloor.current = true;
          }}
        >
          <CapsuleCollider args={[0.8, 0.4]} position={[0, 1.2, 0]} />
          <group ref={characterRef}>
            <primitive object={scene} />
          </group>
        </RigidBody>
      </group>
    );
  });

const Camera = ({ playerRef }: CameraProps) => {
    const { camera, gl: { domElement } } = useThree();
    const [isDragging, setIsDragging] = useState(false);
    const [angle, setAngle] = useState(0);
    const [verticalAngle, setVerticalAngle] = useState(0);
    const angleRef = useRef(angle);
    const verticalAngleRef = useRef(verticalAngle);
    const [distance, setDistance] = useState(10);

    const updateCameraPosition = () => {
        if (playerRef.current) {
            const offsetX = Math.sin(angleRef.current) * Math.cos(verticalAngleRef.current) * distance;
            const offsetY = Math.sin(verticalAngleRef.current) * distance;
            const offsetZ = Math.cos(angleRef.current) * Math.cos(verticalAngleRef.current) * distance;
            
            camera.position.set(playerRef.current.position.x + offsetX, playerRef.current.position.y - offsetY + 2, playerRef.current.position.z + offsetZ);
            camera.lookAt(playerRef.current.position);
        }
    };

    const onMouseDown = (e: MouseEvent) => {
        console.log("Mouse down");
        e.preventDefault();
        if (e.button === 0 || e.button === 2) {
            console.log("Mouse Down");
            setIsDragging(true);
        }
    };

    const onMouseMove = (e: MouseEvent) => {
        console.log("Mouse Starting to move");
        e.preventDefault();
        if (isDragging) {
            console.log("Mouse Moving");
            angleRef.current -= e.movementX * 0.005;
            verticalAngleRef.current = Math.max(Math.min(verticalAngleRef.current - e.movementY * 0.005, Math.PI / 2), -Math.PI / 2);
        }
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    const onWheel = (e: WheelEvent) => {
        setDistance(prevDistance => Math.min(Math.max(prevDistance + e.deltaY * 0.05, 5), 50));
    };

    useEffect(() => {
        domElement.addEventListener('mousedown', onMouseDown);
        domElement.addEventListener('mousemove', onMouseMove);
        domElement.addEventListener('mouseup', onMouseUp);
        domElement.addEventListener('wheel', onWheel);

        return () => {
            domElement.removeEventListener('mousedown', onMouseDown);
            domElement.removeEventListener('mousemove', onMouseMove);
            domElement.removeEventListener('mouseup', onMouseUp);
            domElement.removeEventListener('wheel', onWheel);
        };
    }, [domElement, isDragging]);

    useFrame(updateCameraPosition);

    return null;
}  

const MainGame = () => {
    const playerRef = useRef<THREE.Object3D>(null);

    return (
        <Canvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, 10, 5]} intensity={1} castShadow />
            <PerspectiveCamera makeDefault position={[0, 2, 5]} />
            <Physics>
                <Player modelPath={maleModel} ref={playerRef as any}/>
                <RigidBody type="fixed">
                    <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                        <meshStandardMaterial attach="material" color="green" />
                    </Plane>
                </RigidBody>
            </Physics>
            <Camera playerRef={playerRef} />
            <Html fullscreen className='html-container'>
                <div className='version-number'>v0.1.0</div>
            </Html>
        </Canvas>
    );
}

export default MainGame;