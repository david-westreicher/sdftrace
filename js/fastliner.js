function createFullScreenScene(shader){
	var plane = new THREE.PlaneBufferGeometry(2,2);
	var quad = new THREE.Mesh( plane, shader );
	var tmpScene = new THREE.Scene();
	tmpScene.add( quad );
	return tmpScene;
}

var FastLiner = function(size){
    var datasize = 128;
    var self = this;
	var rtCam = new THREE.OrthographicCamera( size / - 2, size / 2, size / 2, size / - 2, -10000, 10000 );
	var renderTarget = new THREE.WebGLRenderTarget(size,size, { 
	    depthBuffer: false,
	    stencilBuffer: false,
	    minFilter: THREE.NearestFilter,
	    magFilter: THREE.NearestFilter,
	    format: THREE.RGBAFormat,
	    type:THREE.FloatType
	});
    var posData1 = new Float32Array(datasize*datasize*4);
    var posTex1 = new THREE.DataTexture(posData1, datasize, datasize, THREE.RGBAFormat, THREE.FloatType);
	var posTex2 = new THREE.WebGLRenderTarget(datasize, datasize, { 
	    depthBuffer: false,
	    stencilBuffer: false,
	    minFilter: THREE.NearestFilter,
	    magFilter: THREE.NearestFilter,
	    format: THREE.RGBAFormat,
	    type:THREE.FloatType
	});
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
		//blending: THREE.AdditiveBlending
	} );
    var lines = new THREE.LineSegments(geometry,lineShader);
    lines.position.x = -size/2;
    lines.position.y = -size/2;

    var scene = new THREE.Scene();
    scene.add(lines);


    var rayuniforms = {
		rayinfo: { type: "t", value: posTex1 },
		sdf: { type: "t", value: null },
    }
	var rayShader = new THREE.ShaderMaterial( {
		uniforms: rayuniforms,
		vertexShader: document.getElementById( 'vertexFullscreen' ).textContent,
		fragmentShader: document.getElementById( 'fragmentRay' ).textContent,
		depthWrite: false
	} );
    var rayPass = createFullScreenScene(rayShader);

    self.update = function(renderer,sdftex){
        for(var i = 0;i<posData1.length;i+=4){
            var angle = Math.random()*2*Math.PI;
            var dir = new THREE.Vector2(Math.cos(angle),Math.sin(angle));
            posData1[i+0] = size/2;
            posData1[i+1] = size/2;
            posData1[i+2] = dir.x;
            posData1[i+3] = dir.y;
        }
        posTex1.needsUpdate = true;

        rayuniforms.sdf.value = sdftex;
	    renderer.render(rayPass,rtCam,posTex2,true);
	    renderer.render(scene,rtCam,renderTarget,true);
    }
    self.getTex = function(){
        return renderTarget;
    }
}
