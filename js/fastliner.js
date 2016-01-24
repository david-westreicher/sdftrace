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
    var initTexData = new Float32Array(datasize*datasize*4);
    var initTex = new THREE.DataTexture(initTexData, datasize, datasize, THREE.RGBAFormat, THREE.FloatType);
    var randData = new Float32Array(datasize*datasize*4);
    var randTex = new THREE.DataTexture(randData, datasize, datasize, THREE.RGBAFormat, THREE.FloatType);
    //TODO use randomness for diffusnes
	var posTex1 = new THREE.WebGLRenderTarget(datasize, datasize, { 
	    depthBuffer: false,
	    stencilBuffer: false,
	    minFilter: THREE.NearestFilter,
	    magFilter: THREE.NearestFilter,
	    format: THREE.RGBAFormat,
	    type:THREE.FloatType
	});
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
		blending: THREE.AdditiveBlending
	} );
    var lines = new THREE.LineSegments(geometry,lineShader);
    lines.position.x = -size/2;
    lines.position.y = -size/2;

    var scene = new THREE.Scene();
    scene.add(lines);


    var rayuniforms = {
		rayinfo: { type: "t", value: null },
		sdf: { type: "t", value: null },
    }
	var rayShader = new THREE.ShaderMaterial( {
		uniforms: rayuniforms,
		vertexShader: document.getElementById( 'vertexFullscreen' ).textContent,
		fragmentShader: 
		    "const vec3 offset = vec3("+(1.0/size)+",0,"+(-1.0/size)+");\n"+
		    "const float size = "+size+".0;\n"+
		    document.getElementById( 'fragmentRay' ).textContent,
		depthWrite: false
	} );
    var rayPass = createFullScreenScene(rayShader);

	var initShader = new THREE.ShaderMaterial( {
		uniforms: { initTex: {type: "t", value:initTex}},
		vertexShader: document.getElementById( 'vertexFullscreen' ).textContent,
		fragmentShader: document.getElementById( 'initRay' ).textContent,
		depthWrite: false
	} );
    var initPass = createFullScreenScene(initShader);

    var sampleNum =0;
    var mid = [size/2,size/2];
    self.update = function(renderer,sdftex){
        for(var i = 0;i<initTexData.length;i+=4){
            var angle = Math.random()*2*Math.PI;
            var angle2 = Math.random()*2*Math.PI;
            var radius = Math.random()*20;
            initTexData[i+0] = mid[0]+Math.cos(angle2)*radius;
            initTexData[i+1] = mid[1]+Math.sin(angle2)*radius;
            initTexData[i+2] = Math.cos(angle);
            initTexData[i+3] = Math.sin(angle);
            initTexData[i+2] = Math.cos(0);
            initTexData[i+3] = Math.sin(0);
        }
        initTex.needsUpdate = true;
	    renderer.render(initPass,rtCam,posTex1,true);

        for(var i=0;i<2;i++){
            rayuniforms.rayinfo.value = posTex1;
            rayuniforms.sdf.value = sdftex;
	        renderer.render(rayPass,rtCam,posTex2,true);
	        renderer.render(scene,rtCam,renderTarget,true);
	        var tmp = posTex1;
	        posTex1 = posTex2;
	        posTex2 = tmp;
	        sampleNum+=initTexData.length;
	    }
    }
    self.getTex = function(){
        return renderTarget;
    }
    self.getSampleNum = function(){
        return sampleNum;
    }
    self.reset = function(renderer,x,y){
        mid[0] = x+size/2;
        mid[1] = -y+size/2;
        renderer.clearTarget(renderTarget,true,false,false);
        sampleNum = 0;
    }
}
