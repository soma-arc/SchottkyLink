var g_scene;

const CIRCLE_BODY = 0;
const CIRCLE_CIRCUMFERENCE = 1;
var Circle = function(x, y, r){
    this.x = x;
    this.y = y;
    this.r = r;

    this.circumferenceThickness = 10;
    this.centerRadius = 10;
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
    move: function(componentId, mouse, diff){
	if(componentId == CIRCLE_CIRCUMFERENCE){
	    var dx = mouse[0] - this.x;
	    var dy = mouse[1] - this.y;
	    var dist = Math.sqrt((dx * dx) + (dy * dy));
	    this.r = dist;
	}else{
	    this.x = mouse[0] - diff[0];
	    this.y = mouse[1] - diff[1];
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

InfiniteCircle.prototype = {
    update: function(){
	this.rotationMat2 = getRotationMat2(radians(this.thetaDegree));
	this.invRotationMat2 = getRotationMat2(radians(-this.thetaDegree));
    },
    getPosition: function(){
	return [this.x, this.y];
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
    move: function(componentId, mouse, diff){
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

var TransformByCircles = function(){
    this.inner = new Circle(-50, 0, 150);
    this.outer = new Circle(0, 0, 200);
    this.inverted = circleInvert(this.inner, this.outer);
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
        return new TransformByCircles();
    },
    move: function(componentId, mouse, diff){
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

const ID_CIRCLE = 0;
const ID_INFINITE_CIRCLE = 1;
const ID_TRANSFORM_BY_CIRCLES = 2;

var g_params = [
    {
        circles:[new Circle(100, -100, 100),
		 new Circle(100, 100, 100),
		 new Circle(-100, -100, 100),
		 new Circle(-100, 100, 100)],
        infiniteCircles:[],
        transformByCircles:[]
    },
    {
        circles:[new Circle(100, -100, 100),
		 new Circle(100, 100, 100),
		 new Circle(-100, -100, 100),
		 new Circle(-100, 100, 100)],
        infiniteCircles:[new InfiniteCircle(200, 0, 0)],
        transformByCircles:[]
    },
    {
        circles:[new Circle(100, -100, 100),
		 new Circle(100, 100, 100),
		 new Circle(-100, -100, 100),
		 new Circle(-100, 100, 100)],
        infiniteCircles:[new InfiniteCircle(200, 0, 0),
                         new InfiniteCircle(-200, 0, 180)],
        transformByCircles:[]
    },
    {
        circles:[new Circle(226, -139, 108),
                 new Circle(263, 106, 100),
                 new Circle(47, -209, 78),
                 new Circle(93, 200, 95),
                 new Circle(154, 4, 53)],
        infiniteCircles:[],
        transformByCircles:[new TransformByCircles()]
    },
]

var Scene = function(){
    this.circles = [];
    this.infiniteCircles =  [];
    this.transformByCircles = [];
    this.objects = {}
    this.objects[ID_CIRCLE] = this.circles;
    this.objects[ID_INFINITE_CIRCLE] = this.infiniteCircles;
    this.objects[ID_TRANSFORM_BY_CIRCLES] = this.transformByCircles;
}

Scene.prototype = {
    loadParameter: function(param){
        this.circles = this.clone(param["circles"]);
        this.infiniteCircles = this.clone(param["infiniteCircles"]);
        this.transformByCircles = this.clone(param["transformByCircles"]);
        this.objects[ID_CIRCLE] = this.circles;
        this.objects[ID_INFINITE_CIRCLE] = this.infiniteCircles;
        this.objects[ID_TRANSFORM_BY_CIRCLES] = this.transformByCircles;
    },
    clone: function(objects){
	var obj = [];
	for(var i = 0 ; i < objects.length ; i++){
	    obj.push(objects[i].clone());
	}
	return obj;
    },
    getNumCircles: function(){
	return this.circles.length;
    },
    getNumInfiniteCircles: function(){
	return this.infiniteCircles.length;
    },
    getNumTransformByCircles: function(){
	return this.transformByCircles.length;
    },
    addCircle: function(canvas, mouse){
	this.circles.push(new Circle(mouse[0], mouse[1], 100));
	updateShaders(canvas);
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
	    obj.move(componentId, mouse, diff);
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

var RenderCanvas2D = function(canvasId, templateId){
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.defaultWidth = canvas.width;
    this.defaultHeight = canvas.height;
    this.center = [0, 0];
    this.canvasRatio = this.canvas.width / this.canvas.height / 2.;

    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    this.template = nunjucks.compile(document.getElementById(templateId).text);
    this.isRendering = false;
    this.isMousePressing = false;
    this.prevMousePos = [0, 0];
    this.scale = 900;

    this.selectedObjectId = -1;
    this.selectedObjectIndex = -1;
    this.selectedComponentId = -1;
    
    this.switch;
    this.render;
    this.iterations = 10;
    this.initialHue = 0;
    this.hueStep = 0.03
    this.numSamples = 10;
    this.translate = [0, 0];

    this.isFullScreen = false;
    
}

RenderCanvas2D.prototype = {
    resizeCanvas: function(width, height){
	this.canvas.style.width = width + 'px';
	this.canvas.style.height = height + 'px';
	this.canvas.width = width * window.devicePixelRatio;
	this.canvas.height = height * window.devicePixelRatio;
	this.center = [this.canvas.width / 2, this.canvas.height / 2];
	this.canvasRatio = this.canvas.width / this.canvas.height / 2.;
    },
    resizeCanvasFullscreen: function(){
	this.canvas.style.width = window.innerWidth + 'px';
	this.canvas.style.height = window.innerHeight + 'px';
	this.canvas.width = window.innerWidth * window.devicePixelRatio;
	this.canvas.height = window.innerHeight * window.devicePixelRatio;
	this.center = [this.canvas.width / 2, this.canvas.height / 2];
	this.canvasRatio = this.canvas.width / this.canvas.height / 2.;
    },
    calcPixel: function(){
	var rect = event.target.getBoundingClientRect();
	return [this.scale * (((event.clientX - rect.left) * devicePixelRatio) / this.canvas.height - this.canvasRatio) +
		this.translate[0],
		this.scale * -(((event.clientY - rect.top) * devicePixelRatio) / this.canvas.height - 0.5) +
		this.translate[1]];
    },
    requestFullScreen: function(){
	var ua = navigator.userAgent.toLowerCase();
	var version = navigator.appVersion.toLowerCase();

	var requestFullScreen;
	if(ua.indexOf('firefox') > -1){
	    // firefox
	    this.canvas.mozRequestFullscreen();
	}else if((ua.indexOf('chrome') > -1) &&
		 (ua.indexOf('edge') == -1)){
	    // chrome
	    this.canvas.webkitRequestFullscreen();
	    
	}else if((ua.indexOf('safari') > -1) && (ua.indexOf('chrome') == -1)){
	    // safari
	    this.canvas.webkitRequestFullscreen();
	}else if(ua.indexOf('opera') > -1){
	    // opera
	    this.canvas.webkitRequestFullscreen();
	}else if(ua.indexOf('trident/7') > -1){
	    // IE11
	    this.canvas.msRequestFullscreen();
	}else if((ua.indexOf('Edge') > -1)){
	    // Edge
	    this.canvas.msRequestFullscreen();
	}
    },
    releaseObject: function(){
	this.selectedObjectId = -1;
	this.selectedObjectIndex = -1;
	this.selectedComponentId = -1;
    }
}

function updateShaders(canvas){
    [canvas.switch,
     canvas.render] = setupSchottkyProgram(g_scene, canvas);
    canvas.switch();
    canvas.render(0);
}

function addMouseListeners(renderCanvas){
    var diff = [0, 0];

    renderCanvas.canvas.addEventListener("contextmenu", function(e){
	// disable right-click context-menu
        event.preventDefault();
    });
    
    renderCanvas.canvas.addEventListener('mouseup', function(event){
	renderCanvas.isMousePressing = false;
	renderCanvas.isRendering = false;
	renderCanvas.render(0);
    }, false);

    renderCanvas.canvas.addEventListener('mousemove', function(event){
	if(!renderCanvas.isMousePressing) return;
	var mouse = renderCanvas.calcPixel();
	if(event.button == 0){
	    g_scene.move(renderCanvas.selectedObjectId,
			 renderCanvas.selectedObjectIndex,
			 renderCanvas.selectedComponentId,
			 mouse, diff);
	    renderCanvas.isRendering = true;
	}else if(event.button == 2){
            var d = vec2Scale(vec2Diff(mouse, renderCanvas.prevMousePos), 0.01);
            renderCanvas.translate[0] -= d[0];
            renderCanvas.translate[1] -= d[1];
            renderCanvas.isRendering = true;
        }
    });

    renderCanvas.canvas.addEventListener('mousedown', function(event){
	event.preventDefault();
	var mouse = renderCanvas.calcPixel(event);
	if(event.button == 0){
	    [renderCanvas.selectedObjectId,
	     renderCanvas.selectedObjectIndex,
	     renderCanvas.selectedComponentId,
	     diff] = g_scene.getSelectedObject(mouse);
	}else if(event.button == 1){
	    renderCanvas.releaseObject();
	    g_scene.addCircle(renderCanvas, mouse);
	}else if(event.button == 2){
        }
        renderCanvas.prevMousePos = mouse;
	renderCanvas.isMousePressing = true;
	renderCanvas.render(0);
    }, false);

    renderCanvas.canvas.addEventListener('dblclick', function(event){
	if(event.button == 0){
	    var mouse = renderCanvas.calcPixel(event);
	    g_scene.remove(renderCanvas.selectedObjectId,
			   renderCanvas.selectedObjectIndex,
			   mouse, diff);
	    renderCanvas.releaseObject();
	    updateShaders(renderCanvas);
	}
    });

    renderCanvas.canvas.addEventListener('mousewheel', function(event){
	event.preventDefault();
	if(event.wheelDelta > 0){
	    if(renderCanvas.scale > 1){
		renderCanvas.scale -= 100;
	    }
	}else{
	    renderCanvas.scale += 100;
	}
	renderCanvas.render(0);
    })
}

function setupSchottkyProgram(scene, renderCanvas){
    var gl = renderCanvas.gl;
    var program = gl.createProgram();
    var numCircles = scene.getNumCircles();
    var numInfiniteCircles = scene.getNumInfiniteCircles();
    var numTransformByCircles = scene.getNumTransformByCircles();
    attachShaderFromString(gl,
			   renderCanvas.template.render({numCircles: numCircles,
							 numInfiniteCircles: numInfiniteCircles,
							 numTransformByCircles: numTransformByCircles}),
			   program,
			   gl.FRAGMENT_SHADER);
    attachShader(gl, 'vs', program, gl.VERTEX_SHADER);
    program = linkProgram(gl, program);

    var uniLocation = new Array();
    var n = 0;
    uniLocation[n++] = gl.getUniformLocation(program, 'u_iResolution');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_iGlobalTime');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_translate');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_scale');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_iterations');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_initialHue');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_hueStep');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_numSamples');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_selectedObjectId');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_selectedObjectIndex');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_selectedObjectComponentId');
    for(var i = 0 ; i < numCircles ; i++){
	uniLocation[n++] = gl.getUniformLocation(program, 'u_schottkyCircle'+ i);
        uniLocation[n++] = gl.getUniformLocation(program, 'u_schottkyCircleUIParam'+ i);
    }
    for(var i = 0 ; i < numInfiniteCircles ; i++){
	uniLocation[n++] = gl.getUniformLocation(program, 'u_infiniteCircle'+ i);
	uniLocation[n++] = gl.getUniformLocation(program, 'u_infiniteCircleUIParam'+ i);
	uniLocation[n++] = gl.getUniformLocation(program, 'u_infiniteCircleRotationMat2'+ i);
	uniLocation[n++] = gl.getUniformLocation(program, 'u_invInfiniteCircleRotationMat2'+ i);
    }
    for(var i = 0 ; i < numTransformByCircles ; i++){
	uniLocation[n++] = gl.getUniformLocation(program, 'u_transformByCircles'+ i);
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
        gl.viewport(0, 0,
		    renderCanvas.canvas.width,
		    renderCanvas.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var uniI = 0;
        gl.uniform2fv(uniLocation[uniI++], [renderCanvas.canvas.width,
					    renderCanvas.canvas.height]);
        gl.uniform1f(uniLocation[uniI++], elapsedTime * 0.001);
	gl.uniform2fv(uniLocation[uniI++], renderCanvas.translate);
	gl.uniform1f(uniLocation[uniI++], renderCanvas.scale);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.iterations);
	gl.uniform1f(uniLocation[uniI++], renderCanvas.initialHue);
	gl.uniform1f(uniLocation[uniI++], renderCanvas.hueStep);
	gl.uniform1f(uniLocation[uniI++], renderCanvas.numSamples);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedObjectId);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedObjectIndex);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedComponentId);
	for(var i = 0 ; i < numCircles ; i++){
	    gl.uniform3fv(uniLocation[uniI++], scene.circles[i].getUniformArray());
            gl.uniform2fv(uniLocation[uniI++], scene.circles[i].getUIParamArray());
	}
	for(var i = 0 ; i < numInfiniteCircles ; i++){
	    gl.uniform3fv(uniLocation[uniI++], scene.infiniteCircles[i].getUniformArray());
	    gl.uniform3fv(uniLocation[uniI++], scene.infiniteCircles[i].getUIParamArray());
	    gl.uniformMatrix2fv(uniLocation[uniI++], false,
				scene.infiniteCircles[i].rotationMat2);
	    gl.uniformMatrix2fv(uniLocation[uniI++], false,
				scene.infiniteCircles[i].invRotationMat2);
	}
	for(var i = 0 ; i < numTransformByCircles ; i++){
	    gl.uniform3fv(uniLocation[uniI++], scene.transformByCircles[i].getUniformArray());
	}
	
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	gl.flush();
    }

    return [switchProgram, render];
}

window.addEventListener('load', function(event){
    g_scene = new Scene();
    g_scene.loadParameter(g_params[0]);
    
    var renderCanvas = new RenderCanvas2D('canvas',
					  'kissingSchottkyTemplate');
    
    addMouseListeners(renderCanvas);
    renderCanvas.resizeCanvas(renderCanvas.defaultWidth,
			      renderCanvas.defaultHeight);

    updateShaders(renderCanvas);

    window.addEventListener('resize', function(event){
	console.log('resize');
    	if(renderCanvas.isFullScreen){
    	    renderCanvas.resizeCanvasFullscreen();
    	}else{
    	    renderCanvas.resizeCanvas(renderCanvas.defaultWidth,
				      renderCanvas.defaultHeight);
    	}
    	renderCanvas.render(0);
    }, false);

    document.addEventListener('webkitfullscreenchange', function(event){
	console.log(document.webkitFullscreenElement);
	if ( document.webkitFullscreenElement ) {
	    renderCanvas.isFullScreen = true;
	}else{
	    renderCanvas.isFullScreen = false;
	    renderCanvas.resizeCanvas(renderCanvas.defaultWidth,
				      renderCanvas.defaultHeight);
	    renderCanvas.render(0);
	}
    });

    document.addEventListener('mozfullscreenchange', function(event){
	if ( document.mozFullscreenElement ) {
	    renderCanvas.isFullScreen = true;
	}else{
	    renderCanvas.isFullScreen = false;
	    renderCanvas.resizeCanvas(renderCanvas.defaultWidth,
				      renderCanvas.defaultHeight);
	    renderCanvas.render(0);
	}
    });

    document.addEventListener('msfullscreenchange', function(event){
	if ( document.msFullscreenElement ) {
	    renderCanvas.isFullScreen = true;
	}else{
	    renderCanvas.isFullScreen = false;
	    renderCanvas.resizeCanvas(renderCanvas.defaultWidth,
				      renderCanvas.defaultHeight);
	    renderCanvas.render(0);
	}
    });
    
    window.addEventListener('keydown', function(event){
	switch(event.key){
	case '+':
	    renderCanvas.iterations++;
	    renderCanvas.render(0);
	    break;
	case '-':
	    if(renderCanvas.iterations > 1){
		renderCanvas.iterations--;
		renderCanvas.render(0);
	    }
	    break;
	case 'p':
	    renderCanvas.numSamples++;
	    renderCanvas.render(0);
	    break;
	case 'n':
	    if(renderCanvas.numSamples > 1){
		renderCanvas.numSamples--;
		renderCanvas.render(0);
	    }
	    break;
	case 'a':
	    if(renderCanvas.initialHue > 0){
		renderCanvas.initialHue -= 0.05;
		renderCanvas.render(0);
	    }
	    break;
	case 's':
	    renderCanvas.initialHue += 0.05;
	    renderCanvas.render(0);
	    break;
	case 'z':
	    if(renderCanvas.hueStep > 0){
		renderCanvas.hueStep -= 0.01;
		renderCanvas.render(0);
	    }
	    break;
	case 'x':
	    renderCanvas.hueStep += 0.01;
	    renderCanvas.render(0);
	    break;
	case 'r':
	    renderCanvas.requestFullScreen();
	    break;
        case 'o':
            renderCanvas.render(0);
            var a = document.createElement('a');
            a.href = renderCanvas.canvas.toDataURL();
            a.download = "schottky.png"
            a.click();
            break;
	case 'ArrowRight':
	    event.preventDefault();
	    renderCanvas.translate[0] += renderCanvas.scale / 10;
	    renderCanvas.render(0);
	    break;
	case 'ArrowLeft':
	    event.preventDefault();
	    renderCanvas.translate[0] -= renderCanvas.scale / 10;
	    renderCanvas.render(0);
	    break;
	case 'ArrowUp':
	    event.preventDefault();
	    renderCanvas.translate[1] += renderCanvas.scale / 10;
	    renderCanvas.render(0);
	    break;
	case 'ArrowDown':
	    event.preventDefault();
	    renderCanvas.translate[1] -= renderCanvas.scale / 10;
	    renderCanvas.render(0);
	    break;
        case '0':
	case '1':
	case '2':
	case '3':
	case '4':
	case '5':
	case '6':
	case '7':
	case '8':
	case '9':
	    var i = parseInt(event.key);
	    var param = g_params[i];
	    if(param != undefined){
		g_scene.loadParameter(param);
		updateShaders(renderCanvas);
	    }
	    break;
	}
    });
    var startTime = new Date().getTime();
    (function(){
        var elapsedTime = new Date().getTime() - startTime;
	if(renderCanvas.isRendering)
	    renderCanvas.render(elapsedTime);
	requestAnimationFrame(arguments.callee);
    })();
}, false);
