var g_circles = [[100, 0, 100],
		 [100, 100, 100],
		 [-100, -100, 100],
		 [-100, 100, 100]];
var g_selectedCircleIndex = 0;
var g_numCircles = 4;
var g_canvas;
var g_center = [0, 0];
var g_canvasRatio;
var g_scale = 900;
var g_mousePressing = false;
var g_operateRadius = false;
var g_selectableRadius = 10;
var g_diff;
var g_kissingSchottkyTemplate;
var g_addedCircle = false;

function addMouseListeners(){
    g_canvas.addEventListener('mouseup', function(event){
	g_mousePressing = false;
	g_operateRadius = false;
	g_selectedCircleIndex = -1;
    }, false);

    g_canvas.addEventListener('mousemove', function(event){
	if(!g_mousePressing) return;
	var px = g_scale * (event.clientX * window.devicePixelRatio / g_canvas.height - g_canvasRatio);
	var py = g_scale * -((event.clientY * window.devicePixelRatio) / g_canvas.height - 0.5);
	if(event.button == 0){
	    if(g_operateRadius){
		var dx = px - g_circles[g_selectedCircleIndex][0];
		var dy = py - g_circles[g_selectedCircleIndex][1];
		var dist = Math.sqrt((dx * dx) + (dy * dy));
		g_circles[g_selectedCircleIndex][2] = dist;
		return;
	    }else if(g_selectedCircleIndex > -1){
		g_circles[g_selectedCircleIndex][0] = px - g_diff[0];
		g_circles[g_selectedCircleIndex][1] = py - g_diff[1];
	    }
	}
    });

    g_canvas.addEventListener('mousedown', function(event){
	g_mousePressing = true;
	var px = g_scale * ( event.clientX * window.devicePixelRatio / g_canvas.height - g_canvasRatio);
	var py = g_scale * -((event.clientY * window.devicePixelRatio) / g_canvas.height - 0.5);
	if(event.button == 0){
	    for(var i = 0 ; i < g_numCircles ; i++){
		var dx = px - g_circles[i][0];
		var dy = py - g_circles[i][1];
		var dist = Math.sqrt((dx * dx) + (dy * dy));
		if(Math.abs(dist - g_circles[i][2]) < g_selectableRadius){
		    g_selectedCircleIndex = i;
		    g_operateRadius = true;
		}else if(dist < g_circles[i][2] - g_selectableRadius){
		    g_diff = [dx, dy];
		    g_selectedCircleIndex = i;
		}
	    }
	}else if(event.button == 1){
	    g_addedCircle = true;
	    g_circles.push([px, py, 100]);
	}
    }, false);
}

window.addEventListener('load', function(event){
    g_kissingSchottkyTemplate = nunjucks.compile(document.getElementById('kissingSchottkyTemplate').text);
    g_canvas = document.getElementById('canvas');
    addMouseListeners();
    resizeCanvasFullscreen();
    render();
}, false);

window.addEventListener('resize', function(event){
    resizeCanvasFullscreen();
}, false);

function resizeCanvasFullscreen(){
    g_canvas.style.width = window.innerWidth + 'px';
    g_canvas.style.height = window.innerHeight + 'px';
    g_canvas.width = window.innerWidth * window.devicePixelRatio;
    g_canvas.height = window.innerHeight * window.devicePixelRatio;
    g_center = [g_canvas.width / 2, g_canvas.height / 2];
    g_canvasRatio = g_canvas.width / g_canvas.height / 2.;
}

function setupSchottkyProgram(gl, numCircles){
    var program = gl.createProgram();
    attachShaderFromString(gl,
			   g_kissingSchottkyTemplate.render({numCircles: numCircles}),
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
        gl.viewport(0, 0, g_canvas.width, g_canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var uniI = 0;
        gl.uniform2fv(uniLocation[uniI++], [g_canvas.width, g_canvas.height]);
        gl.uniform1f(uniLocation[uniI++], elapsedTime * 0.001);
	for(var i = 0 ; i < numCircles ; i++){
	    gl.uniform3fv(uniLocation[uniI++], g_circles[i]);
	}
	gl.uniform1f(uniLocation[uniI++], g_scale);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	gl.flush();
    }

    return [switchProgram, render];
}

var g_renderFunc;
function render(){
    var startTime = new Date().getTime();
    var gl = g_canvas.getContext('webgl') || g_canvas.getContext('experimental-webgl');
    var [switchKs, g_renderFunc] = setupSchottkyProgram(gl,
							g_numCircles);

    switchKs();
    (function(){
        var elapsedTime = new Date().getTime() - startTime;
	g_renderFunc(elapsedTime);
	if(g_addedCircle){
	    g_numCircles++;
	    [switchKs, g_renderFunc] = setupSchottkyProgram(gl,
							    g_numCircles);
	    switchKs();
	    g_addedCircle = false;
	}
	requestAnimationFrame(arguments.callee);
    })();
}

function attachShader(gl, shaderId, program, shaderType){
    var shader = gl.createShader(shaderType);
    elem = document.getElementById(shaderId).text;
    gl.shaderSource(shader, elem);
    gl.compileShader(shader);
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        gl.attachShader(program, shader);
    }else{
	alert(gl.getShaderInfoLog(shader));
	console.log(gl.getShaderInfoLog(shader));
    }
}

function attachShaderFromString(gl, shaderStr, program, shaderType){
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderStr);
    gl.compileShader(shader);
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        gl.attachShader(program, shader);
    }else{
	alert(gl.getShaderInfoLog(shader));
	console.log(gl.getShaderInfoLog(shader));
    }
}

function linkProgram(gl, program){
    gl.linkProgram(program);
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
	gl.useProgram(program);
	return program;
    }else{
	return null;
    }
}

function createVbo(gl, data){
    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
}

function createIbo(gl, data){
    var ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
}
