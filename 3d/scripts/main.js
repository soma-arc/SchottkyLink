var g_scene;

var Sphere = function(x, y, z, r){
    this.x = x;
    this.y = y;
    this.z = z;
    this.r = r;
}

Sphere.prototype = {
    set : function(axis, val){
	if(axis == 0){
	    this.x = val;
	}else if(axis == 1){
	    this.y = val;
	}else if(axis == 2){
	    this.z = val;
	}else if(axis == 3){
	    this.r = val;
	}
    },
    get : function(axis){
	if(axis == 0){
	    return this.x;
	}else if(axis == 1){
	    return this.y;
	}else if(axis == 2){
	    return this.z;
	}else if(axis == 3){
	    return this.r;
	}
    },
    getPosition: function(){
	return [this.x, this.y, this.z];
    },
    getUniformArray: function(){
	return [this.x, this.y, this.z, this.r];
    },
    clone: function(){
	return new Sphere(this.x, this.y, this.z, this.r);
    },
    // dx and dy are distance between preveous mouse position and current mouse position.
    // Move this sphere along the selected axis.
    move: function(dx, dy, axis, prevObject, schottkyCanvas){
	var v = schottkyCanvas.axisVecOnScreen[axis];
	var lengthOnAxis = v[0] * dx + v[1] * dy;
	var p = calcCoordOnAxis(schottkyCanvas.camera,
				schottkyCanvas.canvas.width,
				schottkyCanvas.canvas.height,
				axis, v, prevObject.getPosition(),
				lengthOnAxis);
	this.set(axis, p[axis]);
    },
    setRadius: function(mx, my, dx, dy, prevObject, schottkyCanvas){
	//We assume that prevObject is Sphere.
	var spherePosOnScreen = calcPointOnScreen(prevObject.getPosition(),
						  schottkyCanvas.camera,
						  schottkyCanvas.canvas.width,
						  schottkyCanvas.canvas.height);
	var diffSphereAndPrevMouse = [spherePosOnScreen[0] - schottkyCanvas.prevMousePos[0],
				      spherePosOnScreen[1] - schottkyCanvas.prevMousePos[1]];
	var r = Math.sqrt(diffSphereAndPrevMouse[0] * diffSphereAndPrevMouse[0] +
			  diffSphereAndPrevMouse[1] * diffSphereAndPrevMouse[1]);
	var diffSphereAndMouse = [spherePosOnScreen[0] - mx,
				  spherePosOnScreen[1] - my];
	var distToMouse = Math.sqrt(diffSphereAndMouse[0] * diffSphereAndMouse[0] +
				    diffSphereAndMouse[1] * diffSphereAndMouse[1]);
	var d = distToMouse - r;
	
	//TODO: calculate tangent sphere
	this.r = prevObject.r + d * 3;
    },
    getComponentFromId(id){
	return this;
    }
}

// Initially planes are aligned along the z-axis
// Rotation is defined by theta and phi
// center is (0, 0, 0)
var ParabolicTransformation = function(){
    this.distToP1 = -300;
    this.distToP2 = 300;
    this.theta = 0; // Degree
    this.phi = 0; // Degree
    this.rotationMat3 = getIdentityMat3();
    this.invRotationMat3 = getIdentityMat3();
    this.size = 1200;
    this.twist = 0.; // Degree
    this.twistMat3 = getIdentityMat3();
    this.invTwistMat3 = getIdentityMat3();
    this.update();
}

ParabolicTransformation.prototype = {
    getUniformArray: function(){
	return [this.distToP1, this.distToP2, this.size,
		radians(this.theta), radians(this.phi), this.twist];
    },
    getComponentFromId: function(id){
	return this;
    },
    update: function(){
	var rotateX = getRotationXAxis(radians(this.theta));
	var rotateY = getRotationYAxis(radians(this.phi));
	this.rotationMat3 = prodMat3(rotateX, rotateY);
	rotateX = getRotationXAxis(radians(-this.theta));
	rotateY = getRotationYAxis(radians(-this.phi));
	this.invRotationMat3 = prodMat3(rotateY, rotateX);
	this.twistMat3 = getRotationZAxis(radians(this.twist));
	this.invTwistMat3 = getRotationZAxis(radians(-this.twist));
    }
}

// Transformation defined by two spheres
var TransformBySpheres = function(){
    // innerSphere and outer sphere is kissing
    this.inner = new Sphere(0, 0, 1000, 500);// componentId = 0
    this.outer = new Sphere(0, 0, 900, 600);// componentId = 1
    this.inverted = sphereInvert(this.inner, this.outer); // componentId = 2
}

TransformBySpheres.prototype = {
    getUniformArray: function(){
	return this.inner.getUniformArray().concat(this.outer.getUniformArray(),
						   this.inverted.getUniformArray());
    },
    clone: function(){
	var obj = new TransformBySpheres();
	obj.inner = this.inner.clone();
	obj.outer = this.outer.clone();
	obj.inverted = this.inverted.clone();
	return obj;
    },
    update: function(){
	this.inverted = sphereInvert(this.inner, this.outer);
    },
    move: function(dx, dy, axis, prevObject, schottkyCanvas){
	var d = prevObject.inner.get(axis)- prevObject.outer.get(axis);
	this.outer.move(dx, dy, axis, prevObject.outer, schottkyCanvas);
	// Keep spheres kissing
	this.inner.set(axis, this.outer.get(axis) + d);
	this.update();
    },
    setRadius: function(mx, my, dx, dy, prevObject, schottkyCanvas){
	this.outer.setRadius(mx, my, dx, dy, prevObject.outer, schottkyCanvas);
	// Keep spheres kissing
	this.inner.set(2, prevObject.inner.get(2) + this.outer.r - prevObject.outer.r);
	this.update();
    },
    getComponentFromId: function(id){
	if(id == 0){
	    return this.inner;
	}else if(id == 1){
	    return this.outer;
	}else if(id == 2){
	    return this.inverted;
	}
    }
}

var Camera = function(target, fovDegree, eyeDist, up){
    this.target = target;
    this.prevTarget = target;
    this.fovDegree = fovDegree;
    this.eyeDist = eyeDist;
    this.up = up;
    this.theta = 0;
    this.phi = 0;
    this.position;
    this.update();
}

// Camera is on the sphere which its center is target and radius is eyeDist.
// Position is defined by two angle, theta and phi.
Camera.prototype = {    
    update: function(){
	this.position = [this.eyeDist * Math.cos(this.phi) * Math.cos(this.theta),
			 this.eyeDist * Math.sin(this.phi),
			 -this.eyeDist * Math.cos(this.phi) * Math.sin(this.theta)];
	this.position = sum(this.target, this.position);
	if(Math.abs(this.phi) % (2 * Math.PI) > Math.PI / 2. &&
	   Math.abs(this.phi) % (2 * Math.PI) < 3 * Math.PI / 2.){
	    this.up = [0, -1, 0];
	}else{
	    this.up = [0, 1, 0];
	}
    }
}

var RenderCanvas = function(canvasId, templateId){
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    this.template = nunjucks.compile(document.getElementById(templateId).text);
    this.camera = new Camera([0, 0, 0], 60, 1500, [0, 1, 0]);

    this.selectedObjectId = -1;
    this.selectedObjectIndex = -1;
    this.selectedComponentId = -1;
    
    this.isRendering = false;
    this.isMousePressing = false;
    this.prevMousePos = [0, 0];
    this.selectedAxis = -1;

    this.axisVecOnScreen;
    this.pressingKey = '';
    this.numIterations = 10;

    this.pixelRatio = 1;//window.devicePixelRatio;

    this.sphereCenterOnScreen;
    this.prevObject;
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
    }
};

const ID_SCHOTTKY_SPHERE = 0;
const ID_BASE_SPHERE = 1;
const ID_TRANSFORMATION = 2;
const ID_TRANSFORM_BY_SPHERES = 3;

var Scene = function(){
    this.schottkySpheres =  [new Sphere(300, 300, 0, 300),
			     new Sphere(300, -300, 0, 300),
			     new Sphere(-300, 300, 0, 300),
			     new Sphere(-300, -300, 0, 300),
			     new Sphere(0, 0, 424.26, 300),
			     new Sphere(0, 0, -424.26, 300)];
    this.baseSpheres = [new Sphere(0, 0, 0, 125),];
    this.transformations = [new ParabolicTransformation()];
    this.transformBySpheres = [];// [new TransformBySpheres()];
}


Scene.prototype = {
    addSchottkySphere: function(schottkyCanvas, orbitCanvas){
	this.schottkySpheres.push(new Sphere(500, 500, 0, 300));
	updateShaders(schottkyCanvas, orbitCanvas);
    },
    addBaseSphere: function(schottkyCanvas, orbitCanvas){
	this.baseSpheres.push(new Sphere(500, 500, 0, 125));
	updateShaders(schottkyCanvas, orbitCanvas);
    },
    removeSchottkySphere: function(schottkyCanvas, orbitCanvas, sphereIndex){
	if(this.schottkySpheres.length == 0) return;
	this.schottkySpheres.splice(sphereIndex, 1);
	schottkyCanvas.selectedObjectId = -1;
	schottkyCanvas.selectedObjectIndex = -1;
	updateShaders(schottkyCanvas, orbitCanvas);
    },
    removeBaseSphere: function(schottkyCanvas, orbitCanvas, sphereIndex){
	if(this.baseSpheres.length == 1) return;
	this.baseSpheres.splice(sphereIndex, 1);
	schottkyCanvas.selectedObjectId = -1;
	schottkyCanvas.selectedObjectIndex = -1;
	updateShaders(schottkyCanvas, orbitCanvas);
    },
    getObjects: function(){
	var obj = {};
	obj[ID_SCHOTTKY_SPHERE] = this.schottkySpheres;
	obj[ID_BASE_SPHERE] = this.baseSpheres;
	obj[ID_TRANSFORMATION] = this.transformations;
	obj[ID_TRANSFORM_BY_SPHERES] = this.transformBySpheres;
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
    },
    getNumTransformBySpheres: function(){
	return this.transformBySpheres.length;
    }
}

function addMouseListenersToSchottkyCanvas(renderCanvas){
    var canvas = renderCanvas.canvas;
    var prevTheta, prevPhi;

    canvas.addEventListener("contextmenu", function(e){
	// disable right-click context-menu
        event.preventDefault();
    });

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
	    renderCanvas.camera.theta = prevTheta + (renderCanvas.prevMousePos[0] - px) * 0.01;
	    renderCanvas.camera.phi = prevPhi -(renderCanvas.prevMousePos[1] - py) * 0.01;
	    renderCanvas.camera.update();
	    renderCanvas.isRendering = true;
	}else if(event.button == 2){
	    var dx = px - renderCanvas.prevMousePos[0];
	    var dy = py - renderCanvas.prevMousePos[1];
	    var vec = getFocalXYAxisVector(renderCanvas.camera,
					   renderCanvas.canvas.width,
					   renderCanvas.canvas.height);
	    renderCanvas.camera.target = sum(renderCanvas.camera.prevTarget,
					     sum(scale(vec[0], -dx * 5),
						 scale(vec[1], -dy * 5)));
	    renderCanvas.camera.update();
	    renderCanvas.isRendering = true;
	}
    });

    canvas.addEventListener('mousedown', function(event){
	renderCanvas.isMousePressing = true;
	[px, py] = renderCanvas.calcPixel(event);
	renderCanvas.prevMousePos = [px, py];
	if(event.button == 1){
	    event.preventDefault();
	    prevTheta = renderCanvas.camera.theta;
	    prevPhi = renderCanvas.camera.phi;
	}else if(event.button == 2){
	    renderCanvas.camera.prevTarget = renderCanvas.camera.target;
	}
    }, true);

    canvas.addEventListener('mousewheel', function(event){
	event.preventDefault();
	if(event.wheelDelta > 0 && renderCanvas.camera.eyeDist > 100){
	    renderCanvas.camera.eyeDist -= 100;
	}else{
	    renderCanvas.camera.eyeDist += 100;
	}
	renderCanvas.camera.update();
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
    var numTransformBySpheres = scene.getNumTransformBySpheres();
    
    var shaderStr = renderCanvas.template.render({numSpheres: numSpheres,
						  numBaseSpheres: numBaseSpheres,
						  numTranslations: numTransformations,
						  numTransformBySpheres: numTransformBySpheres});
    attachShaderFromString(gl,
			   shaderStr,
			   program,
			   gl.FRAGMENT_SHADER);
    attachShader(gl, 'vs', program, gl.VERTEX_SHADER);
    program = linkProgram(gl, program);

    var uniLocation = new Array();
    var n = 0;
    uniLocation[n++] = gl.getUniformLocation(program,
					     'u_iResolution');
    uniLocation[n++] = gl.getUniformLocation(program,
					     'u_iGlobalTime');
    uniLocation[n++] = gl.getUniformLocation(program,
					     'u_selectedObjectId');
    uniLocation[n++] = gl.getUniformLocation(program,
					     'u_selectedObjectIndex');
    uniLocation[n++] = gl.getUniformLocation(program,
					     'u_selectedComponentId');
    uniLocation[n++] = gl.getUniformLocation(program,
					     'u_selectedAxis');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_eye');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_up');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_target');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_fov');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_numIterations');
    for(var i = 0 ; i < numSpheres ; i++){
	uniLocation[n++] = gl.getUniformLocation(program,
						 'u_schottkySphere'+ i);
    }
    for(var j = 0 ; j < numBaseSpheres ; j++){
	uniLocation[n++] = gl.getUniformLocation(program,
						 'u_baseSphere'+ j);
    }
    for(var i = 0 ; i < numTransformations ; i++){
	uniLocation[n++] = gl.getUniformLocation(program,
						 'u_transformByPlanes'+ i);
	uniLocation[n++] = gl.getUniformLocation(program,
						 'u_rotatePlaneMat3'+ i);
	uniLocation[n++] = gl.getUniformLocation(program,
						 'u_invRotatePlaneMat3'+ i);
	uniLocation[n++] = gl.getUniformLocation(program,
						 'u_twistPlaneMat3'+ i);
	uniLocation[n++] = gl.getUniformLocation(program,
						 'u_invTwistPlaneMat3'+ i);
    }
    for(var i = 0 ; i < numTransformBySpheres ; i++){
	uniLocation[n++] = gl.getUniformLocation(program,
						 'u_transformBySpheres'+ i);
    }
    
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
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedObjectId);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedObjectIndex);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedComponentId);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedAxis);
	gl.uniform3fv(uniLocation[uniI++], renderCanvas.camera.position);
	gl.uniform3fv(uniLocation[uniI++], renderCanvas.camera.up);
	gl.uniform3fv(uniLocation[uniI++], renderCanvas.camera.target);
	gl.uniform1f(uniLocation[uniI++], renderCanvas.camera.fovDegree);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.numIterations);
	for(var i = 0 ; i < numSpheres ; i++){
	    gl.uniform4fv(uniLocation[uniI++], scene.schottkySpheres[i].getUniformArray());
	}
	for(var j = 0 ; j < numBaseSpheres ; j++){
	    gl.uniform4fv(uniLocation[uniI++], scene.baseSpheres[j].getUniformArray());
	}
	for(var i = 0 ; i < numTransformations ; i++){
	    gl.uniform1fv(uniLocation[uniI++], scene.transformations[i].getUniformArray());
	    gl.uniformMatrix3fv(uniLocation[uniI++], false, scene.transformations[i].rotationMat3);
	    gl.uniformMatrix3fv(uniLocation[uniI++], false, scene.transformations[i].invRotationMat3);
	    gl.uniformMatrix3fv(uniLocation[uniI++], false, scene.transformations[i].twistMat3);
	    gl.uniformMatrix3fv(uniLocation[uniI++], false, scene.transformations[i].invTwistMat3);
	}
	for(var i = 0 ; i < numTransformBySpheres ; i++){
	    gl.uniform1fv(uniLocation[uniI++], scene.transformBySpheres[i].getUniformArray());
	}
	
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

    schottkyCanvas.canvas.addEventListener('mousedown', function(event){
	[px, py] = schottkyCanvas.calcPixel(event);
	if(event.button == 0){
	    if((schottkyCanvas.pressingKey == 'z' ||
		schottkyCanvas.pressingKey == 'x' ||
		schottkyCanvas.pressingKey == 'c' ||
		schottkyCanvas.pressingKey == 's' ) &&
	       (schottkyCanvas.selectedObjectId != -1)){
		return;
	    }
	    var objects = g_scene.getObjects();
	    var [objectId,
		 objectIndex,
		 componentId] = getIntersectedObject(schottkyCanvas.camera.position,
						     calcRay(schottkyCanvas.camera,
							     canvas.width, canvas.height,
							     [px, py]),
						     objects);
	    schottkyCanvas.selectedObjectId = objectId;
	    schottkyCanvas.selectedObjectIndex = objectIndex;
	    schottkyCanvas.selectedComponentId = componentId;
	    schottkyCanvas.render(0);
	    if(objectId == ID_BASE_SPHERE ||
	       objectId == ID_SCHOTTKY_SPHERE ||
	       objectId == ID_TRANSFORM_BY_SPHERES){
		var obj = objects[objectId][objectIndex];
		schottkyCanvas.prevObject = obj.clone();
		schottkyCanvas.axisVecOnScreen = calcAxisOnScreen(obj.getComponentFromId(componentId).getPosition(),
								  schottkyCanvas.camera,
								  canvas.width, canvas.height);
	    }
	}
    });
    
    // Move Spheres on Schottky Canvas
    schottkyCanvas.canvas.addEventListener('mousemove', function(event){
	if(!schottkyCanvas.isMousePressing) return;
	var groupId = schottkyCanvas.selectedObjectId;
	var index = schottkyCanvas.selectedObjectIndex;
	if(event.button == 0){
	    var operateObject;
	    if(groupId == ID_SCHOTTKY_SPHERE ||
	       groupId == ID_BASE_SPHERE){
		operateObject = g_scene.getObjects()[groupId][index];
	    }else if(groupId == ID_TRANSFORM_BY_SPHERES){
		operateObject = g_scene.getObjects()[groupId][index];
	    }
	    if(operateObject == undefined) return;
	    [mx, my] = schottkyCanvas.calcPixel(event);
	    var dx = mx - schottkyCanvas.prevMousePos[0];
	    var dy = my - schottkyCanvas.prevMousePos[1];
	    switch (schottkyCanvas.pressingKey){
	    case 'z':
		operateObject.move(dx, dy, 0, schottkyCanvas.prevObject, schottkyCanvas);
		schottkyCanvas.isRendering = true;
		orbitCanvas.isRendering = true;
		break;
	    case 'x':
		operateObject.move(dx, dy, 1, schottkyCanvas.prevObject, schottkyCanvas);
		schottkyCanvas.isRendering = true;
		orbitCanvas.isRendering = true;
		break;
	    case 'c':
		operateObject.move(dx, dy, 2, schottkyCanvas.prevObject, schottkyCanvas);
		schottkyCanvas.isRendering = true;
		orbitCanvas.isRendering = true;
		break;
	    case 's':
		operateObject.setRadius(mx, my, dx, dy, schottkyCanvas.prevObject, schottkyCanvas);
		schottkyCanvas.isRendering = true;
		orbitCanvas.isRendering = true;
		break;
	    }
	}
    });
    schottkyCanvas.canvas.addEventListener('mouseup', function(event){
	orbitCanvas.isMousePressing = false;
	orbitCanvas.isRendering = false;
	if(schottkyCanvas.selectedObjectId == ID_BASE_SPHERE ||
	   schottkyCanvas.selectedObjectId == ID_SCHOTTKY_SPHERE ||
	   schottkyCanvas.selectedObjectId == ID_TRANSFORM_BY_SPHERES){
	    var obj = g_scene.getObjects()[schottkyCanvas.selectedObjectId][schottkyCanvas.selectedObjectIndex];
	    schottkyCanvas.prevObject = obj.clone();
	    schottkyCanvas.axisVecOnScreen = calcAxisOnScreen(obj.getComponentFromId(schottkyCanvas.selectedComponentId).getPosition(),
							      schottkyCanvas.camera,
							      canvas.width, canvas.height);
	}
    });
    schottkyCanvas.canvas.addEventListener('dblclick', function(event){
	event.preventDefault();
	var groupId = schottkyCanvas.selectedObjectId;
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
	case 'ArrowRight':
	    if(g_scene.transformations[0] == undefined) return;
	    g_scene.transformations[0].phi += 10;
	    g_scene.transformations[0].update();
	    orbitCanvas.render(0);
	    schottkyCanvas.render(0);
	    break;
	case 'ArrowLeft':
	    if(g_scene.transformations[0] == undefined) return;
	    g_scene.transformations[0].phi -= 10;
	    g_scene.transformations[0].update();
	    orbitCanvas.render(0);
	    schottkyCanvas.render(0);
	    break;
	case 'ArrowUp':
	    if(g_scene.transformations[0] == undefined) return;
	    g_scene.transformations[0].theta += 10;
	    g_scene.transformations[0].update();
	    orbitCanvas.render(0);
	    schottkyCanvas.render(0);
	    break;
	case 'ArrowDown':
	    if(g_scene.transformations[0] == undefined) return;
	    g_scene.transformations[0].theta -= 10;
	    g_scene.transformations[0].update();
	    orbitCanvas.render(0);
	    schottkyCanvas.render(0);
	    break;
	case 'p':
	    if(g_scene.transformations[0] == undefined) return;
	    g_scene.transformations[0].twist += 10;
	    g_scene.transformations[0].update();
	    orbitCanvas.render(0);
	    schottkyCanvas.render(0);
	    break;
	case 'n':
	    if(g_scene.transformations[0] == undefined) return;
	    g_scene.transformations[0].twist -= 10;
	    g_scene.transformations[0].update();
	    orbitCanvas.render(0);
	    schottkyCanvas.render(0);
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
