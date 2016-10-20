var RenderCanvas2D = function(canvasId, templateId){
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.parentPanel = document.getElementById("panel1");
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

    this.usingPixelRatio = 1;
    
}

RenderCanvas2D.prototype = {
    resizeCanvas: function(){
        this.usingPixelRatio = window.devicePixelRatio;

	this.canvas.width = this.parentPanel.clientWidth * this.usingPixelRatio;
	this.canvas.height = this.parentPanel.clientHeight * this.usingPixelRatio;
        
	this.center = [this.canvas.width / 2, this.canvas.height / 2];
	this.canvasRatio = this.canvas.width / this.canvas.height / 2.;
    },
    resizeCanvasFullscreen: function(){
        this.usingPixelRatio = window.devicePixelRatio;
	this.canvas.width = window.innerWidth * this.usingPixelRatio;
	this.canvas.height = window.innerHeight * this.usingPixelRatio;
	this.center = [this.canvas.width / 2, this.canvas.height / 2];
	this.canvasRatio = this.canvas.width / this.canvas.height / 2.;
    },
    calcPixel: function(){
	var rect = event.target.getBoundingClientRect();
	return [this.scale * (((event.clientX - rect.left) * this.usingPixelRatio) / this.canvas.height - this.canvasRatio) +
		this.translate[0],
		this.scale * -(((event.clientY - rect.top) * this.usingPixelRatio) / this.canvas.height - 0.5) +
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

function updateShaders(scene, canvas){
    [canvas.switch,
     canvas.render] = setupSchottkyProgram(scene, canvas);
    canvas.switch();
    canvas.render(0);
}

function addMouseListeners(scene, renderCanvas){
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
	    scene.move(renderCanvas.selectedObjectId,
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
	     diff] = scene.getSelectedObject(mouse);
	}else if(event.button == 1){
	    renderCanvas.releaseObject();
	    scene.addCircle(renderCanvas, mouse);
	}else if(event.button == 2){
        }
        renderCanvas.prevMousePos = mouse;
	renderCanvas.isMousePressing = true;
	renderCanvas.render(0);
    }, false);

    renderCanvas.canvas.addEventListener('dblclick', function(event){
	if(event.button == 0){
	    var mouse = renderCanvas.calcPixel(event);
	    scene.remove(renderCanvas.selectedObjectId,
			   renderCanvas.selectedObjectIndex,
			   mouse, diff);
	    renderCanvas.releaseObject();
	    updateShaders(scene, renderCanvas);
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
    Vue.use(Keen);
    var app = new Vue({
        el: '#prop',
        
    });
    
    var gl = renderCanvas.gl;
    var program = gl.createProgram();
    var numCircles = scene.objects[ID_CIRCLE].length;
    var numInfiniteCircles = scene.objects[ID_INFINITE_CIRCLE].length;
    var numTransformByCircles = scene.objects[ID_TRANSFORM_BY_CIRCLES].length;
    var numTwistedLoxodromic = scene.objects[ID_TWISTED_LOXODROMIC].length;
    attachShaderFromString(gl,
			   renderCanvas.template.render({numCircles: numCircles,
							 numInfiniteCircles: numInfiniteCircles,
							 numTransformByCircles: numTransformByCircles,
                                                         numTwistedLoxodromic: numTwistedLoxodromic}),
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
    for(var i = 0 ; i < numTwistedLoxodromic ; i++){
        uniLocation[n++] = gl.getUniformLocation(program, 'u_twistedLoxodromic'+ i);
        uniLocation[n++] = gl.getUniformLocation(program, 'u_twistedLoxodromicRotationMat2'+ i);
        uniLocation[n++] = gl.getUniformLocation(program, 'u_invTwistedLoxodromicRotationMat2'+ i);
        uniLocation[n++] = gl.getUniformLocation(program, 'u_twistedLoxodromicUIParam'+ i);
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
	    gl.uniform3fv(uniLocation[uniI++], scene.objects[ID_CIRCLE][i].getUniformArray());
            gl.uniform2fv(uniLocation[uniI++], scene.objects[ID_CIRCLE][i].getUIParamArray());
	}
	for(var i = 0 ; i < numInfiniteCircles ; i++){
	    gl.uniform3fv(uniLocation[uniI++], scene.objects[ID_INFINITE_CIRCLE][i].getUniformArray());
	    gl.uniform3fv(uniLocation[uniI++], scene.objects[ID_INFINITE_CIRCLE][i].getUIParamArray());
	    gl.uniformMatrix2fv(uniLocation[uniI++], false,
				scene.objects[ID_INFINITE_CIRCLE][i].rotationMat2);
	    gl.uniformMatrix2fv(uniLocation[uniI++], false,
				scene.objects[ID_INFINITE_CIRCLE][i].invRotationMat2);
	}
	for(var i = 0 ; i < numTransformByCircles ; i++){
	    gl.uniform3fv(uniLocation[uniI++], scene.objects[ID_TRANSFORM_BY_CIRCLES][i].getUniformArray());
	}
	for(var i = 0 ; i < numTwistedLoxodromic ; i++){
	    gl.uniform3fv(uniLocation[uniI++], scene.objects[ID_TWISTED_LOXODROMIC][i].getUniformArray());
            gl.uniformMatrix2fv(uniLocation[uniI++], false,
				scene.objects[ID_TWISTED_LOXODROMIC][i].rotationMat2);
            gl.uniformMatrix2fv(uniLocation[uniI++], false,
				scene.objects[ID_TWISTED_LOXODROMIC][i].invRotationMat2);
            gl.uniform2fv(uniLocation[uniI++], scene.objects[ID_TWISTED_LOXODROMIC][i].getUIParamArray());
	}
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	gl.flush();
    }

    return [switchProgram, render];
}

window.addEventListener('load', function(event){
    var scene = new Scene();
    scene.loadParameterFromJson(PRESET_PARAMETERS[0]);
    var renderCanvas = new RenderCanvas2D('canvas',
					  'kissingSchottkyTemplate');
    addMouseListeners(scene, renderCanvas);
    renderCanvas.resizeCanvas();

    updateShaders(scene, renderCanvas);

    window.addEventListener('resize', function(event){
    	if(renderCanvas.isFullScreen){
    	    renderCanvas.resizeCanvasFullscreen();
    	}else{
    	    renderCanvas.resizeCanvas();
    	}
    	renderCanvas.render(0);
    }, false);

    document.addEventListener('webkitfullscreenchange', function(event){
	if ( document.webkitFullscreenElement ) {
	    renderCanvas.isFullScreen = true;
	}else{
	    renderCanvas.isFullScreen = false;
	    renderCanvas.resizeCanvas();
	    renderCanvas.render(0);
	}
    });

    document.addEventListener('mozfullscreenchange', function(event){
	if ( document.mozFullscreenElement ) {
	    renderCanvas.isFullScreen = true;
	}else{
	    renderCanvas.isFullScreen = false;
	    renderCanvas.resizeCanvas();
	    renderCanvas.render(0);
	}
    });

    document.addEventListener('msfullscreenchange', function(event){
	if ( document.msFullscreenElement ) {
	    renderCanvas.isFullScreen = true;
	}else{
	    renderCanvas.isFullScreen = false;
	    renderCanvas.resizeCanvas();
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
        case 'l':
            scene.saveSceneAsJson();
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
        case 'v':
            if(renderCanvas.selectedObjectId == ID_CIRCLE){
                scene.objects[ID_CIRCLE][renderCanvas.selectedObjectIndex].moveMode = CIRCLE_MOVE_MODE_NEAREST;
            }
            break;
        case 'b':
            if(renderCanvas.selectedObjectId == ID_CIRCLE){
                scene.objects[ID_CIRCLE][renderCanvas.selectedObjectIndex].moveMode = CIRCLE_MOVE_MODE_NORMAL;
            }
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
            var param = PRESET_PARAMETERS[i];
	    if(param != undefined){
                scene.loadParameterFromJson(param);
		updateShaders(scene, renderCanvas);
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
