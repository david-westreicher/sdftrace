if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var stats;

var cam, drawSDF, renderer;
var rtPing, rtPong;
var drawCirclePass, drawCircleUs;
var resetPass;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var size = 400;

init();
animate();

function createFullScreenScene(shader){
	var plane = new THREE.PlaneBufferGeometry(2,2);
	var quad = new THREE.Mesh( plane, shader );
	var tmpScene = new THREE.Scene();
	tmpScene.add( quad );
	return tmpScene;
}

function makeDrawCirclePass(){
    drawCircleUs = {
		pingpong: { type: "t", value: rtPong },
		lightpos: {type:"v3", value: new THREE.Vector3(size/2,size/2,size/2)}
    }
	var shader = new THREE.ShaderMaterial( {
		uniforms: drawCircleUs,
		vertexShader: document.getElementById( 'vertexFullscreen' ).textContent,
		fragmentShader: document.getElementById( 'fragmentFillSDF' ).textContent,
		depthWrite: false
	} );
	return createFullScreenScene(shader);
}

function makeResetPass(){
	var shader = new THREE.ShaderMaterial({
		uniforms: {
		    val: {type:"f", value: size*size}
		},
		vertexShader: document.getElementById( 'vertexFullscreen' ).textContent,
		fragmentShader: document.getElementById( 'fragmentResetSDF' ).textContent,
		depthWrite: false
	});
	return createFullScreenScene(shader);
}

function makeDrawPass(){
    var drawSDFUs = {
		    tex: { type: "t", value: rtPing },
		    size: { type: "f", value: size },
	}
	var materialScreen = new THREE.ShaderMaterial( {
		uniforms: drawSDFUs,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentDrawSDF' ).textContent,
		depthWrite: false
	} );
	var plane = new THREE.PlaneBufferGeometry( size,size );
	var quad = new THREE.Mesh( plane, materialScreen );
	var tmpScene = new THREE.Scene();
	tmpScene.add( quad );
	return tmpScene;
}

function init() {

	var container = document.getElementById( 'container' );

	cam = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
	cam.position.z = 100;

	rtPing = new THREE.WebGLRenderTarget(size,size, { 
	    depthBuffer: false,
	    stencilBuffer: false,
	    minFilter: THREE.NearestFilter,
	    magFilter: THREE.NearestFilter,
	    format: THREE.RGBFormat,
	    type:THREE.FloatType
	});
	rtPong = new THREE.WebGLRenderTarget(size,size, { 
	    depthBuffer: false,
	    stencilBuffer: false,
	    minFilter: THREE.NearestFilter,
	    magFilter: THREE.NearestFilter,
	    format: THREE.RGBFormat,
	    type:THREE.FloatType
	});

	drawSDF = makeDrawPass();
	drawCirclePass = makeDrawCirclePass();
	resetPass = makeResetPass();

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
    // render dist size*size into rtPong
	renderer.render( resetPass, cam, rtPong, true );
    drawCircleUs.lightpos.value.x = mouseX+size/2;
    drawCircleUs.lightpos.value.y = -mouseY+size/2;
    drawCircleUs.lightpos.value.z = size/8;
    drawCircleUs.pingpong.value = rtPong;
	renderer.render( drawCirclePass, cam, rtPing, true );
}

var isinit = true;
function render() {
	renderer.clear();
	if(isinit){
	    //generateSDF();
	    isinit = false;
	}
	generateSDF();
	renderer.render( drawSDF, cam );
}
