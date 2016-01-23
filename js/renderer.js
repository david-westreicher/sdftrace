if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var stats, perfInfo;
var scene, cam, renderer;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var fastliner;
var sdfuniforms;

function init() {
	cam = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );

    fastliner = new FastLiner(size);
    lightmapUs = {
		tex: { type: "t", value: fastliner.getTex() },
		exposure: { type: "f", value: 1.0 },
    }
	var quad = new THREE.Mesh( 
	    new THREE.PlaneBufferGeometry(size,size),
	    new THREE.ShaderMaterial({
	        uniforms: lightmapUs,
		    vertexShader: document.getElementById( 'vertexShader' ).textContent,
		    fragmentShader: document.getElementById( 'lightmapExposure' ).textContent,
	        transparent:true,
	        depthWrite: false,
	        depthTest: false,
	    }));
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
	renderer.setClearColor(0x000000,0.0);

	var container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );

	perfInfo = document.getElementById( 'perf' );
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
}

var lastRayNum = 0;
setInterval(function(){
    var rayNum = fastliner.getSampleNum();
    perfInfo.innerHTML = 10*(rayNum-lastRayNum)+" rays/sec";
    lastRayNum = rayNum;
},100);

var mouseDown = false;
function onDocumentMouseDown( event ) {
    mouseDown = true;
	fastliner.reset(renderer,mouseX,mouseY);
    lastRayNum = 0;
}
function onDocumentMouseUp( event ) {
    mouseDown = false;
}
function onDocumentMouseMove( event ) {
	mouseX = ( event.clientX - windowHalfX );
	mouseY = ( event.clientY - windowHalfY );
	if(mouseDown){
	    fastliner.reset(renderer,mouseX,mouseY);
        lastRayNum = 0;
    }
}

function animate() {
	requestAnimationFrame( animate );
	render();
	stats.update();
}

var size = 800;
var sdf = new SDF(size);
var isinit = true;
init();
animate();

var test = 0;
function render() {
	renderer.clear();
    if(isinit){
        sdf.clear(renderer);
	    sdf.drawRect(renderer,0,0,size,1);
	    sdf.drawRect(renderer,0,size,size,1);
	    sdf.drawRect(renderer,0,0,1,size);
	    sdf.drawRect(renderer,size,0,1,size);
        for(var i=0;i<10;i++){
            if(Math.random()>0.5)
	            sdf.drawCircle(renderer,
	                Math.random()*size,
	                Math.random()*size,
	                (Math.random()+1)*size/10.0);
	        else
	            sdf.drawRect(renderer,
	                Math.random()*size,
	                Math.random()*size,
	                Math.random()*size/10.0,
	                Math.random()*size/10.0,
	                Math.random()*20);
        }
	    //sdf.draw(renderer,cam);
	    sdfuniforms.tex.value = sdf.getTex();
        isinit = false;
    }
	fastliner.update(renderer,sdf.getTex());
    lightmapUs.exposure.value = size/fastliner.getSampleNum();
	renderer.render(scene,cam);
}

