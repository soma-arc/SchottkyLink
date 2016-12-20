var RenderCanvas2D = function(canvasId, templateId){
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.parentPanel = document.getElementById("canvasParent1");
    this.center = [0, 0];
    this.canvasRatio = this.canvas.width / this.canvas.height / 2.;

    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    this.template = nunjucks.compile(document.getElementById(templateId).text);

    
    var vertex = [
        -1, -1,
        -1, 1,
        1, -1,
        1, 1
    ];
    this.vertexBuffer = createVbo(this.gl, vertex);
    this.framebuffer = this.gl.createFramebuffer();

    this.renderProgram = this.gl.createProgram();
    attachShader(this.gl, 'render-frag', this.renderProgram, this.gl.FRAGMENT_SHADER);
    attachShader(this.gl, 'render-vert', this.renderProgram, this.gl.VERTEX_SHADER);
    this.renderProgram = linkProgram(this.gl, this.renderProgram);
    this.renderVertexAttribute = this.gl.getAttribLocation(this.renderProgram, 'a_vertex');

    
    this.isRendering = false;
    this.isMousePressing = false;
    this.prevMousePos = [0, 0];
    this.scale = 1024;

    this.selectedObjectId = -1;
    this.selectedObjectIndex = -1;
    this.selectedComponentId = -1;
    
    this.iterations = 10;
    this.initialHue = 0.01;
    this.hueStep = 0.03
    this.translate = [0, 0];

    this.isFullScreen = false;

    this.pixelRatio = window.devicePixelRatio;

    this.displayGenerators = true;
    this.isDisplayingInstruction = false;


    this.numSamples = 0;
    this.textures = [];
    this.isSampling = false

    // texture for low resolution rendering
    this.isRenderingLowResolution = false;
    this.lowResTextures = [];
    this.lowResRatio = 0.25;

    this.render = function(){};
    this.renderLowRes = function(){};
    this.renderTimerID = undefined;

    this.productRenderContext = new ProductRenderContext();
    this.isProductRendering = false;
}

RenderCanvas2D.prototype = {
    resizeCanvas: function(){
	    this.canvas.width = this.parentPanel.clientWidth * this.pixelRatio;
	    this.canvas.height = this.parentPanel.clientHeight * this.pixelRatio;
        
	    this.center = [this.canvas.width / 2, this.canvas.height / 2];
	    this.canvasRatio = this.canvas.width / this.canvas.height / 2.;
    },
    resizeCanvasFullscreen: function(){
        this.usingPixelRatio = window.devicePixelRatio;
	    this.canvas.width = window.innerWidth * this.pixelRatio;
	    this.canvas.height = window.innerHeight * this.pixelRatio;
	    this.center = [this.canvas.width / 2, this.canvas.height / 2];
	    this.canvasRatio = this.canvas.width / this.canvas.height / 2.;
    },
    calcPixel: function(mx, my){
	    var rect = this.canvas.getBoundingClientRect();
	    return [this.scale * (((mx - rect.left) * this.pixelRatio) / this.canvas.height - this.canvasRatio) +
		        this.translate[0],
		        this.scale * -(((my - rect.top) * this.pixelRatio) / this.canvas.height - 0.5) +
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
        uniLocation.push(gl.getUniformLocation(program,
                                               'u_accTexture'));
        uniLocation.push(gl.getUniformLocation(program,
                                               'u_numSamples'));
        uniLocation.push(gl.getUniformLocation(program,
                                               'u_textureWeight'));
        uniLocation.push(gl.getUniformLocation(program, 'u_iResolution'));
        uniLocation.push(gl.getUniformLocation(program, 'u_iGlobalTime'));
        uniLocation.push(gl.getUniformLocation(program, 'u_translate'));
        uniLocation.push(gl.getUniformLocation(program, 'u_scale'));
        uniLocation.push(gl.getUniformLocation(program, 'u_iterations'));
        uniLocation.push(gl.getUniformLocation(program, 'u_initialHue'));
        uniLocation.push(gl.getUniformLocation(program, 'u_hueStep'));
	    uniLocation.push(gl.getUniformLocation(program, 'u_selectedObjectId'));
	    uniLocation.push(gl.getUniformLocation(program, 'u_selectedObjectIndex'));
	    uniLocation.push(gl.getUniformLocation(program, 'u_selectedObjectComponentId'));
	    uniLocation.push(gl.getUniformLocation(program, 'u_displayGenerators'));
    },
    setUniformValues: function(uniLocation, gl, uniI, width, height){
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
        gl.uniform1i(uniLocation[uniI++], this.textures[0]);
        gl.uniform1i(uniLocation[uniI++], this.numSamples);
        gl.uniform1f(uniLocation[uniI++], this.numSamples / (this.numSamples + 1));
        gl.uniform2fv(uniLocation[uniI++], [width, height]);
        gl.uniform1f(uniLocation[uniI++], 0);
	    gl.uniform2fv(uniLocation[uniI++], this.translate);
	    gl.uniform1f(uniLocation[uniI++], this.scale);
	    gl.uniform1i(uniLocation[uniI++], this.iterations);
	    gl.uniform1f(uniLocation[uniI++], this.initialHue);
	    gl.uniform1f(uniLocation[uniI++], this.hueStep);
	    gl.uniform1i(uniLocation[uniI++], this.selectedObjectId);
	    gl.uniform1i(uniLocation[uniI++], this.selectedObjectIndex);
	    gl.uniform1i(uniLocation[uniI++], this.selectedComponentId);
	    gl.uniform1i(uniLocation[uniI++], this.displayGenerators);
        return uniI;
    },
    createTextures: function(gl, width, height){
        var textures = [];
        var type = gl.getExtension('OES_texture_float') ? gl.FLOAT : gl.UNSIGNED_BYTE;
        for(var i = 0; i < 2; i++) {
            textures.push(gl.createTexture());
            gl.bindTexture(gl.TEXTURE_2D, textures[i]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height,
                          0, gl.RGB, type, null);
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
        return textures;
    },
    initializeTextures: function(){
        this.textures = this.createTextures(this.gl, this.canvas.width, this.canvas.height);
        this.lowResTextures = this.createTextures(this.gl,
                                                  this.canvas.width * this.lowResRatio,
                                                  this.canvas.height * this.lowResRatio)
    },
}

var ProductRenderContext = function(width, height){
    this.width = 256;
    this.height = 256;
    this.maxSamples = 10;
    this.displayGenerators = false;

}

function updateShaders(scene, canvas){
    setupSchottkyProgram(scene, canvas);
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
	    var mouse = renderCanvas.calcPixel(event.clientX, event.clientY);
	    if(event.button == 0){
	        scene.move(renderCanvas.selectedObjectId,
			           renderCanvas.selectedObjectIndex,
			           renderCanvas.selectedComponentId,
			           mouse, diff);
	        renderCanvas.isRendering = true;
	    }else if(event.button == 2){
            var d = vec2Diff(mouse, renderCanvas.prevMousePos);
            renderCanvas.translate[0] -= d[0];
            renderCanvas.translate[1] -= d[1];
            renderCanvas.isRendering = true;
        }
    });

    renderCanvas.canvas.addEventListener('mousedown', function(event){
	    event.preventDefault();
	    var mouse = renderCanvas.calcPixel(event.clientX, event.clientY);
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
	        var mouse = renderCanvas.calcPixel(event.clientX, event.clientY);
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
            renderCanvas.scale *= 0.5;
	    }else{
            renderCanvas.scale *= 2;
	    }
	    renderCanvas.render();
    })
}

function setupSchottkyProgram(scene, renderCanvas){
    renderCanvas.renderTimerID = undefined;
    renderCanvas.numSamples = 0;
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
    renderCanvas.initializeTextures();
    var uniLocation = [];
    renderCanvas.setUniformLocation(uniLocation, gl, program);
    scene.setUniformLocation(uniLocation, gl, program);

    var vAttribLocation = gl.getAttribLocation(program, 'a_vertex');

    var renderToTexture = function(textures, width, height){
        gl.bindFramebuffer(gl.FRAMEBUFFER, renderCanvas.framebuffer);
        gl.viewport(0, 0, width, height);
        gl.useProgram(program);
        var uniI = 0;
        uniI = renderCanvas.setUniformValues(uniLocation, gl, uniI, width, height);
        uniI = scene.setUniformValues(uniLocation, gl, uniI);
        gl.bindBuffer(gl.ARRAY_BUFFER, renderCanvas.vertexBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
                                textures[1], 0);
        gl.enableVertexAttribArray(vAttribLocation);
        gl.vertexAttribPointer(vAttribLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        textures.reverse();
    }
    

    var renderToCanvas = function(textures, width, height){
        gl.viewport(0, 0, width, height);
        gl.useProgram(renderCanvas.renderProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, renderCanvas.vertexBuffer);
        gl.vertexAttribPointer(renderCanvas.renderVertexAttribute, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.flush();
    }

    var render = function(){
        renderCanvas.renderTimerID = undefined;
        renderCanvas.isRendering = false;

        renderToTexture(renderCanvas.textures,
                        renderCanvas.canvas.width, renderCanvas.canvas.height);
        renderToCanvas(renderCanvas.textures,
                       renderCanvas.canvas.width, renderCanvas.canvas.height);

        if(renderCanvas.isSampling)
            renderCanvas.numSamples++;
    }

    var renderLowRes = function(){
        window.clearTimeout(renderCanvas.renderTimerID);
        renderCanvas.isRendering = false;
        
        renderToTexture(renderCanvas.lowResTextures,
                        renderCanvas.canvas.width * renderCanvas.lowResRatio,
                        renderCanvas.canvas.height * renderCanvas.lowResRatio);
        renderToCanvas(renderCanvas.lowResTextures,
                       renderCanvas.canvas.width, renderCanvas.canvas.height);
        renderCanvas.renderTimerID = window.setTimeout(render, 500);
    }
    

    renderCanvas.render = render;
    renderCanvas.renderLowRes = renderLowRes;
}

window.addEventListener('load', function(event){
    var userAgent = window.navigator.userAgent.toLowerCase();
    if(userAgent.indexOf('chrome') == -1)
        window.alert('Sorry...\nCurrently, this application supports Google Chrome only.');
    
    var scene = new Scene();
    scene.loadParameterFromJson(PRESET_PARAMETERS[0]);
    var renderCanvas = new RenderCanvas2D('canvas',
					                      'kissingSchottkyTemplate');
    addMouseListeners(scene, renderCanvas);

    updateShaders(scene, renderCanvas);

    var resizeTimerId = undefined
    var resized = function(){
        renderCanvas.resizeCanvas();
        updateShaders(scene, renderCanvas);
    }
    window.addEventListener('resize', function(event){
    	if(renderCanvas.isFullScreen){
    	    renderCanvas.resizeCanvasFullscreen();
            updateShaders(scene, renderCanvas);
    	}else{
    	    window.clearTimeout(resizeTimerId);
            resizeTimerId = window.setTimeout(resized, 500);
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
	    case 'r':
	        renderCanvas.requestFullScreen();
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
        }
    });

    var isDisplayingInstruction = false;
    Vue.use(Keen);
    var app = new Vue({
        el: '#bodyElem',
        data: {renderCanvas: renderCanvas,
               productRenderContext: renderCanvas.productRenderContext,
               scene: scene,
               presetList: PRESET_PARAMETERS,
               pixelDensities:[{text: "1.0", value: 1.0},
                               {text: "1.5", value: 1.5},
                               {text: "2.0", value: 2.0}],
               pixelDensitiesDefault: {text: String(window.devicePixelRatio),
                                       value: window.devicePixelRatio},
	           minIterations: 1,
	           minHue: 0,
	           hueStep: 0.01,
	           initialHueStep: 0.01},
        methods:{
            saveScene: function(){
                scene.saveSceneAsJson();
            },
            loadScene: function(){
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
            },
            saveImage: function(){
                renderCanvas.render();
                var a = document.createElement('a');
                a.href = renderCanvas.canvas.toDataURL();
                a.download = "schottky.png"
                a.click();
            },
            presetSelected: function(option){
                scene.loadParameterFromJson(option);
                updateShaders(scene, renderCanvas);
            },
            pixelDensitySelected: function(option){
                renderCanvas.pixelRatio = option.value;
                renderCanvas.resizeCanvas();
                updateShaders(scene, renderCanvas);
                renderCanvas.render();
            },
            addCircle: function(){
                scene.addCircle(renderCanvas, [0, 0]);
            },
            addInfiniteCircle: function(){
                scene.addInfiniteCircle(renderCanvas, [0, 0]);
            },
            addTransformByCircles: function(){
                scene.addTransformByCircles(renderCanvas, [0, 0]);
            },
            addLoxodromic: function(){
                scene.addLoxodromic(renderCanvas, [0, 0]);
            },
            addLoxodromicFromFixedPoints: function(){
                scene.addLoxodromicFromFixedPoints(renderCanvas, [0, 0]);
            },
	        render: function(){
		        renderCanvas.render();
	        },
            switchInstructionModal: function(){
                renderCanvas.isDisplayingInstruction = true;
            }
        }
    });

    renderCanvas.resizeCanvas();
    renderCanvas.render();
    var startTime = new Date().getTime();
    (function(){
        var elapsedTime = new Date().getTime() - startTime;
	    if(renderCanvas.isRendering)
	        renderCanvas.render(elapsedTime);
	    requestAnimationFrame(arguments.callee);
    })();
}, false);
