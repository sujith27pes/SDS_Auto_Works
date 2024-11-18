
document.addEventListener("DOMContentLoaded", () => {
     
    let scene, camera, renderer, controls;
    let carGroup, liftRamp, liftRampGroup;
    let rotationSpeed = 0.0069;
    let isRotating = false;
    let isCarRaised = false;
    const raiseCarDuration = 4000; // 2 seconds
    let carSpeed = 2; // Adjust speed as needed
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let isCarStarted = false; // Tracks whether the car is started
    let isSwitchOn = false;


    // Load the audio file
    const liftAudio = new Audio('hydroliclift sound.m4a');
    const carStartAudio = new Audio('car-engine-start-outside-72279.mp3');

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
        #center-car-button {
            background-color: #1E90FF; /* Dodger Blue */
            color: white;
        }
        #start-car-button {
            background-color: #32CD32; /* Lime Green */
            color: white;
}
    `;
    document.head.appendChild(style);

    function init() {

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        const tools = createTools();
        scene.add(tools);

        camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
        camera.position.set(800, 100, 1000);
        camera.lookAt(0, 0, 0);

        // Ambient lighting
        /* const ambientLight = new THREE.AmbientLight(0x404040, 3); // Increased intensity
        scene.add(ambientLight);
 */
        // Overhead lights
        // Overhead lights
        // Overhead lights with hanging mounts
        // Overhead lights with realistic garage lighting colors
        
        
        
        
        
        for (let x = -310; x <= 300; x += 150) {
            // Create hanging wires/rods
            const wireGeometry = new THREE.CylinderGeometry(0.5, 0.5, 50, 8);
            const wireMaterial = new THREE.MeshStandardMaterial({
                color: 0x303030,
                metalness: 0.8,
                roughness: 0.2
            });

            // Two hanging points for each light
            const leftWire = new THREE.Mesh(wireGeometry, wireMaterial);
            leftWire.position.set(x - 40, 420, 0);
            scene.add(leftWire);

            const rightWire = new THREE.Mesh(wireGeometry, wireMaterial);
            rightWire.position.set(x + 40, 420, 0);
            scene.add(rightWire);

            // Add ceiling mounting points
            const mountGeometry = new THREE.CylinderGeometry(2, 2, 4, 16);
            const mountMaterial = new THREE.MeshStandardMaterial({
                color: 0x505050,
                metalness: 0.9,
                roughness: 0.1
            });

            const leftMount = new THREE.Mesh(mountGeometry, mountMaterial);
            leftMount.position.set(x - 40, 445, 0);
            scene.add(leftMount);

            const rightMount = new THREE.Mesh(mountGeometry, mountMaterial);
            rightMount.position.set(x + 40, 445, 0);
            scene.add(rightMount);

            // Main tube light - using cool white LED color (4000K)
            const tubeLight = new THREE.RectAreaLight(0xF5F5FA, 4, 100, 20);
            tubeLight.position.set(x, 400, 0);
            tubeLight.lookAt(x, 0, 0);
            scene.add(tubeLight);
            
            // Glow light - slightly warmer tint for realism
            const glowLight = new THREE.PointLight(0xF2F3FF, 0.4, 120);
            glowLight.position.set(x, 395, 0);
            scene.add(glowLight);

            // Main fixture
            const fixtureGeometry = new THREE.BoxGeometry(100, 10, 20);
            const fixtureMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xE8E8E8,  // Slightly off-white for realism
                metalness: 0.7,
                roughness: 0.2,
                clearcoat: 0.3
            });
            const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
            fixture.position.set(x, 395, 0);
            scene.add(fixture);

            // Connector pieces between wires and fixture
            const connectorGeometry = new THREE.BoxGeometry(5, 5, 5);
            const connectorMaterial = new THREE.MeshStandardMaterial({
                color: 0x404040,
                metalness: 0.8,
                roughness: 0.2
            });

            const leftConnector = new THREE.Mesh(connectorGeometry, connectorMaterial);
            leftConnector.position.set(x - 40, 400, 0);
            scene.add(leftConnector);

            const rightConnector = new THREE.Mesh(connectorGeometry, connectorMaterial);
            rightConnector.position.set(x + 40, 400, 0);
            scene.add(rightConnector);

            // Diffuser panel - using slightly cooler color when off
            const diffuserGeometry = new THREE.BoxGeometry(98, 1, 18);
            const diffuserMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xF0F2FF,  // Slight blue tint for LED appearance
                metalness: 0.1,
                roughness: 0.1,
                transparent: true,
                opacity: 0.7,
                transmission: 0.6
            });
            const diffuser = new THREE.Mesh(diffuserGeometry, diffuserMaterial);
            diffuser.position.set(x, 390, 0);
            scene.add(diffuser);

            // End caps
            const endCapGeometry = new THREE.BoxGeometry(4, 12, 22);
            const endCapMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xD8D8D8,  // Slightly darker than the main fixture
                metalness: 0.8,
                roughness: 0.2,
                clearcoat: 0.4
            });

            const leftEndCap = new THREE.Mesh(endCapGeometry, endCapMaterial);
            leftEndCap.position.set(x - 48, 395, 0);
            scene.add(leftEndCap);

            const rightEndCap = new THREE.Mesh(endCapGeometry, endCapMaterial);
            rightEndCap.position.set(x + 48, 395, 0);
            scene.add(rightEndCap);
        }

        // Subtle ambient light - cool workshop tone
        const ambientLight = new THREE.AmbientLight(0xFFE4D3, 0.6); // Increased from 0.4 to 0.6
        scene.add(ambientLight);

        // 2. Main Directional Sun Light - Repositioned to minimize front shadows
        const sunLight = new THREE.DirectionalLight(0xFFFFFA, 2.5);
        sunLight.position.set(0, 600, -200); // More overhead position
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 2000;
        sunLight.shadow.camera.left = -1000;
        sunLight.shadow.camera.right = 1000;
        sunLight.shadow.camera.top = 1000;
        sunLight.shadow.camera.bottom = -1000;
        sunLight.shadow.bias = -0.0001;
        sunLight.shadow.normalBias = 0.05;
        scene.add(sunLight);

        // 3. Corner Lights - Repositioned for better front coverage
        const cornerLights = [
            { x: -300, y: 200, z: -300, color: 0xFFF3E0, intensity: 1.2 },
            { x: 300, y: 200, z: -300, color: 0xFFF3E0, intensity: 1.2 }
        ];

        cornerLights.forEach(corner => {
            const pointLight = new THREE.PointLight(corner.color, corner.intensity, 1000);
            pointLight.position.set(corner.x, corner.y, corner.z);
            pointLight.castShadow = false; // Disabled shadows from corner lights
            scene.add(pointLight);
        });

        // 4. Front Area Light - Wide light to eliminate front shadows
        const frontArea = new THREE.RectAreaLight(0xFFFFFF, 1.0, 600, 200);
        frontArea.position.set(0, 100, -200);
        frontArea.lookAt(0, 0, 0);
        scene.add(frontArea);

        // 5. Front Fill Lights - Strategic positioning to eliminate shadows
        const frontFills = [
            // Main front fills
            { x: -150, y: 80, z: -200, intensity: 1.0 },  // Left front
            { x: 150, y: 80, z: -200, intensity: 1.0 },   // Right front
            { x: 0, y: 60, z: -180, intensity: 0.8 },     // Center front
            // Low fills for under-car
            { x: -100, y: 30, z: -150, intensity: 0.6 },  // Left low
            { x: 100, y: 30, z: -150, intensity: 0.6 },   // Right low
            { x: 0, y: 20, z: -160, intensity: 0.5 }      // Center low
        ];

        frontFills.forEach(fill => {
            const fillLight = new THREE.PointLight(0xFFFFFF, fill.intensity, 300);
            fillLight.position.set(fill.x, fill.y, fill.z);
            fillLight.castShadow = false;
            scene.add(fillLight);
        });

        // 6. Ground fill to eliminate any remaining under-car shadows
        const groundFill = new THREE.RectAreaLight(0xFFFFFF, 0.8, 400, 400);
        groundFill.position.set(0, 5, -100);
        groundFill.rotation.x = -Math.PI / 2;
        scene.add(groundFill);

        // 7. Optional: Spotlight for overall scene definition
        const spotlight = new THREE.SpotLight(0xFFF3E0, 1.5);
        spotlight.position.set(0, 500, 200); // Positioned behind to avoid front shadows
        spotlight.angle = Math.PI / 4;
        spotlight.penumbra = 0.3;
        spotlight.decay = 2;
        spotlight.distance = 1000;
        spotlight.castShadow = true;
        spotlight.shadow.mapSize.width = 2048;
        spotlight.shadow.mapSize.height = 2048;
        spotlight.shadow.bias = -0.0001;
        spotlight.shadow.radius = 4;
        scene.add(spotlight);

        // 8. Helper function to adjust all lights when car moves
        function adjustLights(carPosition) {
            // Adjust front fills
            frontFills.forEach((fill, index) => {
                const light = scene.children.find(child => 
                    child.isPointLight && 
                    child.position.x === fill.x + carPosition.x
                );
                if (light) {
                    light.position.set(
                        carPosition.x + fill.x,
                        carPosition.y + fill.y,
                        carPosition.z + fill.z
                    );
                }
            });
            
            // Adjust front area light
            const frontAreaLight = scene.children.find(child => 
                child.isRectAreaLight && 
                child.position.y === 100
            );
            if (frontAreaLight) {
                frontAreaLight.position.set(
                    carPosition.x,
                    carPosition.y + 100,
                    carPosition.z - 200
                );
                frontAreaLight.lookAt(
                    carPosition.x,
                    carPosition.y,
                    carPosition.z
                );
            }
            
            // Adjust ground fill
            const groundFillLight = scene.children.find(child => 
                child.isRectAreaLight && 
                child.position.y === 5
            );
            if (groundFillLight) {
                groundFillLight.position.set(
                    carPosition.x,
                    carPosition.y + 5,
                    carPosition.z - 100
                );
            }
        }

        // 9. Animation function (if needed)
        function animateLights(time) {
            // Minimal animation to maintain stable lighting
            scene.traverse((object) => {
                if (object.isPointLight && object.userData.initialIntensity) {
                    const fluctuation = Math.sin(time * 0.001) * 0.05;
                    object.intensity = object.userData.initialIntensity * (1 + fluctuation);
                }
            });
        }

// Add to your render/animation loop:
// animateLights(performance.now());
// If the car moves, call:
// adjustLights(carPosition);
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
    
        // Load textures: base color, grunge overlay, and gloss map for added realism
        const textureLoader = new THREE.TextureLoader();
        const baseTexture = textureLoader.load('textures/download (1).jpeg');      // A subtle color texture for epoxy
        const grungeTexture = textureLoader.load('textures/OIP.jpeg'); // A grunge overlay texture for realism
        const glossTexture = textureLoader.load('textures/OIP (1).jpeg');       // A gloss map for reflections
    
        // Set texture wrapping and repeat to match large floor area
        baseTexture.wrapS = baseTexture.wrapT = THREE.RepeatWrapping;
        grungeTexture.wrapS = grungeTexture.wrapT = THREE.RepeatWrapping;
        glossTexture.wrapS = glossTexture.wrapT = THREE.RepeatWrapping;
    
        baseTexture.repeat.set(20, 20);
        grungeTexture.repeat.set(20, 20);
        glossTexture.repeat.set(20, 20);
    
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,         // Dark grey base color for epoxy
            map: baseTexture,        // Apply base texture
            roughnessMap: grungeTexture, // Adds realistic imperfections
            roughness: 0.25,         // Slightly higher roughness for subdued gloss
            metalness: 0.05,         // Very slight metallic look
            envMapIntensity: 0.4,    // Reduced reflection intensity for a subtle shine
        });
    
        // Optional: Subtle checkered pattern overlay
        const checkeredFloorMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,         // Black for checker pattern
            roughness: 0.3,
            metalness: 0.1,
            opacity: 0.08,           // Semi-transparent for a subtle checker effect
            transparent: true,
        });
    
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
    
        const checkeredFloor = new THREE.Mesh(floorGeometry, checkeredFloorMaterial);
        checkeredFloor.rotation.x = -Math.PI / 2;
        checkeredFloor.position.y = 0.01; // Slightly above the main floor
    
        // Add both layers to the scene
        scene.add(floor);
        scene.add(checkeredFloor);
    }
    

    function addGarageDetails() {
        // Materials
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x8c8c8c,
            roughness: 0.3,
            metalness: 0.8
        });
    
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xe0e0e0,
            roughness: 0.7,
            metalness: 0.2
        });
    
        // Modern Industrial Walls with Windows
        const wallHeight = 400;
        const wallSegments = 10;
        
        for (let i = 0; i < wallSegments; i++) {
            // Back wall with industrial windows
            const windowSection = new THREE.Group();
            
            // Wall section
            const wallSegment = new THREE.Mesh(
                new THREE.BoxGeometry(100, wallHeight, 20),
                wallMaterial
            );
            
            // Industrial window frame
            if (i % 2 === 1) {  // Add windows to alternate segments
                const frameGeometry = new THREE.BoxGeometry(80, 150, 5);
                const windowFrame = new THREE.Mesh(frameGeometry, metalMaterial);
                windowFrame.position.set(0, wallHeight/2 - 100, 2);
                
                // Window glass
                const glassGeometry = new THREE.PlaneGeometry(70, 140);
                const glassMaterial = new THREE.MeshPhysicalMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.3,
                    roughness: 0.05,
                    metalness: 0.1,
                    transmission: 0.95
                });
                const windowGlass = new THREE.Mesh(glassGeometry, glassMaterial);
                windowGlass.position.set(0, wallHeight/2 - 100, 2);
                
                windowSection.add(windowFrame);
                windowSection.add(windowGlass);
            }
            
            windowSection.add(wallSegment);
            windowSection.position.set(-450 + (i * 100), wallHeight/2, -490);
            scene.add(windowSection);
        }
    
        // Modern Tool Storage System
        const toolStorageSystem = new THREE.Group();
        
        // Main cabinet body
        const cabinetBody = new THREE.Mesh(
            new THREE.BoxGeometry(300, 200, 60),
            new THREE.MeshStandardMaterial({
                color: 0x2c3e50,
                metalness: 0.7,
                roughness: 0.2
            })
        );
    
        // Add drawer details
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                const drawer = new THREE.Mesh(
                    new THREE.BoxGeometry(90, 45, 2),
                    new THREE.MeshStandardMaterial({
                        color: 0x34495e,
                        metalness: 0.8,
                        roughness: 0.1
                    })
                );
                drawer.position.set(-90 + (j * 95), -75 + (i * 50), 31);
                
                // Drawer handle
                const handle = new THREE.Mesh(
                    new THREE.CylinderGeometry(2, 2, 40, 8),
                    metalMaterial
                );
                handle.rotation.z = Math.PI / 2;
                handle.position.set(-90 + (j * 95), -75 + (i * 50), 35);
                
                cabinetBody.add(drawer);
                cabinetBody.add(handle);
            }
        }
        
        toolStorageSystem.add(cabinetBody);
        toolStorageSystem.position.set(-350, 100, -450);
        scene.add(toolStorageSystem);
    
        // Modern Workbench with LED Lighting
        const workbenchSystem = new THREE.Group();
        
        // Main bench surface
        const benchTop = new THREE.Mesh(
            new THREE.BoxGeometry(250, 10, 80),
            new THREE.MeshStandardMaterial({
                color: 0x2c3e50,
                metalness: 0.3,
                roughness: 0.7
            })
        );
        
        // Steel frame legs
        const legGeometry = new THREE.BoxGeometry(5, 90, 5);
        const legPositions = [
            [-120, -45, -35], [-120, -45, 35],
            [120, -45, -35], [120, -45, 35]
        ];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, metalMaterial);
            leg.position.set(...pos);
            workbenchSystem.add(leg);
        });
        
        // LED strip under the bench top
        const ledStrip = new THREE.Mesh(
            new THREE.BoxGeometry(240, 2, 2),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        ledStrip.position.set(0, -5, -38);
        
        workbenchSystem.add(benchTop);
        workbenchSystem.add(ledStrip);
        workbenchSystem.position.set(350, 95, 400);
        scene.add(workbenchSystem);
    
        // Modern Tire Display Rack
        const tireDisplaySystem = new THREE.Group();
        
        // Vertical support beams
        const supportGeometry = new THREE.BoxGeometry(5, 300, 5);
        const supports = [
            new THREE.Mesh(supportGeometry, metalMaterial),
            new THREE.Mesh(supportGeometry, metalMaterial)
        ];
        supports[0].position.set(-40, 150, 0);
        supports[1].position.set(40, 150, 0);
        supports.forEach(support => tireDisplaySystem.add(support));
        
        // Tire displays with angled mounts
        for (let i = 0; i < 4; i++) {
            const mount = new THREE.Mesh(
                new THREE.BoxGeometry(90, 5, 40),
                metalMaterial
            );
            mount.rotation.z = Math.PI * 0.1;
            mount.position.set(0, 50 + (i * 70), 0);
            
            const tire = new THREE.Mesh(
                new THREE.TorusGeometry(25, 10, 16, 100),
                new THREE.MeshStandardMaterial({
                    color: 0x1a1a1a,
                    roughness: 0.9,
                    metalness: 0.1
                })
            );
            tire.rotation.x = Math.PI / 2;
            tire.position.set(0, 50 + (i * 70), 20);
            
            tireDisplaySystem.add(mount);
            tireDisplaySystem.add(tire);
        }
        
        tireDisplaySystem.position.set(450, 0, -400);
        scene.add(tireDisplaySystem);
    
        // Add floor markings
        const markingsGeometry = new THREE.PlaneGeometry(800, 800);
        const markingsTexture = new THREE.TextureLoader().load('textures/floor-markings.png');
        const markingsMaterial = new THREE.MeshBasicMaterial({
            map: markingsTexture,
            transparent: true,
            opacity: 0.4
        });
        const floorMarkings = new THREE.Mesh(markingsGeometry, markingsMaterial);
        floorMarkings.rotation.x = -Math.PI / 2;
        floorMarkings.position.y = 0.1;
        scene.add(floorMarkings);
    
        // Add safety equipment
        addSafetyEquipment();
    }
    
    function addSafetyEquipment() {
        // Fire Extinguisher with a metallic red look
        const extinguisherGroup = new THREE.Group();
    
        // Main cylinder with a glossy metallic red finish
        const cylinder = new THREE.Mesh(
            new THREE.CylinderGeometry(5, 5, 40, 32),
            new THREE.MeshStandardMaterial({ 
                color: 0xcc0000,
                metalness: 0.9,
                roughness: 0.3
            })
        );
    
        // Nozzle with dark metallic appearance
        const nozzle = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 2, 10, 16),
            new THREE.MeshStandardMaterial({ 
                color: 0x1a1a1a,
                metalness: 0.8,
                roughness: 0.2
            })
        );
        nozzle.position.y = 25;
    
        // Gauge with a slight shine
        const gauge = new THREE.Mesh(
            new THREE.CircleGeometry(2, 32),
            new THREE.MeshStandardMaterial({ 
                color: 0xf0f0f0,
                metalness: 0.5,
                roughness: 0.2
            })
        );
        gauge.rotation.x = -Math.PI / 2;
        gauge.position.set(3, 10, 2);
    
        // Wall mount bracket
        const bracket = new THREE.Mesh(
            new THREE.BoxGeometry(8, 15, 4),
            new THREE.MeshStandardMaterial({ 
                color: 0x404040,
                metalness: 0.7,
                roughness: 0.3
            })
        );
        bracket.position.z = 3;
    
        extinguisherGroup.add(cylinder, nozzle, gauge, bracket);
    
        // Position fire extinguisher on wall
        extinguisherGroup.position.set(-300, 240, -480);
        scene.add(extinguisherGroup);
    
        // First Aid Kit with a rugged look
        const kitGroup = new THREE.Group();
    
        // Main box for the first aid kit
        const firstAidKit = new THREE.Mesh(
            new THREE.BoxGeometry(30, 30, 10),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.3,
                roughness: 0.7
            })
        );
    
        // Red border and cross for detail
        const borderMaterial = new THREE.MeshStandardMaterial({
            color: 0xe60000,
            metalness: 0.2,
            roughness: 0.6
        });
        const kitBorder = new THREE.Mesh(new THREE.BoxGeometry(32, 32, 9), borderMaterial);
        kitBorder.position.z = -0.5;
        
        const redCross = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 1), borderMaterial);
        redCross.position.z = 5.1;
        const verticalCross = redCross.clone();
        verticalCross.rotation.z = Math.PI / 2;
    
        // Wall mount for the first aid kit
        const kitMount = new THREE.Mesh(
            new THREE.BoxGeometry(34, 34, 2),
            new THREE.MeshStandardMaterial({
                color: 0x404040,
                metalness: 0.6,
                roughness: 0.4
            })
        );
        kitMount.position.z = -6;
    
        kitGroup.add(kitMount, kitBorder, firstAidKit, redCross, verticalCross);
        
        // Position first aid kit above the extinguisher
        kitGroup.position.set(-300, 300, -480);
        scene.add(kitGroup);
    
        // Subtle accent lighting for enhanced appearance
        const safetyLight1 = new THREE.PointLight(0xffffff, 0.2, 100);
        safetyLight1.position.set(-300, 300, -460);
        scene.add(safetyLight1);
    
        const safetyLight2 = new THREE.PointLight(0xffffff, 0.2, 100);
        safetyLight2.position.set(-300, 240, -460);
        scene.add(safetyLight2);
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
    
    function createTools() {
        const toolsGroup = new THREE.Group();
        
        // Materials
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x8c8c8c,
            roughness: 0.3,
            metalness: 0.8
        });
        
        const rubberMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9,
            metalness: 0.1
        });
    
        const redPlasticMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.7,
            metalness: 0.2
        });
    
        // 1. Socket Wrench Set
        const socketSet = new THREE.Group();
        
        // Socket wrench handle
        const handle = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1, 20, 8),
            metalMaterial
        );
        handle.rotation.z = Math.PI / 2;
        
        // Socket head
        const socket = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2, 5, 6),
            metalMaterial
        );
        socket.position.x = 12;
        socket.rotation.z = Math.PI / 2;
        
        socketSet.add(handle);
        socketSet.add(socket);
        socketSet.position.set(350, 100, 380); // Position on workbench
    
        // 2. Hydraulic Floor Jack
        const jackGroup = new THREE.Group();
        
        // Base
        const jackBase = new THREE.Mesh(
            new THREE.BoxGeometry(40, 5, 60),
            metalMaterial
        );
        
        // Lift arm
        const liftArm = new THREE.Mesh(
            new THREE.BoxGeometry(30, 3, 40),
            metalMaterial
        );
        liftArm.position.set(0, 10, -10);
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(3, 3, 3, 16);
        const frontLeftWheel = new THREE.Mesh(wheelGeometry, rubberMaterial);
        frontLeftWheel.rotation.z = Math.PI / 2;
        frontLeftWheel.position.set(-15, -2, -25);
        
        const frontRightWheel = frontLeftWheel.clone();
        frontRightWheel.position.set(15, -2, -25);
        
        const backLeftWheel = frontLeftWheel.clone();
        backLeftWheel.position.set(-15, -2, 25);
        
        const backRightWheel = frontLeftWheel.clone();
        backRightWheel.position.set(15, -2, 25);
        
        jackGroup.add(jackBase);
        jackGroup.add(liftArm);
        jackGroup.add(frontLeftWheel);
        jackGroup.add(frontRightWheel);
        jackGroup.add(backLeftWheel);
        jackGroup.add(backRightWheel);
        jackGroup.position.set(-100, 0, 200);
    
        // Create a canvas texture for the screen
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const screenTexture = new THREE.CanvasTexture(canvas);

        // Function to update the screen with diagnostic information
        function updateScreen(text) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'lime';
            ctx.font = '30px Arial';
            ctx.fillText(text, 20, 50);

            screenTexture.needsUpdate = true;
        }

        // Main body of the scanner
        const scannerBody = new THREE.Mesh(
            new THREE.BoxGeometry(15, 25, 3),
            redPlasticMaterial
        );

        // Screen with dynamic texture
        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 20),
            new THREE.MeshBasicMaterial({ map: screenTexture })
        );
        screen.position.z = 1.6;

        // Buttons for interaction
        const buttonGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
        const buttonMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
        const button1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
        const button2 = button1.clone();
        button1.position.set(-5, -8, 2);
        button2.position.set(5, -8, 2);

        // Add event listener for interactions
        button1.userData = { type: 'engine' };
        button2.userData = { type: 'tires' };

        // Grouping scanner components
        const scanner = new THREE.Group();
        scanner.add(scannerBody);
        scanner.add(screen);
        scanner.add(button1);
        scanner.add(button2);
        scanner.position.set(350, 105, 390);

        // Add the scanner to the scene
        scene.add(scanner);

        // Raycaster for detecting button clicks
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        function onMouseClick(event) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects([button1, button2]);

            if (intersects.length > 0) {
                const buttonType = intersects[0].object.userData.type;
                if (buttonType === 'engine') {
                    updateScreen('Engine: OK\nOil Level: Low');
                } else if (buttonType === 'tires') {
                    updateScreen('Tire Pressure: Front Low\nRear: OK');
                }
            }
        }

        window.addEventListener('click', onMouseClick);
        

    
        // 4. Oil Drain Pan
        const panGroup = new THREE.Group();
        
        const pan = new THREE.Mesh(
            new THREE.CylinderGeometry(20, 15, 10, 32),
            new THREE.MeshStandardMaterial({
                color: 0x2c3e50,
                roughness: 0.5,
                metalness: 0.3
            })
        );
        
        panGroup.add(pan);
        panGroup.position.set(0, 5, 0);
    
        // 5. Mechanic's Creeper
        const creeperGroup = new THREE.Group();
        
        // Creeper board
        const board = new THREE.Mesh(
            new THREE.BoxGeometry(60, 3, 120),
            redPlasticMaterial
        );
        
        // Headrest
        const headrest = new THREE.Mesh(
            new THREE.BoxGeometry(40, 8, 20),
            new THREE.MeshStandardMaterial({
                color: 0x000000,
                roughness: 0.9,
                metalness: 0.1
            })
        );
        headrest.position.z = -45;
        headrest.position.y = 2;
        
        // Add wheels (6 of them)
        const creeperWheelGeometry = new THREE.CylinderGeometry(3, 3, 2, 16);
        const wheelPositions = [
            [-25, -2, -50], [25, -2, -50],
            [-25, -2, 0], [25, -2, 0],
            [-25, -2, 50], [25, -2, 50]
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(creeperWheelGeometry, rubberMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            creeperGroup.add(wheel);
        });
        
        creeperGroup.add(board);
        creeperGroup.add(headrest);
        creeperGroup.position.set(-200, 5, 0);
    
        // Add all tool groups to the main tools group
        toolsGroup.add(socketSet);
        toolsGroup.add(jackGroup);
        toolsGroup.add(scanner);
        toolsGroup.add(panGroup);
        toolsGroup.add(creeperGroup);
        
        return toolsGroup;

    }
    function connectToolToCar() {
        const toolPosition = new THREE.Vector3(350, 105, 390); // Diagnostic tool position
        const carPosition = carGroup.position.clone(); // Car's position
        carPosition.y += 108; // Adjust height if necessary
    
        // Create wire geometry
        const wireGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        const wireMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const wire = new THREE.Mesh(wireGeometry, wireMaterial);
    
        // Calculate the midpoint and length of the wire
        const midpoint = new THREE.Vector3().addVectors(toolPosition, carPosition).divideScalar(2);
        const length = toolPosition.distanceTo(carPosition);
        wire.scale.set(1, length / 2, 1); // Adjust height scale
    
        // Align the wire with the positions
        const direction = new THREE.Vector3().subVectors(carPosition, toolPosition).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        wire.quaternion.copy(quaternion);
    
        // Position the wire at the midpoint
        wire.position.copy(midpoint);
    
        // Add the wire to the scene
        scene.add(wire);
    }
    
    
    function isCarCentered() {
        // Assuming the lift is centered at (0, 0, 0) and checking tolerance
        const tolerance = 20; // Adjust as needed
        return Math.abs(carGroup.position.x) < tolerance && Math.abs(carGroup.position.z) < tolerance;
    }
    function centerCar() {
        const startX = carGroup.position.x;
        const startZ = carGroup.position.z;
        const targetX = 0;
        const targetZ = 0;
        const duration = 2000; // 2 seconds for centering animation
        const startTime = performance.now();
    
        function animateCarToCenter(currentTime) {
            let elapsedTime = currentTime - startTime;
            let progress = elapsedTime / duration;
            progress = Math.min(progress, 1); // Ensure progress does not exceed 1
    
            // Interpolate position
            carGroup.position.x = startX + (targetX - startX) * progress;
            carGroup.position.z = startZ + (targetZ - startZ) * progress;
    
            // Continue animation until progress reaches 1
            if (progress < 1) {
                requestAnimationFrame(animateCarToCenter);
            }
        }
    
        requestAnimationFrame(animateCarToCenter);
    }
    
    
    
    // Add this line in your init() function, after creating the workbench:
    

    function raiseCar() {
        if (!isCarCentered()) {
            displayWarning();
            return; // Exit the function if the car is not centered
        }
    
        if (!isCarRaised) {
            let startPosition = liftRampGroup.position.y;
            let targetPosition = 80;
            let startTime = performance.now();
    
            function raiseCarAnimation(currentTime) {
                let elapsedTime = currentTime - startTime;
                let progress = elapsedTime / raiseCarDuration;
                progress = Math.min(progress, 1);
    
                liftRampGroup.position.y = startPosition + (targetPosition - startPosition) * progress;
                carGroup.position.y = startPosition + (targetPosition - startPosition) * progress;
    
                if (progress > 0 && progress < 1) {
                    if (!liftAudio.isPlaying) { // Use a flag to track playback state
                        liftAudio.currentTime = 0; // Ensure audio starts from the beginning
                        liftAudio.play();
                        liftAudio.isPlaying = true; // Set the flag to true
                    }
                } else {
                    liftAudio.pause();
                    liftAudio.currentTime = 0;
                    liftAudio.isPlaying = false; // Reset the flag
                }
    
                if (progress < 1) {
                    requestAnimationFrame(raiseCarAnimation);
                } else {
                    isCarRaised = true;
                    liftAudio.pause();
                    liftAudio.currentTime = 0;
                    liftAudio.isPlaying = false; // Reset the flag
                }
            }
    
            requestAnimationFrame(raiseCarAnimation);
        }
    }
    
    function lowerCar() {
        if (isCarRaised) {
            let startPosition = liftRampGroup.position.y;
            let targetPosition = -10;
            let startTime = performance.now();
    
            function lowerCarAnimation(currentTime) {
                let elapsedTime = currentTime - startTime;
                let progress = elapsedTime / raiseCarDuration;
                progress = Math.min(progress, 1);
    
                liftRampGroup.position.y = startPosition - (startPosition - targetPosition) * progress;
                carGroup.position.y = startPosition - (startPosition - targetPosition) * progress;
    
                if (progress > 0 && progress < 1) {
                    if (!liftAudio.isPlaying) {
                        liftAudio.currentTime = 0; // Ensure audio starts from the beginning
                        liftAudio.play();
                        liftAudio.isPlaying = true; // Set the flag to true
                    }
                } else {
                    liftAudio.pause();
                    liftAudio.currentTime = 0;
                    liftAudio.isPlaying = false; // Reset the flag
                }
    
                if (progress < 1) {
                    requestAnimationFrame(lowerCarAnimation);
                } else {
                    isCarRaised = false;
                    liftAudio.pause();
                    liftAudio.currentTime = 0;
                    liftAudio.isPlaying = false; // Reset the flag
                }
            }
    
            requestAnimationFrame(lowerCarAnimation);
        }
    }
    
    
    
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth - 220, window.innerHeight - 60);
    }

    function animate() {
        requestAnimationFrame(animate);
    
        // Rotate the car and lift bed if the rotation toggle is active and the car is centered
        if (isRotating && carGroup) {
            if (isCarCentered()) {
                carGroup.rotation.y += rotationSpeed; // Rotate the car group
                liftRampGroup.rotation.y += rotationSpeed; // Rotate the lift group
            } else {
                isRotating = false; // Stop rotation if not centered
                alert("Please center the car before rotating!"); // Display warning
                const rotationButton = document.getElementById('rotation-button');
                if (rotationButton) {
                    rotationButton.textContent = 'Rotate'; // Reset button text
                }
            }
        }
    
        if (isCarStarted && carGroup) {
            if (!isCarRaised) {
                if (moveForward) carGroup.position.z -= carSpeed;
                if (moveBackward) carGroup.position.z += carSpeed;
                if (moveLeft) carGroup.position.x -= carSpeed;
                if (moveRight) carGroup.position.x += carSpeed;
            }
        } else {
            // Reset all movement flags if the car is off
            moveForward = false;
            moveBackward = false;
            moveLeft = false;
            moveRight = false;
        }
    
        controls.update();
        renderer.render(scene, camera);
    }
    
    
    
    
    
    function handleKeyDown(event) {
        const zoomSpeed = 20; // Adjust zoom speed as needed
        const minZoom = 200;  // Minimum distance (zoom in limit)
        const maxZoom = 2000; // Maximum distance (zoom out limit)
    
        if (event.key === '+') {
            console.log('Zooming in');
            camera.position.z = Math.max(camera.position.z - zoomSpeed, minZoom); // Zoom in, but don't go closer than minZoom
        } else if (event.key === '-') {
            console.log('Zooming out');
            camera.position.z = Math.min(camera.position.z + zoomSpeed, maxZoom); // Zoom out, but don't go farther than maxZoom
        }
        camera.updateProjectionMatrix(); // Update the camera projection
    }
    
    // Add event listener for keyboard zoom control
    document.addEventListener("keydown", handleKeyDown);
    function displayWarning() {
        alert("Center the car on the lift!");
    }
    
    
    

    // Add keyboard event listener for raise/lower controls
    function setupUIControls() {
        // Create a container for all buttons
        const container = document.createElement('div');
        container.classList.add('button-container');
        document.body.appendChild(container);

        const toggleSwitch = document.createElement('input');
        toggleSwitch.type = 'checkbox';
        toggleSwitch.id = 'toggle-switch';
        toggleSwitch.style.width = '40px';
        toggleSwitch.style.height = '20px';
        toggleSwitch.style.cursor = 'pointer';

        const switchLabel = document.createElement('label');
        switchLabel.textContent = 'Enable Car Start';
        switchLabel.htmlFor = 'toggle-switch';
        switchLabel.style.marginLeft = '10px';

        container.appendChild(toggleSwitch);
        container.appendChild(switchLabel);
        toggleSwitch.addEventListener('change', () => {
            isSwitchOn = toggleSwitch.checked; // True if the switch is toggled on
        });


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
        const centerCarButton = document.createElement('button');
        centerCarButton.id = 'center-car-button';
        centerCarButton.textContent = 'Center Car';
        centerCarButton.classList.add('button');
        container.appendChild(centerCarButton);

        // Event listener to center the car
        centerCarButton.addEventListener('click', () => {
            centerCar(); // Call the new animation function
        });
        
        const startCarButton = document.createElement('button');
        startCarButton.id = 'start-car-button';
        startCarButton.textContent = 'Start/Stop';
        startCarButton.classList.add('button');
        container.appendChild(startCarButton);
        startCarButton.addEventListener('click', () => {
            if (!isSwitchOn) {
                alert("Switch is off! Centering, lifting, and calling the mechanic...");
                centerCar(); // Automatically center the car
                setTimeout(() => {
                    raiseCar(); // Raise the car after centering
                    mechanicWorkSequence(); // Call the mechanic to work under the car
                }, 2000); // Add delay to ensure centering completes first
            } else if (!isCarStarted) {
                carStartAudio.play();
                isCarStarted = true;
                startCarButton.textContent = "Stop Car";
                alert("Car started. You can now move the car.");
            } else {
                isCarStarted = false;
                startCarButton.textContent = "Start Car";
                carStartAudio.pause();
                carStartAudio.currentTime = 0;
                alert("Car turned off.");
            }
        });
        
        
        
        

        // Raise Car Button
        const raiseCarButton = document.createElement('button');
        raiseCarButton.id = 'raise-car-button';
        raiseCarButton.textContent = 'Raise/Lower';
        raiseCarButton.classList.add('button');
        container.appendChild(raiseCarButton);

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
        
        raiseCarButton.addEventListener('click', () => {
            if (!isCarRaised) {
                raiseCar(); // Raise the car if not already raised
            } else {
                lowerCar(); // Lower the car if it's already raised
            }
        });
        
    }

    // Add keyboard event listener for raise/lower controls
    document.addEventListener('keydown', (event) => {
        const raiseCarButton = document.getElementById('raise-car-button');
        
        if (event.key.toLowerCase() === 'r' && !isCarRaised) {
            raiseCarButton.textContent = 'Lower Car';
            raiseCar();
        } else if (event.key.toLowerCase() === 'l' && isCarRaised) {
            raiseCarButton.textContent = 'Raise Car';
            lowerCar();
        }
    });
    document.addEventListener('keydown', (event) => {
        // Prevent movement if the car is raised
        if (isCarRaised) {
            return; // Exit early if the car is raised
        }
    
        switch (event.key.toLowerCase()) {
            case 'w':
                moveForward = true;
                break;
            case 's':
                moveBackward = true;
                break;
            case 'a':
                moveLeft = true;
                break;
            case 'd':
                moveRight = true;
                break;
        }
    });
    
    document.addEventListener('keyup', (event) => {
        switch (event.key.toLowerCase()) {
            case 'w':
                moveForward = false;
                break;
            case 's':
                moveBackward = false;
                break;
            case 'a':
                moveLeft = false;
                break;
            case 'd':
                moveRight = false;
                break;
        }
    });
    function handleKeyDown(event) {
        if (!isCarStarted) {
            displayWarnig();
            return; // Prevent movement flags from being set
        }
    
        switch (event.key.toLowerCase()) {
            case 'w': moveForward = true; break;
            case 's': moveBackward = true; break;
            case 'a': moveLeft = true; break;
            case 'd': moveRight = true; break;
        }
    }
    function handleKeyUp(event) {
        switch (event.key.toLowerCase()) {
            case 'w': moveForward = false; break;
            case 's': moveBackward = false; break;
            case 'a': moveLeft = false; break;
            case 'd': moveRight = false; break;
        }
    }
    
    
    
    function displayWarnig() {
        alert("Start the car before moving!");
    }
    
    
    
    
    
    init();
});