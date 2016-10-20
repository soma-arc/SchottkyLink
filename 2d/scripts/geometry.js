const ID_CIRCLE = 0;
const ID_INFINITE_CIRCLE = 1;
const ID_TRANSFORM_BY_CIRCLES = 2;
const ID_TWISTED_LOXODROMIC = 3;

const CIRCLE_BODY = 0;
const CIRCLE_CIRCUMFERENCE = 1;
const CIRCLE_MOVE_MODE_NORMAL = 0;
const CIRCLE_MOVE_MODE_NEAREST = 1;
var Circle = function(x, y, r){
    this.x = x;
    this.y = y;
    this.r = r;

    this.circumferenceThickness = 10;
    this.centerRadius = 10;

    this.moveMode = CIRCLE_MOVE_MODE_NORMAL;
}

Circle.prototype = {
    getPosition: function(){
	return [this.x, this.y];
    },
    clone: function(){
	return new Circle(this.x, this.y, this.r);
    },
    getUniformArray: function(){
	return [this.x, this.y, this.r];
    },
    getUIParamArray: function(){
        return [this.centerRadius,
                this.circumferenceThickness];
    },
    exportJson: function(){
        return {"position": [this.x, this.y], "radius": this.r};
    },
    move: function(scene, componentId, mouse, diff){
	if(componentId == CIRCLE_CIRCUMFERENCE){
	    var dx = mouse[0] - this.x;
	    var dy = mouse[1] - this.y;
	    var dist = Math.sqrt((dx * dx) + (dy * dy));
	    this.r = dist;
	}else{
	    this.x = mouse[0] - diff[0];
	    this.y = mouse[1] - diff[1];
            if(this.moveMode == CIRCLE_MOVE_MODE_NEAREST)
                this.r = scene.getMinRadiusToOtherCircles(this);
	}
    },
    removable: function(mouse, diff){
	var dx = mouse[0] - this.x;
	var dy = mouse[1] - this.y;
	var dist = Math.sqrt((dx * dx) + (dy * dy));
	return (dist < this.r);
    },
    // return [componentId,
    //         difference between object position and mouse position]
    selectable: function(mouse, scene){
	var dx = mouse[0] - this.x;
	var dy = mouse[1] - this.y;
	var dist = Math.sqrt((dx * dx) + (dy * dy));
        var distFromCircumference = dist - this.r;
	if(distFromCircumference < 0 &&
           Math.abs(distFromCircumference) < this.circumferenceThickness){
	    return [CIRCLE_CIRCUMFERENCE, [dx, dy]];
	}else if(dist < Math.abs(this.r - this.circumferenceThickness)){
	    return [CIRCLE_BODY, [dx, dy]];
	}
	return [-1, [0, 0]];
    }
}

Circle.createFromJson = function(obj){
    var p = obj['position'];
    return new Circle(p[0], p[1], obj['radius']);
}

const INFINITE_CIRCLE_CONTROL_POINT = 0;
const INFINITE_CIRCLE_BODY = 1;
const INFINITE_CIRCLE_ROTATION = 2;
// Circle which have infinite radius.
// It is defined by translation and rotation.
// Initially it is reflection along the y-axis.
var InfiniteCircle = function(x, y, thetaDegree){
    this.x = x;
    this.y = y;
    this.thetaDegree = thetaDegree;
    this.rotationMat2 = getRotationMat2(radians(thetaDegree));
    this.invRotationMat2 = getRotationMat2(radians(-thetaDegree));

    this.controlPointRadius = 10;
    this.rotationControlCircleRadius = 50.;
    this.rotationControlCircleThickness = 2;
}

InfiniteCircle.createFromJson = function(obj){
    return new InfiniteCircle(obj['position'][0],
                              obj['position'][1],
                              obj['rotation']);
}

InfiniteCircle.prototype = {
    update: function(){
	this.rotationMat2 = getRotationMat2(radians(this.thetaDegree));
	this.invRotationMat2 = getRotationMat2(radians(-this.thetaDegree));
    },
    getPosition: function(){
	return [this.x, this.y];
    },
    exportJson: function(){
        return {"position": [this.x, this.y], "rotation": this.thetaDegree};
    },
    clone: function(){
	return new InfiniteCircle(this.x, this.y, this.thetaDegree);
    },
    getUniformArray: function(){
	return [this.x, this.y, this.thetaDegree];
    },
    getUIParamArray: function(){
	return [this.controlPointRadius,
		this.rotationControlCircleRadius,
		this.rotationControlCircleThickness];
    },
    move: function(scene, componentId, mouse, diff){
	if(componentId == INFINITE_CIRCLE_CONTROL_POINT ||
	   componentId == INFINITE_CIRCLE_BODY){
	    this.x = mouse[0] - diff[0];
	    this.y = mouse[1] - diff[1];
	}else if(componentId == INFINITE_CIRCLE_ROTATION){
	    var x = mouse[0] - this.x;
	    var y = mouse[1] - this.y;
	    this.thetaDegree = degrees(Math.atan2(-y, x) + Math.PI);
	    this.update();
	}
    },
    removable: function(mouse, diff){
	var dx = mouse[0] - this.x;
	var dy = mouse[1] - this.y;
	var dist = Math.sqrt((dx * dx) + (dy * dy));
	return (dist < this.controlPointRadius);
    },
    // return [componentId,
    //         difference between object position and mouse position]
    selectable: function(mouse, scene){
	var dx = mouse[0] - this.x;
	var dy = mouse[1] - this.y;
	var dist = Math.sqrt((dx * dx) + (dy * dy));
	if(dist < this.controlPointRadius){
	    return [INFINITE_CIRCLE_CONTROL_POINT, [dx, dy]];
	}
	var p = vec2Diff(mouse, this.getPosition());
	var rot = applyMat2(this.rotationMat2, p);
	if(rot[0] > 0){
	    return [INFINITE_CIRCLE_BODY, p];
	}

	p = vec2Sum(p, applyMat2(this.invRotationMat2, [this.rotationControlCircleRadius, 0]));
	if(vec2Len(p) < this.controlPointRadius){
	    return [INFINITE_CIRCLE_ROTATION, p];
	}
	
	return [-1, [0, 0]];
    }
}

const TRANSFORM_BY_CIRCLES_INNER_BODY = 0;
const TRANSFORM_BY_CIRCLES_INNER_CIRCUMFERENCE = 1;
const TRANSFORM_BY_CIRCLES_OUTER_BODY = 2;
const TRANSFORM_BY_CIRCLES_OUTER_CIRCUMFERENCE = 3;

var TransformByCircles = function(innerCircle, outerCircle){
    this.inner = innerCircle;
    this.outer = outerCircle;
    this.inverted = circleInvert(this.inner, this.outer);
}

TransformByCircles.createFromJson = function(obj){
    return new TransformByCircles(Circle.createFromJson(obj['innerCircle']),
                                  Circle.createFromJson(obj['outerCircle']));
}

TransformByCircles.prototype = {
    update: function(){
        this.inverted = circleInvert(this.inner, this.outer);
    },
    getUniformArray: function(){
	return this.inner.getUniformArray().concat(this.outer.getUniformArray(),
						   this.inverted.getUniformArray());
    },
    clone: function(){
        return new TransformByCircles(this.inner.clone(),
                                      this.outer.clone());
    },
    exportJson: function(){
        return {"innerCircle": this.inner.exportJson(),
                "outerCircle": this.outer.exportJson()};
    },
    move: function(scene, componentId, mouse, diff){
        var prevOuterX = this.outer.x; 
        var prevOuterY = this.outer.y;
        switch (componentId) {
        case TRANSFORM_BY_CIRCLES_OUTER_BODY:
            this.outer.x = mouse[0] - diff[0];
	    this.outer.y = mouse[1] - diff[1];
            this.inner.x += this.outer.x - prevOuterX;
            this.inner.y += this.outer.y - prevOuterY;
            break;
        case TRANSFORM_BY_CIRCLES_OUTER_CIRCUMFERENCE:
            var dx = mouse[0] - this.outer.x;
	    var dy = mouse[1] - this.outer.y;
	    var dist = Math.sqrt((dx * dx) + (dy * dy));
	    this.outer.r = dist;
            break;
        case TRANSFORM_BY_CIRCLES_INNER_BODY:
            var np = vec2Diff(mouse, diff);
            var d = vec2Len(vec2Diff(this.outer.getPosition(), np));
            if(d <= this.outer.r - this.inner.r){
                this.inner.x = np[0];
                this.inner.y = np[1];
            }else{
                diff[0] = mouse[0] - this.inner.x;
                diff[1] = mouse[1] - this.inner.y;
            }
            break;
        case TRANSFORM_BY_CIRCLES_INNER_CIRCUMFERENCE:
            var dx = mouse[0] - this.inner.x;
	    var dy = mouse[1] - this.inner.y;
	    var nr = Math.sqrt((dx * dx) + (dy * dy));
            var d = vec2Len(vec2Diff(this.outer.getPosition(), this.inner.getPosition()));
            if(d <= this.outer.r - nr){
                this.inner.r = nr;
            }else{
                diff[0] = mouse[0] - this.inner.x;
                diff[1] = mouse[1] - this.inner.y;
            }
            break;
        }
        this.update();
    },
    removable: function(mouse, diff){
        return this.outer.removable(mouse, diff);
    },
    // return [componentId,
    //         difference between object position and mouse position]
    selectable: function(mouse, scene){
        var [componentId, diff] = this.inner.selectable(mouse, scene);
        if(componentId == CIRCLE_BODY){
            return [TRANSFORM_BY_CIRCLES_INNER_BODY, diff];
        }else if(componentId == CIRCLE_CIRCUMFERENCE){
            return [TRANSFORM_BY_CIRCLES_INNER_CIRCUMFERENCE, diff];
        }
        [componentId, diff] = this.outer.selectable(mouse, scene);
        if(componentId == CIRCLE_BODY){
            return [TRANSFORM_BY_CIRCLES_OUTER_BODY, diff];
        }else if(componentId == CIRCLE_CIRCUMFERENCE){
            return [TRANSFORM_BY_CIRCLES_OUTER_CIRCUMFERENCE, diff];
        }
	return [-1, [0, 0]];
    },
}

const TWISTED_LOXODROMIC_INNER_BODY = 0;
const TWISTED_LOXODROMIC_INNER_CIRCUMFERENCE = 1;
const TWISTED_LOXODROMIC_OUTER_BODY = 2;
const TWISTED_LOXODROMIC_OUTER_CIRCUMFERENCE = 3;
const TWISTED_LOXODROMIC_POINT = 4;

var TwistedLoxodromic = function(innerCircle, outerCircle, p){
    this.inner = innerCircle;
    this.outer = outerCircle;
    this.point = p;

    this.controlPointRadius = 10;
    this.lineThickness = 10;

    this.update();
}

TwistedLoxodromic.createFromJson = function(obj){
    return new TwistedLoxodromic(Circle.createFromJson(obj['innerCircle']),
                                 Circle.createFromJson(obj['outerCircle']),
                                 obj['point'].slice(0));
}

TwistedLoxodromic.prototype = {
    update: function(){
        this.inverted = circleInvert(this.inner, this.outer);
        this.pInnerInv = circleInvertOnPoint(this.point, this.inner);
        this.pOuterInv = circleInvertOnPoint(this.point, this.outer);
        this.c3 = makeCircleFromPoints(this.point, this.pInnerInv, this.pOuterInv);
        
        this.lineDir = vec2Diff(this.outer.getPosition(), this.inner.getPosition());
        this.theta = Math.atan2(-this.lineDir[1], this.lineDir[0]) + Math.PI / 2.;
        this.rotationMat2 = getRotationMat2(this.theta);
        this.invRotationMat2 = getRotationMat2(-this.theta);
    },
    getUniformArray: function(){
	return this.inner.getUniformArray().concat(this.outer.getUniformArray(),
						   this.inverted.getUniformArray(),
                                                   this.c3.getUniformArray(),
                                                   this.point, [0]);
    },
    getUIParamArray: function(){
        return [this.controlPointRadius, this.lineThickness];
    },
    clone: function(){
        return new TwistedLoxodromic(this.inner.clone(),
                                     this.outer.clone(),
                                     this.point.slice(0));
    },
    exportJson: function(){
        return {"innerCircle": this.inner.exportJson(),
                "outerCircle": this.outer.exportJson(),
                "point": this.point};
    },
    move: function(scene, componentId, mouse, diff){
        var prevOuterX = this.outer.x; 
        var prevOuterY = this.outer.y;
        switch (componentId) {
        case TWISTED_LOXODROMIC_OUTER_BODY:
            this.outer.x = mouse[0] - diff[0];
	    this.outer.y = mouse[1] - diff[1];
            this.inner.x += this.outer.x - prevOuterX;
            this.inner.y += this.outer.y - prevOuterY;
            this.point[0] += this.outer.x - prevOuterX;
            this.point[1] += this.outer.y - prevOuterY;
            break;
        case TWISTED_LOXODROMIC_OUTER_CIRCUMFERENCE:
            var dx = mouse[0] - this.outer.x;
	    var dy = mouse[1] - this.outer.y;
	    var dist = Math.sqrt((dx * dx) + (dy * dy));
	    this.outer.r = dist;
            break;
        case TWISTED_LOXODROMIC_INNER_BODY:
            var np = vec2Diff(mouse, diff);
            var d = vec2Len(vec2Diff(this.outer.getPosition(), np));
            if(d <= this.outer.r - this.inner.r){
                this.inner.x = np[0];
                this.inner.y = np[1];
            }else{
                diff[0] = mouse[0] - this.inner.x;
                diff[1] = mouse[1] - this.inner.y;
            }
            break;
        case TWISTED_LOXODROMIC_INNER_CIRCUMFERENCE:
            var dx = mouse[0] - this.inner.x;
	    var dy = mouse[1] - this.inner.y;
	    var nr = Math.sqrt((dx * dx) + (dy * dy));
            var d = vec2Len(vec2Diff(this.outer.getPosition(), this.inner.getPosition()));
            if(d <= this.outer.r - nr){
                this.inner.r = nr;
            }else{
                diff[0] = mouse[0] - this.inner.x;
                diff[1] = mouse[1] - this.inner.y;
            }
            break;
        case TWISTED_LOXODROMIC_POINT:
            var np = vec2Diff(mouse, diff);
            var d = vec2Len(vec2Diff(this.outer.getPosition(), np));
            this.point[0] = np[0];
            this.point[1] = np[1];
            break;
        }
        this.update();
    },
    removable: function(mouse, diff){
        return this.outer.removable(mouse, diff);
    },
    // return [componentId,
    //         difference between object position and mouse position]
    selectable: function(mouse, scene){        
        var diff = vec2Diff(this.point, mouse);
        if(vec2Len(diff) < this.controlPointRadius){
            return [TWISTED_LOXODROMIC_POINT, diff];
        }
        var [componentId, diff] = this.inner.selectable(mouse, scene);
        if(componentId == CIRCLE_BODY){
            return [TWISTED_LOXODROMIC_INNER_BODY, diff];
        }else if(componentId == CIRCLE_CIRCUMFERENCE){
            return [TWISTED_LOXODROMIC_INNER_CIRCUMFERENCE, diff];
        }
        [componentId, diff] = this.outer.selectable(mouse, scene);
        if(componentId == CIRCLE_BODY){
            return [TWISTED_LOXODROMIC_OUTER_BODY, diff];
        }else if(componentId == CIRCLE_CIRCUMFERENCE){
            return [TWISTED_LOXODROMIC_OUTER_CIRCUMFERENCE, diff];
        }
	return [-1, [0, 0]];
    },
}

const GENERATORS_NAME_ID_MAP = {
    "Circles": ID_CIRCLE,
    "InfiniteCircles": ID_INFINITE_CIRCLE,
    "TransformByCircles": ID_TRANSFORM_BY_CIRCLES,
    "TwistedLoxodromic": ID_TWISTED_LOXODROMIC,
}

const GENERATORS_ID_NAME_MAP = {};
GENERATORS_ID_NAME_MAP[ID_CIRCLE] = "Circles";
GENERATORS_ID_NAME_MAP[ID_INFINITE_CIRCLE] = "InfiniteCircles";
GENERATORS_ID_NAME_MAP[ID_TRANSFORM_BY_CIRCLES] = "TransformByCircles";
GENERATORS_ID_NAME_MAP[ID_TWISTED_LOXODROMIC] = "TwistedLoxodromic";

const GENERATORS_NAME_CLASS_MAP = {
    "Circles": Circle,
    "InfiniteCircles": InfiniteCircle,
    "TransformByCircles": TransformByCircles,
    "TwistedLoxodromic": TwistedLoxodromic,
};

var Scene = function(){
    this.objects = {};
    for(objectName in GENERATORS_NAME_ID_MAP){
        this.objects[GENERATORS_NAME_ID_MAP[objectName]] = [];
    }
};

Scene.prototype = {
    loadParameter: function(param){
        this.objects = {};
        for(objectName in GENERATORS_NAME_ID_MAP){
            this.objects[GENERATORS_NAME_ID_MAP[objectName]] =
                (param[objectName] == undefined) ? [] : this.clone(param[objectName]);

        }
    },
    loadParameterFromJson: function(param){
        this.objects = {};
        var generators = param['generators'];
        for(generatorName in GENERATORS_NAME_ID_MAP){
            this.objects[GENERATORS_NAME_ID_MAP[generatorName]] = [];
            var objects = generators[generatorName];
            if(objects == undefined) continue;
            for(var i = 0 ; i < objects.length ; i++){
                var obj = GENERATORS_NAME_CLASS_MAP[generatorName].createFromJson(generators[generatorName][i]);
                this.objects[GENERATORS_NAME_ID_MAP[generatorName]].push(obj);
            }
        }
    },
    clone: function(objects){
	var obj = [];
	for(var i = 0 ; i < objects.length ; i++){
	    obj.push(objects[i].clone());
	}
	return obj;
    },
    exportJson: function(){
        var json = {};
        json["name"] = "scene";
        var generators = {};
        for(objectId in Object.keys(this.objects)){
	    objectId = parseInt(objectId);
            var objs = [];
	    var objArray = this.objects[objectId];
            if(objArray.length == 0) continue;
	    for(var i = 0 ; i < objArray.length ; i++){
		objs.push(objArray[i].exportJson());
	    }
            generators[GENERATORS_ID_NAME_MAP[objectId]] = objs;
	}
        json["generators"] = generators;
        return json;
    },
    saveSceneAsJson: function(){
        var blob = new Blob([JSON.stringify(this.exportJson(), null, "    ")],
                            {type: "text/plain"});
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = 'scene.json';
        a.click();
    },
    getMinRadiusToOtherCircles: function(c){
        var minRad = Number.MAX_VALUE;
        for(var i = 0 ; i < this.objects[ID_CIRCLE].length ; i++){
            var oc = this.objects[ID_CIRCLE][i];
            if(c == oc) continue;
            var nr = vec2Len(vec2Diff(c.getPosition(), oc.getPosition())) - oc.r;
            if(nr < minRad){
                minRad = nr;
            }
        }
        return minRad
    },
    addCircle: function(canvas, mouse){
	this.objects[ID_CIRCLE].push(new Circle(mouse[0], mouse[1], 100));
	updateShaders(this, canvas);
    },
    // return [objectId, objectIndex, objectComponentId,
    //         difference between object position and mouse position]
    getSelectedObject: function(mouse){
	for(objectId in Object.keys(this.objects)){
	    objectId = parseInt(objectId);
	    var objArray = this.objects[objectId];
	    for(var i = 0 ; i < objArray.length ; i++){
		var [componentId, diff] = objArray[i].selectable(mouse, this);
		if(componentId != -1)
		    return [objectId, i, componentId, diff];
	    }
	}
	return [-1, -1, -1, [0, 0]];
    },
    move: function(id, index, componentId, mouse, diff){
	if(id == -1) return;
	var obj = this.objects[id][index];
	if(obj != undefined)
	    obj.move(this, componentId, mouse, diff);
    },
    remove: function(id, index, mouse, diff){
	if(id == -1) return;
	var objArray = this.objects[id];
	var obj = objArray[index];
	if(objArray != undefined &&
	   objArray.length != 0 &&
	   obj.removable(mouse, diff)){
	    objArray.splice(index, 1);
	}
    }
}
