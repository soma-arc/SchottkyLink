var g_scene;

var Circle = function(x, y, r){
    this.x = x;
    this.y = y;
    this.r = r;
}

Circle.prototype = {
    clone: function(){
	return new Circle(thix.x, thix.y, thix.r);
    },
    getUniformArray: function(){
	return [this.x, this.y, this.r];
    }
}

// Circle which have infinite radius.
// It is defined by translation and rotation.
// Initially it is reflection along the y-axis.
var InfiniteCircle = function(x, y, thetaDegree){
    this.x = x;
    this.y = y;
    this.theta = thetaDegree;
    this.rotationMat2 = getRotationMat2(radians(thetaDegree));
    this.invRotationMat2 = getRotationMat2(radians(-thetaDegree));
}

InfiniteCircle.prototype = {
    getUniformArray: function(){
	return [this.x, this.y, this.thetaDegree];
    }
}

var Scene = function(){
    this.circles = [new Circle(100, -100, 100),
		    new Circle(100, 100, 100),
		    new Circle(-100, -100, 100),
		    new Circle(-100, 100, 100)];
    this.infiniteCircles = [new InfiniteCircle(200, 0, 0),
			    new InfiniteCircle(-200, 0, 180)];
}

Scene.prototype = {
    getNumCircles: function(){
	return this.circles.length;
    },
    getNumInfiniteCircles: function(){
	return this.infiniteCircles.length;
    },
    removeCircle: function(canvas, index){
	if(this.circles.length == 0) return;
	canvas.selectedObjectId = -1;
	canvas.selectedObjectIndex = -1;
	this.circles.splice(index, 1);
	updateShaders(canvas);
    },
    addCircle: function(canvas, x, y){
	this.circles.push(new Circle(x, y, 100));
	updateShaders(canvas);
    }
}

const ID_CIRCLE = 0;
const CIRCLE_BODY = 0;
const CIRCLE_CIRCUMFERENCE = 1;

var RenderCanvas2D = function(canvasId, templateId){
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.defaultWidth = canvas.width;
    this.defaultHeight = canvas.height;
    this.center = [0, 0];
    this.canvasRatio = this.canvas.width / this.canvas.height / 2.;

    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    this.template = nunjucks.compile(document.getElementById(templateId).text);
    this.isRendering = false;
    this.isMousePressing = false;
    this.prevMousePos = [0, 0];
    this.scale = 900;
    this.selectableRadius = 10;

    this.selectedObjectId = -1;
    this.selectedObjectIndex = -1;
    this.selectedComponentId = -1;
    
    this.switch;
    this.render;
    this.iterations = 10;
    this.initialHue = 0;
    this.hueStep = 0.03
    this.numSamples = 10;
    this.translate = [0, 0];

    this.isFullScreen = false;
    
}

RenderCanvas2D.prototype = {
    resizeCanvas: function(width, height){
	this.canvas.style.width = width + 'px';
	this.canvas.style.height = height + 'px';
	this.canvas.width = width * window.devicePixelRatio;
	this.canvas.height = height * window.devicePixelRatio;
	this.center = [this.canvas.width / 2, this.canvas.height / 2];
	this.canvasRatio = this.canvas.width / this.canvas.height / 2.;
    },
    resizeCanvasFullscreen: function(){
	this.canvas.style.width = window.innerWidth + 'px';
	this.canvas.style.height = window.innerHeight + 'px';
	this.canvas.width = window.innerWidth * window.devicePixelRatio;
	this.canvas.height = window.innerHeight * window.devicePixelRatio;
	this.center = [this.canvas.width / 2, this.canvas.height / 2];
	this.canvasRatio = this.canvas.width / this.canvas.height / 2.;
    },
    calcPixel: function(){
	var rect = event.target.getBoundingClientRect();
	return [this.scale * (((event.clientX - rect.left) * devicePixelRatio) / this.canvas.height - this.canvasRatio) +
		this.translate[0],
		this.scale * -(((event.clientY - rect.top) * devicePixelRatio) / this.canvas.height - 0.5) +
		this.translate[1]];
    },
    requestFullScreen: function(){
	var ua = navigator.userAgent.toLowerCase();
	var version = navigator.appVersion.toLowerCase();

	var requestFullScreen;
	if(ua.indexOf('firefox') > -1){
	    // firefox
	    this.canvas.mozRequestFullscreen();
	}else if((ua.indexOf('chrome') > -1) &&
		 (ua.indexOf('edge') == -1)){
	    // chrome
	    this.canvas.webkitRequestFullscreen();
	    
	}else if((ua.indexOf('safari') > -1) && (ua.indexOf('chrome') == -1)){
	    // safari
	    this.canvas.webkitRequestFullscreen();
	}else if(ua.indexOf('opera') > -1){
	    // opera
	    this.canvas.webkitRequestFullscreen();
	}else if(ua.indexOf('trident/7') > -1){
	    // IE11
	    this.canvas.msRequestFullscreen();
	}else if((ua.indexOf('Edge') > -1)){
	    // Edge
	    this.canvas.msRequestFullscreen();
	}
    }
}

function updateShaders(canvas){
    [canvas.switch,
     canvas.render] = setupSchottkyProgram(g_scene, canvas);
    canvas.switch();
    canvas.render(0);
}

function addMouseListeners(renderCanvas){
    var diff = [0, 0];
    renderCanvas.canvas.addEventListener('mouseup', function(event){
	renderCanvas.mousePressing = false;
	renderCanvas.isRendering = false;
	renderCanvas.selectedObjectId = -1;
	renderCanvas.selectedObjectIndex = -1;
	renderCanvas.selectedComponentId = -1;
    }, false);

    renderCanvas.canvas.addEventListener('mousemove', function(event){
	if(!renderCanvas.isMousePressing) return;
	var [px, py] = renderCanvas.calcPixel();
	if(event.button == 0){
	    if(renderCanvas.selectedObjectId == ID_CIRCLE){
		var circle = g_scene.circles[renderCanvas.selectedObjectIndex];
		if(renderCanvas.selectedComponentId == CIRCLE_CIRCUMFERENCE){
		    var dx = px - circle.x;
		    var dy = py - circle.y;
		    var dist = Math.sqrt((dx * dx) + (dy * dy));
		    circle.r = dist;
		}else{
		    circle.x = px - diff[0];
		    circle.y = py - diff[1];
		}
		renderCanvas.isRendering = true;
	    }
	}
    });

    renderCanvas.canvas.addEventListener('mousedown', function(event){
	event.preventDefault();
	renderCanvas.isMousePressing = true;
	var [px, py] = renderCanvas.calcPixel(event);
	if(event.button == 0){
	    var circles = g_scene.circles;
	    for(var i = 0 ; i < circles.length ; i++){
		var dx = px - circles[i].x;
		var dy = py - circles[i].y;
		var dist = Math.sqrt((dx * dx) + (dy * dy));
		if(Math.abs(dist - circles[i].r) < renderCanvas.selectableRadius){
		    renderCanvas.selectedCircleIndex = i;
		    renderCanvas.isOperatingRadius = true;
		    renderCanvas.selectedObjectId = ID_CIRCLE;
		    renderCanvas.selectedObjectIndex = i;
		    renderCanvas.selectedComponentId = CIRCLE_CIRCUMFERENCE;
		    return;
		}else if(dist < circles[i].r - renderCanvas.selectableRadius){
		    diff = [dx, dy];
		    renderCanvas.selectedObjectId = ID_CIRCLE;
		    renderCanvas.selectedObjectIndex = i;
		    renderCanvas.selectedComponentId = CIRCLE_BODY;
		    return;
		}
	    }
	}else if(event.button == 1){
	    g_scene.addCircle(renderCanvas, px, py);
	}
	renderCanvas.selectedObjectId = -1;
	renderCanvas.selectedObjectIndex = -1;
	renderCanvas.selectedComponentId = -1;
    }, false);

    renderCanvas.canvas.addEventListener('dblclick', function(event){
	if(event.button == 0){
	    var [px, py] = renderCanvas.calcPixel(event);
	    var circles = g_scene.circles;
	    for(var i = 0 ; i < circles.length ; i++){
		var dx = px - circles[i].x;
		var dy = py - circles[i].y;
		var dist = Math.sqrt((dx * dx) + (dy * dy));
		if(dist < circles[i].r){
		    g_scene.removeCircle(renderCanvas, i);
		    return;
		}
	    }
	}
    });

    renderCanvas.canvas.addEventListener('mousewheel', function(event){
	event.preventDefault();
	if(event.wheelDelta > 0){
	    if(renderCanvas.scale > 1){
		renderCanvas.scale -= 100;
	    }
	}else{
	    renderCanvas.scale += 100;
	}
	renderCanvas.render(0);
    })
}

function setupSchottkyProgram(scene, renderCanvas){
    var gl = renderCanvas.gl;
    var program = gl.createProgram();
    var numCircles = scene.getNumCircles();
    var numInfiniteCircles = scene.getNumInfiniteCircles();
    attachShaderFromString(gl,
			   renderCanvas.template.render({numCircles: numCircles,
							 numInfiniteCircles: numInfiniteCircles}),
			   program,
			   gl.FRAGMENT_SHADER);
    attachShader(gl, 'vs', program, gl.VERTEX_SHADER);
    program = linkProgram(gl, program);

    var uniLocation = new Array();
    var n = 0;
    uniLocation[n++] = gl.getUniformLocation(program, 'u_iResolution');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_iGlobalTime');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_translate');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_scale');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_iterations');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_initialHue');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_hueStep');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_numSamples');
    for(var i = 0 ; i < numCircles ; i++){
	uniLocation[n++] = gl.getUniformLocation(program, 'u_schottkyCircle'+ i);
    }
    for(var i = 0 ; i < numInfiniteCircles ; i++){
	uniLocation[n++] = gl.getUniformLocation(program, 'u_infiniteCircle'+ i);
	uniLocation[n++] = gl.getUniformLocation(program, 'u_infiniteCircleRotationMat2'+ i);
	uniLocation[n++] = gl.getUniformLocation(program, 'u_invInfiniteCircleRotationMat2'+ i);
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
        gl.viewport(0, 0,
		    renderCanvas.canvas.width,
		    renderCanvas.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var uniI = 0;
        gl.uniform2fv(uniLocation[uniI++], [renderCanvas.canvas.width,
					    renderCanvas.canvas.height]);
        gl.uniform1f(uniLocation[uniI++], elapsedTime * 0.001);
	gl.uniform2fv(uniLocation[uniI++], renderCanvas.translate);
	gl.uniform1f(uniLocation[uniI++], renderCanvas.scale);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.iterations);
	gl.uniform1f(uniLocation[uniI++], renderCanvas.initialHue);
	gl.uniform1f(uniLocation[uniI++], renderCanvas.hueStep);
	gl.uniform1f(uniLocation[uniI++], renderCanvas.numSamples);

	for(var i = 0 ; i < numCircles ; i++){
	    gl.uniform3fv(uniLocation[uniI++], scene.circles[i].getUniformArray());
	}
	for(var i = 0 ; i < numInfiniteCircles ; i++){
	    gl.uniform3fv(uniLocation[uniI++], scene.infiniteCircles[i].getUniformArray());
	    gl.uniformMatrix2fv(uniLocation[uniI++], false,
				scene.infiniteCircles[i].rotationMat2);
	    gl.uniformMatrix2fv(uniLocation[uniI++], false,
				scene.infiniteCircles[i].invRotationMat2);
	}
	
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	gl.flush();
    }

    return [switchProgram, render];
}

window.addEventListener('load', function(event){
    g_scene = new Scene();
    
    var renderCanvas = new RenderCanvas2D('canvas',
					  'kissingSchottkyTemplate');
    
    addMouseListeners(renderCanvas);
    renderCanvas.resizeCanvas(renderCanvas.defaultWidth,
			      renderCanvas.defaultHeight);

    updateShaders(renderCanvas);

    window.addEventListener('resize', function(event){
	console.log('resize');
    	if(renderCanvas.isFullScreen){
    	    renderCanvas.resizeCanvasFullscreen();
    	}else{
    	    renderCanvas.resizeCanvas(renderCanvas.defaultWidth,
				      renderCanvas.defaultHeight);
    	}
    	renderCanvas.render(0);
    }, false);

    document.addEventListener('webkitfullscreenchange', function(event){
	console.log(document.webkitFullscreenElement);
	if ( document.webkitFullscreenElement ) {
	    renderCanvas.isFullScreen = true;
	}else{
	    renderCanvas.isFullScreen = false;
	    renderCanvas.resizeCanvas(renderCanvas.defaultWidth,
				      renderCanvas.defaultHeight);
	    renderCanvas.render(0);
	}
    });

    document.addEventListener('mozfullscreenchange', function(event){
	if ( document.mozFullscreenElement ) {
	    renderCanvas.isFullScreen = true;
	}else{
	    renderCanvas.isFullScreen = false;
	    renderCanvas.resizeCanvas(renderCanvas.defaultWidth,
				      renderCanvas.defaultHeight);
	    renderCanvas.render(0);
	}
    });

    document.addEventListener('msfullscreenchange', function(event){
	if ( document.msFullscreenElement ) {
	    renderCanvas.isFullScreen = true;
	}else{
	    renderCanvas.isFullScreen = false;
	    renderCanvas.resizeCanvas(renderCanvas.defaultWidth,
				      renderCanvas.defaultHeight);
	    renderCanvas.render(0);
	}
    });
    
    window.addEventListener('keydown', function(event){
	switch(event.key){
	case '+':
	    renderCanvas.iterations++;
	    renderCanvas.render(0);
	    break;
	case '-':
	    if(renderCanvas.iterations > 1){
		renderCanvas.iterations--;
		renderCanvas.render(0);
	    }
	    break;
	case 'p':
	    renderCanvas.numSamples++;
	    renderCanvas.render(0);
	    break;
	case 'n':
	    if(renderCanvas.numSamples > 1){
		renderCanvas.numSamples--;
		renderCanvas.render(0);
	    }
	    break;
	case 'a':
	    if(renderCanvas.initialHue > 0){
		renderCanvas.initialHue -= 0.05;
		renderCanvas.render(0);
	    }
	    break;
	case 's':
	    renderCanvas.initialHue += 0.05;
	    renderCanvas.render(0);
	    break;
	case 'z':
	    if(renderCanvas.hueStep > 0){
		renderCanvas.hueStep -= 0.01;
		renderCanvas.render(0);
	    }
	    break;
	case 'x':
	    renderCanvas.hueStep += 0.01;
	    renderCanvas.render(0);
	    break;
	case 'r':
	    renderCanvas.requestFullScreen();
	    break;
	case 'ArrowRight':
	    event.preventDefault();
	    renderCanvas.translate[0] += renderCanvas.scale / 10;
	    renderCanvas.render(0);
	    break;
	case 'ArrowLeft':
	    event.preventDefault();
	    renderCanvas.translate[0] -= renderCanvas.scale / 10;
	    renderCanvas.render(0);
	    break;
	case 'ArrowUp':
	    event.preventDefault();
	    renderCanvas.translate[1] += renderCanvas.scale / 10;
	    renderCanvas.render(0);
	    break;
	case 'ArrowDown':
	    event.preventDefault();
	    renderCanvas.translate[1] -= renderCanvas.scale / 10;
	    renderCanvas.render(0);
	    break;
	}
    });
    var startTime = new Date().getTime();
    (function(){
        var elapsedTime = new Date().getTime() - startTime;
	if(renderCanvas.isRendering)
	    renderCanvas.render(elapsedTime);
	requestAnimationFrame(arguments.callee);
    })();
}, false);
