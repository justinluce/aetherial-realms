import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon';
import { createNoise2D } from 'simplex-noise';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import maleModel from "../../models/CasualMale.glb";
import './MainGame.css';

interface PlayerProps {
    modelPath: string;
}

function Player({ modelPath }: PlayerProps) {
    const { scene } = useGLTF(modelPath);

    return (
        <RigidBody type="dynamic">
            <primitive object={scene} scale={.5}/>
        </RigidBody>
    )
}

function MainGame() {
    const mountRef = useRef<HTMLDivElement | null>(null);

    // Camera controls setup
    let isMouseDown: boolean = false;
    let onMouseDownPosition: { x: number; y: number } = { x: 0, y: 0 };
    let currentAngle: number = 0;
    let currentVerticalAngle: number = 0;
    let cameraDistance: number = 10; 
    const minDistance = 0;
    const maxDistance = 20; 
    const zoomSpeed = 0.5;

    // Movement setup
    const moveSpeed = 0.08;
    const movement = {
        up: false,
        down: false,
        left: false,
        right: false
    };
    
    let playerModel: THREE.Object3D;
    const playerShape = new CANNON.Sphere(0.5);
    const playerBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 2, 0),
        shape: playerShape,
    });

    let mixer: THREE.AnimationMixer | null = null 
    let actions: { [key: string]: THREE.AnimationAction } = {};
    const clock = new THREE.Clock();
    const scene = new THREE.Scene();

    const noise2D = createNoise2D();
    const size = 256;
    let heightData: number[] = new Array(size * size);

    useEffect(() => {
        const loader = new GLTFLoader();

        loader.load(maleModel, function (gltf: GLTF) {
            gltf.scene.name = 'playerModel';
            playerModel = gltf.scene;
            const playerInGame = scene.getObjectByName('playerModel');
            if (!playerInGame) {
                console.log(playerModel);
                scene.add(gltf.scene);
                mixer = new THREE.AnimationMixer(playerModel);
                gltf.animations.forEach((clip: THREE.AnimationClip) => {
                    if (mixer) {
                        const action = mixer.clipAction(clip);
                        actions[clip.name] = action;
                    }
                });
                if (actions['run']) {
                    actions['run'].play();
                }
            }
            updateCameraPosition();
        }, undefined, function (error: unknown) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error("Unknown error: ", error);
            }
        });

        document.addEventListener('keydown', function(event) {
            switch(event.key) {
                case 'w':
                case 'ArrowUp':
                    movement.up = true;
                    break;
                case 'a':
                case 'ArrowLeft':
                    movement.left = true;
                    break;
                case 's':
                case 'ArrowDown':
                    movement.down = true;
                    break;
                case 'd':
                case 'ArrowRight':
                    movement.right = true;
                    break;
            }
        });
        
        document.addEventListener('keyup', function(event) {
            switch(event.key) {
                case 'w':
                case 'ArrowUp':
                    movement.up = false;
                    break;
                case 'a':
                case 'ArrowLeft':
                    movement.left = false;
                    break;
                case 's':
                case 'ArrowDown':
                    movement.down = false;
                    break;
                case 'd':
                case 'ArrowRight':
                    movement.right = false;
                    break;
            }
        });

        document.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            onMouseDownPosition.x = event.clientX;
            onMouseDownPosition.y = event.clientY;
        });
        
        document.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        document.addEventListener('mousemove', (event) => {
            if (isMouseDown) {
                const deltaX = event.clientX - onMouseDownPosition.x;
                const deltaY = event.clientY - onMouseDownPosition.y;
        
                onMouseDownPosition.x = event.clientX;
                onMouseDownPosition.y = event.clientY;
        
                currentAngle += deltaX * 0.005;
                currentVerticalAngle += deltaY * 0.005;
                currentVerticalAngle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, currentVerticalAngle));
            }
        });

        document.addEventListener('wheel', (event) => {
            // Zoom in or out
            cameraDistance += event.deltaY * 0.01 * zoomSpeed;
            cameraDistance = Math.max(minDistance, Math.min(maxDistance, cameraDistance));
        });        

        // Scene, camera, and renderer setup
        if (!mountRef.current) throw new Error("mountRef.current is null");
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const geometry = new THREE.PlaneGeometry(500, 500, size - 1, size - 1);

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();

        // Camera controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 5;
        controls.maxDistance = 50;
        controls.target.set(0, 0, 0);

        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement); 

        const world = new CANNON.World();
        world.gravity.set(0, -9.82, 0);
        world.broadphase = new CANNON.NaiveBroadphase();
        // Increasing this will have better accuracy but cost more resources. Probably don't increase this
        world.solver.iterations = 10;
        world.addBody(playerBody);

        // Making the ground
        const groundMaterial = new CANNON.Material("groundMaterial");

        const groundBody = new CANNON.Body({
            mass: 0, //static
            material: groundMaterial
        });
        const groundShape = new CANNON.Plane();
        groundBody.addShape(groundShape);
        // Rotate it
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        world.addBody(groundBody);

        // Testing collisions
        const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphereMesh.position.set(0, 10, 0);
        scene.add(sphereMesh);
        const sphereBody = new CANNON.Body({
            mass: 5,
            shape: new CANNON.Sphere(1),
            position: new CANNON.Vec3(0, 10, 0),
        });
        world.addBody(sphereBody);

        // Terrain generation
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const heightValue = noise2D(i / 50, j / 50);
                heightData[i + j * size] = heightValue;
            }
        }

        const vertices = geometry.attributes.position.array;

        for (let i = 0, j = 0; i < vertices.length; i++, j += 3) {
            // Modify the height of the vertex from heightData
            vertices[j + 2] = heightData[i] * 20;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals(); // Need for lighting to work properly

        const material = new THREE.MeshStandardMaterial({ color: 0x5566aa, wireframe: false });
        const terrain = new THREE.Mesh(geometry, material);

        // Rotate the terrain I guess? Without this the terrain is vertical for some reason? Might have screwed up something else somewhere
        terrain.rotation.x = -Math.PI / 2;
        scene.add(terrain);


        let hasValues = false;
        for (let i = 0; i < size * size; i++) {
            if (heightData[i] !== 0.0) {
                hasValues = true;
                break;
            }
        }

        // if (hasValues) {
        //     console.log("has values");
        //     console.log(heightData);
        //     try {
        //         let data = [];
        //         for (let i = 0; i < 1000; i++) {
        //             let y = .5 * Math.cos(.2 * i);
        //             data.push(y);
        //         }
        //         const hfShape = new CANNON.Heightfield(data, {
        //             elementSize: 1
        //         });
    
        //         // const hfBody = new CANNON.Body({
        //         //     mass: 0, //static
        //         // });
        //         // hfBody.addShape(hfShape);
        //         // world.addBody(hfBody);
        //     } catch (error) {
        //         alert(error);
        //     }
        // } else {
        //     console.error("no values");
        // }

        //! THIS IS ALL COMMENTED BECAUSE OF INFINITE LOADING

        /*

        // Converting heightData to a 1D array because Cannon.js needs it or something 
        let heightData2D: number[][] = [];
        for (let i = 0; i < size; i++) {
            let row: number[] = [];
            for (let j = 0; j < size; j++) {
                const heightValue = noise2D(i / 50, j / 50);
                row.push(heightValue);
            }
            heightData2D.push(row);
        }

        // Flatten the 2D array into a 1D array
        let heightData1D: number[] = heightData2D.flat();

        // Use the 1D array with CANNON.Heightfield
        const hfShape = new CANNON.Heightfield(heightData1D, {
            elementSize: 100 / size
        });

        // HAHAHAHAHAHAHAHAHAHAHA
        const hfWidth = 500;
        const hfDepth = 500;
        const widthSegments = size - 1; 
        const depthSegments = size - 1; 

        const bufferGeometry = new THREE.BufferGeometry();

        const numVertices = (widthSegments + 1) * (depthSegments + 1);

        const positions = new Float32Array(numVertices * 3); // 3 values per vertex

        let index = 0;
        for (let i = 0; i <= depthSegments; i++) {
            for (let j = 0; j <= widthSegments; j++) {
                const x = (j / widthSegments) * hfWidth - hfWidth / 2;
                const y = heightData2D[i][j] * 20; // Scale the height value
                const z = (i / depthSegments) * hfDepth - hfDepth / 2;

                positions[index * 3 + 0] = x;
                positions[index * 3 + 1] = y;
                positions[index * 3 + 2] = z;

                index++;
            }
        }

        bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        bufferGeometry.computeVertexNormals();

        const bufferMaterial = new THREE.MeshStandardMaterial({
            wireframe: false,
            color: 0x5566aa,
            side: THREE.DoubleSide
        });

        const hfMesh = new THREE.Mesh(bufferGeometry, bufferMaterial);
        scene.add(hfMesh);

        const hfBody = new CANNON.Body({ mass: 0 }); // mass 0 because terrain is static
        hfBody.addShape(hfShape);
        world.addBody(hfBody);
        */
        // Example object
        const geometryCube = new THREE.BoxGeometry(1, 1, 1);
        const materialCube = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometryCube, materialCube);
        scene.background = new THREE.Color("white");
        scene.add(cube);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        const updateCameraPosition = function() {
            if (scene.getObjectByName('playerModel')) { 
                const testPlayer = scene.getObjectByName('playerModel');
                const playerPosition = new THREE.Vector3();
                if (!testPlayer) throw new Error("test player not defined fuck you")
                testPlayer.getWorldPosition(playerPosition); 
                
                // Calculate new camera position based on angles and distance
                const offsetX = cameraDistance * Math.sin(currentAngle) * Math.cos(currentVerticalAngle);
                const offsetY = cameraDistance * Math.sin(currentVerticalAngle);
                const offsetZ = cameraDistance * Math.cos(currentAngle) * Math.cos(currentVerticalAngle);
                
                camera.position.set(playerPosition.x + offsetX, playerPosition.y + offsetY, playerPosition.z + offsetZ);
                camera.lookAt(playerPosition);
            }
        };

        function updateMovement() {
            // Reset velocity to 0 on the x and z axes before applying new movement
            playerBody.velocity.x = 0;
            playerBody.velocity.z = 0;
            let isMoving = false;
            const forward = new THREE.Vector3();
            camera.getWorldDirection(forward);
            forward.normalize();
            forward.y = 0; // Ignoring vertical movement for now

        
            const right = new THREE.Vector3();
            right.crossVectors(camera.up, forward);
            right.normalize();

            if (movement.up || movement.down || movement.left || movement.right) {
                isMoving = true;
            }
            //TODO: Fix the T-Posing
            if (isMoving) {
                if (!actions['run'].isRunning()) {
                    actions['run'].play();
                }
            } else if (actions['run']) {
                actions['run'].stop();
            } else {
                console.error("no action called run", actions);
            }
        
            if (movement.up) {
                const moveForward = forward.clone().multiplyScalar(-moveSpeed);
                playerBody.velocity.x += moveForward.x;
                playerBody.velocity.z += moveForward.z;
            }
            if (movement.down) {
                const moveBackward = forward.clone().multiplyScalar(moveSpeed);
                playerBody.velocity.x += moveBackward.x;
                playerBody.velocity.z += moveBackward.z;
            }
            if (movement.left) {
                const moveLeft = right.clone().multiplyScalar(-moveSpeed);
                playerBody.velocity.x += moveLeft.x;
                playerBody.velocity.z += moveLeft.z;
            }
            if (movement.right) {
                const moveRight = right.clone().multiplyScalar(moveSpeed);
                playerBody.velocity.x += moveRight.x;
                playerBody.velocity.z += moveRight.z;
            }
        
            // Normalize to prevent faster diagonal movement
            // if (direction.lengthSq() > 0) direction.normalize();

            // const playerTest = scene.getObjectByName('playerModel');
            // if (scene.getObjectByName('playerModel')) { 
            //     if (!playerTest) throw new Error("no player object in game")
            //     playerTest.position.addScaledVector(direction, moveSpeed);
            // }
            // // Rotate player model to face direction of movement
            // if (direction.lengthSq() > 0) {
            //     const angle = Math.atan2(direction.x, direction.z);
            //     if (!playerTest) throw new Error("no player object in game 2")
            //     playerTest.rotation.y = angle;
            // }
        }

        // Animation loop
        const animate = function () {
            requestAnimationFrame(animate);
            const timeStep = 1 / 60; // seconds
            world.step(timeStep);

            if (playerModel && playerBody) {
                playerModel.position.copy(playerBody.position as any);
                playerModel.quaternion.copy(playerBody.position as any);
                // console.log("updating playermodel: ", playerBody.position);
            }
            sphereMesh.position.copy(sphereBody.position);
            sphereMesh.quaternion.copy(sphereBody.quaternion);
            const delta = clock.getDelta();
            if (mixer) mixer.update(delta);
            updateMovement();
            updateCameraPosition();
        
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!mountRef.current) throw new Error("mountRef.current is null");
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (!mountRef.current) throw new Error("mountRef.current is null");
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div>
        {/*<div ref={mountRef} className="main-game">*/}
            <Canvas>
                <div className='version-number'>v0.1.0</div>
                <Physics>
                        <Player modelPath={maleModel} />
                </Physics>
            </Canvas>
        {/*</div>*/}
        </div>
    )
}

export default MainGame;