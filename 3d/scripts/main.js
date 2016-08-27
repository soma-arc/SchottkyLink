var g_spheres = [[300, 300, 0, 300],
		 [300, -300, 0, 300],
		 [-300, 300, 0, 300],
		 [-300, -300, 0, 300],
		 [0, 0, 424.26, 300],
		 [0, 0, -424.26, 300]];
var g_baseSpheres = [[0, 0, 0, 125],];
var g_numSpheres = 6;
var g_numBaseSpheres = 1;
var g_prevSphere;

var RenderCanvas = function(canvasId, templateId){
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    this.template = nunjucks.compile(document.getElementById(templateId).text);
    this.target = [0, 0, 0];
    this.fovDegree = 60;
    this.eyeDist =  1500;
    this.up = [0, 1, 0];
    this.theta = 0;
    this.phi = 0;
    this.eye = calcCoordOnSphere(this.eyeDist, this.theta, this.phi);

    this.selectedSphereIndex = -1;
    this.isRendering = false;
    this.isMousePressing = false;
    this.prevMousePos = [0, 0];
    this.selectedAxis = -1;

    this.axisVecOnScreen;
    this.pressingKey = '';
}

RenderCanvas.prototype = {
    calcPixel: function(mouseEvent){
	return [mouseEvent.clientX * window.devicePixelRatio,
		mouseEvent.clientY * window.devicePixelRatio];
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

    canvas.addEventListener('mousemove', function(event){
	if(!renderCanvas.isMousePressing) return;
	[px, py] = [event.clientX, event.clientY];//renderCanvas.calcPixel(event);
	if(event.button == 1){
	    renderCanvas.theta = prevTheta + (renderCanvas.prevMousePos[0] - px) * 0.01;
	    renderCanvas.phi = prevPhi -(renderCanvas.prevMousePos[1] - py) * 0.01;
	    renderCanvas.updateEye();
	    renderCanvas.isRendering = true;
	}
    });

    canvas.addEventListener('mousedown', function(event){
	renderCanvas.isMousePressing = true;
	[px, py] = [event.clientX, event.clientY];//renderCanvas.calcPixel(event);
	renderCanvas.prevMousePos = [px, py];
	if(event.button == 0){
	    if((renderCanvas.pressingKey == 'z' ||
		renderCanvas.pressingKey == 'x' ||
		renderCanvas.pressingKey == 'c' ||
		renderCanvas.pressingKey == 's' ) &&
	       renderCanvas.selectedSphereIndex > -1){
		renderCanvas.axisVecOnScreen = calcAxisOnScreen(g_prevSphere.slice(0, 3),
								renderCanvas.eye, renderCanvas.target,
								renderCanvas.up, renderCanvas.fovDegree,
								canvas.width, canvas.height);
		return;
	    }
	    var ray = calcRay(renderCanvas.eye, renderCanvas.target,
			      renderCanvas.up, renderCanvas.fovDegree,
			      canvas.width, canvas.height,
			      [event.clientX, event.clientY]);
	    renderCanvas.selectedSphereIndex = trace(renderCanvas.eye,
						     ray,
						     g_spheres.concat(g_baseSpheres));
	    if(renderCanvas.selectedSphereIndex == -1) return;
	    renderCanvas.render(0);
	    if(renderCanvas.selectedSphereIndex >= g_numSpheres){
		g_prevSphere = g_baseSpheres[renderCanvas.selectedSphereIndex - g_numSpheres].slice(0);
		renderCanvas.axisVecOnScreen = calcAxisOnScreen(g_prevSphere.slice(0, 3),
								renderCanvas.eye, renderCanvas.target,
								renderCanvas.up, renderCanvas.fovDegree,
								canvas.width, canvas.height);
	    }else{
		g_prevSphere = g_spheres[renderCanvas.selectedSphereIndex].slice(0);
		renderCanvas.axisVecOnScreen = calcAxisOnScreen(g_prevSphere.slice(0, 3),
								renderCanvas.eye, renderCanvas.target,
								renderCanvas.up, renderCanvas.fovDegree,
								canvas.width, canvas.height);
	    }
	}else if(event.button == 1){
	    prevTheta = renderCanvas.theta;
	    prevPhi = renderCanvas.phi;
	}
    }, true);

    canvas.addEventListener('mousewheel', function(event){
	if(event.wheelDelta > 0){
	    renderCanvas.eyeDist -= 100;
	}else{
	    renderCanvas.eyeDist += 100;
	}
	renderCanvas.updateEye();
	renderCanvas.render(0);
    }, true);

    [renderCanvas.switch,
     renderCanvas.render] = setupSchottkyProgram(g_numSpheres,
						 g_numBaseSpheres,
						 renderCanvas);
    renderCanvas.switch();
    renderCanvas.render(0);
}

function setupSchottkyProgram(numSpheres, numBaseSpheres, renderCanvas){
    var gl = renderCanvas.gl;
    var program = gl.createProgram();
        
    var shaderStr = renderCanvas.template.render({numSpheres: numSpheres,
						  numBaseSpheres: numBaseSpheres});
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
					     'selectedSphereIndex');
    uniLocation[n++] = gl.getUniformLocation(program,
					     'selectedAxis');
    uniLocation[n++] = gl.getUniformLocation(program, 'eye');
    uniLocation[n++] = gl.getUniformLocation(program, 'up');
    uniLocation[n++] = gl.getUniformLocation(program, 'target');
    uniLocation[n++] = gl.getUniformLocation(program, 'fov');
    for(var i = 0 ; i < numSpheres ; i++){
	uniLocation[n++] = gl.getUniformLocation(program,
						 's'+ i);
    }
    for(var j = 0 ; j < numBaseSpheres ; j++){
	uniLocation[n++] = gl.getUniformLocation(program,
						 'baseSphere'+ j);
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
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedSphereIndex);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedAxis);
	gl.uniform3fv(uniLocation[uniI++], renderCanvas.eye);
	gl.uniform3fv(uniLocation[uniI++], renderCanvas.up);
	gl.uniform3fv(uniLocation[uniI++], renderCanvas.target);
	gl.uniform1f(uniLocation[uniI++], renderCanvas.fovDegree);

	for(var i = 0 ; i < numSpheres ; i++){
	    gl.uniform4fv(uniLocation[uniI++], g_spheres[i]);
	}
	for(var j = 0 ; j < numBaseSpheres ; j++){
	    gl.uniform4fv(uniLocation[uniI++], g_baseSpheres[j]);
	}

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	gl.flush();
    }

    return [switchProgram, render];
}

function updateShaders(schottkyCanvas, orbitCanvas){
    [schottkyCanvas.switch,
     schottkyCanvas.render] = setupSchottkyProgram(g_numSpheres,
						   g_numBaseSpheres,
						   schottkyCanvas);
    [orbitCanvas.switch,
     orbitCanvas.render] = setupSchottkyProgram(g_numSpheres,
						g_numBaseSpheres,
     						orbitCanvas);
    schottkyCanvas.switch();
    orbitCanvas.switch();

    schottkyCanvas.render(0);
    orbitCanvas.render(0);
}

function addSchottkySphere(schottkyCanvas, orbitCanvas){
    g_spheres.push([500, 500, 0, 300]);
    g_numSpheres++;
    updateShaders(schottkyCanvas, orbitCanvas);
}

function addBaseSphere(schottkyCanvas, orbitCanvas){
    g_baseSpheres.push([500, 500, 0, 125]);
    g_numBaseSpheres++;
    updateShaders(schottkyCanvas, orbitCanvas);
}

function removeSchottkySphere(schottkyCanvas, orbitCanvas, sphereIndex){
    g_spheres.splice(sphereIndex, 1);
    g_numSpheres--;
    updateShaders(schottkyCanvas, orbitCanvas);
}

function removeBaseSphere(schottkyCanvas, orbitCanvas, sphereIndex){
    g_baseSpheres.splice(sphereIndex, 1);
    g_numBaseSpheres--;
    updateShaders(schottkyCanvas, orbitCanvas);   
}

function transformSphere(schottkyCanvas, orbitCanvas,
			 operateSphere, axis, value){
    operateSphere[axis] = operateSphere[axis] + value;
    schottkyCanvas.render(0);
    orbitCanvas.render(0);
}

window.addEventListener('load', function(event){
    var schottkyCanvas = new RenderCanvas('canvas', '3dSchottkyTemplate');
    var orbitCanvas = new RenderCanvas('orbitCanvas', '3dOrbitTemplate');

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
    schottkyCanvas.canvas.addEventListener('mousemove', function(event){
	if(!schottkyCanvas.isMousePressing) return;
	var index = schottkyCanvas.selectedSphereIndex;
	if(event.button == 0){
	    if(index != -1){
		var operateSphere = g_spheres[index];
		if(index >= g_numSpheres)
		    operateSphere = g_baseSpheres[index - g_numSpheres];
		[px, py] = [event.clientX, event.clientY];//schottkyCanvas.calcPixel(event);
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
		    break;
		}
		schottkyCanvas.isRendering = true;
		orbitCanvas.isRendering = true;
	    }
	}
    });
    schottkyCanvas.canvas.addEventListener('dblclick', function(){
	var index = schottkyCanvas.selectedSphereIndex;
	if(index != -1){
	    if(index >= g_numSpheres &&
	       g_numBaseSpheres > 1){
		removeBaseSphere(schottkyCanvas,
				 orbitCanvas,
				 index - g_numSpheres);
	    }else if(g_numSpheres > 1){
		removeSchottkySphere(schottkyCanvas,
				     orbitCanvas,
				     index);
	    }
	}
    });
    window.addEventListener('keydown', function(event){
	schottkyCanvas.pressingKey = event.key;
	if(event.key == ' '){
	    addSchottkySphere(schottkyCanvas, orbitCanvas);
	}else if(event.key == 'b'){
	    addBaseSphere(schottkyCanvas, orbitCanvas);
	    schottkyCanvas.render(0);
	    orbitCanvas.render(0);
	}else if(event.key == 'z'){
	    schottkyCanvas.selectedAxis = 0;
	    schottkyCanvas.render(0);
	}else if(event.key == 'x'){
	    schottkyCanvas.selectedAxis = 1;
	    schottkyCanvas.render(0);
	}else if(event.key == 'c'){
	    schottkyCanvas.selectedAxis = 2;
	    schottkyCanvas.render(0);
	}else{
	    var index = schottkyCanvas.selectedSphereIndex;
	    if(index != -1){
		var operateSphere = g_spheres[index];
		if(index >= g_numSpheres)
		    operateSphere = g_baseSpheres[index - g_numSpheres];
		switch (event.key){
		case 'i':
		    transformSphere(schottkyCanvas, orbitCanvas,
				    operateSphere, 1, 50);
		    break;
		case 'k':
		    transformSphere(schottkyCanvas, orbitCanvas,
				    operateSphere, 1, -50);
		    break;
		case 'j':
		    transformSphere(schottkyCanvas, orbitCanvas,
				    operateSphere, 0, -50);
		    break;
		case 'l':
		    transformSphere(schottkyCanvas, orbitCanvas,
				    operateSphere, 0, 50);
		    break;
		case 'u':
		    transformSphere(schottkyCanvas, orbitCanvas,
				    operateSphere, 2, -50);
		    break;
		case 'p':
		    transformSphere(schottkyCanvas, orbitCanvas,
				    operateSphere, 2, 50);
		    break;
		case 'r':
		    transformSphere(schottkyCanvas, orbitCanvas,
				    operateSphere, 3, 10);
		    break;
		case 'f':
		    transformSphere(schottkyCanvas, orbitCanvas,
				    operateSphere, 3, -10);
		    break;
		}
	    }
	}
    });
    
    var startTime = new Date().getTime();
    (function(){
        var elapsedTime = new Date().getTime() - startTime;
	if(schottkyCanvas.isRendering){
	    schottkyCanvas.render(elapsedTime);
	}
	if(orbitCanvas.isRendering)
	    orbitCanvas.render(elapsedTime);
    	requestAnimationFrame(arguments.callee);
    })();
}, false);
