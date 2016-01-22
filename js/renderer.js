if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var stats;
var scene, cam, renderer;
var posTex1,posTex2;
var renderTarget;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var lines;

function init() {
	renderTarget = new THREE.WebGLRenderTarget(size,size, { 
	    depthBuffer: false,
	    stencilBuffer: false,
	    minFilter: THREE.NearestFilter,
	    magFilter: THREE.NearestFilter,
	    format: THREE.RGBAFormat,
	    type:THREE.FloatType
	});
	var quad = new THREE.Mesh( 
	        new THREE.PlaneBufferGeometry(size,size),
	        new THREE.MeshBasicMaterial({
	            map:renderTarget,
	            transparent:true,
	            opacity:1,
	            depthWrite: false,
	            depthTest: false}));
	rtScene = new THREE.Scene();
	rtScene.add(quad)
    var datasize = 128;
    var posData1 = new Float32Array(datasize*datasize*4);
    var posData2 = new Float32Array(datasize*datasize*4);
    for(var i = 0;i<posData1.length;i+=4){
        posData1[i+0] = Math.random()*size;
        posData1[i+1] = Math.random()*size;
        posData1[i+2] = 0;
        posData1[i+3] = 0;
        posData2[i+0] = Math.random()*size;
        posData2[i+1] = Math.random()*size;
        posData2[i+2] = 0;
        posData2[i+3] = 0;
    }
    posTex1 = new THREE.DataTexture(posData1, datasize, datasize, THREE.RGBAFormat, THREE.FloatType);
    posTex2 = new THREE.DataTexture(posData2, datasize, datasize, THREE.RGBAFormat, THREE.FloatType);
    posTex1.needsUpdate = true;
    posTex2.needsUpdate = true;
    var geometry = new THREE.Geometry();
    var vertindex = 0;
    for(var x=0;x<datasize;x++)
        for(var y=0;y<datasize;y++)
            for(var i=0;i<2;i++)
                geometry.vertices.push(new THREE.Vector3(x/datasize,y/datasize,i));

	var lineShader = new THREE.ShaderMaterial( {
		uniforms: {
		    posTex1: {type: "t", value: posTex1},
		    posTex2: {type: "t", value: posTex2},
		},
		vertexShader: document.getElementById( 'vertexLine' ).textContent,
		fragmentShader: document.getElementById( 'fragmentLine' ).textContent,
		depthWrite: false,
		depthTest: false,
		transparent: true,
		blending: THREE.AdditiveBlending
	} );
    lines = new THREE.LineSegments(geometry,lineShader);
    lines.position.x = -size/2;
    lines.position.y = -size/2;

    scene = new THREE.Scene();
    scene.add(lines);

	cam = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
	rtCam = new THREE.OrthographicCamera( size / - 2, size / 2, size / 2, size / - 2, -10000, 10000 );


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
        isinit = false;
    }
	sdf.draw(renderer,cam);
	renderer.render(scene,rtCam,renderTarget,true);
	renderer.render(rtScene,cam);
}
