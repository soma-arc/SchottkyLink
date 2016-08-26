var g_spheres = [[300, 300, 0, 300],
		 [300, -300, 0, 300],
		 [-300, 300, 0, 300],
		 [-300, -300, 0, 300],
		 [0, 0, 424.26, 300],
		 [0, 0, -424.26, 300]];
var g_baseSpheres = [[0, 0, 0, 125],];
var g_numSpheres = 6;
var g_numBaseSpheres = 1;

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
}

RenderCanvas.prototype = {
    calcPixel: function(mouseEvent){
	return [(mouseEvent.clientX * window.devicePixelRatio),
		(mouseEvent.clientY * window.devicePixelRatio)];
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

function setupSchottkyCanvas(renderCanvas){
    var canvas = renderCanvas.canvas;
    var prevTheta, prevPhi, prevPos;
    
    var isMousePressing = false;
    canvas.addEventListener('mouseup', function(event){
	isMousePressing = false;
	renderCanvas.isRendering = false;
    });

    canvas.addEventListener('mousemove', function(event){
	if(!isMousePressing) return;
	[px, py] = renderCanvas.calcPixel(event);
	if(event.button == 1){
	    renderCanvas.theta = prevTheta + (prevPos[0] - px) * 0.01;
	    renderCanvas.phi = prevPhi -(prevPos[1] - py) * 0.01;
	    renderCanvas.updateEye();
	    renderCanvas.isRendering = true;
	}
    });

    canvas.addEventListener('mousedown', function(event){
	isMousePressing = true;
	[px, py] = renderCanvas.calcPixel(event);
	if(event.button == 0){
	    var ray = calcRay(renderCanvas.eye, renderCanvas.target,
			      renderCanvas.up, renderCanvas.fovDegree,
			      canvas.width, canvas.height,
			      [event.clientX, event.clientY]);
	    renderCanvas.selectedSphereIndex = trace(renderCanvas.eye,
						     ray,
						     g_spheres.concat(g_baseSpheres));
	    renderCanvas.isRendering = true;
	}else if(event.button == 1){
	    prevPos = [px, py];
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

function addSphere(schottkyCanvas, orbitCanvas){
    g_spheres.push([500, 500, 0, 300]);
    g_numSpheres++;
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

function addBaseSphere(schottkyCanvas, orbitCanvas){
    g_baseSpheres.push([500, 500, 0, 125]);
    g_numBaseSpheres++;
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
}

window.addEventListener('load', function(event){
    var schottkyCanvas = new RenderCanvas('canvas', '3dSchottkyTemplate');
    var orbitCanvas = new RenderCanvas('orbitCanvas', '3dOrbitTemplate');

    setupSchottkyCanvas(schottkyCanvas);
    setupSchottkyCanvas(orbitCanvas);

    window.addEventListener('keydown', function(event){
	if(event.key == ' '){
	    addSphere(schottkyCanvas, orbitCanvas);
	    schottkyCanvas.render(0);
	    orbitCanvas.render(0);
	}else if(event.key == 'b'){
	    addBaseSphere(schottkyCanvas, orbitCanvas);
	    schottkyCanvas.render(0);
	    orbitCanvas.render(0);
	}else{
	    var index = schottkyCanvas.selectedSphereIndex;
	    if(index != -1){
		var operateSphere = g_spheres[index];
		if(index >= g_numSpheres)
		    operateSphere = g_baseSpheres[index - g_numSpheres];
		switch (event.key){
		case 'w':
		    operateSphere[1] += 50;
		    break;
		case 's':
		    operateSphere[1] -= 50;
		    break;
		case 'a':
		    operateSphere[0] -= 50;
		    break;
		case 'd':
		    operateSphere[0] += 50;
		    break;
		case 'q':
		    operateSphere[2] -= 50;
		    break;
		case 'e':
		    operateSphere[2] += 50;
		    break;
		case 'r':
		    operateSphere[3] += 10;
		    break;
		case 'f':
		    operateSphere[3] -= 10;
		    break;
		}
		schottkyCanvas.render(0);
		orbitCanvas.render(0);
	    }
	}

    });
    
    var startTime = new Date().getTime();
    (function(){
        var elapsedTime = new Date().getTime() - startTime;
	if(schottkyCanvas.isRendering)
	    schottkyCanvas.render(elapsedTime);
	if(orbitCanvas.isRendering)
	    orbitCanvas.render(elapsedTime);
    	requestAnimationFrame(arguments.callee);
    })();
}, false);
