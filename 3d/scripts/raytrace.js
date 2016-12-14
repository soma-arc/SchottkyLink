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

function getIdentityMat3(){
    return [1, 0, 0,
	        0, 1, 0,
	        0, 0, 1];
}

function getRotationXAxis(thetaRad){
    var cosTheta = Math.cos(thetaRad);
    var sinTheta = Math.sin(thetaRad);
    return [1, 0, 0,
	        0, cosTheta, -sinTheta,
	        0, sinTheta, cosTheta];
}

function getRotationYAxis(thetaRad){
    var cosTheta = Math.cos(thetaRad);
    var sinTheta = Math.sin(thetaRad);
    return [cosTheta, 0, sinTheta,
	        0, 1, 0,
	        -sinTheta, 0, cosTheta];
}

function getRotationZAxis(thetaRad){
    var cosTheta = Math.cos(thetaRad);
    var sinTheta = Math.sin(thetaRad);
    return [cosTheta, -sinTheta, 0,
	        sinTheta, cosTheta, 0,
	        0, 0, 1];
}

function prodMat3(a, b){
    return [a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
	        a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
	        a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
	        a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
	        a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
	        a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
	        a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
	        a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
	        a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
	       ];
}

function applyMat3(m, p){
    return [p[0] * m[0] + p[1] * m[1] + p[2] * m[2],
	        p[0] * m[3] + p[1] * m[4] + p[2] * m[5],
	        p[0] * m[6] + p[1] * m[7] + p[2] * m[8]];
}

function calcRay(camera, width, height, coord){
    var imagePlane = (height * 0.5) / Math.tan(radians(camera.fovDegree) * 0.5);
    var v = normalize3(diff(camera.target, camera.position));
    var focalXAxis = normalize3(cross(v, camera.up));
    var focalYAxis = normalize3(cross(v, focalXAxis));
    var center = scale(v, imagePlane);
    var origin = diff(diff(center, scale(focalXAxis, width * 0.5)),
		              scale(focalYAxis, height * 0.5));
    return normalize3(sum(sum(origin, scale(focalXAxis, coord[0])),
			              scale(focalYAxis, coord[1])))
}

function getFocalXYAxisVector(camera, width, height){
    var imagePlane = (height * 0.5) / Math.tan(radians(camera.fovDegree) * 0.5);
    var v = normalize3(diff(camera.target, camera.position));
    var focalXAxis = normalize3(cross(v, camera.up));
    var focalYAxis = normalize3(cross(v, focalXAxis));
    return [focalXAxis, focalYAxis]
}

function intersectPlane(groupId, id, p, n, rayOrigin, rayDir, isect){
    var d = -dot(p, n);
    var v = dot(n, rayDir);
    var t = -(dot(n, rayOrigin) + d) / v;
    if(RAYTRACE_EPSILON < t && t < isect[0]){
	    var i = sum(rayOrigin, scale(rayDir, t));
    	return [t, id, i, n];
    }
    return isect;
}

function intersectXYCylinder(groupId, id, r, center,
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

function intersectYZCylinder(grouoId, id, r, center,
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



function intersectXZCylinder(groupId, id, r, center,
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

function calcCoordOnAxis(camera, width, height,
			             axis, axisVec, spherePos, lengthOnAxis){
    var pos = calcPointOnScreen(spherePos, camera,
				                width, height);
    var ray = calcRay(camera, width, height,
		              [pos[0] + axisVec[0] * lengthOnAxis,
		               pos[1] + axisVec[1] * lengthOnAxis]);
    var r = 10;
    var isect;
    if(axis == 0){
	    isect = intersectYZCylinder(0, 0, r, spherePos,
				                    camera.position, ray,
				                    [99999, 99999, 99999, 99999])
    }else if(axis == 1){
	    isect = intersectXZCylinder(0, 0, r, spherePos,
				                    camera.position, ray,
				                    [99999, 99999, 99999, 99999])
    }else if(axis == 2){
	    isect = intersectXYCylinder(0, 0, r, spherePos,
				                    camera.position, ray,
				                    [99999, 99999, 99999, 99999])
    }
    return sum(camera.position, scale(ray, isect[0] + r));
}

// Calculate vector of axis on screen space
function calcAxisOnScreen(spherePos, camera,
			              width, height){
    var imagePlane = (height * 0.5) / Math.tan(radians(camera.fovDegree) * 0.5);
    var v = normalize3(diff(camera.target, camera.position));
    var focalXAxis = normalize3(cross(v, camera.up));
    var focalYAxis = normalize3(cross(v, focalXAxis));
    var center = scale(v, imagePlane);
    var origin = diff(diff(center, scale(focalXAxis, width * 0.5)),
    		          scale(focalYAxis, height * 0.5));

    var planeCenter = sum(camera.position, center);
    var planeOrigin = sum(camera.position, origin);
    var ray = normalize3(diff(spherePos, camera.position));
    var [t, id, planeP, n] = intersectPlane(0, 0, planeCenter,
					                        v, camera.position, ray,
					                        [99999, 99999, 99999, 99999]);
    var pv = diff(planeP, planeOrigin);
    var sp = [dot(pv, focalXAxis),
     	      dot(pv, focalYAxis)];

    ray = normalize3(diff(sum(spherePos, [50, 0, 0]), camera.position));
    [t, id, planeP, n] = intersectPlane(0, 0, planeCenter, v,
					                    camera.position, ray,
					                    [99999, 99999, 99999, 99999]);
    pv = diff(planeP, planeOrigin);
    var px = [dot(pv, focalXAxis),
     	      dot(pv, focalYAxis)];

    ray = normalize3(diff(sum(spherePos, [0, 50, 0]), camera.position));
    [t, id, planeP, n] = intersectPlane(0, 0, planeCenter, v,
					                    camera.position, ray,
					                    [99999, 99999, 99999, 99999]);
    pv = diff(planeP, planeOrigin);
    var py = [dot(pv, focalXAxis),
     	      dot(pv, focalYAxis)];

    ray = normalize3(diff(sum(spherePos, [0, 0, 50]), camera.position));
    [t, id, planeP, n] = intersectPlane(0, 0, planeCenter,
					                    v, camera.position, ray,
					                    [99999, 99999, 99999, 99999]);
    pv = diff(planeP, planeOrigin);
    var pz = [dot(pv, focalXAxis),
     	      dot(pv, focalYAxis)];

    return[normalize2([px[0] - sp[0],
		               px[1] - sp[1]]),
	       normalize2([py[0] - sp[0],
		               py[1] - sp[1]]),
	       normalize2([pz[0] - sp[0],
		               pz[1] - sp[1]])]
}

function calcPointOnScreen(point, camera,
			               width, height){
    var ray = normalize3(diff(point, camera.position));
    var imagePlane = (height * 0.5) / Math.tan(radians(camera.fovDegree) * 0.5);
    var v = normalize3(diff(camera.target, camera.position));
    var focalXAxis = normalize3(cross(v, camera.up));
    var focalYAxis = normalize3(cross(v, focalXAxis));
    var center = scale(v, imagePlane);
    var origin = diff(diff(center, scale(focalXAxis, width * 0.5)),
    		          scale(focalYAxis, height * 0.5));
    var [t, id, planeP, n] = intersectPlane(0, 0, sum(camera.position, center),
					                        v, camera.position, ray,
					                        [99999, 99999, 99999, 99999]);
    
    var pv = diff(planeP, sum(camera.position, origin));
    return [dot(pv, focalXAxis),
     	    dot(pv, focalYAxis)];
}

function intersectSphere(objectId, objectIndex, componentId, center, radius,
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
            //	    var p = sum(rayOrigin, scale(rayDir, t));
	        return [t, objectId, objectIndex, componentId];
	    }
    }
    return isect;
}

function calcLineSphereIntersection(lineP, lineDir, sphere){
    let v = diff(lineP, sphere.getPosition());
    let b = dot(lineDir, v);
    let c = dot(v, v) - sphere.r * sphere.r;
    let d = b * b - c;
    if(d >= 0){
        let s = Math.sqrt(d);
        let tMinus = -b - s;
        let tPlus = -b + s;
        return [sum(lineP, scale(lineDir, tPlus)),
                sum(lineP, scale(lineDir, tMinus))];
    }
    return [];
}

function intersectOverlappingSphere(objectId, objectIndex,
                                    innerComponentId, outerComponentId,
                                    innerSphere, outerSphere,
                                    rayOrigin, rayDir, isect){
    var v = diff(rayOrigin, outerSphere.getPosition());
    var b = dot(rayDir, v);
    var c = dot(v, v) - outerSphere.r * outerSphere.r;
    var d = b * b - c;
    if(d >= 0){
	    var s = Math.sqrt(d);
	    var ot = - b - s;
	    if(ot <= RAYTRACE_EPSILON) ot = -b + s;
	    if(RAYTRACE_EPSILON < ot && ot < isect[0]){
	        v = diff(rayOrigin, innerSphere.getPosition());
            b = dot(rayDir, v);
            c = dot(v, v) - innerSphere.r * innerSphere.r;
            d = b * b - c;
            if(d >= 0){
                s = Math.sqrt(d);
	            var it = - b - s;
	            if(it <= RAYTRACE_EPSILON) it = -b + s;
	            if(RAYTRACE_EPSILON < it && it < isect[0]){
	                return [it, objectId, objectIndex, innerComponentId];
                }
            }
            return [ot, objectId, objectIndex, outerComponentId];
	    }
    }
    return isect;
}

// Represent a sphere which have infinite radius
// default plane is aligned the z-axis
// Rotation center is plane's center
function intersectInfiniteSphere (objectId, objectIndex, componentId,
			                      center, size,
			                      rotationMat3,
			                      rayOrigin, rayDir, isect){
    var n = applyMat3(rotationMat3, [0, 0, 1]);
    var xAxis = applyMat3(rotationMat3, [1, 0, 0]);
    var yAxis = applyMat3(rotationMat3, [0, 1, 0]);
    var d = -dot(center, n);
    var v = dot(n, rayDir);
    var t = -(dot(n, rayOrigin) + d) / v;
    if(RAYTRACE_EPSILON < t && t < isect[0]){
        var hSize = size * 0.5;
        var p = sum(rayOrigin, scale(rayDir, t));
        var x = dot(diff(p, center), xAxis);
        var y = dot(diff(p, center), yAxis);
        if(-hSize <= x && x <= hSize &&
           -hSize <= y && y <= hSize){
            return [t, objectId, objectIndex, componentId];
        }
    }
    return isect;
    
}

function intersectParallelPlanes(objectId, objectIndex,
                                 plane1Id, plane2Id,
                                 center, distPlane1, distPlane2, size,
                                 rotationMat3, twistMat3,
                                 rayOrigin, rayDir, isect){
    isect = intersectInfiniteSphere(objectId, objectIndex, plane1Id,
                                    applyMat3(rotationMat3, sum(center, [0, 0, distPlane1])),
                                    size, rotationMat3,
                                    rayOrigin, rayDir, isect);
    isect = intersectInfiniteSphere(objectId, objectIndex, plane2Id,
                                    applyMat3(rotationMat3, sum(center, [0, 0, distPlane2])),
                                    size, prodMat3(rotationMat3, twistMat3),
                                    rayOrigin, rayDir, isect);
    return isect;
}
