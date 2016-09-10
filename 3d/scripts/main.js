var g_scene;
var g_prevSphere;

// Initially planes are aligned along the z-axis
// Rotation is defined by theta and phi
// center is (0, 0, 0)
var ParabolicTransformation = function(){
    this.distToP1 = -300;
    this.distToP2 = 300;
    this.theta = 0; // Degree
    this.phi = 0; // Degree
    this.rotationMat3 = getIdentityMat3();
    this.size = 1200;
    this.rotation = 0.;
    //    this.isRenderingPlaneAtOrbitCanvas = 0;
}

ParabolicTransformation.prototype = {
    getTransformation: function(){
	return [this.distToP1, this.distToP2, this.size,
		radians(this.theta), radians(this.phi), this.rotation];
    }
}

var RenderCanvas = function(canvasId, templateId){
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    this.template = nunjucks.compile(document.getElementById(templateId).text);
    this.target = [0, 0, 0];
    this.fovDegree = 60;
    this.eyeDist = 1500;
    this.up = [0, 1, 0];
    this.theta = 0;
    this.phi = 0;
    this.eye = calcCoordOnSphere(this.eyeDist, this.theta, this.phi);

    this.selectedGroupId = -1;
    this.selectedObjectIndex = -1;
    
    this.isRendering = false;
    this.isMousePressing = false;
    this.prevMousePos = [0, 0];
    this.selectedAxis = -1;

    this.axisVecOnScreen;
    this.pressingKey = '';
    this.numIterations = 10;

    this.pixelRatio = 1;//window.devicePixelRatio;

    this.isRenderingPlaneOnOrbitCanvas = 0;
}

RenderCanvas.prototype = {
    resizeCanvas: function(width, height){
	this.canvas.style.width = width + 'px';
	this.canvas.style.height = height + 'px';
	this.canvas.width = width * this.pixelRatio;
	this.canvas.height = height * this.pixelRatio;
    },
    calcPixel: function(mouseEvent){
	var rect = mouseEvent.target.getBoundingClientRect();
	return [(mouseEvent.clientX - rect.left) * this.pixelRatio,
		(mouseEvent.clientY - rect.top) * this.pixelRatio];
    },
    updateEye: function(){
	this.eye = calcCoordOnSphere(this.eyeDist, this.theta, this.phi);
	if(Math.abs(this.phi) % (2 * Math.PI) > Math.PI / 2. &&
	   Math.abs(this.phi) % (2 * Math.PI) < 3 * Math.PI / 2.){
	    this.up = [0, -1, 0];
	}else{
	    this.up = [0, 1, 0];
	}
    }
};

const ID_SCHOTTKY_SPHERE = 0;
const ID_BASE_SPHERE = 1;
const ID_TRANSFORMATION = 2;

var Scene = function(){
    this.schottkySpheres = [[300, 300, 0, 300],
			    [300, -300, 0, 300],
			    [-300, 300, 0, 300],
			    [-300, -300, 0, 300],
			    [0, 0, 424.26, 300],
			    [0, 0, -424.26, 300]];
    this.baseSpheres = [[0, 0, 0, 125],];
    this.transformations = [new ParabolicTransformation()];
}


Scene.prototype = {
    addSchottkySphere: function(schottkyCanvas, orbitCanvas){
	this.schottkySpheres.push([500, 500, 0, 300]);
	updateShaders(schottkyCanvas, orbitCanvas);
    },
    addBaseSphere: function(schottkyCanvas, orbitCanvas){
	this.baseSpheres.push([500, 500, 0, 125]);
	updateShaders(schottkyCanvas, orbitCanvas);
    },
    removeSchottkySphere: function(schottkyCanvas, orbitCanvas, sphereIndex){
	if(this.schottkySpheres.length == 1) return;
	this.schottkySpheres.splice(sphereIndex, 1);
	updateShaders(schottkyCanvas, orbitCanvas);
    },
    removeBaseSphere: function(schottkyCanvas, orbitCanvas, sphereIndex){
	if(this.baseSpheres.length == 1) return;
	this.baseSpheres.splice(sphereIndex, 1);
	updateShaders(schottkyCanvas, orbitCanvas);
    },
    getObjects: function(){
	var obj = {};
	obj[ID_SCHOTTKY_SPHERE] = this.schottkySpheres;
	obj[ID_BASE_SPHERE] = this.baseSpheres;
	obj[ID_TRANSFORMATION] = this.transformations;
	return obj;
    },
    getNumSchottkySpheres: function(){
	return this.schottkySpheres.length;
    },
    getNumBaseSpheres: function(){
	return this.baseSpheres.length;
    },
    getNumTransformations: function(){
	return this.transformations.length;
    }
}

function calcCoordOnSphere(r, theta, phi){
    return [r * Math.cos(phi) * Math.cos(theta),
	    r * Math.sin(phi),
	    -r * Math.cos(phi) * Math.sin(theta)];
}

function calcLatitudeTangentOnSphere(r, theta, phi){
    return [- r * Math.sin(phi) * Math.cos(theta),
	    r * Math.cos(phi),
	    r * Math.sin(phi) * Math.sin(phi),
	   ];
}

function addMouseListenersToSchottkyCanvas(renderCanvas){
    var canvas = renderCanvas.canvas;
    var prevTheta, prevPhi;
    
    canvas.addEventListener('mouseup', function(event){
	renderCanvas.isMousePressing = false;
	renderCanvas.isRendering = false;
    });

    canvas.addEventListener('mouseleave', function(event){
	renderCanvas.isMousePressing = false;
	renderCanvas.isRendering = false;
    });

    canvas.addEventListener('mousemove', function(event){
	if(!renderCanvas.isMousePressing) return;
	[px, py] = renderCanvas.calcPixel(event);
	if(event.button == 1){
	    renderCanvas.theta = prevTheta + (renderCanvas.prevMousePos[0] - px) * 0.01;
	    renderCanvas.phi = prevPhi -(renderCanvas.prevMousePos[1] - py) * 0.01;
	    renderCanvas.updateEye();
	    renderCanvas.isRendering = true;
	}
    });

    canvas.addEventListener('mousedown', function(event){
	renderCanvas.isMousePressing = true;
	[px, py] = renderCanvas.calcPixel(event);
	renderCanvas.prevMousePos = [px, py];
	if(event.button == 0){
	    if((renderCanvas.pressingKey == 'z' ||
		renderCanvas.pressingKey == 'x' ||
		renderCanvas.pressingKey == 'c' ||
		renderCanvas.pressingKey == 's' ) &&
	       (renderCanvas.selectedGroupId == ID_SCHOTTKY_SPHERE ||
		renderCanvas.selectedGroupId == ID_BASE_SPHERE)){
		renderCanvas.axisVecOnScreen = calcAxisOnScreen(g_prevSphere.slice(0, 3),
								renderCanvas.eye, renderCanvas.target,
								renderCanvas.up, renderCanvas.fovDegree,
								canvas.width, canvas.height);
		return;
	    }
	    var ray = calcRay(renderCanvas.eye, renderCanvas.target,
			      renderCanvas.up, renderCanvas.fovDegree,
			      canvas.width, canvas.height,
			      [px, py]);
	    [renderCanvas.selectedGroupId,
	     renderCanvas.selectedObjectIndex] = getIntersectedObject(renderCanvas.eye,
								      ray,
								      g_scene.getObjects());
	    renderCanvas.render(0);
	    if(renderCanvas.selectedGroupId == -1) return;
	    if(renderCanvas.selectedGroupId == ID_BASE_SPHERE){
		// Base Sphere
		g_prevSphere = g_scene.baseSpheres[renderCanvas.selectedObjectIndex].slice(0);
		renderCanvas.axisVecOnScreen = calcAxisOnScreen(g_prevSphere.slice(0, 3),
								renderCanvas.eye, renderCanvas.target,
								renderCanvas.up, renderCanvas.fovDegree,
								canvas.width, canvas.height);
	    }else if(renderCanvas.selectedGroupId == ID_SCHOTTKY_SPHERE){
		// Schottky Sphere
		g_prevSphere = g_scene.schottkySpheres[renderCanvas.selectedObjectIndex].slice(0);
		renderCanvas.axisVecOnScreen = calcAxisOnScreen(g_prevSphere.slice(0, 3),
								renderCanvas.eye, renderCanvas.target,
								renderCanvas.up, renderCanvas.fovDegree,
								canvas.width, canvas.height);
	    }
	}else if(event.button == 1){
	    event.preventDefault();
	    prevTheta = renderCanvas.theta;
	    prevPhi = renderCanvas.phi;
	}
    }, true);

    canvas.addEventListener('mousewheel', function(event){
	event.preventDefault();
	if(event.wheelDelta > 0){
	    renderCanvas.eyeDist -= 100;
	}else{
	    renderCanvas.eyeDist += 100;
	}
	renderCanvas.updateEye();
	renderCanvas.render(0);
    }, true);

    [renderCanvas.switch,
     renderCanvas.render] = setupSchottkyProgram(g_scene,
						 renderCanvas);
    renderCanvas.switch();
    renderCanvas.render(0);
}

function setupSchottkyProgram(scene, renderCanvas){
    var gl = renderCanvas.gl;
    var program = gl.createProgram();

    var numSpheres = scene.getNumSchottkySpheres();
    var numBaseSpheres = scene.getNumBaseSpheres();
    var numTransformations = scene.getNumTransformations();

    var shaderStr = renderCanvas.template.render({numSpheres: numSpheres,
						  numBaseSpheres: numBaseSpheres,
						  numTranslations: numTransformations});
    attachShaderFromString(gl,
			   shaderStr,
			   program,
			   gl.FRAGMENT_SHADER);
    attachShader(gl, 'vs', program, gl.VERTEX_SHADER);
    program = linkProgram(gl, program);

    var uniLocation = new Array();
    var n = 0;
    uniLocation[n++] = gl.getUniformLocation(program,
					     'iResolution');
    uniLocation[n++] = gl.getUniformLocation(program,
					     'iGlobalTime');
    uniLocation[n++] = gl.getUniformLocation(program,
					     'selectedGroupId');
    uniLocation[n++] = gl.getUniformLocation(program,
					     'selectedObjectIndex');
    uniLocation[n++] = gl.getUniformLocation(program,
					     'selectedAxis');
    uniLocation[n++] = gl.getUniformLocation(program, 'eye');
    uniLocation[n++] = gl.getUniformLocation(program, 'up');
    uniLocation[n++] = gl.getUniformLocation(program, 'target');
    uniLocation[n++] = gl.getUniformLocation(program, 'fov');
    uniLocation[n++] = gl.getUniformLocation(program, 'numIterations');
    for(var i = 0 ; i < numSpheres ; i++){
	uniLocation[n++] = gl.getUniformLocation(program,
						 's'+ i);
    }
    for(var j = 0 ; j < numBaseSpheres ; j++){
	uniLocation[n++] = gl.getUniformLocation(program,
						 'baseSphere'+ j);
    }
    for(var i = 0 ; i < numTransformations ; i++){
	uniLocation[n++] = gl.getUniformLocation(program,
						 'transformation'+ i);
    }
    
    uniLocation[n++] = gl.getUniformLocation(program, 'renderPlane');
    
    var position = [-1.0, 1.0, 0.0,
                    1.0, 1.0, 0.0,
	            -1.0, -1.0,  0.0,
	            1.0, -1.0, 0.0
                   ];
    var index = [
	0, 2, 1,
	1, 2, 3
    ];
    var vPosition = createVbo(gl, position);
    var vIndex = createIbo(gl, index);
    var vAttLocation = gl.getAttribLocation(program, 'position');
    gl.bindBuffer(gl.ARRAY_BUFFER, vPosition);
    gl.enableVertexAttribArray(vAttLocation);
    gl.vertexAttribPointer(vAttLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex);

    var switchProgram = function(){
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, vPosition);
        gl.enableVertexAttribArray(vAttLocation);
        gl.vertexAttribPointer(vAttLocation, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex);
    }

    var render = function(elapsedTime){
        gl.viewport(0, 0, renderCanvas.canvas.width, renderCanvas.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var uniI = 0;
        gl.uniform2fv(uniLocation[uniI++], [renderCanvas.canvas.width, renderCanvas.canvas.height]);
        gl.uniform1f(uniLocation[uniI++], elapsedTime * 0.001);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedGroupId);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedObjectIndex);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedAxis);
	gl.uniform3fv(uniLocation[uniI++], renderCanvas.eye);
	gl.uniform3fv(uniLocation[uniI++], renderCanvas.up);
	gl.uniform3fv(uniLocation[uniI++], renderCanvas.target);
	gl.uniform1f(uniLocation[uniI++], renderCanvas.fovDegree);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.numIterations);
	for(var i = 0 ; i < numSpheres ; i++){
	    gl.uniform4fv(uniLocation[uniI++], scene.schottkySpheres[i]);
	}
	for(var j = 0 ; j < numBaseSpheres ; j++){
	    gl.uniform4fv(uniLocation[uniI++], scene.baseSpheres[j]);
	}
	for(var i = 0 ; i < numTransformations ; i++){
	    gl.uniform1fv(uniLocation[uniI++], scene.transformations[i].getTransformation());
	}
	gl.uniform1i(uniLocation[uniI++], renderCanvas.isRenderingPlaneOnOrbitCanvas);
	
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	gl.flush();
    }

    return [switchProgram, render];
}

function updateShaders(schottkyCanvas, orbitCanvas){
    [schottkyCanvas.switch,
     schottkyCanvas.render] = setupSchottkyProgram(g_scene, schottkyCanvas);
    [orbitCanvas.switch,
     orbitCanvas.render] = setupSchottkyProgram(g_scene, orbitCanvas);
    schottkyCanvas.switch();
    orbitCanvas.switch();

    schottkyCanvas.render(0);
    orbitCanvas.render(0);
}

window.addEventListener('load', function(event){
    g_scene = new Scene();
    var schottkyCanvas = new RenderCanvas('canvas', '3dSchottkyTemplate');
    var orbitCanvas = new RenderCanvas('orbitCanvas', '3dOrbitTemplate');

    schottkyCanvas.resizeCanvas(256, 256);
    orbitCanvas.resizeCanvas(256, 256);
    
    addMouseListenersToSchottkyCanvas(schottkyCanvas);
    addMouseListenersToSchottkyCanvas(orbitCanvas);
    
    window.addEventListener('keyup', function(event){
	schottkyCanvas.pressingKey = '';
	if(schottkyCanvas.selectedAxis != -1){
	    schottkyCanvas.selectedAxis = -1;
	    schottkyCanvas.render(0);
	}
	schottkyCanvas.isRendering = false;
	orbitCanvas.isRendering = false;
    });
    // Move Spheres on Schottky Canvas
    schottkyCanvas.canvas.addEventListener('mousemove', function(event){
	if(!schottkyCanvas.isMousePressing) return;
	var groupId = schottkyCanvas.selectedGroupId;
	var index = schottkyCanvas.selectedObjectIndex;
	if(event.button == 0){
	    if(groupId == ID_SCHOTTKY_SPHERE ||
	       groupId == ID_BASE_SPHERE){
		var operateSphere = g_scene.getObjects()[groupId][index];
		[px, py] = schottkyCanvas.calcPixel(event);
		var dx = px - schottkyCanvas.prevMousePos[0];
		var dy = py - schottkyCanvas.prevMousePos[1];
		switch (schottkyCanvas.pressingKey){
		case 'z':
		    var v = schottkyCanvas.axisVecOnScreen[0];
		    var lengthOnAxis = v[0] * dx + v[1] * dy; //dot
		    var p = calcCoordOnAxis(schottkyCanvas.eye,
					    schottkyCanvas.target,
					    schottkyCanvas.up,
					    schottkyCanvas.fovDegree,
					    schottkyCanvas.canvas.width,
					    schottkyCanvas.canvas.height,
					    0, v, g_prevSphere.slice(0, 3),
					    lengthOnAxis);
		    operateSphere[0] = p[0];
		    schottkyCanvas.isRendering = true;
		    orbitCanvas.isRendering = true;
		    break;
		case 'x':
		    var v = schottkyCanvas.axisVecOnScreen[1];
		    var lengthOnAxis = v[0] * dx + v[1] * dy;
		    var p = calcCoordOnAxis(schottkyCanvas.eye,
					    schottkyCanvas.target,
					    schottkyCanvas.up,
					    schottkyCanvas.fovDegree,
					    schottkyCanvas.canvas.width,
					    schottkyCanvas.canvas.height,
					    1, v, g_prevSphere.slice(0, 3),
					    lengthOnAxis);
		    operateSphere[1] = p[1];
		    schottkyCanvas.isRendering = true;
		    orbitCanvas.isRendering = true;
		    break;
		case 'c':
		    var v = schottkyCanvas.axisVecOnScreen[2];
		    var lengthOnAxis = v[0] * dx + v[1] * dy;
		    var p = calcCoordOnAxis(schottkyCanvas.eye,
					    schottkyCanvas.target,
					    schottkyCanvas.up,
					    schottkyCanvas.fovDegree,
					    schottkyCanvas.canvas.width,
					    schottkyCanvas.canvas.height,
					    2, v, g_prevSphere.slice(0, 3),
					    lengthOnAxis);
		    operateSphere[2] = p[2];
		    schottkyCanvas.isRendering = true;
		    orbitCanvas.isRendering = true;
		    break;
		case 's':
		    //operateSphere[3] = g_prevSphere[3] + dx * 10;
		    var v = schottkyCanvas.axisVecOnScreen[0];
		    var lengthOnAxis = v[0] * dx + v[1] * dy; //dot
		    var p = calcCoordOnAxis(schottkyCanvas.eye,
					    schottkyCanvas.target,
					    schottkyCanvas.up,
					    schottkyCanvas.fovDegree,
					    schottkyCanvas.canvas.width,
					    schottkyCanvas.canvas.height,
					    0, v, g_prevSphere.slice(0, 3),
					    lengthOnAxis);
		    operateSphere[3] = p[0];
		    schottkyCanvas.isRendering = true;
		    orbitCanvas.isRendering = true;
		    break;
		}
	    }
	}
    });
    schottkyCanvas.canvas.addEventListener('mouseup', function(){
	orbitCanvas.isMousePressing = false;
	orbitCanvas.isRendering = false;
    });
    schottkyCanvas.canvas.addEventListener('dblclick', function(){
	var groupId = schottkyCanvas.selectedGroupId;
	var index = schottkyCanvas.selectedObjectIndex;
	if(groupId != -1){
	    if(groupId == ID_SCHOTTKY_SPHERE){
		g_scene.removeSchottkySphere(schottkyCanvas,
					     orbitCanvas,
					     index);
	    }else if(groupId == ID_BASE_SPHERE){
		g_scene.removeBaseSphere(schottkyCanvas,
					 orbitCanvas,
					 index);
	    }
	}
    });
    window.addEventListener('keydown', function(event){
	schottkyCanvas.pressingKey = event.key;
	switch(event.key){
	case ' ':
	    g_scene.addSchottkySphere(schottkyCanvas, orbitCanvas);
	    break;
	case 'b':
	    g_scene.addBaseSphere(schottkyCanvas, orbitCanvas);
	    schottkyCanvas.render(0);
	    orbitCanvas.render(0);
	    break;
	case 'z':
	    if(schottkyCanvas.selectedAxis != 0){
		schottkyCanvas.selectedAxis = 0;
		schottkyCanvas.render(0);
	    }

	    break;
	case 'x':
	    if(schottkyCanvas.selectedAxis != 1){
		schottkyCanvas.selectedAxis = 1;
		schottkyCanvas.render(0);
	    }
	    break;
	case 'c':
	    if(schottkyCanvas.selectedAxis != 2){
		schottkyCanvas.selectedAxis = 2;
		schottkyCanvas.render(0);
	    }
	    break;
	case '+':
	    orbitCanvas.numIterations++;
	    orbitCanvas.render(0);
	    break;
	case '-':
	    if(orbitCanvas.numIterations != 0){
		orbitCanvas.numIterations--;
		orbitCanvas.render(0);
	    }
	    break;
	}});
    
    var startTime = new Date().getTime();
    (function(){
        var elapsedTime = new Date().getTime() - startTime;
	if(schottkyCanvas.isRendering){
	    schottkyCanvas.render(elapsedTime);
	}
	if(orbitCanvas.isRendering){
	    orbitCanvas.render(elapsedTime);
	}
    	requestAnimationFrame(arguments.callee);
    })();
}, false);
