const ID_SCHOTTKY_SPHERE = 0;
const ID_BASE_SPHERE = 1;
const ID_TRANSFORM_BY_PLANES = 2;
const ID_TRANSFORM_BY_SPHERES = 3;
const ID_COMPOUND_PARABOLIC  = 4;

const SPHERE_BODY = 0;
var Sphere = function(x, y, z, r){
    this.x = x;
    this.y = y;
    this.z = z;
    this.r = r;
}

Sphere.prototype = {
    set : function(axis, val){
	if(axis == 0){
	    this.x = val;
	}else if(axis == 1){
	    this.y = val;
	}else if(axis == 2){
	    this.z = val;
	}else if(axis == 3){
	    this.r = val;
	}
    },
    get : function(axis){
	if(axis == 0){
	    return this.x;
	}else if(axis == 1){
	    return this.y;
	}else if(axis == 2){
	    return this.z;
	}else if(axis == 3){
	    return this.r;
	}
    },
    getPosition: function(){
	return [this.x, this.y, this.z];
    },
    getUniformArray: function(){
	return [this.x, this.y, this.z, this.r];
    },
    clone: function(){
	return new Sphere(this.x, this.y, this.z, this.r);
    },
    // dx and dy are distance between preveous mouse position and current mouse position.
    // Move this sphere along the selected axis.
    move: function(dx, dy, axis, prevObject, schottkyCanvas){
	var v = schottkyCanvas.axisVecOnScreen[axis];
	var lengthOnAxis = v[0] * dx + v[1] * dy;
	var p = calcCoordOnAxis(schottkyCanvas.camera,
				schottkyCanvas.canvas.width,
				schottkyCanvas.canvas.height,
				axis, v, prevObject.getPosition(),
				lengthOnAxis);
	this.set(axis, p[axis]);
    },
    setRadius: function(mx, my, dx, dy, prevObject, schottkyCanvas){
	//We assume that prevObject is Sphere.
	var spherePosOnScreen = calcPointOnScreen(prevObject.getPosition(),
						  schottkyCanvas.camera,
						  schottkyCanvas.canvas.width,
						  schottkyCanvas.canvas.height);
	var diffSphereAndPrevMouse = [spherePosOnScreen[0] - schottkyCanvas.prevMousePos[0],
				      spherePosOnScreen[1] - schottkyCanvas.prevMousePos[1]];
	var r = Math.sqrt(diffSphereAndPrevMouse[0] * diffSphereAndPrevMouse[0] +
			  diffSphereAndPrevMouse[1] * diffSphereAndPrevMouse[1]);
	var diffSphereAndMouse = [spherePosOnScreen[0] - mx,
				  spherePosOnScreen[1] - my];
	var distToMouse = Math.sqrt(diffSphereAndMouse[0] * diffSphereAndMouse[0] +
				    diffSphereAndMouse[1] * diffSphereAndMouse[1]);
	var d = distToMouse - r;
	
	//TODO: calculate tangent sphere
	this.r = prevObject.r + d * 3;
    },
    getComponentFromId: function(id){
	return this;
    },
    castRay: function(objectId, index, eye, ray, isect){
        return intersectSphere(objectId, index, SPHERE_BODY,
                               this.getPosition(), this.r,
                               eye, ray, isect);
    },
    calcAxisOnScreen: function(componentId, camera, width, height){
        return calcAxisOnScreen(this.getPosition(), camera, width, height);
    }
}

const PARABOLIC_TRANSFORM_PLANE1 = 0;
const PARABOLOC_TRANSFORM_PLANE2 = 1;
// Initially planes are aligned along the z-axis
// Rotation is defined by theta and phi
// center is (0, 0, 0)
var ParabolicTransformation = function(){
    this.distToP1 = -300;
    this.distToP2 = 300;
    this.theta = 0; // Degree
    this.phi = 0; // Degree
    this.rotationMat3 = getIdentityMat3();
    this.invRotationMat3 = getIdentityMat3();
    this.size = 1200;
    this.twist = 0.; // Degree
    this.twistMat3 = getIdentityMat3();
    this.invTwistMat3 = getIdentityMat3();
    this.update();
}

ParabolicTransformation.prototype = {
    clone: function(){
	var obj = new ParabolicTransformation();
	obj.distToP1 = this.distToP1;
	obj.distToP2 = this.distToP2;
	obj.theta = this.theta;
	obj.phi = this.phi;
	obj.size = this.size;
	obj.twist = this.twist;
	obj.update();
	return obj;
    },
    getUniformArray: function(){
	return [this.distToP1, this.distToP2, this.size,
		radians(this.theta), radians(this.phi), this.twist];
    },
    getComponentFromId: function(id){
	return this;
    },
    update: function(){
	var rotateX = getRotationXAxis(radians(this.theta));
	var rotateY = getRotationYAxis(radians(this.phi));
	this.rotationMat3 = prodMat3(rotateX, rotateY);
	rotateX = getRotationXAxis(radians(-this.theta));
	rotateY = getRotationYAxis(radians(-this.phi));
	this.invRotationMat3 = prodMat3(rotateY, rotateX);
	this.twistMat3 = getRotationZAxis(radians(this.twist));
	this.invTwistMat3 = getRotationZAxis(radians(-this.twist));
    },
    castRay: function(objectId, index, eye, ray, isect){
        isect = intersectRect(objectId, index, PARABOLIC_TRANSFORM_PLANE1,
			      this.distToP1,
			      this.size,
			      this.invRotationMat3,
			      this.rotationMat3,
			      eye, ray, isect);
	isect = intersectRect(objectId, index, PARABOLOC_TRANSFORM_PLANE2,
			      this.distToP2,
			      this.size,
			      prodMat3(this.invTwistMat3,
				       this.invRotationMat3),
			      prodMat3(this.rotationMat3,
				       this.twistMat3),
			      eye, ray, isect);
        return isect;
    },
    calcAxisOnScreen: function(componentId, camera, width, height){
        return [];
    }
}

const COMPOUND_PARABOLIC_INNER_SPHERE = 0;
const COMPOUND_PARABOLIC_OUTER_SPHERE = 1;
// Currently, we aligne the transformation along the z-axis only.
var CompoundParabolic = function(){
    // innerSphere and outer sphere is kissing
    this.inner = new Sphere(0, 0, 1000, 500);// componentId = 0
    this.outer = new Sphere(0, 0, 900, 600);// componentId = 1
    this.inverted = sphereInvert(this.inner, this.outer); // componentId = 2
    this.theta = 45; //Degree
    this.rotationMat3 = getRotationZAxis(radians(this.theta));
    this.invRotationMat3 = getRotationZAxis(radians(-this.theta));
}

CompoundParabolic.prototype = {
    getUniformArray: function(){
	return this.inner.getUniformArray().concat(this.outer.getUniformArray(),
						   this.inverted.getUniformArray());
    },
    clone: function(){
	var obj = new CompoundParabolic();
	obj.inner = this.inner.clone();
	obj.outer = this.outer.clone();
	obj.inverted = this.inverted.clone();
	obj.update();
	return obj;
    },
    update: function(){
	this.inverted = sphereInvert(this.inner, this.outer);
	this.rotationMat3 = getRotationZAxis(radians(this.theta));
	this.invRotationMat3 = getRotationZAxis(radians(-this.theta));
    },
    move: function(dx, dy, axis, prevObject, schottkyCanvas){
	var d = prevObject.inner.get(axis)- prevObject.outer.get(axis);
	this.outer.move(dx, dy, axis, prevObject.outer, schottkyCanvas);
	// Keep spheres kissing
	this.inner.set(axis, this.outer.get(axis) + d);
	this.update();
    },
    setRadius: function(mx, my, dx, dy, prevObject, schottkyCanvas){
	this.outer.setRadius(mx, my, dx, dy, prevObject.outer, schottkyCanvas);
	// Keep spheres kissing
	this.inner.set(2, prevObject.inner.get(2) + this.outer.r - prevObject.outer.r);
	this.update();
    },
    getComponentFromId: function(id){
	if(id == 0){
	    return this.inner;
	}else if(id == 1){
	    return this.outer;
	}else if(id == 2){
	    return this.inverted;
	}
    },
    castRay: function(objectId, index, eye, ray, isect){
        isect = intersectSphere(objectId, COMPOUND_PARABOLIC_INNER_SPHERE,
				this.inner.getPosition(),
				this.inner.r,
				eye, ray, isect);
        isect = intersectSphere(objectId, index, COMPOUND_PARABOLIC_OUTER_SPHERE,
				this.outer.getPosition(),
				this.outer.r,
				eye, ray, isect);
        return isect;
    },
    calcAxisOnScreen: function(componentId, camera, width, height){
        return calcAxisOnScreen(this.getComponentFromId(componentId).getPosition(),
                                camera, width, height);
    }
}

const TRANSFORM_BY_SPHERES_INNER_SPHERE = 0;
const TRANSFORM_BY_SPHERES_OUTER_SPHERE = 1;
// Transformation defined by two spheres
var TransformBySpheres = function(){
    // innerSphere and outer sphere is kissing
    this.inner = new Sphere(0, 0, 1000, 500);// componentId = 0
    this.outer = new Sphere(0, 0, 900, 600);// componentId = 1
    this.inverted = sphereInvert(this.inner, this.outer); // componentId = 2
}

TransformBySpheres.prototype = {
    getUniformArray: function(){
	return this.inner.getUniformArray().concat(this.outer.getUniformArray(),
						   this.inverted.getUniformArray());
    },
    clone: function(){
	var obj = new TransformBySpheres();
	obj.inner = this.inner.clone();
	obj.outer = this.outer.clone();
	obj.inverted = this.inverted.clone();
	obj.update();
	return obj;
    },
    update: function(){
	this.inverted = sphereInvert(this.inner, this.outer);
    },
    move: function(dx, dy, axis, prevObject, schottkyCanvas){
	var d = prevObject.inner.get(axis)- prevObject.outer.get(axis);
	this.outer.move(dx, dy, axis, prevObject.outer, schottkyCanvas);
	// Keep spheres kissing
	this.inner.set(axis, this.outer.get(axis) + d);
	this.update();
    },
    setRadius: function(mx, my, dx, dy, prevObject, schottkyCanvas){
	this.outer.setRadius(mx, my, dx, dy, prevObject.outer, schottkyCanvas);
	// Keep spheres kissing
	this.inner.set(2, prevObject.inner.get(2) + this.outer.r - prevObject.outer.r);
	this.update();
    },
    getComponentFromId: function(id){
	if(id == 0){
	    return this.inner;
	}else if(id == 1){
	    return this.outer;
	}else if(id == 2){
	    return this.inverted;
	}
    },
    castRay: function(objectId, index, eye, ray, isect){
        isect = intersectSphere(objectId, index, TRANSFORM_BY_SPHERES_INNER_SPHERE,
				this.inner.getPosition(),
				this.inner.r,
				eye, ray, isect);
        isect = intersectSphere(objectId, index, TRANSFORM_BY_SPHERES_OUTER_SPHERE,
				this.outer.getPosition(),
				this.outer.r,
				eye, ray, isect);
        return isect;
    },
    calcAxisOnScreen: function(componentId, camera, width, height){
        return calcAxisOnScreen(this.getComponentFromId(componentId).getPosition(),
                                camera, width, height);
    }
}

var Camera = function(target, fovDegree, eyeDist, up){
    this.target = target;
    this.prevTarget = target;
    this.fovDegree = fovDegree;
    this.eyeDist = eyeDist;
    this.up = up;
    this.theta = 0;
    this.phi = 0;
    this.position;
    this.update();
}

// Camera is on the sphere which its center is target and radius is eyeDist.
// Position is defined by two angle, theta and phi.
Camera.prototype = {    
    update: function(){
	this.position = [this.eyeDist * Math.cos(this.phi) * Math.cos(this.theta),
			 this.eyeDist * Math.sin(this.phi),
			 -this.eyeDist * Math.cos(this.phi) * Math.sin(this.theta)];
	this.position = sum(this.target, this.position);
	if(Math.abs(this.phi) % (2 * Math.PI) > Math.PI / 2. &&
	   Math.abs(this.phi) % (2 * Math.PI) < 3 * Math.PI / 2.){
	    this.up = [0, -1, 0];
	}else{
	    this.up = [0, 1, 0];
	}
    }
}


var Scene = function(){
    this.schottkySpheres = [];
    this.baseSpheres = [new Sphere(0, 0, 0, 125)];
    this.transformByPlanes = [];
    this.transformBySpheres = [];
    this.compoundParabolic = [];
}


Scene.prototype = {
    loadParameter: function(param){
	this.schottkySpheres = this.clone(param["schottkySpheres"]);
	this.baseSpheres = this.clone(param["baseSpheres"]);
	this.transformByPlanes = this.clone(param["transformByPlanes"]);
	this.transformBySpheres = this.clone(param["transformBySpheres"]);
	this.compoundParabolic = this.clone(param["compoundParabolic"]);
    },
    clone: function(objects){
	var obj = [];
	for(var i = 0 ; i < objects.length ; i++){
	    obj.push(objects[i].clone());
	}
	return obj;
    },
    addSchottkySphere: function(schottkyCanvas, orbitCanvas){
	this.schottkySpheres.push(new Sphere(500, 500, 0, 300));
	updateShaders(schottkyCanvas, orbitCanvas);
    },
    addBaseSphere: function(schottkyCanvas, orbitCanvas){
	this.baseSpheres.push(new Sphere(500, 500, 0, 125));
	updateShaders(schottkyCanvas, orbitCanvas);
    },
    removeSchottkySphere: function(schottkyCanvas, orbitCanvas, sphereIndex){
	if(this.schottkySpheres.length == 0) return;
	this.schottkySpheres.splice(sphereIndex, 1);
	schottkyCanvas.selectedObjectId = -1;
	schottkyCanvas.selectedObjectIndex = -1;
	updateShaders(schottkyCanvas, orbitCanvas);
    },
    removeBaseSphere: function(schottkyCanvas, orbitCanvas, sphereIndex){
	if(this.baseSpheres.length == 1) return;
	this.baseSpheres.splice(sphereIndex, 1);
	schottkyCanvas.selectedObjectId = -1;
	schottkyCanvas.selectedObjectIndex = -1;
	updateShaders(schottkyCanvas, orbitCanvas);
    },
    getObjects: function(){
	var obj = {};
	obj[ID_SCHOTTKY_SPHERE] = this.schottkySpheres;
	obj[ID_BASE_SPHERE] = this.baseSpheres;
	obj[ID_TRANSFORM_BY_PLANES] = this.transformByPlanes;
	obj[ID_TRANSFORM_BY_SPHERES] = this.transformBySpheres;
	obj[ID_COMPOUND_PARABOLIC] = this.compoundParabolic;
	return obj;
    },
    getNumSchottkySpheres: function(){
	return this.schottkySpheres.length;
    },
    getNumBaseSpheres: function(){
	return this.baseSpheres.length;
    },
    getNumTransformByPlanes: function(){
	return this.transformByPlanes.length;
    },
    getNumTransformBySpheres: function(){
	return this.transformBySpheres.length;
    },
    getNumCompoundParabolic: function(){
	return this.compoundParabolic.length;
    },
    getSelectedObject: function(eye, ray){
        // [distance, objectId, index, componentId]
        var isect = [99999999, -1, -1, -1];
        var objs = this.getObjects();
        for(objectId in Object.keys(this.getObjects())){
	    objectId = parseInt(objectId);
	    var objArray = objs[objectId];
	    for(var i = 0 ; i < objArray.length ; i++){
		isect = objArray[i].castRay(objectId, i, eye, ray, isect);
	    }
	}
        // return [objectId, index, componentId]
        return isect.slice(1, 4);
    }
}
