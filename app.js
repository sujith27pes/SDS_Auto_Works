document.addEventListener("DOMContentLoaded", () => {
    let scene, camera, renderer, controls;
    let carGroup, liftRamp, liftRampGroup;
    let rotationSpeed = 0.01;
    let isRotating = false;
    let isCarRaised = false;
    const raiseCarDuration = 2000; // 2 seconds

    // Load the audio file
    const liftAudio = new Audio('hydroliclift sound.m4a');

    // Add CSS styling for the buttons directly in JavaScript
    const style = document.createElement('style');
    style.textContent = `
        .button-container {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
            flex-wrap: wrap;
            max-width: 100%;
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000; /* Ensure buttons are on top */
        }
        .button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            cursor: pointer;
            flex-shrink: 0;
        }
        #rotation-button { background-color: #4CAF50; }
        #raise-car-button { background-color: #FF5722; }
        #zoom-in-button { background-color: #2196F3; }
        #zoom-out-button { background-color: #FFC107; }
    `;
    document.head.appendChild(style);

    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
        camera.position.set(800, 100, 1000);
        camera.lookAt(0, 0, 0);

        // Ambient lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 3); // Increased intensity
        scene.add(ambientLight);

        // Overhead lights
        for (let x = -300; x <= 300; x += 150) {
            const tubeLight = new THREE.RectAreaLight(0xffffff, 5, 100, 20);
            tubeLight.position.set(x, 400, 0);
            tubeLight.lookAt(x, 0, 0);
            scene.add(tubeLight);

            const fixtureGeometry = new THREE.BoxGeometry(100, 10, 20);
            const fixtureMaterial = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                metalness: 0.5,
                roughness: 0.2
            });
            const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
            fixture.position.set(x, 395, 0);
            scene.add(fixture);
        }

        // Corner point lights for full illumination
        const corners = [
            { x: -500, y: 250, z: -500 },
            { x: 500, y: 250, z: -500 },
            { x: -500, y: 250, z: 500 },
            { x: 500, y: 250, z: 500 },
        ];
        corners.forEach(corner => {
            const pointLight = new THREE.PointLight(0xffffff, 1.5, 1000);
            pointLight.position.set(corner.x, corner.y, corner.z);
            scene.add(pointLight);
        });

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(200, 400, 300);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const spotlight = new THREE.SpotLight(0xffffff, 2);
        spotlight.position.set(0, 400, 0);
        spotlight.angle = Math.PI / 4;
        spotlight.penumbra = 0.1;
        spotlight.decay = 2;
        spotlight.distance = 1000;
        spotlight.castShadow = true;
        scene.add(spotlight);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth - 220, window.innerHeight - 60);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('3d-view').appendChild(renderer.domElement);

        createEpoxyFloor();
        addGarageDetails();
        createLiftRamp();

        carGroup = new THREE.Group();
        scene.add(carGroup);

        const loader = new THREE.GLTFLoader();
        loader.load('scene.gltf', function (gltf) {
            const car = gltf.scene;
            car.scale.set(2, 2, 2);

            const box = new THREE.Box3().setFromObject(car);
            const center = box.getCenter(new THREE.Vector3());
            car.position.sub(center);

            car.position.y += 108;
            car.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });

            carGroup.add(car);
            animate();
        });

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.update();

        setupUIControls();
        window.addEventListener('resize', onWindowResize);
    }

    function createEpoxyFloor() {
        const floorGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0xf0f0f0,
            metalness: 0.5,
            roughness: 0.2,
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);
    }

    function addGarageDetails() {
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x8c8c8c,
            roughness: 0.6,
            metalness: 0.3,
        });

        const backWall = new THREE.Mesh(new THREE.BoxGeometry(1000, 500, 20), wallMaterial);
        backWall.position.set(0, 250, -500);
        scene.add(backWall);

        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(20, 500, 1000), wallMaterial);
        leftWall.position.set(-500, 250, 0);
        scene.add(leftWall);

        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(20, 500, 1000), wallMaterial);
        rightWall.position.set(500, 250, 0);
        scene.add(rightWall);

        // Tool cabinet
        const cabinetGeometry = new THREE.BoxGeometry(80, 150, 40);
        const cabinetMaterial = new THREE.MeshStandardMaterial({
            color: 0xcc0000,
            metalness: 0.6,
            roughness: 0.3,
        });
        const cabinet = new THREE.Mesh(cabinetGeometry, cabinetMaterial);
        cabinet.position.set(-400, 75, -400);
        cabinet.castShadow = true;
        scene.add(cabinet);

        // Workbench
        const benchGeometry = new THREE.BoxGeometry(200, 80, 60);
        const benchMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            metalness: 0.4,
            roughness: 0.6,
        });
        const workbench = new THREE.Mesh(benchGeometry, benchMaterial);
        workbench.position.set(-350, 40, 400);
        workbench.castShadow = true;
        scene.add(workbench);

        // Tire rack and tires
        const rackGeometry = new THREE.BoxGeometry(100, 200, 40);
        const rackMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.7,
            roughness: 0.3,
        });
        const tireRack = new THREE.Mesh(rackGeometry, rackMaterial);
        tireRack.position.set(450, 100, -400);
        tireRack.castShadow = true;
        scene.add(tireRack);

        const tireGeometry = new THREE.TorusGeometry(20, 8, 16, 100);
        const tireMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9,
            metalness: 0.1,
        });

        for (let i = 0; i < 4; i++) {
            const tire = new THREE.Mesh(tireGeometry, tireMaterial);
            tire.position.set(450, 50 + (i * 40), -400);
            tire.rotation.y = Math.PI / 2;
            tire.castShadow = true;
            scene.add(tire);
        }
    }

    function createLiftRamp() {
        liftRampGroup = new THREE.Group();
        scene.add(liftRampGroup);
    
        // Update the ramp color to a realistic metallic silver/gray
        const bedMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080, // Gray color for a metallic look
            metalness: 0.5,
            roughness: 0.3
        });
        const bedGeometry = new THREE.BoxGeometry(300, 30, 600);
        const rampBed = new THREE.Mesh(bedGeometry, bedMaterial);
        rampBed.position.set(0, 15, -10);
        rampBed.castShadow = true;
        rampBed.receiveShadow = true;
        liftRampGroup.add(rampBed);
        liftRamp = rampBed;
    
        // Create circular (cylinder) legs for the lift
        const legsGroup = new THREE.Group();
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a, // Darker gray for hydraulic pistons
            metalness: 0.5,
            roughness: 0.3
        });
    
        const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 100, 32), legMaterial);
        leftLeg.position.set(-90, -50, 0);
        leftLeg.castShadow = true;
        leftLeg.receiveShadow = true;
        legsGroup.add(leftLeg);
    
        const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 100, 32), legMaterial);
        rightLeg.position.set(90, -50, 0);
        rightLeg.castShadow = true;
        rightLeg.receiveShadow = true;
        legsGroup.add(rightLeg);
    
        liftRampGroup.add(legsGroup);
        liftRampGroup.position.y = -10;
    }
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth - 220, window.innerHeight - 60);
    }
    
    
    
    // Modified animate function to include lift bed rotation
    function animate() {
        requestAnimationFrame(animate);
    
        if (isRotating) {
            if (carGroup) {
                carGroup.rotation.y += rotationSpeed;
            }
            if (liftRamp) {
                // Rotate just the lift bed (not the legs)
                liftRampGroup.rotation.y += rotationSpeed;
            }
        }
    
        controls.update();
        renderer.render(scene, camera);
    }
    
    function setupUIControls() {
        // Create a container for all buttons
        const container = document.createElement('div');
        container.classList.add('button-container');
        document.body.appendChild(container);

        // Toggle Rotation Button
        const rotationButton = document.createElement('button');
        rotationButton.id = 'rotation-button';
        rotationButton.textContent = 'Rotate';
        rotationButton.classList.add('button');
        container.appendChild(rotationButton);

        rotationButton.addEventListener('click', () => {
            isRotating = !isRotating;
            rotationButton.textContent = isRotating ? 'Stop' : 'Rotate';
        });

        // Raise Car Button
        const raiseCarButton = document.createElement('button');
        raiseCarButton.id = 'raise-car-button';
        raiseCarButton.textContent = 'Raise Car';
        raiseCarButton.classList.add('button');
        container.appendChild(raiseCarButton);

        raiseCarButton.addEventListener('click', () => {
            if (!isCarRaised) {
                raiseCarButton.textContent = 'Lower Car';
                let startPosition = liftRampGroup.position.y;
                let targetPosition = 80;
                let startTime = performance.now();

                function raiseCarAnimation(currentTime) {
                    let elapsedTime = currentTime - startTime;
                    let progress = elapsedTime / raiseCarDuration;
                    progress = Math.min(progress, 1);

                    liftRampGroup.position.y = startPosition + (targetPosition - startPosition) * progress;
                    carGroup.position.y = startPosition + (targetPosition - startPosition) * progress;

                    // Play the lift audio when the car is being raised
                    if (progress > 0 && progress < 1) {
                        if (!liftAudio.playing) {
                            liftAudio.play();
                            liftAudio.playing = true; // Custom flag to prevent multiple plays
                        }
                    } else {
                        liftAudio.pause();
                        liftAudio.currentTime = 0;
                        liftAudio.playing = false;
                    }

                    if (progress < 1) {
                        requestAnimationFrame(raiseCarAnimation);
                    } else {
                        isCarRaised = true;
                        liftAudio.pause();
                        liftAudio.currentTime = 0;
                        liftAudio.playing = false;
                    }
                }

                requestAnimationFrame(raiseCarAnimation);
            } else {
                raiseCarButton.textContent = 'Raise Car';
                let startPosition = liftRampGroup.position.y;
                let targetPosition = -10;
                let startTime = performance.now();

                function lowerCarAnimation(currentTime) {
                    let elapsedTime = currentTime - startTime;
                    let progress = elapsedTime / raiseCarDuration;
                    progress = Math.min(progress, 1);

                    liftRampGroup.position.y = startPosition - (startPosition - targetPosition) * progress;
                    carGroup.position.y = startPosition - (startPosition - targetPosition) * progress;

                    // Play the lift audio when the car is being lowered
                    if (progress > 0 && progress < 1) {
                        if (!liftAudio.playing) {
                            liftAudio.play();
                            liftAudio.playing = true; // Custom flag to prevent multiple plays
                        }
                    } else {
                        liftAudio.pause();
                        liftAudio.currentTime = 0;
                        liftAudio.playing = false;
                    }

                    if (progress < 1) {
                        requestAnimationFrame(lowerCarAnimation);
                    } else {
                        isCarRaised = false;
                        liftAudio.pause();
                        liftAudio.currentTime = 0;
                        liftAudio.playing = false;
                    }
                }

                requestAnimationFrame(lowerCarAnimation);
            }
        });

        // Zoom In Button
        const zoomInButton = document.createElement('button');
        zoomInButton.id = 'zoom-in-button';
        zoomInButton.textContent = 'Zoom In';
        zoomInButton.classList.add('button');
        container.appendChild(zoomInButton);

        // Zoom Out Button
        const zoomOutButton = document.createElement('button');
        zoomOutButton.id = 'zoom-out-button';
        zoomOutButton.textContent = 'Zoom Out';
        zoomOutButton.classList.add('button');
        container.appendChild(zoomOutButton);

        const MIN_ZOOM = 300;
        const MAX_ZOOM = 1500;

        zoomInButton.addEventListener("click", () => {
            if (camera.position.z > MIN_ZOOM) {
                camera.position.z -= 50;
                controls.update();
            }
        });

        zoomOutButton.addEventListener("click", () => {
            if (camera.position.z < MAX_ZOOM) {
                camera.position.z += 50;
                controls.update();
            }
        });
    }

    init();
});
