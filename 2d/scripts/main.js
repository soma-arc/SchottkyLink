var g_circles = [[100, 0, 100],
		 [100, 100, 100],
		 [-100, -100, 100],
		 [-100, 100, 100]];
var g_numCircles = 4;

var RenderCanvas2D = function(canvasId, templateId){
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.center = [0, 0];
    this.canvasRatio;
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
}

RenderCanvas2D.prototype = {
    resizeCanvasFullscreen: function(){
	this.canvas.style.width = window.innerWidth + 'px';
	this.canvas.style.height = window.innerHeight + 'px';
	this.canvas.width = window.innerWidth * window.devicePixelRatio;
	this.canvas.height = window.innerHeight * window.devicePixelRatio;
	this.center = [this.canvas.width / 2, this.canvas.height / 2];
	this.canvasRatio = this.canvas.width / this.canvas.height / 2.;
    },
    calcPixel: function(mouseEvent){
	return [this.scale * (event.clientX * window.devicePixelRatio / this.canvas.height - this.canvasRatio),
		this.scale * -((event.clientY * window.devicePixelRatio) / this.canvas.height - 0.5)];
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
	var [px, py] = renderCanvas.calcPixel(event)
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
    for(var i = 0 ; i < numCircles ; i++){
	uniLocation[n++] = gl.getUniformLocation(program, 'c'+ i);
    }
    uniLocation[n++] = gl.getUniformLocation(program, 'scale');
 
 
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
	for(var i = 0 ; i < numCircles ; i++){
	    gl.uniform3fv(uniLocation[uniI++], g_circles[i]);
	}
	gl.uniform1f(uniLocation[uniI++], renderCanvas.scale);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	gl.flush();
    }

    return [switchProgram, render];
}

window.addEventListener('load', function(event){
    var renderCanvas = new RenderCanvas2D('canvas',
					  'kissingSchottkyTemplate');
    addMouseListeners(renderCanvas);
    renderCanvas.resizeCanvasFullscreen();

    [renderCanvas.switch,
     renderCanvas.render] = setupSchottkyProgram(renderCanvas,
						 g_numCircles);

    renderCanvas.switch();
    renderCanvas.render();

    window.addEventListener('resize', function(event){
	renderCanvas.resizeCanvasFullscreen();
	renderCanvas.render(0);
    }, false);
    
    var startTime = new Date().getTime();
    (function(){
        var elapsedTime = new Date().getTime() - startTime;
	if(renderCanvas.isRendering)
	    renderCanvas.render(elapsedTime);
	requestAnimationFrame(arguments.callee);
    })();
}, false);
