const ID_CIRCLE = 0;
const ID_INFINITE_CIRCLE = 1;
const ID_TRANSFORM_BY_CIRCLES = 2;
const ID_TWISTED_LOXODROMIC = 3;
const ID_TWISTED_LOXODROMIC_FROM_FIXED_POINTS = 4;
const ID_PARABOLIC = 5;
const ID_MOD_HYPERBOLIC = 6;
const ID_MOD_LOXODROMIC = 7;

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
    setUniformLocation: function(uniLocation, gl, program, index){
        uniLocation.push(gl.getUniformLocation(program, 'u_schottkyCircle'+ index));
        uniLocation.push(gl.getUniformLocation(program, 'u_schottkyCircleUIParam'+ index));
    },
    setUniformValues: function(uniLocation, gl, uniIndex){
        gl.uniform3fv(uniLocation[uniIndex++], this.getUniformArray());
        gl.uniform2fv(uniLocation[uniIndex++], this.getUIParamArray());
        return uniIndex;
    },
    move: function(scene, componentId, mouse, diff){
	    if(componentId == CIRCLE_CIRCUMFERENCE){
	        var dx = mouse[0] - this.x;
	        var dy = mouse[1] - this.y;
	        var dist = Math.sqrt((dx * dx) + (dy * dy));
	        this.r = dist + diff[0];
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
            var d = dist - (this.r - this.circumferenceThickness)
	        return [CIRCLE_CIRCUMFERENCE, [d, d]];
	    }else if(dist < Math.abs(this.r - this.circumferenceThickness)){
	        return [CIRCLE_BODY, [dx, dy]];
	    }
	    return [-1, [0, 0]];
    },
    applyTransformation: function(circle){
        return circleInvert(circle, this);
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
    setUniformLocation: function(uniLocation, gl, program, index){
        uniLocation.push(gl.getUniformLocation(program, 'u_infiniteCircle'+ index));
        uniLocation.push(gl.getUniformLocation(program, 'u_infiniteCircleUIParam'+ index));
        uniLocation.push(gl.getUniformLocation(program, 'u_infiniteCircleRotationMat2'+ index));
        uniLocation.push(gl.getUniformLocation(program, 'u_invInfiniteCircleRotationMat2'+ index));
    },
    setUniformValues: function(uniLocation, gl, uniIndex){
        gl.uniform3fv(uniLocation[uniIndex++], this.getUniformArray());
	    gl.uniform3fv(uniLocation[uniIndex++], this.getUIParamArray());
	    gl.uniformMatrix2fv(uniLocation[uniIndex++], false, this.rotationMat2);
	    gl.uniformMatrix2fv(uniLocation[uniIndex++], false, this.invRotationMat2);
        return uniIndex;
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
        // Rotation matrix doesn't work same as GLSL
        // We have to swap rotaion matrix and inversed matrix
	    var rot = applyMat2(this.rotationMat2, p);
	    if(rot[0] > 0){
	        return [INFINITE_CIRCLE_BODY, p];
	    }

	    p = vec2Sum(p, applyMat2(this.invRotationMat2, [this.rotationControlCircleRadius, 0]));
	    if(vec2Len(p) < this.controlPointRadius){
	        return [INFINITE_CIRCLE_ROTATION, p];
	    }

	    return [-1, [0, 0]];
    },
    applyTransformation: function(circle){
        var p = [circle.x, circle.y];
        p = vec2Diff(p, [this.x, this.y]);
        p = applyMat2(this.invRotationMat2, p);
        p[0] *= -1;
        p = applyMat2(this.rotationMat2, p);
        p = vec2Sum(p, [this.x, this.y]);
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
    setUniformLocation: function(uniLocation, gl, program, index){
        uniLocation.push(gl.getUniformLocation(program, 'u_transformByCircles'+ index));
    },
    setUniformValues: function(uniLocation, gl, uniIndex){
        gl.uniform3fv(uniLocation[uniIndex++], this.getUniformArray());
        return uniIndex;
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

const MOD_HYPERBOLIC_INNER_BODY = 0;
const MOD_HYPERBOLIC_INNER_CIRCUMFERENCE = 1;
const MOD_HYPERBOLIC_OUTER_BODY = 2;
const MOD_HYPERBOLIC_OUTER_CIRCUMFERENCE = 3;

var ModHyperbolic = function(innerCircle, outerCircle){
    this.inner = innerCircle;
    this.outer = outerCircle;
    this.update();
}

ModHyperbolic.createFromJson = function(obj){
    return new ModHyperbolic(Circle.createFromJson(obj['innerCircle']),
                             Circle.createFromJson(obj['outerCircle']));
}

ModHyperbolic.prototype = {
    update: function(){
        this.inverted = circleInvert(this.inner, this.outer);

        this.point = [this.outer.x + 250, this.outer.y + 100];

        this.pInnerInv = circleInvertOnPoint(this.point, this.inner);
        this.pOuterInv = circleInvertOnPoint(this.point, this.outer);
        this.c3 = makeCircleFromPoints(this.point, this.pInnerInv, this.pOuterInv);

        this.lineDir = vec2Diff(this.outer.getPosition(), this.inner.getPosition());

        let [p1, p2] = calcCircleLineIntersection(this.c3, this.lineDir, this.outer.getPosition());
        if(distance(p1, this.inverted.getPosition()) < this.inverted.r){
            this.innerFixedPoint = p1;
            this.outerFixedPoint = p2;
        }else{
            this.innerFixedPoint = p2;
            this.outerFixedPoint = p1;
        }

        this.circleOnFixedPoint = new Circle(this.outerFixedPoint[0], this.outerFixedPoint[1], 100);
        this.concentricInner = circleInvert(this.inner, this.circleOnFixedPoint);
        this.concentricInverted = circleInvert(this.inverted, this.circleOnFixedPoint);

        this.scalingFactor = this.concentricInverted.r / this.concentricInner.r;
    },
    getUniformArray: function(){
	    return this.inner.getUniformArray().concat(this.outer.getUniformArray(),
						                           this.inverted.getUniformArray(),
                                                   this.circleOnFixedPoint.getUniformArray(),
                                                   this.concentricInner.getUniformArray(),
                                                   this.concentricInverted.getUniformArray(),
                                                   [this.scalingFactor, 0, 0]);
    },
    clone: function(){
        return new ModHyperbolic(this.inner.clone(),
                                      this.outer.clone());
    },
    exportJson: function(){
        return {"innerCircle": this.inner.exportJson(),
                "outerCircle": this.outer.exportJson()};
    },
    setUniformLocation: function(uniLocation, gl, program, index){
        uniLocation.push(gl.getUniformLocation(program, 'u_modHyperbolic'+ index));
    },
    setUniformValues: function(uniLocation, gl, uniIndex){
        gl.uniform3fv(uniLocation[uniIndex++], this.getUniformArray());
        return uniIndex;
    },
    move: function(scene, componentId, mouse, diff){
        var prevOuterX = this.outer.x;
        var prevOuterY = this.outer.y;
        switch (componentId) {
        case MOD_HYPERBOLIC_OUTER_BODY:
            this.outer.x = mouse[0] - diff[0];
	        this.outer.y = mouse[1] - diff[1];
            this.inner.x += this.outer.x - prevOuterX;
            this.inner.y += this.outer.y - prevOuterY;
            break;
        case MOD_HYPERBOLIC_OUTER_CIRCUMFERENCE:
            var dx = mouse[0] - this.outer.x;
	        var dy = mouse[1] - this.outer.y;
	        var dist = Math.sqrt((dx * dx) + (dy * dy));
	        this.outer.r = dist;
            break;
        case MOD_HYPERBOLIC_INNER_BODY:
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
        case MOD_HYPERBOLIC_INNER_CIRCUMFERENCE:
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
            return [MOD_HYPERBOLIC_INNER_BODY, diff];
        }else if(componentId == CIRCLE_CIRCUMFERENCE){
            return [MOD_HYPERBOLIC_INNER_CIRCUMFERENCE, diff];
        }
        [componentId, diff] = this.outer.selectable(mouse, scene);
        if(componentId == CIRCLE_BODY){
            return [MOD_HYPERBOLIC_OUTER_BODY, diff];
        }else if(componentId == CIRCLE_CIRCUMFERENCE){
            return [MOD_HYPERBOLIC_OUTER_CIRCUMFERENCE, diff];
        }
	    return [-1, [0, 0]];
    },
}

const PARABOLIC_OUTER_BODY = 0;
const PARABOLIC_OUTER_CIRCUMFERENCE = 1;
const PARABOLIC_INNER_CENTER = 2;
const PARABOLIC_CONTACT_POINT = 3;
const ROTATION_PI_2 = getRotationMat2(Math.PI / 2);
var Parabolic = function(outerCircle, contactDegree, innerRadius){
    this.outer = outerCircle;
    this.contactDegree = contactDegree;
    this.innerRadius = innerRadius;

    this.controlPointRadius = 10;
    this.lineThickness = 10;

    this.update();
}

Parabolic.createFromJson = function(obj){
    return new Parabolic(Circle.createFromJson(obj["OuterCircle"]),
                         obj["ContactDegree"],
                         obj["InnerRadius"]);
}

Parabolic.prototype = {
    update: function(){
        let rad = radians(this.contactDegree);
        this.contactPoint = [this.outer.x + this.outer.r * Math.cos(rad),
                             this.outer.y + this.outer.r * Math.sin(rad)]
        this.inner = new Circle(this.contactPoint[0] - this.innerRadius * Math.cos(rad),
                                this.contactPoint[1] - this.innerRadius * Math.sin(rad),
                                this.innerRadius);
        this.inverted = circleInvert(this.inner, this.outer);

        this.circleOnContactPoint = new Circle(this.contactPoint[0],
                                               this.contactPoint[1],
                                               this.innerRadius);
        let innerP1 = [this.inner.x + this.inner.r * Math.cos(Math.PI / 5.5),
                       this.inner.y + this.inner.r * Math.sin(Math.PI / 5.5)];
        let innerP2 = [this.inner.x + this.inner.r * Math.cos(Math.PI * 3. / 6.5),
                       this.inner.y + this.inner.r * Math.sin(Math.PI * 3. / 6.5)];
        let invertedP1 = [this.inverted.x + this.inverted.r * Math.cos(Math.PI / 4.5),
                          this.inverted.y + this.inverted.r * Math.sin(Math.PI / 4.5)];
        let invertedP2 = [this.inverted.x + this.inverted.r * Math.cos(Math.PI * 3. / 7.5),
                          this.inverted.y + this.inverted.r * Math.sin(Math.PI * 3. / 7.5)];
        this.innerLinePoint = circleInvertOnPoint(innerP1, this.circleOnContactPoint);
        this.innerLineVec = vec2Normalize(vec2Diff(this.innerLinePoint,
                                                   circleInvertOnPoint(innerP2,
                                                                       this.circleOnContactPoint)));
        this.invertedLinePoint1 = circleInvertOnPoint(invertedP1,
                                                   this.circleOnContactPoint);
        let invertedLinePoint2 = circleInvertOnPoint(invertedP2,
                                                  this.circleOnContactPoint);
        this.invertedLineVec = vec2Normalize(vec2Diff(this.invertedLinePoint1, invertedLinePoint2));
        if(Math.abs(this.innerLineVec[0]) <  0.00001){
            this.translateDist = Math.abs(this.innerLinePoint[0] - this.invertedLinePoint1[0]);
            this.translatePoint = this.innerLinePoint;
            this.invertedLineIsect = vec2Sum(this.innerLinePoint, [this.translateDist, 0]);
        }else{
            let nVec = applyMat2(ROTATION_PI_2, this.innerLineVec);
            this.invertedLineIsect = calcLineIntersection(this.innerLinePoint[0], this.innerLinePoint[1],
                                                       this.innerLinePoint[0] + nVec[0],
                                                       this.innerLinePoint[1] + nVec[1],
                                                       this.invertedLinePoint1[0], this.invertedLinePoint1[1],
                                                       invertedLinePoint2[0], invertedLinePoint2[1]);
            let d = vec2Diff(this.innerLinePoint, this.invertedLineIsect);
            this.translateDist = vec2Len(d);
            this.translatePoint = this.innerLinePoint;
        }
        this.theta = Math.atan2(-this.innerLineVec[1], this.innerLineVec[0]) + Math.PI / 2.;
        this.rotationMat2 = getRotationMat2(this.theta);
        this.invRotationMat2 = getRotationMat2(-this.theta);
    },
    clone: function(){
        return new Parabolic(this.outer.clone(),
                             this.contactDegree,
                             this.innerRadius);
    },
    exportJson: function(){
        return {"OuterCircle": this.inner.exportJson(),
                "ContactDegree": this.contactDegree,
                "InnerRadius": this.innerRadius};
    },
    getUniformArray: function(){
        return this.inner.getUniformArray().concat(this.outer.getUniformArray(),
                                                   this.inverted.getUniformArray(),
                                                   this.circleOnContactPoint.getUniformArray(),
                                                   this.translatePoint, [this.translateDist],
                                                   this.contactPoint, [0],
                                                   this.innerLineVec, [0],
                                                   this.innerLinePoint, [0],
                                                   this.invertedLineVec, [0],
                                                   this.invertedLinePoint1, [0],
                                                   this.invertedLineIsect, [0]);
    },
    setUniformLocation: function(uniLocation, gl, program, index){
        uniLocation.push(gl.getUniformLocation(program, 'u_parabolic'+ index));
        uniLocation.push(gl.getUniformLocation(program, 'u_parabolicRotationMat'+ index));
    },
    setUniformValues: function(uniLocation, gl, uniIndex){
        gl.uniform3fv(uniLocation[uniIndex++], this.getUniformArray());
        gl.uniformMatrix2fv(uniLocation[uniIndex++], false,
                            this.rotationMat2.concat(this.invRotationMat2));
        return uniIndex;
    },
    removable: function(mouse, diff){
        return this.outer.removable(mouse, diff);
    },
    selectable: function(mouse, scene){
        let diff = vec2Diff(this.contactPoint, mouse);
        if(vec2Len(diff) < this.controlPointRadius){
            return [PARABOLIC_CONTACT_POINT, diff];
        }
        diff = vec2Diff(this.inner.getPosition(), mouse);
        if(vec2Len(diff) < this.controlPointRadius){
            return [PARABOLIC_INNER_CENTER, diff];
        }
        [componentId, diff] = this.outer.selectable(mouse, scene);
        if(componentId == CIRCLE_BODY){
            return [PARABOLIC_OUTER_BODY, diff];
        }else if(componentId == CIRCLE_CIRCUMFERENCE){
            return [PARABOLIC_OUTER_CIRCUMFERENCE, diff];
        }
        return [-1, [0, 0]];
    },
    move: function(scene, componentId, mouse, diff){
        let m = vec2Diff(mouse, this.outer.getPosition());
        switch(componentId){
        case PARABOLIC_CONTACT_POINT:
            this.contactDegree = degrees(Math.atan2(m[1], m[0]));
            break;
        case PARABOLIC_OUTER_BODY:
            this.outer.x = mouse[0] - diff[0];
	        this.outer.y = mouse[1] - diff[1];
            break;
        case PARABOLIC_OUTER_CIRCUMFERENCE:
            var dx = mouse[0] - this.outer.x;
	        var dy = mouse[1] - this.outer.y;
	        var dist = Math.sqrt((dx * dx) + (dy * dy));
	        this.outer.r = dist;
            break;
        }
        this.update();
    }
}

const MOD_LOXODROMIC_INNER_BODY = 0;
const MOD_LOXODROMIC_INNER_CIRCUMFERENCE = 1;
const MOD_LOXODROMIC_OUTER_BODY = 2;
const MOD_LOXODROMIC_OUTER_CIRCUMFERENCE = 3;
const MOD_LOXODROMIC_POINT = 4;

var ModLoxodromic = function(innerCircle, outerCircle, p){
    this.inner = innerCircle;
    this.outer = outerCircle;
    this.point = p;

    this.controlPointRadius = 10;
    this.lineThickness = 10;

    this.update();
}

ModLoxodromic.createFromJson = function(obj){
    return new ModLoxodromic(Circle.createFromJson(obj['innerCircle']),
                             Circle.createFromJson(obj['outerCircle']),
                             obj['point'].slice(0));
}

ModLoxodromic.prototype = {
    update: function(){
        this.inverted = circleInvert(this.inner, this.outer);
        this.pInnerInv = circleInvertOnPoint(this.point, this.inner);
        this.pOuterInv = circleInvertOnPoint(this.point, this.outer);
        this.c3 = makeCircleFromPoints(this.point, this.pInnerInv, this.pOuterInv);

        this.lineDir = vec2Diff(this.outer.getPosition(), this.inner.getPosition());
        let lineTheta = Math.atan2(-this.lineDir[1], this.lineDir[0]) + Math.PI / 2.;
        let lineRotationMat2 = getRotationMat2(lineTheta);
        let invLineRotationMat2 = getRotationMat2(-lineTheta);


        let [p1, p2] = calcCircleLineIntersection(this.c3, this.lineDir, this.outer.getPosition());
        if(distance(p1, this.inverted.getPosition()) < this.inverted.r){
            this.innerFixedPoint = p1;
            this.outerFixedPoint = p2;
        }else{
            this.innerFixedPoint = p2;
            this.outerFixedPoint = p1;
        }

        this.circleOnFixedPoint = new Circle(this.outerFixedPoint[0], this.outerFixedPoint[1], 100);
        this.concentricInner = circleInvert(this.inner, this.circleOnFixedPoint);
        this.concentricInverted = circleInvert(this.inverted, this.circleOnFixedPoint);

        this.scalingFactor = this.concentricInverted.r / this.concentricInner.r;

        this.invertedC3Line = vec2Diff(circleInvertOnPoint([this.c3.x,
                                                            this.c3.y + this.c3.r],
                                                           this.circleOnFixedPoint),
                                       circleInvertOnPoint([this.c3.x + this.c3.r,
                                                            this.c3.y],
                                                           this.circleOnFixedPoint));
        this.lineDir = vec2Normalize(this.lineDir);
        this.invertedC3Line = vec2Normalize(this.invertedC3Line);
        this.theta = -2. *( Math.acos(vec2Dot(this.lineDir, this.invertedC3Line)));
        let c3LineTheta = Math.atan2(-this.invertedC3Line[1], this.invertedC3Line[0]) + Math.PI / 2.;
        let c3LineRotationMat2 = getRotationMat2(c3LineTheta);
        let c3InvLineRotationMat2 = getRotationMat2(-c3LineTheta);
    },
    getUniformArray: function(){
	    return this.inner.getUniformArray().concat(this.outer.getUniformArray(),
						                           this.inverted.getUniformArray(),
                                                   this.circleOnFixedPoint.getUniformArray(),
                                                   this.concentricInner.getUniformArray(),
                                                   this.concentricInverted.getUniformArray(),
                                                   [this.scalingFactor, this.theta, 0],
                                                   this.c3.getUniformArray(),
                                                   this.point, [0],
                                                   this.invertedC3Line, [0]);
    },
    getUIParamArray: function(){
        return [this.controlPointRadius, this.lineThickness];
    },
    clone: function(){
        return new ModLoxodromic(this.inner.clone(),
                                     this.outer.clone(),
                                     this.point.slice(0));
    },
    exportJson: function(){
        return {"innerCircle": this.inner.exportJson(),
                "outerCircle": this.outer.exportJson(),
                "point": this.point};
    },
    setUniformLocation: function(uniLocation, gl, program, index){
        uniLocation.push(gl.getUniformLocation(program, 'u_modLoxodromic'+ index));
        uniLocation.push(gl.getUniformLocation(program, 'u_modLoxodromicUIParam'+ index));
    },
    setUniformValues: function(uniLocation, gl, uniIndex){
        gl.uniform3fv(uniLocation[uniIndex++], this.getUniformArray());
        gl.uniform2fv(uniLocation[uniIndex++], this.getUIParamArray());
        return uniIndex;
    },
    move: function(scene, componentId, mouse, diff){
        var prevOuterX = this.outer.x;
        var prevOuterY = this.outer.y;
        switch (componentId) {
        case MOD_LOXODROMIC_OUTER_BODY:
            this.outer.x = mouse[0] - diff[0];
	        this.outer.y = mouse[1] - diff[1];
            this.inner.x += this.outer.x - prevOuterX;
            this.inner.y += this.outer.y - prevOuterY;
            this.point[0] += this.outer.x - prevOuterX;
            this.point[1] += this.outer.y - prevOuterY;
            break;
        case MOD_LOXODROMIC_OUTER_CIRCUMFERENCE:
            var dx = mouse[0] - this.outer.x;
	        var dy = mouse[1] - this.outer.y;
	        var dist = Math.sqrt((dx * dx) + (dy * dy));
	        this.outer.r = dist;
            break;
        case MOD_LOXODROMIC_INNER_BODY:
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
        case MOD_LOXODROMIC_INNER_CIRCUMFERENCE:
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
        case MOD_LOXODROMIC_POINT:
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
            return [MOD_LOXODROMIC_POINT, diff];
        }
        var [componentId, diff] = this.inner.selectable(mouse, scene);
        if(componentId == CIRCLE_BODY){
            return [MOD_LOXODROMIC_INNER_BODY, diff];
        }else if(componentId == CIRCLE_CIRCUMFERENCE){
            return [MOD_LOXODROMIC_INNER_CIRCUMFERENCE, diff];
        }
        [componentId, diff] = this.outer.selectable(mouse, scene);
        if(componentId == CIRCLE_BODY){
            return [MOD_LOXODROMIC_OUTER_BODY, diff];
        }else if(componentId == CIRCLE_CIRCUMFERENCE){
            return [MOD_LOXODROMIC_OUTER_CIRCUMFERENCE, diff];
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
    setUniformLocation: function(uniLocation, gl, program, index){
        uniLocation.push(gl.getUniformLocation(program, 'u_twistedLoxodromic'+ index));
        uniLocation.push(gl.getUniformLocation(program, 'u_twistedLoxodromicRotationMat2'+ index));
        uniLocation.push(gl.getUniformLocation(program, 'u_invTwistedLoxodromicRotationMat2'+ index));
        uniLocation.push(gl.getUniformLocation(program, 'u_twistedLoxodromicUIParam'+ index));
    },
    setUniformValues: function(uniLocation, gl, uniIndex){
        gl.uniform3fv(uniLocation[uniIndex++], this.getUniformArray());
        gl.uniformMatrix2fv(uniLocation[uniIndex++], false,
			                this.rotationMat2);
        gl.uniformMatrix2fv(uniLocation[uniIndex++], false,
			                this.invRotationMat2);
        gl.uniform2fv(uniLocation[uniIndex++], this.getUIParamArray());
        return uniIndex;
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

const TWISTED_LOXODROMIC_FROM_FIXED_POINTS_FP1 = 0;
const TWISTED_LOXODROMIC_FROM_FIXED_POINTS_FP2 = 1;
const TWISTED_LOXODROMIC_FROM_FIXED_POINTS_POINT = 2;
const TWISTED_LOXODROMIC_FROM_FIXED_POINTS_Q1 = 3;
const TWISTED_LOXODROMIC_FROM_FIXED_POINTS_Q2 = 4;
const TWISTED_LOXODROMIC_FROM_FIXED_POINTS_OUTER_BODY = 5;

var TwistedLoxodromicFromFixedPoints = function(fp1, fp2, point, q1, q2){
    this.fp1 = fp1;
    this.fp2 = fp2;
    this.point = point;
    this.q1 = q1;
    this.q2 = q2;

    this.controlPointRadius = 10;
    this.lineThickness = 10;

    this.update();
}

TwistedLoxodromicFromFixedPoints.createFromJson = function(obj){
    return new TwistedLoxodromicFromFixedPoints(obj['fixedPoint1'].slice(0),
                                                obj['fixedPoint2'].slice(0),
                                                obj['point'].slice(0),
                                                obj['q1'].slice(0),
                                                obj['q2'].slice(0));
}

TwistedLoxodromicFromFixedPoints.prototype = {
    update: function(){
        this.lineDir = vec2Diff(this.fp1, this.fp2);
        this.theta = Math.atan2(-this.lineDir[1], this.lineDir[0]) + Math.PI / 2.;
        this.rotationMat2 = getRotationMat2(this.theta);
        this.invRotationMat2 = getRotationMat2(-this.theta);
        this.c3 = makeCircleFromPoints(this.point, this.fp1, this.fp2);


        this.q1C3Inv = circleInvertOnPoint(this.q1, this.c3);
        // Rotation matrix doesn't work same as GLSL
        // We have to swap rotaion matrix and inversed matrix
        this.q1LineInv = lineInvertOnPoint(this.q1, this.fp1, this.lineDir,
                                           this.rotationMat2, this.invRotationMat2);
        this.q2C3Inv = circleInvertOnPoint(this.q2, this.c3);
        this.q2LineInv = lineInvertOnPoint(this.q2, this.fp1, this.lineDir,
                                           this.rotationMat2, this.invRotationMat2);

        var c1 = makeCircleFromPoints(this.q1, this.q1C3Inv, this.q1LineInv);
        var c2 = makeCircleFromPoints(this.q2, this.q2C3Inv, this.q2LineInv);
        if(c1.r < c2.r){
            this.inner = c1;
            this.outer = c2;
        }else{
            this.inner = c2;
            this.outer = c1;
        }

        this.inverted = circleInvert(this.inner, this.outer);
    },
    getUniformArray: function(){
	    return this.inner.getUniformArray().concat(this.outer.getUniformArray(),
						                           this.inverted.getUniformArray(),
                                                   this.c3.getUniformArray(),
                                                   this.point, [0],
                                                   this.q1, [0],
                                                   this.q2, [0],
                                                   this.fp1, [0],
                                                   this.fp2, [0]);
    },
    getUIParamArray: function(){
        return [this.controlPointRadius, this.lineThickness];
    },
    clone: function(){
        return new TwistedLoxodromicFromFixedPoints(this.fp1.slice(0),
                                                    this.fp2.slice(0),
                                                    this.point.slice(0),
                                                    this.q1.slice(0),
                                                    this.q2.slice(0));
    },
    exportJson: function(){
        return {"fp1": this.fp1,
                "fp2": this.fp2,
                "point": this.point,
                "q1": this.q1,
                "q2": this.q2};
    },
    setUniformLocation: function(uniLocation, gl, program, index){
        uniLocation.push(gl.getUniformLocation(program, 'u_twistedLoxodromicFromFixedPoints'+ index));
        uniLocation.push(gl.getUniformLocation(program, 'u_twistedLoxodromicFromFixedPointsRotationMat2'+ index));
        uniLocation.push(gl.getUniformLocation(program, 'u_invTwistedLoxodromicFromFixedPointsRotationMat2'+ index));
        uniLocation.push(gl.getUniformLocation(program, 'u_twistedLoxodromicFromFixedPointsUIParam'+ index));
    },
    setUniformValues: function(uniLocation, gl, uniIndex){
        gl.uniform3fv(uniLocation[uniIndex++], this.getUniformArray());
        gl.uniformMatrix2fv(uniLocation[uniIndex++], false,
			                this.rotationMat2);
        gl.uniformMatrix2fv(uniLocation[uniIndex++], false,
			                this.invRotationMat2);
        gl.uniform2fv(uniLocation[uniIndex++], this.getUIParamArray());
        return uniIndex;
    },
    move: function(scene, componentId, mouse, diff){
        var prevOuterX = this.outer.x;
        var prevOuterY = this.outer.y;
        switch (componentId) {
        case TWISTED_LOXODROMIC_FROM_FIXED_POINTS_FP1:
            this.fp1 = vec2Diff(mouse, diff);
            break;
        case TWISTED_LOXODROMIC_FROM_FIXED_POINTS_FP2:
            this.fp2 = vec2Diff(mouse, diff);
            break;
        case TWISTED_LOXODROMIC_FROM_FIXED_POINTS_POINT:
            this.point = vec2Diff(mouse, diff);
            break;
        case TWISTED_LOXODROMIC_FROM_FIXED_POINTS_Q1:
            this.q1 = vec2Diff(mouse, diff);
            break;
        case TWISTED_LOXODROMIC_FROM_FIXED_POINTS_Q2:
            this.q2 = vec2Diff(mouse, diff);
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
        var diff = vec2Diff(this.fp1, mouse);
        if(vec2Len(diff) < this.controlPointRadius){
            return [TWISTED_LOXODROMIC_FROM_FIXED_POINTS_FP1, diff];
        }
        diff = vec2Diff(this.fp2, mouse);
        if(vec2Len(diff) < this.controlPointRadius){
            return [TWISTED_LOXODROMIC_FROM_FIXED_POINTS_FP2, diff];
        }
        diff = vec2Diff(this.point, mouse);
        if(vec2Len(diff) < this.controlPointRadius){
            return [TWISTED_LOXODROMIC_FROM_FIXED_POINTS_POINT, diff];
        }
        diff = vec2Diff(this.q1, mouse);
        if(vec2Len(diff) < this.controlPointRadius){
            return [TWISTED_LOXODROMIC_FROM_FIXED_POINTS_Q1, diff];
        }
        diff = vec2Diff(this.q2, mouse);
        if(vec2Len(diff) < this.controlPointRadius){
            return [TWISTED_LOXODROMIC_FROM_FIXED_POINTS_Q2, diff];
        }
        [componentId, diff] = this.outer.selectable(mouse, scene);
        if(componentId == CIRCLE_BODY){
            return [TWISTED_LOXODROMIC_FROM_FIXED_POINTS_OUTER_BODY, diff];
        }

	    return [-1, [0, 0]];
    },
}

const GENERATORS_NAME_ID_MAP = {
    "Circles": ID_CIRCLE,
    "InfiniteCircles": ID_INFINITE_CIRCLE,
    "TransformByCircles": ID_TRANSFORM_BY_CIRCLES,
    "TwistedLoxodromic": ID_TWISTED_LOXODROMIC,
    "TwistedLoxodromicFromFixedPoints": ID_TWISTED_LOXODROMIC_FROM_FIXED_POINTS,
    "Parabolic": ID_PARABOLIC,
    "ModHyperbolic": ID_MOD_HYPERBOLIC,
    "ModLoxodromic": ID_MOD_LOXODROMIC
}

const GENERATORS_ID_NAME_MAP = {};
GENERATORS_ID_NAME_MAP[ID_CIRCLE] = "Circles";
GENERATORS_ID_NAME_MAP[ID_INFINITE_CIRCLE] = "InfiniteCircles";
GENERATORS_ID_NAME_MAP[ID_TRANSFORM_BY_CIRCLES] = "TransformByCircles";
GENERATORS_ID_NAME_MAP[ID_TWISTED_LOXODROMIC] = "TwistedLoxodromic";
GENERATORS_ID_NAME_MAP[ID_TWISTED_LOXODROMIC_FROM_FIXED_POINTS] = "TwistedLoxodromicFromFixedPoints";
GENERATORS_ID_NAME_MAP[ID_PARABOLIC] = "Parabolic";
GENERATORS_ID_NAME_MAP[ID_MOD_HYPERBOLIC] = "ModHyperbolic";
GENERATORS_ID_NAME_MAP[ID_MOD_LOXODROMIC] = "ModLoxodromic";

const GENERATORS_NAME_CLASS_MAP = {
    "Circles": Circle,
    "InfiniteCircles": InfiniteCircle,
    "TransformByCircles": TransformByCircles,
    "TwistedLoxodromic": TwistedLoxodromic,
    "TwistedLoxodromicFromFixedPoints": TwistedLoxodromicFromFixedPoints,
    "Parabolic": Parabolic,
    "ModHyperbolic": ModHyperbolic,
    "ModLoxodromic": ModLoxodromic
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
    addInfiniteCircle: function(canvas, pos){
        this.objects[ID_INFINITE_CIRCLE].push(new InfiniteCircle(pos[0], pos[1], 0));
        updateShaders(this, canvas);
    },
    addTransformByCircles: function(canvas, pos){
        this.objects[ID_TRANSFORM_BY_CIRCLES].push(new TransformByCircles(new Circle(pos[0]-50, pos[1], 150),
                                                                          new Circle(pos[0], pos[1], 200)));
        updateShaders(this, canvas);
    },
    addLoxodromic: function(canvas, pos){
        this.objects[ID_TWISTED_LOXODROMIC].push(new TwistedLoxodromic(new Circle(pos[0]-50, pos[1], 150),
                                                                       new Circle(pos[0], pos[1], 200),
                                                                       [pos[0] + 200, pos[1] + 100]));
        updateShaders(this, canvas);
    },
    addLoxodromicFromFixedPoints: function(canvas, pos){
        this.objects[ID_TWISTED_LOXODROMIC_FROM_FIXED_POINTS].push(new TwistedLoxodromicFromFixedPoints([241,-41],
                                                                                                        [-200, 100],
                                                                                                        [0, 42],
                                                                                                        [157, 61],
                                                                                                        [133, -59]));
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
    },
    setUniformLocation: function(uniLocation, gl, program){
	    for(objectId in Object.keys(this.objects)){
	        objectId = parseInt(objectId);
	        var objArray = this.objects[objectId];
            if(objArray.length == 0) continue;
	        for(var i = 0 ; i < objArray.length ; i++){
		        objArray[i].setUniformLocation(uniLocation, gl, program, i);
	        }
	    }
	    return uniLocation;
    },
    setUniformValues: function(uniLocation, gl, uniIndex){
	    for(objectId in Object.keys(this.objects)){
	        objectId = parseInt(objectId);
	        var objArray = this.objects[objectId];
            if(objArray.length == 0) continue;
	        for(var i = 0 ; i < objArray.length ; i++){
		        uniIndex = objArray[i].setUniformValues(uniLocation, gl, uniIndex);
	        }
	    }
	    return uniIndex;
    },
    setRenderContext: function(context){
        for(objectName in GENERATORS_NAME_ID_MAP){
            context['num'+ objectName] = this.objects[GENERATORS_NAME_ID_MAP[objectName]].length;
        }
    },
    calcOrbits: function(){
        var gen = this.objects[ID_CIRCLE];
        var bfs = new BfsManager(gen);
        var orbits = bfs.run();
        return orbits;
    }
}
