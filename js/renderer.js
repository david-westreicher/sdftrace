if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var stats;

var cam, renderer;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var size = 400;
var sdf;

init();
animate();

function init() {
    sdf = new SDF(400);

	cam = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
	cam.position.z = 100;

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClear = false;

	var container = document.getElementById( 'container' );
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

var isinit = true;
function render() {
	renderer.clear();
	sdf.clear(renderer);
	sdf.drawCircle(renderer,mouseX+size/2,-mouseY+size/2,size/8);
	sdf.drawCircle(renderer,mouseX+size/2,mouseY+size/2,size/8);
	sdf.drawCircle(renderer,-mouseX+size/2,-mouseY+size/2,size/8);
	sdf.drawRect(renderer,size/2,size/2,50,50);
	sdf.draw(renderer,cam);
}
