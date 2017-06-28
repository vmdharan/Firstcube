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

// UI scene and camera
var uiScene, uiCamera;

// UI Elements
const uiElements = {};

// Ground plane.
var plane;

// Cube mesh.
var geometry, material, mesh;

// Statistics
var stats, rendererStats;

// Tree mesh
var treeMesh;

// Blocks
var mesh2;

// Player
var playerMesh;

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

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

window.addEventListener('mousemove', onMouseMove, false);


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

// Draw roof mesh.
//drawRoof();

// Draw soil.    
drawSoilPatch(1, 0, -2);
drawSoilPatch(5, 0, -2);
drawSoilPatch(1, 0, -6);
drawSoilPatch(5, 0, -6);

// Import mesh.
//loadJSON();

// Animate the scene.
animate();


// ----------- //
// Definitions //
// ----------- //

function onMouseMove(event) {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

// Import a mesh using json.
function loadJSON() {
	var loadMesh = new THREE.JSONLoader();
	loadMesh.load('models/untitled.json', function (geometry) {
		var mesh = new THREE.Mesh(geometry, material);
		
		mesh.position.set(2, 0, 8);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		scene.add(mesh);
	});
}

// Draw the blocks to test physics.
function drawBlocks(s, startX, startY, startZ, depth) {
	var mesh2Friction = 0.25;
    var mesh2Restitution = 0.35;
    var mesh2Material = Physijs.createMaterial(
    	new THREE.MeshPhongMaterial({  
    		color: 0x009636, 
    	    specular: 0x444444,
    	    shading: THREE.SmoothShading,
    	}),
    	mesh2Friction,
    	mesh2Restitution
    );
    var blockGeometry = new THREE.BoxGeometry( 1*s, 1*s, 1*s );
    
	mesh2 = new Array();
    for(var i=0; i<depth; i++) {
		mesh2[i] = new Array();
    	for(var j=0; j<depth; j++) {
			mesh2[i][j] = new Array();
    		for(var k=0; k<depth; k++) {
    			mesh2[i][j][k] = new Physijs.BoxMesh(blockGeometry, mesh2Material, 0.25);
    		    mesh2[i][j][k].position.set(startX+i*s, startY+j*s, startZ+k*s);
    		    mesh2[i][j][k].castShadow = true;
    		    mesh2[i][j][k].receiveShadow = true;
				mesh2[i][j][k].id = "i_"+i+"_j_"+j+"_k_"+k;

    		    scene.add(mesh2[i][j][k]);
    		}
    	}
    }
}

// Draw the player.
function drawPlayer(s, xPos, yPos, zPos) {
	var playGeo = new THREE.SphereGeometry(0.5*s, 8, 6);
	
	var playMeshFriction = 0.25;
    var playMeshRestitution = 0.75;
    var playMat = Physijs.createMaterial(
    	new THREE.MeshPhongMaterial({  
    		color: 0x116677, 
    	    specular: 0x222222,
    	    shading: THREE.SmoothShading,
    	}),
    	playMeshFriction,
    	playMeshRestitution
    );
	
	playerMesh = new Physijs.SphereMesh(playGeo, playMat, 10);
	playerMesh.position.set(xPos, yPos+0.5*s, zPos);
	playerMesh.castShadow = true;
	playerMesh.receiveShadow = true;
	scene.add(playerMesh);
}

function createTreeRoots(s, xPos, yPos, zPos) {
	var treeRootGeometry = new THREE.BoxGeometry(0.2*s, 0.1*s, 0.2*s);
	var treeRoot = new THREE.MeshPhongMaterial({ color: 0x784532 });
	
	// Roots
	treeMesh = new THREE.Mesh(treeRootGeometry, treeRoot);
	treeMesh.position.set(xPos, yPos, zPos);
	treeMesh.receiveShadow = true;
	treeMesh.castShadow = true;
	scene.add(treeMesh);
	
	treeMesh = new THREE.Mesh(treeRootGeometry, treeRoot);
	treeMesh.position.set(xPos, yPos, zPos + 0.1*s);
	treeMesh.receiveShadow = true;
	treeMesh.castShadow = true;
	scene.add(treeMesh);
	
	treeMesh = new THREE.Mesh(treeRootGeometry, treeRoot);
	treeMesh.position.set(xPos, yPos, zPos - 0.1*s);
	treeMesh.receiveShadow = true;
	treeMesh.castShadow = true;
	scene.add(treeMesh);
	
	treeMesh = new THREE.Mesh(treeRootGeometry, treeRoot);
	treeMesh.position.set(0.1*s + xPos, yPos, zPos);
	treeMesh.receiveShadow = true;
	treeMesh.castShadow = true;
	scene.add(treeMesh);
	
	treeMesh = new THREE.Mesh(treeRootGeometry, treeRoot);
	treeMesh.position.set(-0.1*s + xPos, yPos, zPos);
	treeMesh.receiveShadow = true;
	treeMesh.castShadow = true;
	scene.add(treeMesh);
}

function createTreeTrunk(s, xPos, yPos, zPos) {
	var treeTrunkGeometry = new THREE.BoxGeometry(0.2*s, 0.2*s, 0.2*s);
	var treeTrunk = new THREE.MeshPhongMaterial({ color: 0x784532 });
	
	// Trunk
	treeMesh = new THREE.Mesh(treeTrunkGeometry, treeTrunk);
	treeMesh.position.set(xPos, 0.1*s + yPos, zPos);
	treeMesh.receiveShadow = true;
	treeMesh.castShadow = true;
	scene.add(treeMesh);
	
	treeMesh = new THREE.Mesh(treeTrunkGeometry, treeTrunk);
	treeMesh.position.set(xPos, 0.3*s + yPos, zPos);
	treeMesh.receiveShadow = true;
	treeMesh.castShadow = true;
	scene.add(treeMesh);
	
	treeMesh = new THREE.Mesh(treeTrunkGeometry, treeTrunk);
	treeMesh.position.set(xPos, 0.5*s + yPos, zPos);
	treeMesh.receiveShadow = true;
	treeMesh.castShadow = true;
	scene.add(treeMesh);
}

function createTreeLeaves1(s, xPos, yPos, zPos) {
	var treeLeavesGeometry = new THREE.BoxGeometry(0.5*s, 0.5*s, 0.5*s);
	var treeLeavesGeometry2 = new THREE.BoxGeometry(0.65*s, 0.35*s, 0.5*s);
	var treeLeavesGeometry3 = new THREE.BoxGeometry(0.5*s, 0.35*s, 0.65*s);
	var treeLeaves = new THREE.MeshPhongMaterial({ color: 0x327845 });
	
	// Leaves
	treeMesh = new THREE.Mesh(treeLeavesGeometry, treeLeaves);
	treeMesh.position.set(xPos, yPos, zPos);
	treeMesh.receiveShadow = true;
	treeMesh.castShadow = true;
	scene.add(treeMesh);
	
	treeMesh = new THREE.Mesh(treeLeavesGeometry2, treeLeaves);
	treeMesh.position.set(xPos, yPos, zPos);
	treeMesh.receiveShadow = true;
	treeMesh.castShadow = true;
	scene.add(treeMesh);
	
	treeMesh = new THREE.Mesh(treeLeavesGeometry3, treeLeaves);
	treeMesh.position.set(xPos, yPos, zPos);
	treeMesh.receiveShadow = true;
	treeMesh.castShadow = true;
	scene.add(treeMesh);
}

function createTreeLeaves2(s, xPos, yPos, zPos) {
	var treeLeavesGeometry = new THREE.CylinderGeometry(0, 0.5*s, 0.75*s, 8, 1);
	var treeLeavesGeometry2 = new THREE.CylinderGeometry(0, 0.5*s*0.75, 0.75*s*0.75, 8, 1);
	var treeLeavesGeometry3 = new THREE.CylinderGeometry(0, 0.5*s*0.55, 0.75*s*0.55, 8, 1);
	var treeLeaves = new THREE.MeshPhongMaterial({ color: 0x327845 });
	
	// Leaves
	treeMesh = new THREE.Mesh(treeLeavesGeometry, treeLeaves);
	treeMesh.position.set(xPos, yPos, zPos);
	treeMesh.receiveShadow = true;
	treeMesh.castShadow = true;
	scene.add(treeMesh);
	
	treeMesh = new THREE.Mesh(treeLeavesGeometry2, treeLeaves);
	treeMesh.position.set(xPos, yPos + 0.20*s, zPos);
	treeMesh.receiveShadow = true;
	treeMesh.castShadow = true;
	scene.add(treeMesh);
	
	treeMesh = new THREE.Mesh(treeLeavesGeometry3, treeLeaves);
	treeMesh.position.set(xPos, yPos + 0.40*s, zPos);
	treeMesh.receiveShadow = true;
	treeMesh.castShadow = true;
	scene.add(treeMesh);
}

function createTree1(s, xPos, yPos, zPos) {
	createTreeRoots(s, xPos, 0.05*s + yPos, zPos);	
	createTreeTrunk(s, xPos, yPos, zPos);
	createTreeLeaves1(s, xPos, 0.75*s + yPos, zPos);
}

function createTree2(s, xPos, yPos, zPos) {
	createTreeTrunk(s, xPos, yPos, zPos);
	createTreeLeaves2(s, xPos, 0.75*s + yPos, zPos);
	//createTreeLeaves2(0.75*s, xPos, 0.75*s + yPos + 0.20*s, zPos);
	//createTreeLeaves2(0.55*s, xPos, 0.75*s + yPos + 0.40*s, zPos);
}

function drawRoof() {
	var geo3 = new THREE.CylinderGeometry(0.675, 1.25, 0.4, 4, 1);
    var roofMat = new THREE.MeshPhongMaterial({  
    	color: 0x774422, 
    	specular: 0x222222,
        shading: THREE.SmoothShading,
    	});
    var mesh3 = new THREE.Mesh(geo3, roofMat);
    mesh3.position.set(-3, 0.20, 8);
    mesh3.castShadow = true;
    mesh3.receiveShadow = true;
    scene.add(mesh3);
}

function drawSoilPatch(xPos, yPos, zPos) {
	drawSoil(0.96, xPos-1, yPos, zPos-1);
	drawSoil(0.96, xPos-1, yPos, zPos);
	drawSoil(0.96, xPos-1, yPos, zPos+1);
	drawSoil(0.96, xPos, yPos, zPos-1);
	drawSoil(0.96, xPos, yPos, zPos);
	drawSoil(0.96, xPos, yPos, zPos+1);
	drawSoil(0.96, xPos+1, yPos, zPos-1);
	drawSoil(0.96, xPos+1, yPos, zPos);
	drawSoil(0.96, xPos+1, yPos, zPos+1);
}

function drawSoil(s, xPos, yPos, zPos) {
	var soilGeo = new THREE.BoxGeometry(1*s, 0.05*s, 1*s);
	var soilMat = new THREE.MeshPhongMaterial({  
    	color: 0x443311, 
    	specular: 0x222222,
        shading: THREE.SmoothShading,
    	});
	var soilMesh = new THREE.Mesh(soilGeo, soilMat);
	soilMesh.position.set(xPos, yPos+0.025*s, zPos);
	soilMesh.castShadow = true;
	soilMesh.receiveShadow = true;
	scene.add(soilMesh);
}

function initStats() {
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
}

// Initialisation
function init() {
	
    initStats();

    // Set up the scene.
    scene = new Physijs.Scene({
    	fixedTimeStep: (physicsTimeStep) 
    });
    scene.setGravity(new THREE.Vector3(0, -8, 0));

    var sceneWidth = window.innerWidth;
    var sceneHeight = window.innerHeight;
    var viewAngle = 50;
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
    renderer.shadowMapSoft = true;

    renderer.shadowCameraNear = 0.5;
    renderer.shadowCameraFar = camera.far;
    renderer.shadowCameraFov = viewAngle;

    renderer.shadowMapBias = 0.0001;
    renderer.shadowMapDarkness = 0.75;
    renderer.shadowMapWidth = 2048;
    renderer.shadowMapHeight = 2048;

	renderer.setClearColor(0x000000);
	renderer.autoClear = false;

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
    plane = new Physijs.BoxMesh(new THREE.BoxGeometry(128, 1, 128), planeMaterial, 0, 1);
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
    mesh.position.y = 5;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);
    scene.add(camera);

    // Initialise player.
    drawPlayer(0.5, 3, 0, -4);
    playerRotation = 0;

    // Draw blocks for testing physics.
    drawBlocks(0.25, 2, 0.125, 2, 3);

	drawBlocks(0.2, -2, 0.1, -2, 3);

	for(var i=0; i<8; i++) {
		for(var j=0; j<8; j++) {
			drawBlocks(0.2, i, 0.1, j, 2);
		}
	}

    // Test fog.
    //scene.fog = new THREE.Fog(0xffffff, 0.050, 100);

	var Fizzytext = function() {
		this.message = 'test';
		this.speed = 100;
		this.speed2 = 40;
		this.displayCube = true;

		//this.color0 = "#00aaee";
		//this.color1 = "#aa00ee";
		//this.color2 = "#aaee00";
		//this.color3 = "#eeaaee";
	}

	var guiText = new Fizzytext();
	var gui = new dat.GUI();
	gui.add(guiText, 'message');
	gui.add(guiText, 'speed', 1, 200);
	gui.add(guiText, 'speed2', 20, 100);
	gui.add(guiText, 'displayCube');

	//gui.addColor(guiText, 'color0');
	//gui.addColor(guiText, 'color1');
	//gui.addColor(guiText, 'color2');
	//gui.addColor(guiText, 'color3');

	initUI(0.5 * sceneWidth, 0.5 * sceneHeight);
	resize(sceneWidth, sceneHeight);
}

function initUI(hw, hh) {
	uiScene = new THREE.Scene();
	uiCamera = new THREE.OrthographicCamera(-hw, hw, hh, -hh, 1, 10);
	uiCamera.position.set(0, 0, 10);

	addUIElement({
		id: 'top-left',
		width: 240,
		height: 100,
		color: 0xff0000,
		align: 'left',
		valign: 'top'
	});
}



function addUIElement({id, width, height, color, align, valign}) {
	const uiMesh = new THREE.Mesh(
		new THREE.PlaneGeometry(width, height),
		new THREE.MeshBasicMaterial({color})
	);
	uiScene.add(uiMesh)
	uiElements[id] = {uiMesh, width, height, align, valign};
}

// Animate
function animate() {
    //requestAnimationFrame(animate);

    stats.begin();
    mesh.rotation.x += 0.002;
    mesh.rotation.y += 0.01;

	renderer.clear();

    renderer.render(scene, camera);
    stats.end();
	rendererStats.update(renderer);

	renderer.clearDepth();

	renderer.render(uiScene, uiCamera);
	requestAnimationFrame(animate);

    
    controls.update();
    
    update();
	picking();
    
    scene.simulate(undefined, 5);
}

function picking() {
	raycaster.setFromCamera(mouse, uiCamera);
	var intersects = raycaster.intersectObjects(uiScene.children);
	for(var i=0; i<intersects.length; i++) {
		intersects[i].object.material.color.set(0x00aaff);
	}
	renderer.render(uiScene, uiCamera);
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

		for(var i=0; i<mesh2.length; i++) {
			for(var j=0; j<mesh2[i].length; j++) {
				for(var k=0; k<mesh2[i][j].length; k++) {
					var posX = mesh2[i][j][k].position.x;
					var posY = mesh2[i][j][k].position.y;
					var posZ = mesh2[i][j][k].position.z;
					var blockGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
					var meshMaterial = new THREE.MeshPhongMaterial({ color: 0x00aaee });
					//mesh2[i][j][k] = new THREE.BoxMesh(blockGeometry, meshMaterial);
					//mesh2[i][j][k].position.set(posX, posY, posZ);
					mesh2[i][j][k].material = meshMaterial;

					scene.remove(mesh2[i][j][k]);
				}
			}
		}
	}
	
	if (keyUpdate) {
		//render();
	}
	
	playerMesh.setLinearVelocity(new THREE.Vector3(0, 0, 0));
    playerMesh.setAngularVelocity(new THREE.Vector3(0, 0, 0));
}

function resize(w, h) {
	camera.aspect = w / h;
	camera.updateProjectionMatrix();

	const hw = 0.5 * w;
	const hh = 0.5 * h;

	uiCamera.left = -hw;
	uiCamera.right = hw;
	uiCamera.top = hh;
	uiCamera.bottom = -hh;
	uiCamera.updateProjectionMatrix();

	for (const id in uiElements) {
		const element = uiElements[id];
		let x = 0;
		let y = 0;

		switch (element.align) {
			case 'left':	x = -hw + (0.5 * element.width); break;
			case 'right':	x = hw - (0.5 * element.width); break;
		}

		switch (element.valign) {
			case 'top':	y = hh - (0.5 * element.height); break;
			case 'bottom':	y = -hh + (0.5 * element.height); break;
		}

		element.uiMesh.position.x = x;
		element.uiMesh.position.y = y;
	}

	renderer.setSize(w, h);
}