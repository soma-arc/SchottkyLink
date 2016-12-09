function radians(degrees) {
    return degrees * Math.PI / 180;
};

function degrees(radians){
    return radians * 180 / Math.PI;
}

function getIdentityMat2(){
    return [1, 0,
            0, 1];
}

function getRotationMat2(thetaRad){
    var cosTheta = Math.cos(thetaRad);
    var sinTheta = Math.sin(thetaRad);
    return [cosTheta, -sinTheta,
            sinTheta, cosTheta];
}

function prodMat2(a, b){
    return [a[0] * b[0] + a[1] * b[2],
            a[0] * b[1] + a[1] * b[3],
            a[2] * b[0] + a[3] * b[2],
            a[2] * b[1] + a[1] * b[3]];
}

function applyMat2(m, p){
    return [m[0] * p[0] + m[1] * p[1],
            m[2] * p[0] + m[3] * p[1]];
}

function vec2Sum(a, b){
    return [a[0] + b[0],
            a[1] + b[1]];
}

function vec2Diff(a, b){
    return [a[0] - b[0],
            a[1] - b[1]];
}

function vec2Len(a){
    return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
}

function vec2Scale(a, k){
    return [a[0] * k, a[1] * k];
}

function vec2Normalize(v){
    var l = vec2Len(v);
    return [v[0] / l, v[1] / l];
}

function distance(p1, p2){
    return vec2Len(vec2Diff(p1, p2));
}

function circleInvertOnPoint(p, c){
    var center = c.getPosition();
    var r2 = c.r * c.r;
    var d = vec2Diff(p, center);
    var len = vec2Len(d);
    return vec2Sum(vec2Scale(d, r2 / (len * len)),
                   center);
}

function lineInvertOnPoint(p, center, lineDir, invRotationMat2, rotationMat2){
    var pos = vec2Diff(p, center);
    var rotated = applyMat2(invRotationMat2, pos);
    rotated[0] *= -1;
    rotated = applyMat2(rotationMat2, rotated);
    return vec2Sum(rotated, center);
}

function makeCircleFromPoints(a, b, c){
    var lA = vec2Len(vec2Diff(b, c));
    var lB = vec2Len(vec2Diff(a, c));
    var lC = vec2Len(vec2Diff(a, b));
    var coefA = lA * lA * (lB * lB + lC * lC - lA * lA);
    var coefB = lB * lB * (lA * lA + lC * lC - lB * lB);
    var coefC = lC * lC * (lA * lA + lB * lB - lC * lC);
    var denom = coefA + coefB + coefC;
    var center = [(coefA * a[0] + coefB * b[0] + coefC * c[0]) / denom,
                  (coefA * a[1] + coefB * b[1] + coefC * c[1]) / denom,
                 ];
    return new Circle(center[0], center[1], vec2Len(vec2Diff(center, a)));
}

function makeLineFromPoints(a, b){
    var d = (b[1] - a[1]) / (b[0] - a[0]);
    return [-d, 1, d * a[0] - a[1]];
}

var RT_2 = Math.sqrt(2);
function circleInvert(invertCircle, genCircle){
    var [x, y] = invertCircle.getPosition();
    var r = invertCircle.r;
    coeffR = r * RT_2 / 2;
    var p1 = circleInvertOnPoint([x + coeffR,
                                  y + coeffR,
                                 ], genCircle);
    var p2 = circleInvertOnPoint([x - coeffR,
                                  y - coeffR,
                                 ], genCircle);
    var p3 = circleInvertOnPoint([x + coeffR,
                                  y - coeffR,
                                 ], genCircle);
    return makeCircleFromPoints(p1, p2, p3);
}

function calcLineIntersection(x1, y1, x2, y2,
                          x3, y3, x4, y4){
    let ksi   = ( y4-y3 )*( x4-x1 ) - ( x4-x3 )*( y4-y1 );
    let eta   = ( x2-x1 )*( y4-y1 ) - ( y2-y1 )*( x4-x1 );
    let delta = ( x2-x1 )*( y4-y3 ) - ( y2-y1 )*( x4-x3 );

    let lambda = ksi / delta;
    let mu    = eta / delta;
    return [x1 + lambda*( x2-x1 ),
            y1 + lambda*( y2-y1 )];
}

// http://shogo82148.github.io/homepage/memo/geometry/line-circle.html
function calcCircleLineIntersection(c, lineDir, linePoint){
    let a = lineDir[0];
    let b = lineDir[1];

    let d = a * (c.y - linePoint[1]) - b * (c.x - linePoint[0]);
    let a2b2 = a * a + b * b;
    let rt = a2b2 * c.r * c.r - d * d;
    if(rt > 0){
        rt = Math.sqrt(rt);
        let ab = a * (c.x - linePoint[0]) + b * (c.y - linePoint[1])
        let tPlus = (ab + rt) / a2b2;
        let tMinus = (ab - rt) / a2b2;
        return [[a * tPlus + linePoint[0], b * tPlus + linePoint[1]],
                [a * tMinus + linePoint[0], b * tMinus + linePoint[1]]];
    }else if(rt == 0){
        let ab = a * (c.x - linePoint[0]) + b * (c.y - linePoint[1]);
        let t = ab / a2b2;
        return [a * t + linePoint[0], b * t + linePoint[1]];
    }else{
        return [];
    }
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
