if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var stats;

var cameraRTT, camera, sceneRTT, sceneScreen, scene, renderer;
var rtTexture;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var resolution = [600,400]

init();
animate();

function makeRTTScene(){
	var geometry = new THREE.TorusGeometry( 100, 25, 15, 30 );
	var mat1 = new THREE.MeshBasicMaterial( { color: 0xff00ff}  );
	var zmesh1 = new THREE.Mesh( geometry, mat1 );
	zmesh1.position.set( 0, 0, 100 );
	zmesh1.scale.set( 1.5, 1.5, 1.5 );
	sceneRTT.add( zmesh1 );
}

function makeScreenScene(){
	var materialScreen = new THREE.ShaderMaterial( {
		uniforms: { tDiffuse: { type: "t", value: rtTexture } },
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragment_shader_screen' ).textContent,
		depthWrite: false
	} );
	var plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
	var quad = new THREE.Mesh( plane, materialScreen );
	quad.position.z = -100;
	sceneScreen.add( quad );
}

function makeScene(){
	var geometry = new THREE.SphereGeometry( 10, 64, 32 ),
		material2 = new THREE.MeshBasicMaterial( { color: 0xffffff, map: rtTexture } );
	mesh = new THREE.Mesh( geometry, material2 );
	mesh.rotation.y = - Math.PI / 2;
	scene.add( mesh );
}

function init() {

	var container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 400;

	cameraRTT = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
	cameraRTT.position.z = 100;

	scene = new THREE.Scene();
	sceneRTT = new THREE.Scene();
	sceneScreen = new THREE.Scene();

	rtTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );

	makeScene();
	makeScreenScene();
	makeRTTScene();

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClear = false;

	container.appendChild( renderer.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

}

function onDocumentMouseMove( event ) {
	mouseX = ( event.clientX - windowHalfX );
	mouseY = ( event.clientY - windowHalfY );
}

//

function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

function render() {
	camera.lookAt( scene.position );

	renderer.clear();
	// Render first scene into texture
	renderer.render( sceneRTT, cameraRTT, rtTexture, true );
	// Render full screen quad with generated texture
	renderer.render( sceneScreen, cameraRTT );
	// Render second scene to screen
	// (using first scene as regular texture)
	renderer.render( scene, camera );
}
