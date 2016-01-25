if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var stats, perfInfo;
var scene, cam, renderer;
var mouseX = 0, mouseY = 0;
var fastliner;
var sdfuniforms;
var sdfquad,lightAccumBuffer;

function init() {
    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer:true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClearColor = false;
    renderer.setClearColor(0x000000,0.0);

    cam = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );

    fastliner = new FastLiner(renderer, size);
    lightmapUs = {
        tex: { type: "t", value: fastliner.getTex() },
        exposure: { type: "f", value: 1.0 },
    }
    lightAccumBuffer = new THREE.Mesh( 
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
    scene.add(lightAccumBuffer);
    scene.add(sdfquad);


    var container = document.getElementById( 'container' );
    container.appendChild( renderer.domElement );

    perfInfo = document.getElementById( 'perf' );
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    container.addEventListener( 'mousemove', onDocumentMouseMove, false );
    container.addEventListener( 'mousedown', onDocumentMouseDown, false );
    container.addEventListener( 'mouseup', onDocumentMouseUp, false );
    window.addEventListener( 'resize', onResize, false );
}


function onResize(event){
    renderer.setSize(window.innerWidth, window.innerHeight);
    cam.left = -window.innerWidth/2;
    cam.right = window.innerWidth/2;
    cam.top = window.innerHeight/2;
    cam.bottom = -window.innerHeight/2;
    cam.updateProjectionMatrix();
}

var mouseDown = false;
function onDocumentMouseDown( event ) {
    mouseDown = true;
    fastliner.reset(mouseX,mouseY);
}
function onDocumentMouseUp( event ) {
    mouseDown = false;
}
function onDocumentMouseMove( event ) {
    mouseX = ( event.clientX - window.innerWidth / 2 );
    mouseY = ( event.clientY - window.innerHeight / 2 );
    if(mouseDown){
        fastliner.reset(mouseX,mouseY);
    }
}

function animate() {
    requestAnimationFrame( animate );
    render();
    stats.update();
}

var size = 800;
var exposure = 0.1;
var sdf = new SDF(size);
var isinit = true;
var useBounds = true;
init();
animate();

function showSDF(istrue){
    if(istrue){
        lightAccumBuffer.visible = false;
        sdfquad.visible = true;
    }else{
        lightAccumBuffer.visible = true;
        sdfquad.visible = false;
    }
}
var test = 0;
function render() {
    renderer.clear();
    if(isinit){
        sdf.clear(renderer);
        for(var i=0;i<20;i++){
            var subtractive = Math.random()>0.5;
            if(Math.random()>0.5)
                sdf.drawCircle(renderer,
                    Math.random()*size,
                    Math.random()*size,
                    (Math.random()+1)*size/10.0,
                    subtractive);
            else
                sdf.drawRect(renderer,
                    Math.random()*size,
                    Math.random()*size,
                    Math.random()*size/10.0,
                    Math.random()*size/10.0,
                    Math.random()*20,
                    subtractive);
        }
        if(useBounds){
            sdf.drawRect(renderer,0,0,size,1);
            sdf.drawRect(renderer,0,size,size,1);
            sdf.drawRect(renderer,0,0,1,size);
            sdf.drawRect(renderer,size,0,1,size);
            sdfuniforms.tex.value = sdf.getTex();
        }
        isinit = false;
    }
    fastliner.update(sdf.getTex());
    lightmapUs.exposure.value = fastliner.bounces*exposure*size/fastliner.getSampleNum();
    renderer.render(scene,cam);
}

