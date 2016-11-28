// firstcube.js
// Simulate a basic scene using Three.js and Physijs.


// ------- //
// Physijs //
// ------- //
Physijs.scripts.worker = 'js/framework/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';


// ---------------------------------- //
// Define objects used by the program //
// ---------------------------------- //

// Scene, camera and renderer.
var scene, camera, renderer;

// Ground plane.
var plane;

// Cube mesh.
var geometry, material, mesh;

// Statistics
var stats, rendererStats;

// Tree mesh
var mesh2, treeMesh;

// Physics time step.
var physicsTimeStep = 1/120;

// Keyboard keys.
var Keys = {
		up: false,
		down: false,
		left: false,
		right: false,
		jump: false
};

// Track player rotation.
var playerRotation;

// Controls.
var controls;

// Define handler for keyboard key press.
window.onkeydown = function(e) {
	var kc = e.keyCode;
	e.preventDefault();
	
	if( kc === 65) {
		Keys.left = true;
	}
	else if (kc === 87) {
		Keys.up = true;
	}
	else if (kc === 68) {
		Keys.right = true;
	}
	else if (kc === 83) {
		Keys.down = true;
	}
	else if (kc === 32) {
		Keys.jump = true;
	}
};

// Define handler for keyboard key release.
window.onkeyup = function(e) {
	var kc = e.keyCode;
	e.preventDefault();
	
	if( kc === 65) {
		Keys.left = false;
	}
	else if (kc === 87) {
		Keys.up = false;
	}
	else if (kc === 68) {
		Keys.right = false;
	}
	else if (kc === 83) {
		Keys.down = false;
	}
	else if (kc === 32) {
		Keys.jump = false;
	}
};

// Track if a key was pressed.
var keyUpdate = false;


// ------- //
// Process //
// ------- //

// Initialise the scene.
init();

// Create trees.
createTree1(2.5, 4, 0, 7);
createTree2(2.5, -4, 0, 5);
createTree2(1.5, -6, 0, 3);
createTree2(2.0, -8, 0, 2);
createTree2(2.25, -3, 0, 2);

// Animate the scene.
animate();


// ----------- //
// Definitions //
// ----------- //

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
    scene = new Physijs.Scene({
    	fixedTimeStep: (physicsTimeStep) 
    });
    scene.setGravity(new THREE.Vector3(0, -50, 0));

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
    var planeMeshFriction = 0.25;
    var planeMeshRestitution = 0.75;
    var planeMaterial = Physijs.createMaterial(
    	new THREE.MeshPhongMaterial({  
    		color: 0x335522, 
    	    specular: 0x444444,
    	    shading: THREE.SmoothShading,
    	}),
    	planeMeshFriction,
    	planeMeshRestitution
    );
    plane = new Physijs.BoxMesh(new THREE.BoxGeometry(150, 1, 150), planeMaterial, 0, 1);
    plane.position.set( 0, -0.5, -2 );
    plane.receiveShadow = true;
    
    scene.add(plane);

    // Define controls.
    controls = new THREE.OrbitControls(camera, renderer.domElement);

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

    // Initialise player rotation.
    playerRotation = 0;
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
    controls.update();
    
    update();
    
    scene.simulate(undefined, 5);
}

function render() {
    renderer.render(scene, camera);
}

function update() {
	var rotFactor = 0.05;
	if (Keys.left) {
		keyUpdate = true;
		playerRotation += rotFactor;
		playerMesh.rotation.y += rotFactor;
		playerMesh.__dirtyRotation = true;
	}
	if (Keys.up) {
		keyUpdate = true;
		playerMesh.position.x += 0.1 * Math.cos(playerRotation);
		playerMesh.position.z -= 0.1 * Math.sin(playerRotation);
		playerMesh.__dirtyPosition = true;
	}
	if (Keys.right) {
		keyUpdate = true;
		playerRotation -= rotFactor;
		playerMesh.rotation.y -= rotFactor;
		playerMesh.__dirtyRotation = true;
	}
	if (Keys.down) {
		keyUpdate = true;
		playerMesh.position.x -= 0.1 * Math.cos(playerRotation);
		playerMesh.position.z += 0.1 * Math.sin(playerRotation);
		playerMesh.__dirtyPosition = true;
	}
	if (Keys.jump) {
		keyUpdate = true;
		playerMesh.position.y += 0.05;
		playerMesh.__dirtyPosition = true;
	}
	
	if (keyUpdate) {
		//render();
	}
}