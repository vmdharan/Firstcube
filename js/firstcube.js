// firstcube.js
// Simulate a basic scene using Three.js and Physijs.

// ---------------------------------- //
// Define objects used by the program //
// ---------------------------------- //
var scene, camera, renderer;
var plane, planeMaterial;
var geometry, material, mesh;

var stats, rendererStats;

// Initialise the scene.
init();

// Animate the scene.
animate();


// Initialisation
function init() {
    // Set up the statistics counter.
    // Panel value of 0 is fps, 1 is ms, 2 is mb, and 3+ for custom.
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    rendererStats   = new THREEx.RendererStats();
	rendererStats.domElement.style.position = 'absolute';
	rendererStats.domElement.style.left = '0px';
	rendererStats.domElement.style.bottom   = '0px';
	document.body.appendChild( rendererStats.domElement );

    // Set up the scene.
    scene = new THREE.Scene();

    var sceneWidth = window.innerWidth;
    var sceneHeight = window.innerHeight;
    var viewAngle = 45;
    var nearZ = 0.1;
    var farZ = 10000;

    // Set up the camera.
    camera = new THREE.PerspectiveCamera(
        viewAngle, 
        sceneWidth/sceneHeight, 
        nearZ, 
        farZ
    );
    camera.position.set(-8, 4, 12);
    camera.lookAt({ x:0, y:0, z:0 });

    // Configure the renderer.
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(sceneWidth, sceneHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = false;

    renderer.shadowCameraNear = 0.5;
    renderer.shadowCameraFar = camera.far;
    renderer.shadowCameraFov = viewAngle;

    renderer.shadowMapBias = 0.0001;
    renderer.shadowMapDarkness = 0.75;
    renderer.shadowMapWidth = 2048;
    renderer.shadowMapHeight = 2048;

    document.body.appendChild( renderer.domElement );

    // Configure lighting

    // Spot light
    var light = new THREE.SpotLight(0xFFFFFF);
    light.castShadow = true;
    light.position.set(-5, 5, -5);
    light.target.position.set(0, 0, 0);
    light.shadow.camera.fov = viewAngle;
    light.shadow.camera.near = nearZ;
    light.shadow.camera.far = farZ;
    light.shadow.mapSize.bias = 0.0001;
    light.shadow.mapSize.darkness = 0.75;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    scene.add(light);
    
   	var helper2 = new THREE.CameraHelper( light.shadow.camera );
	scene.add( helper2 );

    // Directional light
    var directionalLight = new THREE.DirectionalLight(0xFFFFFF);
    directionalLight.position.set(-30, 150, -30);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.fov = 50;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 1000;

    var helper = new THREE.CameraHelper( directionalLight.shadow.camera );
    scene.add( helper );
    
    scene.add(directionalLight);

    // Point light
    var pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.x = 40;
    pointLight.position.y = 10;
    pointLight.position.z = 50;

    scene.add(pointLight);

    // Add a plane to the scene.
    planeMaterial = new THREE.MeshPhongMaterial({ color: 0x335522 });
    plane = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), planeMaterial);
    plane.material.side = THREE.DoubleSide;
    plane.position.set( 0, 0, -2 );
    plane.rotation.x = Math.PI / 2;
    plane.receiveShadow = true;
    
    scene.add(plane);

    // Add a mesh to the scene.
    geometry = new THREE.BoxGeometry( 1, 1, 1 );
    material = new THREE.MeshPhongMaterial({  
    	color: 0x00aaee, 
    	specular: 0x444444,
        shading: THREE.SmoothShading,
    	});

    mesh = new THREE.Mesh( geometry, material );
    mesh.position.y = 2;
    mesh.castShadow = true;
    mesh.receiveShadow = false;

    scene.add(mesh);
    scene.add(camera);
}

// Animate
function animate() {
    requestAnimationFrame(animate);

    stats.begin();
    mesh.rotation.x += 0.002;
    mesh.rotation.y += 0.01;

    renderer.render(scene, camera);
    stats.end();

    rendererStats.update(renderer);
}