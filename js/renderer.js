if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var stats;
var scene, cam, renderer;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var fastliner;
var sdfuniforms;

function init() {
	cam = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );

    fastliner = new FastLiner(size);
	var quad = new THREE.Mesh( 
	    new THREE.PlaneBufferGeometry(size,size),
	    new THREE.MeshBasicMaterial({
	        map:fastliner.getTex(),
	        transparent:true,
	        opacity:1,
	        depthWrite: false,
	        depthTest: false}));
    sdfuniforms = {
		    tex: { type: "t", value: null },
		    size: { type: "f", value: size },
	}
	var sdfmaterial = new THREE.ShaderMaterial( {
		uniforms: sdfuniforms,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentDrawSDF' ).textContent,
		depthWrite: false
	} );
	sdfquad = new THREE.Mesh( 
	    new THREE.PlaneBufferGeometry(size,size),
	    sdfmaterial);

	scene = new THREE.Scene();
	scene.add(quad);
	scene.add(sdfquad);

	renderer = new THREE.WebGLRenderer({preserveDrawingBuffer:true});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClearColor = false;

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

var size = 600;
var sdf = new SDF(size);
var isinit = true;
init();
animate();

var test = 0;
function render() {
	renderer.clear();
    if(isinit){
        sdf.clear(renderer);
        for(var i=0;i<10;i++){
            if(Math.random()>0.5)
	            sdf.drawCircle(renderer,Math.random()*size,Math.random()*size,Math.random()*90);
	        else
	            sdf.drawRect(renderer,Math.random()*size,Math.random()*size,Math.random()*90,Math.random()*90);
        }
	    //sdf.draw(renderer,cam);
	    sdfuniforms.tex.value = sdf.getTex();
        isinit = false;
    }
	fastliner.update(renderer,sdf.getTex());
	renderer.render(scene,cam);
}
