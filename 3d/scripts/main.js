const RAY_TRACER = 0;
const PATH_TRACER = 1;

var RenderCanvas = function(canvasId, templateId){
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    this.template = nunjucks.compile(document.getElementById(templateId).text);
    this.uniformVariables = nunjucks.compile(document.getElementById('uniformVariables').text);
    this.kleinTemplate = nunjucks.compile(document.getElementById('distKleinTemplate').text);
    this.orbitPathTracerTemplate = nunjucks.compile(document.getElementById('3dOrbitPathTraceTemplate').text);
    
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

    this.pixelRatio = 1;//window.devicePixelRatio;

    this.sphereCenterOnScreen;
    this.prevObject;

    this.renderer = RAY_TRACER;
    this.isSampling = false;
    
    this.numSamples = 0;
    this.textures = [];
    
    this.displayGenerators = false;
}

RenderCanvas.prototype = {
    resizeCanvas: function(width, height){
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.width = width * this.pixelRatio;
        this.canvas.height = height * this.pixelRatio;
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
    }
};

const PRESET_PARAMS = [
    {
        baseSpheres:[new Sphere(0, 0, 0, 125)],
    },
    {
        schottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(-300, -300, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                         new Sphere(0, 0, -424.26, 300)],
        baseSpheres:[new Sphere(0, 0, 0, 125)],
        compoundParabolic:[new CompoundParabolic(new Sphere(0, 0, 1000, 500),
                                                 new Sphere(0, 0, 900, 600),
                                                 0)],
    },
    {
        schottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(-300, -300, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                         new Sphere(0, 0, -424.26, 300)],
        baseSpheres:[new Sphere(0, 0, 0, 125)],
        compoundLoxodromic:[new CompoundLoxodromic(new Sphere(10, 50, 900, 400),
                                                   new Sphere(100, 100, 900, 700),
                                                   [0, 1000, 100],
                                                   [100, -1000, 100],
                                                   [1000, 0, 90])]
    },
    {
        schottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                        ],
        baseSpheres:[new Sphere(0, 0, 0, 125)],
        infiniteSpheres:[new InfiniteSphere([0, 0, 150], 0, 0)],
    },
    {
        schottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(-300, -300, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                        ],
        baseSpheres:[new Sphere(0, 0, 0, 125)],
    },
    {
        schottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(-300, -300, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                         new Sphere(0, 0, -424.26, 300)],
        baseSpheres:[new Sphere(0, 0, 0, 125)],
    },
    {
        schottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(-300, -300, 0, 300),
                         new Sphere(300 + 300. * Math.sqrt(3), 0, 0, 300),
                         new Sphere(-300 - 300 * Math.sqrt(3), 0, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                         new Sphere(0, 0, -424.26, 300),
                        ],
        baseSpheres:[new Sphere(0, 0, 0, 125),
                     new Sphere(300 + 100 * Math.sqrt(3), 0, 0, 50),
                     new Sphere(-300 -100 * Math.sqrt(3), 0, 0, 50)],
    },
    {
        schottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(-300, -300, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                         new Sphere(0, 0, -424.26, 300)],
        baseSpheres:[new Sphere(0, 0, 0, 125)],
        transformBySpheres: [],
        transformByPlanes:[new ParabolicTransformation(-300, 300, 0, 0, 0)],
    },
    {
        schottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(-300, -300, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                         new Sphere(0, 0, -424.26, 300)],
        baseSpheres:[new Sphere(0, 0, 0, 125)],
        transformBySpheres:[new TransformBySpheres(new Sphere(0, 0, 1000, 500),
                                                   new Sphere(0, 0, 900, 600))],
    },
    {
        baseSpheres:[new Sphere(0, 0, 0, 125)],
        transformBySpheres:[new TransformBySpheres(new Sphere(0, 0, 1000, 500),
                                                   new Sphere(0, 0, 900, 600))],
        transformByPlanes:[new ParabolicTransformation(-300, 300, 0, 0, 0)],
    }
    
];

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
        if(event.wheelDelta > 0 && renderCanvas.camera.eyeDist > 100){
            renderCanvas.camera.eyeDist -= 100;
        }else{
            renderCanvas.camera.eyeDist += 100;
        }
        renderCanvas.camera.update();
        renderCanvas.numSamples = 0;
        renderCanvas.render();
    }, false);
}

function getUniLocations(scene, renderCanvas, gl, program){
    var uniLocation = new Array();
    var n = 0;
    uniLocation[n++] = gl.getUniformLocation(program,
                                             'u_accTexture');
    uniLocation[n++] = gl.getUniformLocation(program,
                                             'u_numSamples');
    uniLocation[n++] = gl.getUniformLocation(program,
                                             'u_textureWeight');
    uniLocation[n++] = gl.getUniformLocation(program,
                                             'u_iResolution');
    uniLocation[n++] = gl.getUniformLocation(program,
                                             'u_iGlobalTime');
    uniLocation[n++] = gl.getUniformLocation(program,
                                             'u_selectedObjectId');
    uniLocation[n++] = gl.getUniformLocation(program,
                                             'u_selectedObjectIndex');
    uniLocation[n++] = gl.getUniformLocation(program,
                                             'u_selectedComponentId');
    uniLocation[n++] = gl.getUniformLocation(program,
                                             'u_selectedAxis');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_eye');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_up');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_target');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_fov');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_numIterations');
    uniLocation[n++] = gl.getUniformLocation(program,
                                             'u_displayGenerators');
    scene.setUniformLocation(uniLocation, gl, program);
    
    return uniLocation;
}

function setUniformVariables(scene, renderCanvas, gl, uniLocation){
    var uniI = 0;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, renderCanvas.textures[0]);
    gl.uniform1i(uniLocation[uniI++], renderCanvas.textures[0]);
    gl.uniform1i(uniLocation[uniI++], renderCanvas.numSamples);
    gl.uniform1f(uniLocation[uniI++], renderCanvas.numSamples / (renderCanvas.numSamples + 1));
    gl.uniform2fv(uniLocation[uniI++], [renderCanvas.canvas.width, renderCanvas.canvas.height]);
    gl.uniform1f(uniLocation[uniI++], 0);
    gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedObjectId);
    gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedObjectIndex);
    gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedComponentId);
    gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedAxis);
    gl.uniform3fv(uniLocation[uniI++], renderCanvas.camera.position);
    gl.uniform3fv(uniLocation[uniI++], renderCanvas.camera.up);
    gl.uniform3fv(uniLocation[uniI++], renderCanvas.camera.target);
    gl.uniform1f(uniLocation[uniI++], renderCanvas.camera.fovDegree);
    gl.uniform1i(uniLocation[uniI++], renderCanvas.numIterations);
    gl.uniform1i(uniLocation[uniI++], renderCanvas.displayGenerators);

    uniI = scene.setUniformValues(uniLocation, gl, uniI);
}

function setupSchottkyProgram(scene, renderCanvas){
    renderCanvas.numSamples = 0;
    var gl = renderCanvas.gl;
    var program = gl.createProgram();
    var numSchottkySpheres = scene.objects[ID_SCHOTTKY_SPHERE].length;
    var numBaseSpheres = scene.objects[ID_BASE_SPHERE].length;
    var numTransformByPlanes = scene.objects[ID_TRANSFORM_BY_PLANES].length;
    var numTransformBySpheres = scene.objects[ID_TRANSFORM_BY_SPHERES].length;
    var numCompoundParabolic = scene.objects[ID_COMPOUND_PARABOLIC].length;
    var numCompoundLoxodromic = scene.objects[ID_COMPOUND_LOXODROMIC].length;

    var renderTemplate = renderCanvas.getTracerTemplate();
    var shaderStr = renderTemplate.render(
        {uniformVariables: renderCanvas.uniformVariables,
         distKlein: renderCanvas.kleinTemplate,
         numSchottkySpheres: numSchottkySpheres,
         numBaseSpheres: numBaseSpheres,
         numTransformByPlanes: numTransformByPlanes,
         numTransformBySpheres: numTransformBySpheres,
         numCompoundParabolic: numCompoundParabolic,
         numCompoundLoxodromic: numCompoundLoxodromic,
         numInfiniteSpheres: scene.objects[ID_INFINITE_SPHERE].length,
        });
    attachShaderFromString(gl,
                           shaderStr,
                           program,
                           gl.FRAGMENT_SHADER);
    attachShader(gl, 'vs', program, gl.VERTEX_SHADER);
    program = linkProgram(gl, program);

    var renderProgram = gl.createProgram();
    attachShader(gl, 'render-frag', renderProgram, gl.FRAGMENT_SHADER);
    attachShader(gl, 'render-vert', renderProgram, gl.VERTEX_SHADER);
    renderProgram = linkProgram(gl, renderProgram);

    renderCanvas.textures = [];
    var type = gl.getExtension('OES_texture_float') ? gl.FLOAT : gl.UNSIGNED_BYTE;
    for(var i = 0; i < 2; i++) {
        renderCanvas.textures.push(gl.createTexture());
        gl.bindTexture(gl.TEXTURE_2D, renderCanvas.textures[i]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
                      renderCanvas.canvas.width, renderCanvas.canvas.height,
                      0, gl.RGB, type, null);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    var uniLocation = getUniLocations(scene, renderCanvas, gl, program);
    
    var vertex = [
            -1, -1,
            -1, 1,
            1, -1,
            1, 1
    ];
    var vertexBuffer = createVbo(gl, vertex);
    var vAttribLocation = gl.getAttribLocation(program, 'a_vertex');
    var renderVertexAttribute = gl.getAttribLocation(program, 'a_vertex');
    
    var framebuffer = gl.createFramebuffer();

    var render = function(){
        gl.viewport(0, 0, renderCanvas.canvas.width, renderCanvas.canvas.height);
//        gl.clearColor(0.0, 0.0, 0.0, 1.0);
//        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        setUniformVariables(scene, renderCanvas, gl, uniLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
                                renderCanvas.textures[1], 0);
        gl.enableVertexAttribArray(vAttribLocation);
        gl.vertexAttribPointer(vAttribLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        renderCanvas.textures.reverse();

        gl.useProgram(renderProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, renderCanvas.textures[0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(renderVertexAttribute, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.flush();

        if(renderCanvas.isSampling)
            renderCanvas.numSamples++;
//        console.log(renderCanvas.numSamples);
    }

    return render;
}

function updateShaders(scene, schottkyCanvas, orbitCanvas){
    schottkyCanvas.render = setupSchottkyProgram(scene, schottkyCanvas);
    orbitCanvas.render = setupSchottkyProgram(scene, orbitCanvas);
    schottkyCanvas.render();
    orbitCanvas.render();
}

window.addEventListener('load', function(event){
    var scene = new Scene();
    scene.loadParameter(PRESET_PARAMS[0]);
    var schottkyCanvas = new RenderCanvas('canvas', '3dSchottkyTemplate');
    var orbitCanvas = new RenderCanvas('orbitCanvas', '3dOrbitTemplate');

    schottkyCanvas.resizeCanvas(256, 256);
    orbitCanvas.resizeCanvas(256, 256);
    
    addMouseListenersToSchottkyCanvas(schottkyCanvas);
    addMouseListenersToSchottkyCanvas(orbitCanvas);

    updateShaders(scene, schottkyCanvas, orbitCanvas);

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
        case 'r':
            orbitCanvas.switchSampling();
            break;
        case 'f':
            orbitCanvas.setPathTracer();
            updateShaders(scene, schottkyCanvas, orbitCanvas);
            break;
        case 'v':
            orbitCanvas.setRayTracer();
            updateShaders(scene, schottkyCanvas, orbitCanvas);
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
            var param = PRESET_PARAMS[i];
            if(param != undefined){
                schottkyCanvas.releaseObject();
                scene.loadParameter(param);
                updateShaders(scene, schottkyCanvas, orbitCanvas);
            }
            break;
        }});
    
    (function(){
        if(schottkyCanvas.isRendering){
            schottkyCanvas.render();
        }
        if(orbitCanvas.isRendering ||
           orbitCanvas.isSampling){
            orbitCanvas.render();
        }
        requestAnimationFrame(arguments.callee);
    })();
}, false);
