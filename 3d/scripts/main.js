var RenderCanvas = function(canvasId, templateId){
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    this.template = nunjucks.compile(document.getElementById(templateId).text);
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

    canvas.addEventListener("contextmenu", function(e){
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
        renderCanvas.render(0);
    }, false);
}

function setupSchottkyProgram(scene, renderCanvas){
    var gl = renderCanvas.gl;
    var program = gl.createProgram();
    var numSchottkySpheres = scene.objects[ID_SCHOTTKY_SPHERE].length;
    var numBaseSpheres = scene.objects[ID_BASE_SPHERE].length;
    var numTransformByPlanes = scene.objects[ID_TRANSFORM_BY_PLANES].length;
    var numTransformBySpheres = scene.objects[ID_TRANSFORM_BY_SPHERES].length;
    var numCompoundParabolic = scene.objects[ID_COMPOUND_PARABOLIC].length;
    var numCompoundLoxodromic = scene.objects[ID_COMPOUND_LOXODROMIC].length;
    var shaderStr = renderCanvas.template.render({numSchottkySpheres: numSchottkySpheres,
                                                  numBaseSpheres: numBaseSpheres,
                                                  numTransformByPlanes: numTransformByPlanes,
                                                  numTransformBySpheres: numTransformBySpheres,
                                                  numCompoundParabolic: numCompoundParabolic,
                                                  numCompoundLoxodromic: numCompoundLoxodromic});
    attachShaderFromString(gl,
                           shaderStr,
                           program,
                           gl.FRAGMENT_SHADER);
    attachShader(gl, 'vs', program, gl.VERTEX_SHADER);
    program = linkProgram(gl, program);

    var uniLocation = new Array();
    var n = 0;
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
    for(var i = 0 ; i < numSchottkySpheres ; i++){
        uniLocation[n++] = gl.getUniformLocation(program,
                                                 'u_schottkySphere'+ i);
    }
    for(var j = 0 ; j < numBaseSpheres ; j++){
        uniLocation[n++] = gl.getUniformLocation(program,
                                                 'u_baseSphere'+ j);
    }
    for(var i = 0 ; i < numTransformByPlanes ; i++){
        uniLocation[n++] = gl.getUniformLocation(program,
                                                 'u_transformByPlanes'+ i);
        uniLocation[n++] = gl.getUniformLocation(program,
                                                 'u_rotatePlaneMat3'+ i);
        uniLocation[n++] = gl.getUniformLocation(program,
                                                 'u_invRotatePlaneMat3'+ i);
        uniLocation[n++] = gl.getUniformLocation(program,
                                                 'u_twistPlaneMat3'+ i);
        uniLocation[n++] = gl.getUniformLocation(program,
                                                 'u_invTwistPlaneMat3'+ i);
    }
    for(var i = 0 ; i < numTransformBySpheres ; i++){
        uniLocation[n++] = gl.getUniformLocation(program,
                                                 'u_transformBySpheres'+ i);
    }
    for(var i = 0 ; i < numCompoundParabolic ; i++){
        uniLocation[n++] = gl.getUniformLocation(program,
                                                 'u_compoundParabolic'+ i);
        uniLocation[n++] = gl.getUniformLocation(program,
                                                 'u_compoundRotateMat3'+ i);
        uniLocation[n++] = gl.getUniformLocation(program,
                                                 'u_invCompoundRotateMat3'+ i);
    }
    for(var i = 0 ; i < numCompoundLoxodromic ; i++){
        uniLocation[n++] = gl.getUniformLocation(program,
                                                'u_compoundLoxodromic'+ i)
    }
    
    uniLocation[n++] = gl.getUniformLocation(program,
                                             'u_displayGenerators');

    var position = [
            -1, -1,
            -1, 1,
            1, -1,
            1, 1
    ];
    var vPosition = createVbo(gl, position);
    var vAttLocation = gl.getAttribLocation(program, 'position');
    gl.bindBuffer(gl.ARRAY_BUFFER, vPosition);
    gl.enableVertexAttribArray(vAttLocation);
    gl.vertexAttribPointer(vAttLocation, 2, gl.FLOAT, false, 0, 0);

    var switchProgram = function(){
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, vPosition);
        gl.enableVertexAttribArray(vAttLocation);
        gl.vertexAttribPointer(vAttLocation, 2, gl.FLOAT, false, 0, 0);
    }

    var render = function(elapsedTime){
        gl.viewport(0, 0, renderCanvas.canvas.width, renderCanvas.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var uniI = 0;
        gl.uniform2fv(uniLocation[uniI++], [renderCanvas.canvas.width, renderCanvas.canvas.height]);
        gl.uniform1f(uniLocation[uniI++], elapsedTime * 0.001);
        gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedObjectId);
        gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedObjectIndex);
        gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedComponentId);
        gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedAxis);
        gl.uniform3fv(uniLocation[uniI++], renderCanvas.camera.position);
        gl.uniform3fv(uniLocation[uniI++], renderCanvas.camera.up);
        gl.uniform3fv(uniLocation[uniI++], renderCanvas.camera.target);
        gl.uniform1f(uniLocation[uniI++], renderCanvas.camera.fovDegree);
        gl.uniform1i(uniLocation[uniI++], renderCanvas.numIterations);
        for(var i = 0 ; i < numSchottkySpheres ; i++){
            gl.uniform4fv(uniLocation[uniI++], scene.objects[ID_SCHOTTKY_SPHERE][i].getUniformArray());
        }
        for(var i = 0 ; i < numBaseSpheres ; i++){
            gl.uniform4fv(uniLocation[uniI++], scene.objects[ID_BASE_SPHERE][i].getUniformArray());
        }
        for(var i = 0 ; i < numTransformByPlanes ; i++){
            gl.uniform1fv(uniLocation[uniI++], scene.objects[ID_TRANSFORM_BY_PLANES][i].getUniformArray());
            gl.uniformMatrix3fv(uniLocation[uniI++], false, scene.objects[ID_TRANSFORM_BY_PLANES][i].rotationMat3);
            gl.uniformMatrix3fv(uniLocation[uniI++], false, scene.objects[ID_TRANSFORM_BY_PLANES][i].invRotationMat3);
            gl.uniformMatrix3fv(uniLocation[uniI++], false, scene.objects[ID_TRANSFORM_BY_PLANES][i].twistMat3);
            gl.uniformMatrix3fv(uniLocation[uniI++], false, scene.objects[ID_TRANSFORM_BY_PLANES][i].invTwistMat3);
        }
        for(var i = 0 ; i < numTransformBySpheres ; i++){
            gl.uniform4fv(uniLocation[uniI++], scene.objects[ID_TRANSFORM_BY_SPHERES][i].getUniformArray());
        }

        for(var i = 0 ; i < numCompoundParabolic ; i++){
            gl.uniform4fv(uniLocation[uniI++], scene.objects[ID_COMPOUND_PARABOLIC][i].getUniformArray());
            gl.uniformMatrix3fv(uniLocation[uniI++], false, scene.objects[ID_COMPOUND_PARABOLIC][i].rotationMat3);
            gl.uniformMatrix3fv(uniLocation[uniI++], false, scene.objects[ID_COMPOUND_PARABOLIC][i].invRotationMat3);
        }
        for(var i = 0 ; i < numCompoundLoxodromic ; i++){
            gl.uniform4fv(uniLocation[uniI++], scene.objects[ID_COMPOUND_LOXODROMIC][i].getUniformArray());
        }
        gl.uniform1i(uniLocation[uniI++], renderCanvas.displayGenerators);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.flush();
    }

    return [switchProgram, render];
}

function updateShaders(scene, schottkyCanvas, orbitCanvas){
    [schottkyCanvas.switch,
     schottkyCanvas.render] = setupSchottkyProgram(scene, schottkyCanvas);
    [orbitCanvas.switch,
     orbitCanvas.render] = setupSchottkyProgram(scene, orbitCanvas);
    schottkyCanvas.switch();
    orbitCanvas.switch();

    schottkyCanvas.render(0);
    orbitCanvas.render(0);
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
            schottkyCanvas.render(0);
        }
        schottkyCanvas.isRendering = false;
        orbitCanvas.isRendering = false;
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
            schottkyCanvas.render(0);
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
            schottkyCanvas.render(0);
            orbitCanvas.render(0);
            break;
        case 'z':
            if(schottkyCanvas.selectedAxis != AXIS_X){
                schottkyCanvas.selectedAxis = AXIS_X;
                schottkyCanvas.render(0);
            }
            break;
        case 'x':
            if(schottkyCanvas.selectedAxis != AXIS_Y){
                schottkyCanvas.selectedAxis = AXIS_Y;
                schottkyCanvas.render(0);
            }
            break;
        case 'c':
            if(schottkyCanvas.selectedAxis != AXIS_Z){
                schottkyCanvas.selectedAxis = AXIS_Z;
                schottkyCanvas.render(0);
            }
            break;
        case 's':
            if(schottkyCanvas.selectedAxis != AXIS_RADIUS){
                schottkyCanvas.selectedAxis = AXIS_RADIUS;
            }
            break;
        case 'd':
            orbitCanvas.displayGenerators = !orbitCanvas.displayGenerators;
            orbitCanvas.render(0);
            break;
        case '+':
            orbitCanvas.numIterations++;
            orbitCanvas.render(0);
            break;
        case '-':
            if(orbitCanvas.numIterations != 0){
                orbitCanvas.numIterations--;
                orbitCanvas.render(0);
            }
            break;
        case 'ArrowRight':
            if(scene.transformByPlanes[0] == undefined) return;
            event.preventDefault();
            scene.transformByPlanes[0].phi += 10;
            scene.transformByPlanes[0].update();
            orbitCanvas.render(0);
            schottkyCanvas.render(0);
            break;
        case 'ArrowLeft':
            if(scene.transformByPlanes[0] == undefined) return;
            event.preventDefault();
            scene.transformByPlanes[0].phi -= 10;
            scene.transformByPlanes[0].update();
            orbitCanvas.render(0);
            schottkyCanvas.render(0);
            break;
        case 'ArrowUp':
            if(scene.transformByPlanes[0] == undefined) return;
            event.preventDefault();
            scene.transformByPlanes[0].theta += 10;
            scene.transformByPlanes[0].update();
            orbitCanvas.render(0);
            schottkyCanvas.render(0);
            break;
        case 'ArrowDown':
            if(scene.transformByPlanes[0] == undefined) return;
            event.preventDefault();
            scene.transformByPlanes[0].theta -= 10;
            scene.transformByPlanes[0].update();
            orbitCanvas.render(0);
            schottkyCanvas.render(0);
            break;
        case 'p':
            if(scene.transformByPlanes[0] == undefined) return;
            scene.transformByPlanes[0].twist += 10;
            scene.transformByPlanes[0].update();
            orbitCanvas.render(0);
            schottkyCanvas.render(0);
            break;
        case 'n':
            if(scene.transformByPlanes[0] == undefined) return;
            scene.transformByPlanes[0].twist -= 10;
            scene.transformByPlanes[0].update();
            orbitCanvas.render(0);
            schottkyCanvas.render(0);
            break;
        case 'y':
            if(scene.compoundParabolic[0] == undefined) return;
            scene.compoundParabolic[0].theta += 10;
            scene.compoundParabolic[0].update();
            orbitCanvas.render(0);
            schottkyCanvas.render(0);
            break;
        case 'g':
            if(scene.compoundParabolic[0] == undefined) return;
            scene.compoundParabolic[0].theta -= 10;
            scene.compoundParabolic[0].update();
            orbitCanvas.render(0);
            schottkyCanvas.render(0);
            break;
        case 'l':
            scene.saveSceneAsJson();
            break;
        case 'i':
            schottkyCanvas.render(0);
            var a = document.createElement('a');
            a.href = schottkyCanvas.canvas.toDataURL();
            a.download = "schottky.png"
            a.click();
            break;
        case 'o':
            orbitCanvas.render(0);
            var a = document.createElement('a');
            a.href = orbitCanvas.canvas.toDataURL();
            a.download = "orbit.png"
            a.click();
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
    
    var startTime = new Date().getTime();
    (function(){
        var elapsedTime = new Date().getTime() - startTime;
        if(schottkyCanvas.isRendering){
            schottkyCanvas.render(elapsedTime);
        }
        if(orbitCanvas.isRendering){
            orbitCanvas.render(elapsedTime);
        }
        requestAnimationFrame(arguments.callee);
    })();
}, false);
