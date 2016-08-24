var g_spheres = [[300, 300, 0, 300],
		 [300, -300, 0, 300],
		 [-300, 300, 0, 300],
		 [-300, -300, 0, 300],
		 [0, 0, 424.26, 300],
		 [0, 0, -424.26, 300]];
var g_numSpheres = 6;
var g_canvas;
var g_center = [0, 0];
var g_canvasRatio;
var g_scale = 900;
var g_mousePressing = false;
var g_operateRadius = false;
var g_selectableRadius = 10;
var g_diff;
var g_schottkyTemplate;
var g_addedCircle = false;

var g_eye = [1500, 450, 0];
var g_target = [0, 0, 0];
var g_fov = 60;
var g_eyeDist = 1500;
var g_up = [0, 1, 0]
var g_theta = 0;
var g_phi = 0;
var g_selectedSphereIndex = -1;

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


function calcPixel(mouseEvent){
    return [(mouseEvent.clientX * window.devicePixelRatio),
	    (mouseEvent.clientY * window.devicePixelRatio)];
}

function updateEye(){
    g_eye = calcCoordOnSphere(g_eyeDist, g_theta, g_phi);
    if(Math.abs(g_phi) % (2 * Math.PI) > Math.PI / 2. &&
       Math.abs(g_phi) % (2 * Math.PI) < 3 * Math.PI / 2.){
	g_up = [0, -1, 0];
    }else{
	g_up = [0, 1, 0];
    }
}

function addMouseListeners(){
    var prevPos;
    var prevTheta;
    var prevPhi;
    g_canvas.addEventListener('mouseup', function(event){
	g_mousePressing = false;
	g_operateRadius = false;
    }, false);

    g_canvas.addEventListener('mousemove', function(event){
	if(!g_mousePressing) return;
	[px, py] = calcPixel(event);
	if(g_mousePressing){
	    if(event.button == 1){
		g_theta = prevTheta + (prevPos[0] - px) * 0.01;
		g_phi = prevPhi -(prevPos[1] - py) * 0.01;
		updateEye();
	    }
	}
    });

    g_canvas.addEventListener('mousedown', function(event){
	g_mousePressing = true;
	[px, py] = calcPixel(event);
	if(event.button == 0){
	    var ray = calcRay(g_eye, g_target, g_up, g_fov,
			      g_canvas.width, g_canvas.height,
			      [event.clientX, event.clientY]);
	    g_selectedSphereIndex = trace(g_eye, ray, g_spheres);
	}else if(event.button == 1){
	    prevPos = [px, py];
	    prevTheta = g_theta;
	    prevPhi = g_phi;
	}

    }, false);
    
    window.addEventListener('keydown', function(event){
	if(event.key == 'ArrowRight'){
	    g_theta += 0.1;
	}else if(event.key == 'ArrowLeft'){
	    g_theta -= 0.1;
	}else if(event.key == 'ArrowUp'){
	    g_phi += 0.1;
	}else if(event.key == 'ArrowDown'){
	    g_phi -= 0.1;
	}
	updateEye();
    });
}

window.addEventListener('load', function(event){
    g_eye = calcCoordOnSphere(g_eyeDist, 0, 0);
    g_schottkyTemplate = nunjucks.compile(document.getElementById('3dSchottkyTemplate').text);
    g_canvas = document.getElementById('canvas');
    addMouseListeners();
//    resizeCanvasFullscreen();
    render();
}, false);

window.addEventListener('resize', function(event){
//    resizeCanvasFullscreen();
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
			   g_schottkyTemplate.render({numSpheres: g_numSpheres}),
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

    for(var i = 0 ; i < g_numSpheres ; i++){
	uniLocation[n++] = gl.getUniformLocation(program,
						 's'+ i);
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
        gl.viewport(0, 0, g_canvas.width, g_canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var uniI = 0;
        gl.uniform2fv(uniLocation[uniI++], [g_canvas.width, g_canvas.height]);
        gl.uniform1f(uniLocation[uniI++], elapsedTime * 0.001);
	gl.uniform1i(uniLocation[uniI++], g_selectedSphereIndex);
	gl.uniform3fv(uniLocation[uniI++], g_eye);
	gl.uniform3fv(uniLocation[uniI++], g_up);
	gl.uniform3fv(uniLocation[uniI++], g_target);
	gl.uniform1f(uniLocation[uniI++], g_fov);
	for(var i = 0 ; i < g_numSpheres ; i++){
	    gl.uniform4fv(uniLocation[uniI++], g_spheres[i]);
	}

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
							g_numSpheres);

    switchKs();
    (function(){
        var elapsedTime = new Date().getTime() - startTime;
	g_renderFunc(elapsedTime);
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
