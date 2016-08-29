var g_circles = [[100, -100, 100],
		 [100, 100, 100],
		 [-100, -100, 100],
		 [-100, 100, 100]];
var g_numCircles = 4;

var RenderCanvas2D = function(canvasId, templateId){
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.center = [0, 0];
    this.canvasRatio = this.canvas.width / this.canvas.height / 2.;
;
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    this.template = nunjucks.compile(document.getElementById(templateId).text);
    this.isRendering = false;
    this.isMousePressing = false;
    this.isOperatingRadius = false;
    this.prevMousePos = [0, 0];
    this.scale = 900;
    this.selectableRadius = 10;
    this.selectedCircleIndex = -1;
    
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

function addMouseListeners(renderCanvas){
    var diff = [0, 0];
    renderCanvas.canvas.addEventListener('mouseup', function(event){
	renderCanvas.mousePressing = false;
	renderCanvas.isOperatingRadius = false;
	renderCanvas.selectedCircleIndex = -1;
	renderCanvas.isRendering = false;
    }, false);

    renderCanvas.canvas.addEventListener('mousemove', function(event){
	if(!renderCanvas.isMousePressing) return;
	var [px, py] = renderCanvas.calcPixel();
	if(event.button == 0){
	    if(renderCanvas.isOperatingRadius){
		var dx = px - g_circles[renderCanvas.selectedCircleIndex][0];
		var dy = py - g_circles[renderCanvas.selectedCircleIndex][1];
		var dist = Math.sqrt((dx * dx) + (dy * dy));
		g_circles[renderCanvas.selectedCircleIndex][2] = dist;
		return;
	    }else if(renderCanvas.selectedCircleIndex > -1){
		g_circles[renderCanvas.selectedCircleIndex][0] = px - diff[0];
		g_circles[renderCanvas.selectedCircleIndex][1] = py - diff[1];
	    }
	}
    });

    renderCanvas.canvas.addEventListener('mousedown', function(event){
	renderCanvas.isMousePressing = true;
	var [px, py] = renderCanvas.calcPixel(event);
	if(event.button == 0){
	    for(var i = 0 ; i < g_numCircles ; i++){
		var dx = px - g_circles[i][0];
		var dy = py - g_circles[i][1];
		var dist = Math.sqrt((dx * dx) + (dy * dy));
		if(Math.abs(dist - g_circles[i][2]) < renderCanvas.selectableRadius){
		    renderCanvas.selectedCircleIndex = i;
		    renderCanvas.isOperatingRadius = true;
		}else if(dist < g_circles[i][2] - renderCanvas.selectableRadius){
		    diff = [dx, dy];
		    renderCanvas.selectedCircleIndex = i;
		}
	    }
	    renderCanvas.isRendering = true;
	}else if(event.button == 1){
	    g_circles.push([px, py, 100]);
	    g_numCircles++;
	    [renderCanvas.switch,
	     renderCanvas.render] = setupSchottkyProgram(renderCanvas,
							 g_numCircles);
	    renderCanvas.switch();
	    renderCanvas.render(0);
	}
    }, false);

    renderCanvas.canvas.addEventListener('dblclick', function(event){
	if(event.button == 0 && g_numCircles > 1){
	    var [px, py] = renderCanvas.calcPixel(event);
	    for(var i = 0 ; i < g_numCircles ; i++){
		var dx = px - g_circles[i][0];
		var dy = py - g_circles[i][1];
		var dist = Math.sqrt((dx * dx) + (dy * dy));
		if(dist < g_circles[i][2]){
		    g_circles.splice(i, 1);
		    g_numCircles--;
		    
		    [renderCanvas.switch,
		     renderCanvas.render] = setupSchottkyProgram(renderCanvas,
								 g_numCircles);
		    renderCanvas.switch();
		    renderCanvas.render(0);
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

function setupSchottkyProgram(renderCanvas, numCircles){
    var gl = renderCanvas.gl;
    var program = gl.createProgram();
    attachShaderFromString(gl,
			   renderCanvas.template.render({numCircles: numCircles}),
			   program,
			   gl.FRAGMENT_SHADER);
    attachShader(gl, 'vs', program, gl.VERTEX_SHADER);
    program = linkProgram(gl, program);

    var uniLocation = new Array();
    var n = 0;
    uniLocation[n++] = gl.getUniformLocation(program, 'iResolution');
    uniLocation[n++] = gl.getUniformLocation(program, 'iGlobalTime');
    uniLocation[n++] = gl.getUniformLocation(program, 'translate');
    for(var i = 0 ; i < numCircles ; i++){
	uniLocation[n++] = gl.getUniformLocation(program, 'c'+ i);
    }
    uniLocation[n++] = gl.getUniformLocation(program, 'scale');
    uniLocation[n++] = gl.getUniformLocation(program, 'iterations');
    uniLocation[n++] = gl.getUniformLocation(program, 'initialHue');
    uniLocation[n++] = gl.getUniformLocation(program, 'hueStep');
    uniLocation[n++] = gl.getUniformLocation(program, 'numSamples');
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
	for(var i = 0 ; i < numCircles ; i++){
	    gl.uniform3fv(uniLocation[uniI++], g_circles[i]);
	}
	gl.uniform1f(uniLocation[uniI++], renderCanvas.scale);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.iterations);
	gl.uniform1f(uniLocation[uniI++], renderCanvas.initialHue);
	gl.uniform1f(uniLocation[uniI++], renderCanvas.hueStep);
	gl.uniform1f(uniLocation[uniI++], renderCanvas.numSamples);
	
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	gl.flush();
    }

    return [switchProgram, render];
}

window.addEventListener('load', function(event){
    var renderCanvas = new RenderCanvas2D('canvas',
					  'kissingSchottkyTemplate');
    
    addMouseListeners(renderCanvas);
    renderCanvas.resizeCanvas(512, 512);

    [renderCanvas.switch,
     renderCanvas.render] = setupSchottkyProgram(renderCanvas,
						 g_numCircles);

    renderCanvas.switch();
    renderCanvas.render();

    window.addEventListener('resize', function(event){
	if(renderCanvas.isFullScreen){
	    renderCanvas.resizeCanvasFullscreen();
	}else{
	    renderCanvas.resizeCanvas(512, 512);
	}
	renderCanvas.render(0);
    }, false);

    document.addEventListener('webkitfullscreenchange', function(event){
	if ( document.webkitFullscreenElement ) {
	    renderCanvas.isFullScreen = true;
	}else{
	    renderCanvas.isFullScreen = false;
	}
    });

    document.addEventListener('mozfullscreenchange', function(event){
	if ( document.mozFullscreenElement ) {
	    renderCanvas.isFullScreen = true;
	}else{
	    renderCanvas.isFullScreen = false;
	}
    });

    document.addEventListener('msfullscreenchange', function(event){
	if ( document.msFullscreenElement ) {
	    renderCanvas.isFullScreen = true;
	}else{
	    renderCanvas.isFullScreen = false;
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
