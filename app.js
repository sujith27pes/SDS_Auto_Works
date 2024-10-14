document.addEventListener("DOMContentLoaded", () => {
    let scene, camera, renderer, controls;
    let carGroup; // Group to hold the car model

    // Initialize scene, camera, lights, and 3D objects
    function init() {
        // Create the scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xdddddd); // Set background color of the scene to light grey

        // Setup camera with perspective projection
        camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
        camera.position.set(800, 100, 1000); // Adjust the camera position
        camera.lookAt(0, 0, 0); // Focus the camera on the center of the garage

        // Add ambient light to the scene (soft overall light)
        const ambientLight = new THREE.AmbientLight(0x404040, 2); // Low-intensity ambient light
        scene.add(ambientLight);

        // Add directional light (light from a specific direction)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Simulating sunlight
        directionalLight.position.set(0, 1, 0); // Light coming from above
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Add several point lights (specific spots of light)
        const pointLight1 = new THREE.PointLight(0xc4c4c4, 2);
        pointLight1.position.set(0, 300, 500); // Positioned in front
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xc4c4c4, 2);
        pointLight2.position.set(500, 100, 0); // Positioned on the right
        scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0xc4c4c4, 2);
        pointLight3.position.set(0, 100, -500); // Positioned behind
        scene.add(pointLight3);

        const pointLight4 = new THREE.PointLight(0xc4c4c4, 2);
        pointLight4.position.set(-500, 300, 500); // Positioned on the left
        scene.add(pointLight4);

        // Set up WebGL renderer
        renderer = new THREE.WebGLRenderer({ antialias: true }); // Antialiasing for smoother edges
        renderer.setSize(window.innerWidth - 220, window.innerHeight - 60); // Set the size of the render
        document.getElementById('3d-view').appendChild(renderer.domElement); // Attach the renderer to the DOM

        // Create a group to hold the car model
        carGroup = new THREE.Group();
        scene.add(carGroup); // Add the group to the scene

        // Load and add the car model (GLTF format) to the carGroup
        const loader = new THREE.GLTFLoader();
        loader.load('scene.gltf', function (gltf) {
            const car = gltf.scene; // Get the car model from the GLTF file
            car.scale.set(2, 2, 2); // Scale the model to fit the scene
            carGroup.add(car); // Add the car to the carGroup
            animate(); // Start animation loop after model is loaded
        });

        // Set up orbit controls to allow the user to move the camera around the scene
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0); // Target the center of the garage
        controls.enableDamping = true; // Enable smooth damping
        controls.dampingFactor = 0.25; // Damping factor for smoothness
        controls.update(); // Update controls

        // Add a floor to the scene (light grey)
        const floorGeometry = new THREE.BoxGeometry(1000, 1, 1000);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xd3d3d3 }); // Light grey material for floor
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.y = -50; // Slightly below the car
        floor.receiveShadow = true; // Make it receive shadows
        scene.add(floor);

        // Add inner and outer walls and ceiling
        const innerWallMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 }); // Grey for inner walls
        const outerWallMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // Yellow for outer walls
        const outerCeilingMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 }); // Grey for outer ceiling
        const wallHeight = 500; // Height for the walls and ceiling

        // Left wall
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(10, wallHeight, 1000), innerWallMaterial);
        leftWall.position.set(-500, wallHeight / 2 - 50, 0); // Position the inner left wall
        leftWall.material.side = THREE.BackSide; // Make sure the inside is visible
        leftWall.material.needsUpdate = true;
        const leftWallOuter = new THREE.Mesh(new THREE.BoxGeometry(10, wallHeight, 1000), outerWallMaterial);
        leftWallOuter.position.set(-500, wallHeight / 2 - 50, 0); // Outer left wall
        scene.add(leftWall, leftWallOuter); // Add both inner and outer walls

        // Right wall
        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(10, wallHeight, 1000), innerWallMaterial);
        rightWall.position.set(500, wallHeight / 2 - 50, 0); // Inner right wall
        rightWall.material.side = THREE.BackSide; 
        rightWall.material.needsUpdate = true;
        const rightWallOuter = new THREE.Mesh(new THREE.BoxGeometry(10, wallHeight, 1000), outerWallMaterial);
        rightWallOuter.position.set(500, wallHeight / 2 - 50, 0); // Outer right wall
        scene.add(rightWall, rightWallOuter); // Add both right walls

        // Back wall
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(1000, wallHeight, 10), innerWallMaterial);
        backWall.position.set(0, wallHeight / 2 - 50, -500); // Inner back wall
        backWall.material.side = THREE.BackSide; 
        backWall.material.needsUpdate = true;
        const backWallOuter = new THREE.Mesh(new THREE.BoxGeometry(1000, wallHeight, 10), outerWallMaterial);
        backWallOuter.position.set(0, wallHeight / 2 - 50, -500); // Outer back wall
        scene.add(backWall, backWallOuter); // Add both back walls

        // Ceiling
        const ceiling = new THREE.Mesh(new THREE.BoxGeometry(1000, 10, 1000), innerWallMaterial); // Inner ceiling
        ceiling.position.set(0, wallHeight - 50, 0); // Position the inner ceiling
        ceiling.material.side = THREE.BackSide;
        ceiling.material.needsUpdate = true;
        const outerCeiling = new THREE.Mesh(new THREE.BoxGeometry(1000, 10, 1000), outerCeilingMaterial); // Outer ceiling
        outerCeiling.position.set(0, wallHeight - 50, 0); // Outer ceiling positioned the same
        scene.add(ceiling, outerCeiling); // Add both ceilings

        // Add text (Garage name)
        const fontLoader = new THREE.FontLoader();
        fontLoader.load('https://threejs.org/fonts/helvetiker_regular.typeface.json', function (font) {
            const textGeometry = new THREE.TextGeometry('SDS Auto Works', {
                font: font,
                size: 50, // Size of the text
                height: 5, // Depth of the text
                curveSegments: 12,
                bevelEnabled: true, // Enable bevel for 3D text effect
                bevelThickness: 1,
                bevelSize: 1,
                bevelOffset: 0,
                bevelSegments: 5
            });

            const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White color for text
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);

            // Position the text above the garage
            textMesh.position.set(0, wallHeight + 50, -480); // Slightly in front of the back wall
            textMesh.rotation.y = Math.PI; // Rotate the text to face the camera
            scene.add(textMesh);
        });

        // Set up zoom in and zoom out controls
        const MIN_ZOOM = 300; // Minimum zoom limit
        const MAX_ZOOM = 1500; // Maximum zoom limit

        document.getElementById("zoom-in").addEventListener("click", () => {
            if (camera.position.z > MIN_ZOOM) {
                camera.position.z -= 50; // Zoom in by decreasing z-position
                controls.update(); // Update the controls
            }
        });

        document.getElementById("zoom-out").addEventListener("click", () => {
            if (camera.position.z < MAX_ZOOM) {
                camera.position.z += 50; // Zoom out by increasing z-position
                controls.update(); // Update the controls
            }
        });

        // Adjust renderer size and camera aspect ratio on window resize
        window.addEventListener('resize', onWindowResize);
    }

    // Handle window resize event
    function onWindowResize() {
        camera.aspect = (window.innerWidth - 220) / (window.innerHeight - 60); // Update camera aspect ratio
        camera.updateProjectionMatrix(); // Update projection matrix
        renderer.setSize(window.innerWidth - 220, window.innerHeight - 60); // Resize renderer
    }

    // Animation loop
    function animate() {
        requestAnimationFrame(animate); // Request the next frame
        controls.update(); // Update orbit controls
        renderer.render(scene, camera); // Render the scene
    }

    init(); // Call init to set up the scene
    animate(); // Start animation loop
});
