const RAYTRACE_EPSILON = 0.001;

function sum(a, b){
    return [a[0] + b[0],
	    a[1] + b[1],
	    a[2] + b[2]];
}

function diff(a, b){
    return [a[0] - b[0],
	    a[1] - b[1],
	    a[2] - b[2]];
}

function prod(a, b){
    return [a[0] * b[0],
	    a[1] * b[1],
	    a[2] * b[2]];
}

function dot(a, b){
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function scale(a, k){
    return [a[0] * k,
	    a[1] * k,
	    a[2] * k];
}

function cross(a, b){
    return [a[1] * b[2] - a[2] * b[1],
	    a[2] * b[0] - a[0] * b[2],
	    a[0] * b[1] - a[1] * b[0]];
}

function vecLength(v){
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function normalize(n){
    var l = vecLength(n);
    return [n[0] / l,
	    n[1] / l,
	    n[2] / l];
}

function radians(degrees) {
  return degrees * Math.PI / 180;
};

function calcRay(eye, target, up, fov, width, height, coord){
    var imagePlane = (height * 0.5) / Math.tan(radians(fov) * 0.5);
    var v = normalize(diff(target, eye));
    var focalXAxis = normalize(cross(v, up));
    var focalYAxis = normalize(cross(v, focalXAxis));
    var center = scale(v, imagePlane);
    var origin = diff(diff(center, scale(focalXAxis, width * 0.5)),
		      scale(focalYAxis, height * 0.5));
    return normalize(sum(sum(origin, scale(focalXAxis, coord[0])),
			 scale(focalYAxis, coord[1])))
}

function intersectSphere(id, center, radius,
			 rayOrigin, rayDir, isect){
    var v = diff(rayOrigin, center);
    var b = dot(rayDir, v);
    var c = dot(v, v) - radius * radius;
    var d = b * b - c;
    if(d >= 0){
	var s = Math.sqrt(d);
	var t = - b - s;
	if(t <= RAYTRACE_EPSILON) t = -b + s;
	if(RAYTRACE_EPSILON < t && t < isect[0]){
	    var p = sum(rayOrigin, scale(rayDir, t));
	    return [t, id].concat(normalize(diff(p, center)));
	}
    }
    return isect;
}

function trace(eye, ray, spheres){
    var result = [99999, 99999, 99999, 99999];
    var l = spheres.length;
    for(let i = 0 ; i < l ; i++){
	result = intersectSphere(i,
				 spheres[i].slice(0, 3),
				 spheres[i][3],
				 eye, ray, result);
    }
    if(result[0] != 99999){
	return result[1];
    }
    return -1;
}
