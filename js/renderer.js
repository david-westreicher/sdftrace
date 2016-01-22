if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var stats;

var cam, drawSDF, renderer;
var drawCirclePass, drawCircleUs;
var drawRectPass, drawRectUs;
var resetPass;
var drawSDFUs;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var size = 400;
var pingpong = function(){
    var self = this;
    this.rts = [];
    this.pointer = 0;
    for(var i =0;i<2;i++){
	    var rt = new THREE.WebGLRenderTarget(size,size, { 
	        depthBuffer: false,
	        stencilBuffer: false,
	        minFilter: THREE.NearestFilter,
	        magFilter: THREE.NearestFilter,
	        format: THREE.RGBFormat,
	        type:THREE.FloatType
	    });
	    rts.push(rt);
    }
    this.next = function(){
        pointer = (pointer+1)%2;
        return self.current(); 
    }
    this.current = function(){
        return rts[pointer];
    }
    return self;
}();

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
		pingpong: { type: "t", value: pingpong.current() },
		circle: {type:"v3", value: new THREE.Vector3(size/2,size/2,size/2)}
    }
	var shader = new THREE.ShaderMaterial( {
		uniforms: drawCircleUs,
		vertexShader: document.getElementById( 'vertexFullscreen' ).textContent,
		fragmentShader: document.getElementById( 'fragmentFillSDF' ).textContent,
		depthWrite: false
	} );
	return createFullScreenScene(shader);
}

function makeDrawRectPass(){
    drawRectUs = {
		pingpong: { type: "t", value: pingpong.current() },
		rect: {type:"v4", value: new THREE.Vector4(size/2,size/2,size/2,size/2)}
    }
	var shader = new THREE.ShaderMaterial( {
		uniforms: drawRectUs,
		vertexShader: document.getElementById( 'vertexFullscreen' ).textContent,
		fragmentShader: document.getElementById( 'fragmentDrawRectSDF' ).textContent,
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
    drawSDFUs = {
		    tex: { type: "t", value: pingpong.current() },
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

	drawSDF = makeDrawPass();
	drawCirclePass = makeDrawCirclePass();
	drawRectPass = makeDrawRectPass();
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
	renderer.render( resetPass, cam, pingpong.current(), true );
    drawCircleUs.circle.value.x = mouseX+size/2;
    drawCircleUs.circle.value.y = -mouseY+size/2;
    drawCircleUs.circle.value.z = size/8;
    drawCircleUs.pingpong.value = pingpong.current();
	renderer.render( drawCirclePass, cam, pingpong.next(), true );
    drawCircleUs.circle.value.x = mouseX+size/2;
    drawCircleUs.circle.value.y = mouseY+size/2;
    drawCircleUs.circle.value.z = size/8;
    drawCircleUs.pingpong.value = pingpong.current();
	renderer.render( drawCirclePass, cam, pingpong.next(), true );
    drawCircleUs.circle.value.x = -mouseX+size/2;
    drawCircleUs.circle.value.y = -mouseY+size/2;
    drawCircleUs.circle.value.z = size/8;
    drawCircleUs.pingpong.value = pingpong.current();
	renderer.render( drawCirclePass, cam, pingpong.next(), true );
    drawRectUs.rect.value.x = size/2;
    drawRectUs.rect.value.y = size/2;
    drawRectUs.rect.value.z = 50;
    drawRectUs.rect.value.w = 50;
    drawRectUs.pingpong.value = pingpong.current();
	renderer.render( drawRectPass, cam, pingpong.next(), true );
}

var isinit = true;
function render() {
	renderer.clear();
	if(isinit){
	    isinit = false;
	}
	generateSDF();
	drawSDFUs.tex.value = pingpong.current();
	renderer.render( drawSDF, cam );
}
