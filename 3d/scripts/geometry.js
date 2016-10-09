const ID_SCHOTTKY_SPHERE = 0;
const ID_BASE_SPHERE = 1;
const ID_TRANSFORM_BY_PLANES = 2;
const ID_TRANSFORM_BY_SPHERES = 3;
const ID_COMPOUND_PARABOLIC  = 4;

const AXIS_X = 0;
const AXIS_Y = 1;
const AXIS_Z = 2;
const AXIS_RADIUS = 3;

const SPHERE_BODY = 0;
var Sphere = function(x, y, z, r){
    this.x = x;
    this.y = y;
    this.z = z;
    this.r = r;
}

Sphere.prototype = {
    set : function(axis, val){
	if(axis == AXIS_X){
	    this.x = val;
	}else if(axis == AXIS_Y){
	    this.y = val;
	}else if(axis == AXIS_Z){
	    this.z = val;
	}else if(axis == AXIS_RADIUS){
	    this.r = val;
	}
    },
    get : function(axis){
	if(axis == AXIS_X){
	    return this.x;
	}else if(axis == AXIS_Y){
	    return this.y;
	}else if(axis == AXIS_Z){
	    return this.z;
	}else if(axis == AXIS_RADIUS){
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
    move: function(scene, componentId, selectedAxis, mouse, prevMouse, prevObject,
                   axisVecOnScreen, camera, canvasWidth, canvasHeight){
        if(selectedAxis == AXIS_RADIUS){
            //set radius
            //We assume that prevObject is Sphere.
	    var spherePosOnScreen = calcPointOnScreen(prevObject.getPosition(),
						      camera, canvasWidth, canvasHeight);
	    var diffSphereAndPrevMouse = [spherePosOnScreen[0] - prevMouse[0],
				          spherePosOnScreen[1] - prevMouse[1]];
	    var r = Math.sqrt(diffSphereAndPrevMouse[0] * diffSphereAndPrevMouse[0] +
			      diffSphereAndPrevMouse[1] * diffSphereAndPrevMouse[1]);
	    var diffSphereAndMouse = [spherePosOnScreen[0] - mouse[0],
				      spherePosOnScreen[1] - mouse[1]];
	    var distToMouse = Math.sqrt(diffSphereAndMouse[0] * diffSphereAndMouse[0] +
				        diffSphereAndMouse[1] * diffSphereAndMouse[1]);
	    var d = distToMouse - r;

            var scaleFactor = 3;
	    //TODO: calculate tangent sphere
	    this.r = prevObject.r + d * scaleFactor;
        }else{
            // Move this sphere along the selected axis.
            var dx = mouse[0] - prevMouse[0];
            var dy = mouse[1] - prevMouse[1];
            var v = axisVecOnScreen[selectedAxis];
	    var lengthOnAxis = v[0] * dx + v[1] * dy;
	    var p = calcCoordOnAxis(camera, canvasWidth, canvasHeight,
				    selectedAxis, v, prevObject.getPosition(),
				    lengthOnAxis);
	    this.set(selectedAxis, p[selectedAxis]);
        }
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
    },
    move: function(scene, componentId, selectedAxis, mouse, prevMouse, prevObject,
                   axisVecOnScreen, camera, canvasWidth, canvasHeight){
    }
}

const COMPOUND_PARABOLIC_INNER_SPHERE = 0;
const COMPOUND_PARABOLIC_OUTER_SPHERE = 1;
const COMPOUND_PARABOLIC_INVERTED_SPHERE = 2;
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
    move: function(scene, componentId, selectedAxis, mouse, prevMouse, prevObject,
                   axisVecOnScreen, camera, canvasWidth, canvasHeight){
        switch(componentId){
        case COMPOUND_PARABOLIC_INNER_SPHERE:
            this.inner.move(scene, componentId, selectedAxis, mouse, prevMouse, prevObject.inner,
                            axisVecOnScreen, camera, canvasWidth, canvasHeight);
            break;
        case COMPOUND_PARABOLIC_OUTER_SPHERE:
            this.outer.move(scene, componentId, selectedAxis, mouse, prevMouse, prevObject.outer,
                            axisVecOnScreen, camera, canvasWidth, canvasHeight);
            if(selectedAxis == AXIS_RADIUS){
                // Keep spheres kissing along the z-axis
                this.inner.set(AXIS_Z, prevObject.inner.get(AXIS_Z) + this.outer.r - prevObject.outer.r);
            }else{
                var d = prevObject.inner.get(selectedAxis) - prevObject.outer.get(selectedAxis);
                this.inner.set(selectedAxis, this.outer.get(selectedAxis) + d);
            }
            break;
        }
        this.update();
    },
    getComponentFromId: function(id){
	if(id == COMPOUND_PARABOLIC_INNER_SPHERE){
	    return this.inner;
	}else if(id == COMPOUND_PARABOLIC_OUTER_SPHERE){
	    return this.outer;
	}else if(id == COMPOUND_PARABOLIC_INVERTED_SPHERE){
	    return this.inverted;
	}
    },
    castRay: function(objectId, index, eye, ray, isect){
        isect = intersectSphere(objectId, index, COMPOUND_PARABOLIC_OUTER_SPHERE,
				this.outer.getPosition(),
				this.outer.r,
				eye, ray, isect);
        return isect;
    },
    calcAxisOnScreen: function(componentId, camera, width, height){
        return calcAxisOnScreen(this.getComponentFromId(componentId).getPosition(),
                                camera, width, height);
    },
}

const TRANSFORM_BY_SPHERES_INNER_SPHERE = 0;
const TRANSFORM_BY_SPHERES_OUTER_SPHERE = 1;
const TRANSFORM_BY_SPHERES_INVERTED_SPHERE = 2;

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
    move: function(scene, componentId, selectedAxis, mouse, prevMouse, prevObject,
                   axisVecOnScreen, camera, canvasWidth, canvasHeight){
        switch(componentId){
        case TRANSFORM_BY_SPHERES_INNER_SPHERE:
            this.inner.move(scene, componentId, selectedAxis, mouse, prevMouse, prevObject.inner,
                            axisVecOnScreen, camera, canvasWidth, canvasHeight);
            break;
        case TRANSFORM_BY_SPHERES_OUTER_SPHERE:
            this.outer.move(scene, componentId, selectedAxis, mouse, prevMouse, prevObject.outer,
                            axisVecOnScreen, camera, canvasWidth, canvasHeight);
            // Keep spheres kissing along the z-axis
            if(selectedAxis == AXIS_RADIUS){
                this.inner.set(AXIS_Z, prevObject.inner.get(AXIS_Z) + this.outer.r - prevObject.outer.r);
            }else{
                var d = prevObject.inner.get(selectedAxis) - prevObject.outer.get(selectedAxis);
                this.inner.set(selectedAxis, this.outer.get(selectedAxis) + d);
            }
            break;
        }
        this.update();
    },
    getComponentFromId: function(id){
	if(id == TRANSFORM_BY_SPHERES_INNER_SPHERE){
	    return this.inner;
	}else if(id == TRANSFORM_BY_SPHERES_OUTER_SPHERE){
	    return this.outer;
	}else if(id == TRANSFORM_BY_SPHERES_INVERTED_SPHERE){
	    return this.inverted;
	}
    },
    castRay: function(objectId, index, eye, ray, isect){
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

const GENERATORS_NAME_ID_MAP = {
    "schottkySpheres": ID_SCHOTTKY_SPHERE,
    "baseSpheres": ID_BASE_SPHERE,
    "transformByPlanes": ID_TRANSFORM_BY_PLANES,
    "transformBySpheres": ID_TRANSFORM_BY_SPHERES,
    "compoundParabolic": ID_COMPOUND_PARABOLIC
}

var Scene = function(){
    this.objects = {};
    for(objectName in GENERATORS_NAME_ID_MAP){
        this.objects[GENERATORS_NAME_ID_MAP[objectName]] = [];
    }
}


Scene.prototype = {
    loadParameter: function(param){
        this.objects = {};
        for(objectName in GENERATORS_NAME_ID_MAP){
            this.objects[GENERATORS_NAME_ID_MAP[objectName]] =
                (param[objectName] == undefined) ? [] : this.clone(param[objectName]);

        }
    },
    clone: function(objects){
	var obj = [];
	for(var i = 0 ; i < objects.length ; i++){
	    obj.push(objects[i].clone());
	}
	return obj;
    },
    addSchottkySphere: function(schottkyCanvas, orbitCanvas){
	this.objects[ID_SCHOTTKY_SPHERE].push(new Sphere(500, 500, 0, 300));
	updateShaders(this, schottkyCanvas, orbitCanvas);
    },
    addBaseSphere: function(schottkyCanvas, orbitCanvas){
	this.objects[ID_BASE_SPHERE].push(new Sphere(500, 500, 0, 125));
	updateShaders(this, schottkyCanvas, orbitCanvas);
    },
    getSelectedObject: function(eye, ray){
        // [distance, objectId, index, componentId]
        var isect = [99999999, -1, -1, -1];
        for(objectId in Object.keys(this.objects)){
	    objectId = parseInt(objectId);
	    var objArray = this.objects[objectId];
	    for(var i = 0 ; i < objArray.length ; i++){
		isect = objArray[i].castRay(objectId, i, eye, ray, isect);
	    }
	}
        // return [objectId, index, componentId]
        return isect.slice(1, 4);
    },
    // axis 0:x 1:y 2:z 3:radius
    move: function(objId, index, componentId, selectedAxis, mouse, prevMouse, prevObject,
                   axisVecOnScreen, camera, canvasWidth, canvasHeight){
        if(objId == -1) return;
	var obj = this.objects[objId][index];
	if(obj != undefined){
	    obj.move(this, componentId, selectedAxis, mouse, prevMouse, prevObject,
                     axisVecOnScreen, camera, canvasWidth, canvasHeight);
        }
    },
    remove: function(objectId, objectIndex){
        if(objectId == -1) return;
        var objArray = this.objects[objectId];
        var obj = objArray[objectIndex];
        if(objArray != undefined &&
           objArray.length != 0 ){
            objArray.splice(objectIndex, 1);
        }
        
    }
}
