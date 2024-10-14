document.addEventListener("DOMContentLoaded", () => {
    let scene, camera, renderer, controls;
    let carGroup; // Group for the car
  
    function init() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xdddddd);
  
      // Setup camera
      camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
      camera.position.set(800, 100, 1000); // Adjust initial camera position
      camera.lookAt(0, 0, 0); // Look at the center of the garage
  
      // Lighting setup
      const ambientLight = new THREE.AmbientLight(0x404040, 2);
      scene.add(ambientLight);
  
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(0, 1, 0);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
  
      const pointLight1 = new THREE.PointLight(0xc4c4c4, 2);
      pointLight1.position.set(0, 300, 500);
      scene.add(pointLight1);
  
      const pointLight2 = new THREE.PointLight(0xc4c4c4, 2);
      pointLight2.position.set(500, 100, 0);
      scene.add(pointLight2);
  
      const pointLight3 = new THREE.PointLight(0xc4c4c4, 2);
      pointLight3.position.set(0, 100, -500);
      scene.add(pointLight3);
  
      const pointLight4 = new THREE.PointLight(0xc4c4c4, 2);
      pointLight4.position.set(-500, 300, 500);
      scene.add(pointLight4);
  
      // Renderer setup
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth - 220, window.innerHeight - 60);
      document.getElementById('3d-view').appendChild(renderer.domElement);
  
      // Create a group for the car model
      carGroup = new THREE.Group();
      scene.add(carGroup);
  
      // Load the car model into carGroup
      const loader = new THREE.GLTFLoader();
      loader.load('scene.gltf', function (gltf) {
        const car = gltf.scene;
        car.scale.set(2, 2, 2);
        carGroup.add(car); // Add the car model to the carGroup only
        animate();
      });
  
      // Add orbit controls
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0, 0); // Set the target to the center of the garage
      controls.enableDamping = true; // Smooth transitions
      controls.dampingFactor = 0.25;
      controls.update();
  
      // Inner Ground (Light Grey)
      const floorGeometry = new THREE.BoxGeometry(1000, 1, 1000);
      const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xd3d3d3 }); // Light grey floor
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.position.y = -50;
      floor.receiveShadow = true;
      scene.add(floor);
  
      // Inner and Outer Side Walls and Ceiling
      const innerWallMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 }); // Grey inner walls and ceiling
      const outerWallMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // Yellow outer walls
      const outerCeilingMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 }); // Grey outer ceiling
      const wallHeight = 500;
  
      // Left Wall
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(10, wallHeight, 1000), innerWallMaterial);
      leftWall.position.set(-500, wallHeight / 2 - 50, 0);
      leftWall.material.side = THREE.BackSide; // Inner side grey
      leftWall.material.needsUpdate = true;
      const leftWallOuter = new THREE.Mesh(new THREE.BoxGeometry(10, wallHeight, 1000), outerWallMaterial);
      leftWallOuter.position.set(-500, wallHeight / 2 - 50, 0);
      scene.add(leftWall, leftWallOuter);
  
      // Right Wall
      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(10, wallHeight, 1000), innerWallMaterial);
      rightWall.position.set(500, wallHeight / 2 - 50, 0);
      rightWall.material.side = THREE.BackSide; // Inner side grey
      rightWall.material.needsUpdate = true;
      const rightWallOuter = new THREE.Mesh(new THREE.BoxGeometry(10, wallHeight, 1000), outerWallMaterial);
      rightWallOuter.position.set(500, wallHeight / 2 - 50, 0);
      scene.add(rightWall, rightWallOuter);
  
      // Back Wall
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(1000, wallHeight, 10), innerWallMaterial);
      backWall.position.set(0, wallHeight / 2 - 50, -500);
      backWall.material.side = THREE.BackSide; // Inner side grey
      backWall.material.needsUpdate = true;
      const backWallOuter = new THREE.Mesh(new THREE.BoxGeometry(1000, wallHeight, 10), outerWallMaterial);
      backWallOuter.position.set(0, wallHeight / 2 - 50, -500);
      scene.add(backWall, backWallOuter);
  
      // Ceiling
      const ceiling = new THREE.Mesh(new THREE.BoxGeometry(1000, 10, 1000), innerWallMaterial); // Inner ceiling grey
      ceiling.position.set(0, wallHeight - 50, 0);
      ceiling.material.side = THREE.BackSide;
      ceiling.material.needsUpdate = true;
      const outerCeiling = new THREE.Mesh(new THREE.BoxGeometry(1000, 10, 1000), outerCeilingMaterial); // Outer ceiling grey
      outerCeiling.position.set(0, wallHeight - 50, 0);
      scene.add(ceiling, outerCeiling);
  
      // Garage Name Text
      const fontLoader = new THREE.FontLoader();
      fontLoader.load('https://threejs.org/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new THREE.TextGeometry('SDS Auto Works', {
          font: font,
          size: 50,
          height: 5,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 1,
          bevelSize: 1,
          bevelOffset: 0,
          bevelSegments: 5
        });
  
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  
        // Position the text above the garage
        textMesh.position.set(0, wallHeight + 50, -480);
        textMesh.rotation.y = Math.PI; // Face the camera
        scene.add(textMesh);
      });
  
      // Zoom controls
      const MIN_ZOOM = 300;
      const MAX_ZOOM = 1500;
  
      document.getElementById("zoom-in").addEventListener("click", () => {
        if (camera.position.z > MIN_ZOOM) {
          camera.position.z -= 50;
          controls.update();
        }
      });
  
      document.getElementById("zoom-out").addEventListener("click", () => {
        if (camera.position.z < MAX_ZOOM) {
          camera.position.z += 50;
          controls.update();
        }
      });
  
      window.addEventListener('resize', onWindowResize);
    }
  
    function onWindowResize() {
      camera.aspect = (window.innerWidth - 220) / (window.innerHeight - 60);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth - 220, window.innerHeight - 60);
    }
  
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
  
    init();
    animate();
  });
  