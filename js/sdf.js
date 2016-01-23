var PingPong = function(){
    var self = this;
    self.rts = [];
    self.pointer = 0;
    for(var i =0;i<2;i++){
	    var rt = new THREE.WebGLRenderTarget(size,size, { 
	        depthBuffer: false,
	        stencilBuffer: false,
	        minFilter: THREE.LinearFilter,
	        magFilter: THREE.LinearFilter,
	        format: THREE.RGBFormat,
	        type:THREE.FloatType
	    });
	    self.rts.push(rt);
    }

    self.next = function(){
        self.pointer = (self.pointer+1)%2;
        return self.current(); 
    }

    self.current = function(){
        return self.rts[self.pointer];
    }
};

var SDF = function(size){
    var self = this;
    self.pingpong = new PingPong();
	self.dummycam = new THREE.OrthographicCamera(0,0);
	self.drawCirclePass = makeDrawCirclePass();
	self.drawRectPass = makeDrawRectPass();
	self.resetPass = makeResetPass();

    function createFullScreenScene(shader){
	    var plane = new THREE.PlaneBufferGeometry(2,2);
	    var quad = new THREE.Mesh( plane, shader );
	    var tmpScene = new THREE.Scene();
	    tmpScene.add( quad );
	    return tmpScene;
    }

    function makeDrawCirclePass(){
        self.drawCircleUs = {
		    pingpong: { type: "t", value: self.pingpong.current() },
		    circle: {type:"v3", value: new THREE.Vector3(size/2,size/2,size/2)}
        }
	    var shader = new THREE.ShaderMaterial( {
		    uniforms: self.drawCircleUs,
		    vertexShader: document.getElementById( 'vertexFullscreen' ).textContent,
		    fragmentShader: document.getElementById( 'fragmentFillSDF' ).textContent,
		    depthWrite: false
	    } );
	    return createFullScreenScene(shader);
    }

    function makeDrawRectPass(){
        self.drawRectUs = {
		    pingpong: { type: "t", value: self.pingpong.current() },
		    rect: {type:"v4", value: new THREE.Vector4(size/2,size/2,size/2,size/2)},
		    border: {type:"f", value: 0.0}
        }
	    var shader = new THREE.ShaderMaterial( {
		    uniforms: self.drawRectUs,
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

    self.clear = function(renderer){
	    renderer.render( self.resetPass, self.dummycam, self.pingpong.current());
    }

    self.drawCircle = function(renderer,x,y,size){
        self.drawCircleUs.circle.value.set(x,y,size);
        self.drawCircleUs.pingpong.value = self.pingpong.current();
	    renderer.render( self.drawCirclePass, self.dummycam, self.pingpong.next());
    }

    self.drawRect = function(renderer,x,y,width,height,border){
        self.drawRectUs.rect.value.set(x,y,width,height);
        self.drawRectUs.pingpong.value = self.pingpong.current();
        if(!border)
            self.drawRectUs.border.value = 0.0;
        else
            self.drawRectUs.border.value = border;
	    renderer.render( self.drawRectPass, self.dummycam, self.pingpong.next());
    }

    self.getTex = function(){
        return self.pingpong.current();
    }
}
