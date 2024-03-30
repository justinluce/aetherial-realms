import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import maleModel from "../../models/CasualMale.glb";
import './MainGame.css';

function MainGame() {
    const mountRef = useRef(null);

    // Camera controls setup
    let isMouseDown = false;
    let onMouseDownPosition = { x: 0, y: 0 };
    let currentAngle = 0;
    let currentVerticalAngle = 0;
    let cameraDistance = 10; 
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

    let playerModel;
    let mixer, actions = {};
    const clock = new THREE.Clock();

    useEffect(() => {
        const loader = new GLTFLoader();

        loader.load(maleModel, function (gltf) {
            playerModel = gltf.scene;
            scene.add(gltf.scene);
            mixer = new THREE.AnimationMixer(playerModel);
            gltf.animations.forEach((clip) => {
                console.log(clip);
                const action = mixer.clipAction(clip);
                actions[clip.name] = action;
            });
            if (actions['run']) {
                actions['run'].play();
            }
            console.log(gltf.animations.map(clip => clip.name));
            updateCameraPosition();
        }, undefined, function (error) {
            console.error(error);
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
        const scene = new THREE.Scene();
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();

        // Camera controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 5;
        controls.maxDistance = 50;
        controls.target.set(0, 0, 0);

        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement); 
        
        // Example object
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.background = new THREE.Color("white");
        scene.add(cube);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        const updateCameraPosition = function() {
            if (playerModel) { 
                const playerPosition = new THREE.Vector3();
                playerModel.getWorldPosition(playerPosition); 
                
                // Calculate new camera position based on angles and distance
                const offsetX = cameraDistance * Math.sin(currentAngle) * Math.cos(currentVerticalAngle);
                const offsetY = cameraDistance * Math.sin(currentVerticalAngle);
                const offsetZ = cameraDistance * Math.cos(currentAngle) * Math.cos(currentVerticalAngle);
                
                camera.position.set(playerPosition.x + offsetX, playerPosition.y + offsetY, playerPosition.z + offsetZ);
                camera.lookAt(playerPosition);
            }
        };

        function updateMovement() {
            let isMoving = false;
            let direction = new THREE.Vector3(0, 0, 0);
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
                // console.log("no action called run", actions);
            }
        
            if (movement.up) direction.add(forward);
            if (movement.down) direction.sub(forward);
            if (movement.left) direction.add(right);
            if (movement.right) direction.sub(right);
        
            // Normalize to prevent faster diagonal movement
            if (direction.lengthSq() > 0) direction.normalize();

            if (playerModel) { 
                playerModel.position.addScaledVector(direction, moveSpeed);
            }
            // Rotate player model to face direction of movement
            if (direction.lengthSq() > 0) {
                const angle = Math.atan2(direction.x, direction.z);
                playerModel.rotation.y = angle;
            }
        }

        // Animation loop
        const animate = function () {
            requestAnimationFrame(animate);
            // playerModel.getWorldPosition(playerPosition);
            const delta = clock.getDelta();
            if (mixer) mixer.update(delta);
            updateMovement();
            updateCameraPosition();
        
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div ref={mountRef} className="main-game">
            <div className='version-number'>v0.1.0</div>
        </div>
    )
}

export default MainGame;