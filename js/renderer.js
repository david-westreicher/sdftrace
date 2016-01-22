if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var stats;

var cameraRTT, camera, sceneRTT, sceneScreen, scene, renderer;
var rtTexture, sdfShader;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var size = 400;

init();
animate();

function makeRTTScene(){
	sdfShader = new THREE.ShaderMaterial( {
		uniforms: {
		    lightpos: {type:"v3", value: new THREE.Vector3(size/2,size/2,size/2)}
		},
		vertexShader: document.getElementById( 'vertexFillSDF' ).textContent,
		fragmentShader: document.getElementById( 'fragmentFillSDF' ).textContent,
		depthWrite: false
	} );
	var plane = new THREE.PlaneBufferGeometry(2,2);
	var quad = new THREE.Mesh( plane, sdfShader );
	sceneRTT.add( quad );
}

function makeScreenScene(){
	var materialScreen = new THREE.ShaderMaterial( {
		uniforms: { 
		    tDiffuse: { type: "t", value: rtTexture },
		    size: { type: "f", value: size },
		},
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentDrawSDF' ).textContent,
		depthWrite: false
	} );
	var plane = new THREE.PlaneBufferGeometry( size,size );
	var quad = new THREE.Mesh( plane, materialScreen );
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

	rtTexture = new THREE.WebGLRenderTarget(size,size, { 
	    minFilter: THREE.NearestFilter,
	    magFilter: THREE.NearestFilter,
	    format: THREE.RGBFormat,
	    type:THREE.FloatType
	});

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

function animate() {
	requestAnimationFrame( animate );
	render();
	stats.update();
}

function generateSDF() {
    sdfShader.uniforms.lightpos.value.x = mouseX+size/2;
    sdfShader.uniforms.lightpos.value.y = -mouseY+size/2;
    sdfShader.uniforms.lightpos.value.z = size/4;
	renderer.render( sceneRTT, cameraRTT, rtTexture, true );
}

var isinit = true;
function render() {
	camera.lookAt( scene.position );
	renderer.clear();
	if(isinit){
	    generateSDF();
	    isinit = false;
	}
	generateSDF();

	// Render first scene into texture
	// Render full screen quad with generated texture
	renderer.render( sceneScreen, cameraRTT );
	// Render second scene to screen
	// (using first scene as regular texture)
	//renderer.render( scene, camera );
}
