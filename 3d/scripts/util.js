radians = function(degrees) {
    return degrees * Math.PI / 180;
};

function makeSphereFromPoints(p1, p2, p3, p4){
    var p = [p1, p2, p3, p4];
    var coefficient =[[], [], []];
    for(var i = 0 ; i < 3 ; i++){
	coefficient[i][0] = 2 * (p[i + 1][0] - p[i][0]);
	coefficient[i][1] = 2 * (p[i + 1][1] - p[i][1]);
	coefficient[i][2] = 2 * (p[i + 1][2] - p[i][2]);
	coefficient[i][3] = -(Math.pow(p[i][0], 2) + Math.pow(p[i][1], 2) + Math.pow(p[i][2], 2))+
	    Math.pow(p[i + 1][0], 2) + Math.pow(p[i + 1][1], 2) + Math.pow(p[i + 1][2], 2);
    }

    var pibot, d;
    for (var k = 0 ; k < 3 ; k++) {
	pibot = coefficient[k][k];
	//    if(pibot == 0) console.log("0 pibot");
	for (var j = k; j < 3 + 1; j++) {
	    coefficient[k][j] = coefficient[k][j] / pibot;
	}
	for (var i = 0 ; i < 3 ; i++) {
	    if (k != i) {
  		d = coefficient[i][k];
		for (var j = k; j < 3 + 1; j++) {
  		    coefficient[i][j] = coefficient[i][j] - d * coefficient[k][j];
		}
	    }
	}
    }

    var center = [coefficient[0][3], coefficient[1][3], coefficient[2][3]];
    var r = vecLength(diff(center, p1));
    return new Sphere(center[0], center[1], center[2], r);
}

var RT_3 = Math.sqrt(3);
function sphereInvert(invertSphere, genSphere){
    var [x, y, z] = invertSphere.getPosition();
    var r = invertSphere.r;
    coeffR = r * RT_3 / 3;
    var p1 = sphereInvertOnPoint([x + coeffR,
				  y + coeffR,
				  z + coeffR], genSphere);
    var p2 = sphereInvertOnPoint([x - coeffR,
				  y - coeffR,
				  z - coeffR], genSphere);
    var p3 = sphereInvertOnPoint([x + coeffR,
				  y - coeffR,
				  z - coeffR], genSphere);
    var p4 = sphereInvertOnPoint([x + coeffR,
				  y + coeffR,
				  z - coeffR], genSphere);
    return makeSphereFromPoints(p1, p2, p3, p4);
}

function sphereInvertOnPoint(p, s){
    var sphereC = s.getPosition();
    var r2 = s.r * s.r;
    var d = diff(p, sphereC);
    var len = vecLength(d);
    return sum(scale(d, r2 / (len * len)),
	       sphereC);
}

function resizeCanvasFullscreen(canvas){
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
//    center = [canvas.width / 2, canvas.height / 2];
//    canvasRatio = canvas.width / canvas.height / 2.;
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
