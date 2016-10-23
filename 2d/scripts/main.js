var RenderCanvas2D = function(canvasId, templateId){
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.parentPanel = document.getElementById("canvasParent1");
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
    },
    setUniformLocation: function(uniLocation, gl, program){
        uniLocation.push(gl.getUniformLocation(program, 'u_iResolution'));
        uniLocation.push(gl.getUniformLocation(program, 'u_iGlobalTime'));
        uniLocation.push(gl.getUniformLocation(program, 'u_translate'));
        uniLocation.push(gl.getUniformLocation(program, 'u_scale'));
        uniLocation.push(gl.getUniformLocation(program, 'u_iterations'));
        uniLocation.push(gl.getUniformLocation(program, 'u_initialHue'));
        uniLocation.push(gl.getUniformLocation(program, 'u_hueStep'));
	uniLocation.push(gl.getUniformLocation(program, 'u_numSamples'));
	uniLocation.push(gl.getUniformLocation(program, 'u_selectedObjectId'));
	uniLocation.push(gl.getUniformLocation(program, 'u_selectedObjectIndex'));
	uniLocation.push(gl.getUniformLocation(program, 'u_selectedObjectComponentId'));
    },
    setUniformValues: function(uniLocation, gl, uniI, width, height){
        gl.uniform2fv(uniLocation[uniI++], [width, height]);
        gl.uniform1f(uniLocation[uniI++], 0);
	gl.uniform2fv(uniLocation[uniI++], this.translate);
	gl.uniform1f(uniLocation[uniI++], this.scale);
	gl.uniform1i(uniLocation[uniI++], this.iterations);
	gl.uniform1f(uniLocation[uniI++], this.initialHue);
	gl.uniform1f(uniLocation[uniI++], this.hueStep);
	gl.uniform1f(uniLocation[uniI++], this.numSamples);
	gl.uniform1i(uniLocation[uniI++], this.selectedObjectId);
	gl.uniform1i(uniLocation[uniI++], this.selectedObjectIndex);
	gl.uniform1i(uniLocation[uniI++], this.selectedComponentId);
        return uniI;
    }
}

function updateShaders(scene, canvas){
    [canvas.switch,
     canvas.render] = setupSchottkyProgram(scene, canvas);
    canvas.switch();
    canvas.render();
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
	renderCanvas.render();
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
	renderCanvas.render();
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
	renderCanvas.render();
    })
}

function setupSchottkyProgram(scene, renderCanvas){
    var gl = renderCanvas.gl;
    var program = gl.createProgram();
    var renderContext = {};
    scene.setRenderContext(renderContext);
    attachShaderFromString(gl,
			   renderCanvas.template.render(renderContext),
			   program,
			   gl.FRAGMENT_SHADER);
    attachShader(gl, 'vs', program, gl.VERTEX_SHADER);
    program = linkProgram(gl, program);

    var uniLocation = [];
    renderCanvas.setUniformLocation(uniLocation, gl, program);
    scene.setUniformLocation(uniLocation, gl, program);
    
    var vertex = [
            -1, -1,
            -1, 1,
             1, -1,
             1, 1
    ];
    var vPosition = createVbo(gl, vertex);
    var vAttLocation = gl.getAttribLocation(program, 'a_vertex');
    gl.bindBuffer(gl.ARRAY_BUFFER, vPosition);
    gl.enableVertexAttribArray(vAttLocation);
    gl.vertexAttribPointer(vAttLocation, 2, gl.FLOAT, false, 0, 0);

    var switchProgram = function(){
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, vPosition);
        gl.enableVertexAttribArray(vAttLocation);
        gl.vertexAttribPointer(vAttLocation, 2, gl.FLOAT, false, 0, 0);
    }

    var render = function(){
        gl.viewport(0, 0,
		    renderCanvas.canvas.width,
		    renderCanvas.canvas.height);

	var uniI = 0;
        uniI = renderCanvas.setUniformValues(uniLocation, gl, uniI,
                                             renderCanvas.canvas.width,
                                             renderCanvas.canvas.height);
        uniI = scene.setUniformValues(uniLocation, gl, uniI);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	gl.flush();
    }

    return [switchProgram, render];
}

window.addEventListener('load', function(event){
    Vue.use(Keen);
    var app = new Vue({
        el: '#bodyElem',
    });
    
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
    	renderCanvas.render();
    }, false);

    document.addEventListener('webkitfullscreenchange', function(event){
	if ( document.webkitFullscreenElement ) {
	    renderCanvas.isFullScreen = true;
	}else{
	    renderCanvas.isFullScreen = false;
	    renderCanvas.resizeCanvas();
	    renderCanvas.render();
	}
    });

    document.addEventListener('mozfullscreenchange', function(event){
	if ( document.mozFullscreenElement ) {
	    renderCanvas.isFullScreen = true;
	}else{
	    renderCanvas.isFullScreen = false;
	    renderCanvas.resizeCanvas();
	    renderCanvas.render();
	}
    });

    document.addEventListener('msfullscreenchange', function(event){
	if ( document.msFullscreenElement ) {
	    renderCanvas.isFullScreen = true;
	}else{
	    renderCanvas.isFullScreen = false;
	    renderCanvas.resizeCanvas();
	    renderCanvas.render();
	}
    });
    
    window.addEventListener('keydown', function(event){
	switch(event.key){
	case '+':
	    renderCanvas.iterations++;
	    renderCanvas.render();
	    break;
	case '-':
	    if(renderCanvas.iterations > 1){
		renderCanvas.iterations--;
		renderCanvas.render();
	    }
	    break;
	case 'p':
	    renderCanvas.numSamples++;
	    renderCanvas.render();
	    break;
	case 'n':
	    if(renderCanvas.numSamples > 1){
		renderCanvas.numSamples--;
		renderCanvas.render();
	    }
	    break;
	case 'a':
	    if(renderCanvas.initialHue > 0){
		renderCanvas.initialHue -= 0.05;
		renderCanvas.render();
	    }
	    break;
	case 's':
	    renderCanvas.initialHue += 0.05;
	    renderCanvas.render();
	    break;
	case 'z':
	    if(renderCanvas.hueStep > 0){
		renderCanvas.hueStep -= 0.01;
		renderCanvas.render();
	    }
	    break;
	case 'x':
	    renderCanvas.hueStep += 0.01;
	    renderCanvas.render();
	    break;
	case 'r':
	    renderCanvas.requestFullScreen();
	    break;
        case 'o':
            renderCanvas.render();
            var a = document.createElement('a');
            a.href = renderCanvas.canvas.toDataURL();
            a.download = "schottky.png"
            a.click();
            break;
        case 'l':
            scene.saveSceneAsJson();
            break;
        case 'm':
            var reader = new FileReader();
            reader.addEventListener('load', function(){
                scene.loadParameterFromJson(JSON.parse(reader.result));
                updateShaders(scene, renderCanvas);
            });
            var a = document.createElement('input');
            a.type = 'file';
            a.addEventListener('change', function(event){
                var files = event.target.files;
                reader.readAsText(files[0]);
            });
            a.click();
            break;
	case 'ArrowRight':
	    event.preventDefault();
	    renderCanvas.translate[0] += renderCanvas.scale / 10;
	    renderCanvas.render();
	    break;
	case 'ArrowLeft':
	    event.preventDefault();
	    renderCanvas.translate[0] -= renderCanvas.scale / 10;
	    renderCanvas.render();
	    break;
	case 'ArrowUp':
	    event.preventDefault();
	    renderCanvas.translate[1] += renderCanvas.scale / 10;
	    renderCanvas.render();
	    break;
	case 'ArrowDown':
	    event.preventDefault();
	    renderCanvas.translate[1] -= renderCanvas.scale / 10;
	    renderCanvas.render();
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
