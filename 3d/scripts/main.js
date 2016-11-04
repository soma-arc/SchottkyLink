const RAY_TRACER = 0;
const PATH_TRACER = 1;

var RenderCanvas = function(parentId, canvasId, templateId){
    this.parentPanel = document.getElementById(parentId);
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    this.template = nunjucks.compile(document.getElementById(templateId).text);
    this.uniformVariables = nunjucks.compile(document.getElementById('uniformVariables').text);
    this.kleinTemplate = nunjucks.compile(document.getElementById('distKleinTemplate').text);
    this.intersectFunctions = nunjucks.compile(document.getElementById('intersectFunctions').text);
    
    this.orbitPathTracerTemplate = nunjucks.compile(document.getElementById('3dOrbitPathTraceTemplate').text);

    this.renderProgram = this.gl.createProgram();
    attachShader(this.gl, 'render-frag', this.renderProgram, this.gl.FRAGMENT_SHADER);
    attachShader(this.gl, 'render-vert', this.renderProgram, this.gl.VERTEX_SHADER);
    this.renderProgram = linkProgram(this.gl, this.renderProgram);
    this.renderVertexAttribute = this.gl.getAttribLocation(this.renderProgram, 'a_vertex');


    var vertex = [
            -1, -1,
            -1, 1,
             1, -1,
             1, 1
    ];
    this.vertexBuffer = createVbo(this.gl, vertex);
    this.framebuffer = this.gl.createFramebuffer();
    
    this.camera = new Camera([0, 0, 0], 60, 1500, [0, 1, 0]);

    this.selectedObjectId = -1;
    this.selectedObjectIndex = -1;
    this.selectedComponentId = -1;
    
    this.isRendering = false;
    this.isMousePressing = false;
    this.prevMousePos = [0, 0];
    this.selectedAxis = -1;

    this.axisVecOnScreen;
    this.pressingKey = '';
    this.numIterations = 10;

    this.pixelRatio = window.devicePixelRatio;

    this.sphereCenterOnScreen;
    this.prevObject;

    this.renderer = RAY_TRACER;
    this.isSampling = false;
    
    this.numSamples = 0;
    this.textures = [];

    // texture for low resolution rendering
    this.isRenderingLowResolution = false;
    this.lowResTextures = [];
    this.lowResRatio = 0.25;
    
    this.displayGenerators = false;

    this.render = function(){};
    this.renderLowRes = function(){};
    this.renderTimerID = undefined;

    this.isDisplayingInstruction = false;
}

RenderCanvas.prototype = {
    resizeCanvas: function(width, height){
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.width = width * this.pixelRatio;
        this.canvas.height = height * this.pixelRatio;
    },
    resize: function(){
	this.canvas.width = this.parentPanel.clientWidth * this.pixelRatio;
	this.canvas.height = this.parentPanel.clientHeight * this.pixelRatio;
    },
    calcPixel: function(mouseEvent){
        var rect = mouseEvent.target.getBoundingClientRect();
        return [(mouseEvent.clientX - rect.left) * this.pixelRatio,
                (mouseEvent.clientY - rect.top) * this.pixelRatio];
    },
    updateSelection: function(scene, mouse){
        [this.selectedObjectId,
         this.selectedObjectIndex,
         this.selectedComponentId] = scene.getSelectedObject(this.camera.position,
                                                             calcRay(this.camera,
                                                                     this.canvas.width,
                                                                     this.canvas.height,
                                                                     mouse));
    },
    updateAxisVecOnScreen: function(scene){
        if(this.selectedObjectId != -1){
            var obj = scene.objects[this.selectedObjectId][this.selectedObjectIndex];
            this.prevObject = obj.clone();
            this.axisVecOnScreen = obj.calcAxisOnScreen(this.selectedComponentId,
                                                        this.camera,
                                                        this.canvas.width, this.canvas.height);
        }
    },
    releaseObject: function(){
        this.selectedObjectId = -1;
        this.selectedObjectIndex = -1;
        this.selectedComponentId = -1;
    },
    switchSampling: function(){
        this.numSamples = 0;
        this.isSampling = !this.isSampling;
    },
    update: function(){
        this.numSamples = 0;
        this.render();
    },
    getTracerTemplate: function(){
        if(this.renderer == PATH_TRACER)
            return this.orbitPathTracerTemplate;
        else
            return this.template;
    },
    setPathTracer: function(){
        this.renderer = PATH_TRACER;
    },
    setRayTracer: function(){
        this.renderer = RAY_TRACER;
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
    setUniformLocation: function(uniLocation, gl, program){
        // Sometimes first getUniformLocation takes too much time.
        var s = new Date().getTime();
        uniLocation.push(gl.getUniformLocation(program,
                                               'u_accTexture'));
        console.log('getUniLocation '+ (new Date().getTime() - s));
        uniLocation.push(gl.getUniformLocation(program,
                                               'u_numSamples'));
        uniLocation.push(gl.getUniformLocation(program,
                                               'u_textureWeight'));
        uniLocation.push(gl.getUniformLocation(program,
                                               'u_iResolution'));
        uniLocation.push(gl.getUniformLocation(program,
                                               'u_selectedObjectId'));
        uniLocation.push(gl.getUniformLocation(program,
                                               'u_selectedObjectIndex'));
        uniLocation.push(gl.getUniformLocation(program,
                                               'u_selectedComponentId'));
        uniLocation.push(gl.getUniformLocation(program,
                                               'u_selectedAxis'));
        uniLocation.push(gl.getUniformLocation(program, 'u_camera'));
        uniLocation.push(gl.getUniformLocation(program, 'u_numIterations'));
        uniLocation.push(gl.getUniformLocation(program,
                                               'u_displayGenerators'));

    },
    setUniformValues: function(uniLocation, gl, uniI, width, height){
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
        gl.uniform1i(uniLocation[uniI++], this.textures[0]);
        gl.uniform1i(uniLocation[uniI++], this.numSamples);
        gl.uniform1f(uniLocation[uniI++], this.numSamples / (this.numSamples + 1));
        gl.uniform2fv(uniLocation[uniI++], [width, height]);
        gl.uniform1i(uniLocation[uniI++], this.selectedObjectId);
        gl.uniform1i(uniLocation[uniI++], this.selectedObjectIndex);
        gl.uniform1i(uniLocation[uniI++], this.selectedComponentId);
        gl.uniform1i(uniLocation[uniI++], this.selectedAxis);
        gl.uniform3fv(uniLocation[uniI++], this.camera.getUniformArray());
        gl.uniform1i(uniLocation[uniI++], this.numIterations);
        gl.uniform1i(uniLocation[uniI++], this.displayGenerators);
        return uniI;
    }
};

function addMouseListenersToSchottkyCanvas(renderCanvas){
    var canvas = renderCanvas.canvas;
    var prevTheta, prevPhi;

    canvas.addEventListener("contextmenu", function(event){
        // disable right-click context-menu
        event.preventDefault();
    });

    canvas.addEventListener('mouseup', function(event){
        renderCanvas.isMousePressing = false;
        renderCanvas.isRendering = false;
    });

    canvas.addEventListener('mouseleave', function(event){
        renderCanvas.isMousePressing = false;
        renderCanvas.isRendering = false;
    });

    canvas.addEventListener('mousemove', function(event){
        event.preventDefault();
        if(!renderCanvas.isMousePressing) return;
        [px, py] = renderCanvas.calcPixel(event);
        if(event.button == 1){
            renderCanvas.camera.theta = prevTheta + (renderCanvas.prevMousePos[0] - px) * 0.01;
            renderCanvas.camera.phi = prevPhi -(renderCanvas.prevMousePos[1] - py) * 0.01;
            renderCanvas.camera.update();
            renderCanvas.numSamples = 0;
            renderCanvas.isRendering = true;
        }else if(event.button == 2){
            var dx = px - renderCanvas.prevMousePos[0];
            var dy = py - renderCanvas.prevMousePos[1];
            var vec = getFocalXYAxisVector(renderCanvas.camera,
                                           renderCanvas.canvas.width,
                                           renderCanvas.canvas.height);
            renderCanvas.camera.target = sum(renderCanvas.camera.prevTarget,
                                             sum(scale(vec[0], -dx * 5),
                                                 scale(vec[1], -dy * 5)));
            renderCanvas.camera.update();
            renderCanvas.numSamples = 0;
            renderCanvas.isRendering = true;
        }
    });

    canvas.addEventListener('mousedown', function(event){
        event.preventDefault();
        renderCanvas.isMousePressing = true;
        [px, py] = renderCanvas.calcPixel(event);
        renderCanvas.prevMousePos = [px, py];
        if(event.button == 1){
            prevTheta = renderCanvas.camera.theta;
            prevPhi = renderCanvas.camera.phi;
        }else if(event.button == 2){
            renderCanvas.camera.prevTarget = renderCanvas.camera.target;
        }
    }, false);

    canvas.addEventListener('mousewheel', function(event){
        event.preventDefault();
        if(event.wheelDelta > 0){
            renderCanvas.camera.eyeDist *= 0.75;
        }else{
            renderCanvas.camera.eyeDist *= 1.5;
        }
        renderCanvas.camera.update();
        renderCanvas.numSamples = 0;
	if(renderCanvas.isRenderingLowResolution)
            renderCanvas.renderLowRes();
	else
	    renderCanvas.render();
    }, false);
}

function setupSchottkyProgram(scene, renderCanvas){
    renderCanvas.renderTimerID = undefined;
    renderCanvas.numSamples = 0;
    var gl = renderCanvas.gl;
    var program = gl.createProgram();

    var renderContext = {uniformVariables: renderCanvas.uniformVariables,
                         distKlein: renderCanvas.kleinTemplate,
                         intersectFunctions: renderCanvas.intersectFunctions};
    scene.setRenderContext(renderContext);
    var renderTemplate = renderCanvas.getTracerTemplate();
    var shaderStr = renderTemplate.render(renderContext);
    attachShaderFromString(gl,
                           shaderStr,
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

function updateShaders(scene, schottkyCanvas, orbitCanvas){
    var s = new Date().getTime();
    setupSchottkyProgram(scene, schottkyCanvas);
    console.log('schott '+(new Date().getTime() - s));
    var s = new Date().getTime();
    setupSchottkyProgram(scene, orbitCanvas);
    console.log('orbit '+(new Date().getTime() - s));
    schottkyCanvas.render();
    orbitCanvas.render();
}

window.addEventListener('load', function(event){
    var scene = new Scene();
    //    scene.loadParameter(PRESET_PARAMS[0]);
    scene.loadParameterFromJson(PRESET_PARAMETERS[0]);
    var schottkyCanvas = new RenderCanvas('canvasParent1', 'schottkyCanvas', '3dSchottkyTemplate');
    var orbitCanvas = new RenderCanvas('canvasParent2', 'orbitCanvas', '3dOrbitTemplate');

    schottkyCanvas.resize();
    orbitCanvas.resize();
    
    addMouseListenersToSchottkyCanvas(schottkyCanvas);
    addMouseListenersToSchottkyCanvas(orbitCanvas);

    updateShaders(scene, schottkyCanvas, orbitCanvas);

    var resizeTimerId = undefined;
    var resized = function(){
        schottkyCanvas.resize();
        orbitCanvas.resize();
        updateShaders(scene, schottkyCanvas, orbitCanvas);
    }
    window.addEventListener('resize', function(event){
        window.clearTimeout(resizeTimerId);
        resizeTimerId = window.setTimeout(resized, 500);
    });
    
    window.addEventListener('keyup', function(event){
        schottkyCanvas.pressingKey = '';
        if(schottkyCanvas.selectedAxis != -1){
            schottkyCanvas.selectedAxis = -1;
            schottkyCanvas.render();
        }
//        schottkyCanvas.isRendering = false;
//        orbitCanvas.isRendering = false;
    });

    schottkyCanvas.canvas.addEventListener('mousedown', function(event){
        mouse = schottkyCanvas.calcPixel(event);
        if(event.button == 0){
            if((schottkyCanvas.pressingKey == 'z' ||
                schottkyCanvas.pressingKey == 'x' ||
                schottkyCanvas.pressingKey == 'c' ||
                schottkyCanvas.pressingKey == 's' ) &&
               (schottkyCanvas.selectedObjectId != -1)){
                return;
            }
            schottkyCanvas.updateSelection(scene, mouse);
            schottkyCanvas.render();
            schottkyCanvas.updateAxisVecOnScreen(scene);
        }
    });

    schottkyCanvas.canvas.addEventListener('mouseup', function(event){
        orbitCanvas.isMousePressing = false;
        orbitCanvas.isRendering = false;
        schottkyCanvas.updateAxisVecOnScreen(scene);
    });
    
    // Move Spheres on Schottky Canvas
    schottkyCanvas.canvas.addEventListener('mousemove', function(event){
        if(!schottkyCanvas.isMousePressing) return;
        if(event.button == 0){
            mouse = schottkyCanvas.calcPixel(event);
            if (schottkyCanvas.pressingKey != ''){
                scene.move(schottkyCanvas.selectedObjectId,
                           schottkyCanvas.selectedObjectIndex,
                           schottkyCanvas.selectedComponentId,
                           schottkyCanvas.selectedAxis,
                           mouse, schottkyCanvas.prevMousePos,
                           schottkyCanvas.prevObject,
                           schottkyCanvas.axisVecOnScreen,
                           schottkyCanvas.camera,
                           schottkyCanvas.canvas.width,
                           schottkyCanvas.canvas.height);
                
                schottkyCanvas.isRendering = true;
                orbitCanvas.isRendering = true;
                orbitCanvas.numSamples = 0;
            }
        }
    });

    schottkyCanvas.canvas.addEventListener('dblclick', function(event){
        event.preventDefault();
        if(schottkyCanvas.selectedObjectId != -1){
            scene.remove(schottkyCanvas.selectedObjectId,
                           schottkyCanvas.selectedObjectIndex);
            schottkyCanvas.releaseObject();
            updateShaders(scene, schottkyCanvas, orbitCanvas);
        }
    });
    window.addEventListener('keydown', function(event){
        schottkyCanvas.pressingKey = event.key;
        switch(event.key){
        case ' ':
            event.preventDefault();
            scene.addSchottkySphere(schottkyCanvas, orbitCanvas);
            break;
        case 'b':
            scene.addBaseSphere(schottkyCanvas, orbitCanvas);
            schottkyCanvas.render();
            orbitCanvas.render();
            break;
        case 'z':
            if(schottkyCanvas.selectedAxis != AXIS_X){
                schottkyCanvas.selectedAxis = AXIS_X;
                schottkyCanvas.render();
            }
            break;
        case 'x':
            if(schottkyCanvas.selectedAxis != AXIS_Y){
                schottkyCanvas.selectedAxis = AXIS_Y;
                schottkyCanvas.render();
            }
            break;
        case 'c':
            if(schottkyCanvas.selectedAxis != AXIS_Z){
                schottkyCanvas.selectedAxis = AXIS_Z;
                schottkyCanvas.render();
            }
            break;
        case 's':
            if(schottkyCanvas.selectedAxis != AXIS_RADIUS){
                schottkyCanvas.selectedAxis = AXIS_RADIUS;
            }
            break;
        case 'a':
            if(schottkyCanvas.selectedAxis != AXIS_THETA){
                schottkyCanvas.selectedAxis = AXIS_THETA;
                schottkyCanvas.render();
            }
            break;
        case 'q':
            if(schottkyCanvas.selectedAxis != AXIS_PHI){
                schottkyCanvas.selectedAxis = AXIS_PHI;
                schottkyCanvas.render();
            }
            break;
        case 'd':
            orbitCanvas.displayGenerators = !orbitCanvas.displayGenerators;
            orbitCanvas.render();
            break;
        case '+':
            orbitCanvas.numIterations++;
            orbitCanvas.update();
            break;
        case '-':
            if(orbitCanvas.numIterations != 0){
                orbitCanvas.numIterations--;
                orbitCanvas.update();
            }
            break;
        case 'ArrowRight':
            if(scene.objects[ID_TRANSFORM_BY_PLANES][0] == undefined) return;
            event.preventDefault();
            scene.objects[ID_TRANSFORM_BY_PLANES][0].phi += 10;
            scene.objects[ID_TRANSFORM_BY_PLANES][0].update();
            orbitCanvas.update();
            schottkyCanvas.render();
            break;
        case 'ArrowLeft':
            if(scene.objects[ID_TRANSFORM_BY_PLANES][0] == undefined) return;
            event.preventDefault();
            scene.objects[ID_TRANSFORM_BY_PLANES][0].phi -= 10;
            scene.objects[ID_TRANSFORM_BY_PLANES][0].update();
            orbitCanvas.update();
            schottkyCanvas.render();
            break;
        case 'ArrowUp':
            if(scene.objects[ID_TRANSFORM_BY_PLANES][0] == undefined) return;
            event.preventDefault();
            scene.objects[ID_TRANSFORM_BY_PLANES][0].theta += 10;
            scene.objects[ID_TRANSFORM_BY_PLANES][0].update();
            orbitCanvas.update();
            schottkyCanvas.render();
            break;
        case 'ArrowDown':
            if(scene.objects[ID_TRANSFORM_BY_PLANES][0] == undefined) return;
            event.preventDefault();
            scene.objects[ID_TRANSFORM_BY_PLANES][0].theta -= 10;
            scene.objects[ID_TRANSFORM_BY_PLANES][0].update();
            orbitCanvas.update();
            schottkyCanvas.render();
            break;
        case 'p':
            if(scene.objects[ID_TRANSFORM_BY_PLANES][0] == undefined) return;
            scene.objects[ID_TRANSFORM_BY_PLANES][0].twist += 10;
            scene.objects[ID_TRANSFORM_BY_PLANES][0].update();
            orbitCanvas.update();
            schottkyCanvas.render();
            break;
        case 'n':
            if(scene.objects[ID_TRANSFORM_BY_PLANES][0] == undefined) return;
            scene.objects[ID_TRANSFORM_BY_PLANES][0].twist -= 10;
            scene.objects[ID_TRANSFORM_BY_PLANES][0].update();
            orbitCanvas.update();
            schottkyCanvas.render();
            break;
        case 'y':
            if(scene.objects[ID_COMPOUND_PARABOLIC][0] == undefined) return;
            scene.objects[ID_COMPOUND_PARABOLIC][0].theta += 10;
            scene.objects[ID_COMPOUND_PARABOLIC][0].update();
            orbitCanvas.update();
            schottkyCanvas.render();
            break;
        case 'g':
            if(scene.objects[ID_COMPOUND_PARABOLIC][0] == undefined) return;
            scene.objects[ID_COMPOUND_PARABOLIC][0].theta -= 10;
            scene.objects[ID_COMPOUND_PARABOLIC][0].update();
            orbitCanvas.update();
            schottkyCanvas.render();
            break;
        case 'l':
            scene.saveSceneAsJson();
            break;
        case 'i':
            schottkyCanvas.render();
            var a = document.createElement('a');
            a.href = schottkyCanvas.canvas.toDataURL();
            a.download = "schottky.png"
            a.click();
            break;
        case 'o':
            orbitCanvas.render();
            var a = document.createElement('a');
            a.href = orbitCanvas.canvas.toDataURL();
            a.download = "orbit.png"
            a.click();
            break;
        case 'm':
            var reader = new FileReader();
            reader.addEventListener('load', function(){
                scene.loadParameterFromJson(JSON.parse(reader.result));
                updateShaders(scene, schottkyCanvas, orbitCanvas);
            });
            var a = document.createElement('input');
            a.type = 'file';
            a.addEventListener('change', function(event){
                var files = event.target.files;
                reader.readAsText(files[0]);
            });
            a.click();
            break;
        case 'r':
            orbitCanvas.switchSampling();
            break;
        case 'f':
            orbitCanvas.setPathTracer();
            setupSchottkyProgram(scene, orbitCanvas);
            orbitCanvas.render();
            break;
        case 'v':
            orbitCanvas.setRayTracer();
            setupSchottkyProgram(scene, orbitCanvas);
            orbitCanvas.render();
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
                schottkyCanvas.releaseObject();
                scene.loadParameterFromJson(param);
                updateShaders(scene, schottkyCanvas, orbitCanvas);
            }
            break;
        }});

    Vue.use(Keen);
    var app = new Vue({
        el: '#bodyElem',
        data: {
            scene: scene,
            schottkyCanvas: schottkyCanvas,
            orbitCanvas: orbitCanvas,
            presetList: PRESET_PARAMETERS,
            pixelDensities:[{text: "1.0", value: 1.0},
                            {text: "1.5", value: 1.5},
                            {text: "2.0", value: 2.0}],
            pixelDensitiesDefault: {text: String(window.devicePixelRatio),
                                    value: 1.0},
	    minIterations: 0
        },
        methods: {
            saveScene: function(){
                scene.saveSceneAsJson();
            },
            loadScene: function(){
                var reader = new FileReader();
                reader.addEventListener('load', function(){
                    scene.loadParameterFromJson(JSON.parse(reader.result));
                    updateShaders(scene, schottkyCanvas, orbitCanvas);
                });
                var a = document.createElement('input');
                a.type = 'file';
                a.addEventListener('change', function(event){
                    var files = event.target.files;
                    reader.readAsText(files[0]);
                });
                a.click();
            },
            saveOrbitImage: function(){
                orbitCanvas.render();
                var a = document.createElement('a');
                a.href = orbitCanvas.canvas.toDataURL();
                a.download = "orbit.png"
                a.click();
            },
            saveSchottkyImage: function(){
                schottkyCanvas.render();
                var a = document.createElement('a');
                a.href = schottkyCanvas.canvas.toDataURL();
                a.download = "schottky.png"
                a.click();
            },
            renderOrbit: function(){
                orbitCanvas.render();
            },
            orbitSwitchSampling: function(){
                orbitCanvas.render();
            },
            orbitSwitchGI: function(){
                if(orbitCanvas.renderer == RAY_TRACER){
                    orbitCanvas.setPathTracer();
                }else if(orbitCanvas.renderer == PATH_TRACER){
                    orbitCanvas.setRayTracer();
                }
                setupSchottkyProgram(scene, orbitCanvas);
                orbitCanvas.render();
            },
            presetSelected: function(option){
                scene.loadParameterFromJson(option);
                updateShaders(scene, schottkyCanvas, orbitCanvas);
            },
            pixelDensitySelected: function(option){
                orbitCanvas.pixelRatio = option.value;
                orbitCanvas.resize();
                schottkyCanvas.pixelRatio = option.value;
                schottkyCanvas.resize();
                updateShaders(scene, schottkyCanvas, orbitCanvas);
                orbitCanvas.render();
                schottkyCanvas.render();
            },
            addBaseSphere: function(){
                scene.addBaseSphere(schottkyCanvas, orbitCanvas);
            },
            addSchottkySphere: function(){
                scene.addSchottkySphere(schottkyCanvas, orbitCanvas);
            },
            addInfiniteSphere: function(){
                scene.addInfiniteSphere(schottkyCanvas, orbitCanvas, [0, 0, 0]);
            },
            addTranslation: function(){
                scene.addTranslation(schottkyCanvas, orbitCanvas, [0, 0, 0]);
            },
            addTransformBySpheres: function(){
                scene.addTransformBySpheres(schottkyCanvas, orbitCanvas, [0, 0, 0]);
            },
            addCompoundLoxodromic: function(){
                scene.addCompoundLoxodromic(schottkyCanvas, orbitCanvas, [0, 0, 0]);
            },
            switchInstructionModal: function(){
                orbitCanvas.isDisplayingInstruction = true;
            }
        },
    });


    (function(){

        if(schottkyCanvas.isRendering){
            schottkyCanvas.render();
        }
        if(orbitCanvas.isRendering){
	    if(orbitCanvas.isRenderingLowResolution)
		orbitCanvas.renderLowRes();
	    else
		orbitCanvas.render();
        }else if(orbitCanvas.isSampling &&
                 orbitCanvas.renderTimerID == undefined){
            orbitCanvas.render();
        }
        requestAnimationFrame(arguments.callee);
    })();
}, false);
