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

function normalize3(n){
    var l = vecLength(n);
    return [n[0] / l,
	    n[1] / l,
	    n[2] / l];
}

function normalize2(v){
    var l = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / l,
	    v[1] / l];
}

function radians(degrees) {
  return degrees * Math.PI / 180;
};

function calcRay(eye, target, up, fov, width, height, coord){
    var imagePlane = (height * 0.5) / Math.tan(radians(fov) * 0.5);
    var v = normalize3(diff(target, eye));
    var focalXAxis = normalize3(cross(v, up));
    var focalYAxis = normalize3(cross(v, focalXAxis));
    var center = scale(v, imagePlane);
    var origin = diff(diff(center, scale(focalXAxis, width * 0.5)),
		      scale(focalYAxis, height * 0.5));
    return normalize3(sum(sum(origin, scale(focalXAxis, coord[0])),
			 scale(focalYAxis, coord[1])))
}

function intersectPlane(id, p, n, rayOrigin, rayDir, isect){
    var d = -dot(p, n);
    var v = dot(n, rayDir);
    var t = -(dot(n, rayOrigin) + d) / v;
    if(RAYTRACE_EPSILON < t && t < isect[0]){
	var i = sum(rayOrigin, scale(rayDir, t));
    	return [t, id, i, n];
    }
    return isect;
}

function intersectXYCylinder(id, r, center,
			     rayOrigin, rayDir, isect){
    rayOrigin = diff(rayOrigin, center);
    var a = rayDir[0] * rayDir[0] + rayDir[1] * rayDir[1];
    var b = 2. * ( rayOrigin[0] * rayDir[0] + rayOrigin[1] * rayDir[1]);
    var c = rayOrigin[0] * rayOrigin[0] + rayOrigin[1] * rayOrigin[1] - r * r;
    var d = b * b - 4. * a * c;
    if(d >= 0.){
	var s = Math.sqrt(d);
	var t = (-b - s) / (2. * a);
        if(t <= RAYTRACE_EPSILON) t = (-b + s) / (2. * a);
        if(RAYTRACE_EPSILON < t && t < isect[0]){
	    var p = sum(rayOrigin, scale(rayDir, t));
	    return [t, id, p];
        }
    }
    return isect;
}

function intersectYZCylinder(id, r, center,
			     rayOrigin, rayDir, isect){
    rayOrigin = diff(rayOrigin, center);
    var a = rayDir[2] * rayDir[2] + rayDir[1] * rayDir[1];
    var b = 2. * ( rayOrigin[2] * rayDir[2] + rayOrigin[1] * rayDir[1]);
    var c = rayOrigin[2] * rayOrigin[2] + rayOrigin[1] * rayOrigin[1] - r * r;
    var d = b * b - 4. * a * c;
    if(d >= 0.){
	var s = Math.sqrt(d);
	var t = (-b - s) / (2. * a);
        if(t <= RAYTRACE_EPSILON) t = (-b + s) / (2. * a);
        if(RAYTRACE_EPSILON < t && t < isect[0]){
	    var p = sum(rayOrigin, scale(rayDir, t));
	    return [t, id, p];
        }
    }
    return isect;
}



function intersectXZCylinder(id, r, center,
			     rayOrigin, rayDir, isect){
    rayOrigin = diff(rayOrigin, center);
    var a = rayDir[0] * rayDir[0] + rayDir[2] * rayDir[2];
    var b = 2. * ( rayOrigin[0] * rayDir[0] + rayOrigin[2] * rayDir[2]);
    var c = rayOrigin[0] * rayOrigin[0] + rayOrigin[2] * rayOrigin[2] - r * r;
    var d = b * b - 4. * a * c;
    if(d >= 0.){
	var s = Math.sqrt(d);
	var t = (-b - s) / (2. * a);
        if(t <= RAYTRACE_EPSILON) t = (-b + s) / (2. * a);
        if(RAYTRACE_EPSILON < t && t < isect[0]){
	    var p = sum(rayOrigin, scale(rayDir, t));
	    return [t, id, p];
        }
    }
    return isect;
}

function calcCoordOnAxis(eye, target, up, fov,
			 width, height,
			 axis, axisVec, spherePos, lengthOnAxis){
    var pos = calcPointOnScreen(spherePos, eye, target, up, fov,
				width, height);
    var ray = calcRay(eye, target, up, fov, width, height,
		      [pos[0] + axisVec[0] * lengthOnAxis,
		       pos[1] + axisVec[1] * lengthOnAxis]);

    var r = 10;
    var isect;
    if(axis == 0){
	isect = intersectYZCylinder(0, r, spherePos,
				    eye, ray,
				    [99999, 99999, 99999, 99999])
    }else if(axis == 1){
	isect = intersectXZCylinder(0, r, spherePos,
				    eye, ray,
				    [99999, 99999, 99999, 99999])
    }else if(axis == 2){
	isect = intersectXYCylinder(0, r, spherePos,
				    eye, ray,
				    [99999, 99999, 99999, 99999])
    }
    return sum(eye, scale(ray, isect[0] + r));
}

function calcAxisOnScreen(spherePos, eye, target, up, fov,
			  width, height){
    var imagePlane = (height * 0.5) / Math.tan(radians(fov) * 0.5);
    var v = normalize3(diff(target, eye));
    var focalXAxis = normalize3(cross(v, up));
    var focalYAxis = normalize3(cross(v, focalXAxis));
    var center = scale(v, imagePlane);
    var origin = diff(diff(center, scale(focalXAxis, width * 0.5)),
    		      scale(focalYAxis, height * 0.5));

    var ray = normalize3(diff(spherePos, eye));
    var [t, id, planeP, n] = intersectPlane(0, sum(eye, center), v, eye, ray,
					    [99999, 99999, 99999, 99999]);
    var pv = diff(planeP, sum(eye, origin));
    var sp = [dot(pv, focalXAxis),
     	      dot(pv, focalYAxis)];

    ray = normalize3(diff(sum(spherePos, [50, 0, 0]), eye));
    [t, id, planeP, n] = intersectPlane(0, sum(eye, center), v, eye, ray,
					[99999, 99999, 99999, 99999]);
    pv = diff(planeP, sum(eye, origin));
    var px = [dot(pv, focalXAxis),
     	      dot(pv, focalYAxis)];

    ray = normalize3(diff(sum(spherePos, [0, 50, 0]), eye));
    [t, id, planeP, n] = intersectPlane(0, sum(eye, center), v, eye, ray,
					[99999, 99999, 99999, 99999]);
    pv = diff(planeP, sum(eye, origin));
    var py = [dot(pv, focalXAxis),
     	      dot(pv, focalYAxis)];

    ray = normalize3(diff(sum(spherePos, [0, 0, 50]), eye));
    [t, id, planeP, n] = intersectPlane(0, sum(eye, center), v, eye, ray,
					[99999, 99999, 99999, 99999]);
    pv = diff(planeP, sum(eye, origin));
    var pz = [dot(pv, focalXAxis),
     	      dot(pv, focalYAxis)];

    return[normalize2([px[0] - sp[0],
		       px[1] - sp[1]]),
	   normalize2([py[0] - sp[0],
		       py[1] - sp[1]]),
	   normalize2([pz[0] - sp[0],
		       pz[1] - sp[1]])]
}

function calcPointOnScreen(point, eye, target, up, fov,
			   width, height){
    var ray = normalize3(diff(point, eye));
    var imagePlane = (height * 0.5) / Math.tan(radians(fov) * 0.5);
    var v = normalize3(diff(target, eye));
    var focalXAxis = normalize3(cross(v, up));
    var focalYAxis = normalize3(cross(v, focalXAxis));
    var center = scale(v, imagePlane);
    var origin = diff(diff(center, scale(focalXAxis, width * 0.5)),
    		      scale(focalYAxis, height * 0.5));
    var [t, id, planeP, n] = intersectPlane(0, sum(eye, center), v, eye, ray,
					    [99999, 99999, 99999, 99999]);
    
    var pv = diff(planeP, sum(eye, origin));
    return [dot(pv, focalXAxis),
     	    dot(pv, focalYAxis)];
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
	    return [t, id].concat(normalize3(diff(p, center)));
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
