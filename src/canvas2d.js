import { GetWebGL2Context, CreateSquareVbo, AttachShader,
         LinkProgram, CreateRGBATextures } from './glUtils';
import Canvas from './canvas.js';
import Vec2 from './vector2d.js';

const RENDER_VERTEX = require('./shaders/render.vert');
const RENDER_FLIPPED_VERTEX = require('./shaders/renderFlipped.vert');
const RENDER_FRAGMENT = require('./shaders/render.frag');

const CIRCLES_SHADER_TMPL = require('./shaders/2dShader.njk.frag');

export default class Canvas2d extends Canvas {
    constructor(canvasId, scene, videoManager, textureManager) {
        super(canvasId, scene);
        this.videoManager = videoManager;
        this.textureManager = textureManager;

        // geometry
        this.scale = 1;
        this.scaleFactor = 1.05;
        this.scaleMax = 100;
        this.scaleMin = 0;
        this.translate = new Vec2(0, 0);

        this.maxIterations = 20;

        // mouse
        this.mouseState = {
            isPressing: false,
            position: new Vec2(0, 0),
            prevPosition: new Vec2(0, 0),
            prevTranslate: new Vec2(0, 0),
            button: -1,
        };

        this.keyState = {
            isPressingShift: false,
            isPressingCtrl: false
        };

        this.scene.addSceneUpdateListener(this.compileRenderShader.bind(this));
        this.scene.addReRenderListener(this.render.bind(this));

        this.orbitOrigin = new Vec2(0, 0);
        this.draggingOrbitOrigin = false;

        this.isRenderingOrbitOrigin = false;

        this.queryParameter = undefined;

        this.displayMode = 'default';

        this.prevSelected = false;
        this.prevId = -1;

        this.backgroundColor = [0, 0, 0, 1];
        this.generatorBoundaryColor = [1, 1, 1];

        this.allowDeleteComponents = true;
        this.cursorType = 'allScroll';
        this.grab = false;
    }

    init() {
        this.canvas = document.getElementById(this.canvasId);

        function copyTouch(touch) {
            const o = {};
            o.identifier = touch.identifier;
            o.clientX = touch.clientX;
            o.clientY = touch.clientY;
            o.radiusX = touch.radiusX;
            o.radiusY = touch.radiusY;
            return o;
        }

        function touchIndexById(idToFind) {
            for (let i = 0; i < touchesList.length; i++) {
                const id = touchesList[i].identifier;
                if (id == idToFind) {
                    return i;
                }
            }
            return -1;    // not found
        }

        this.canvas.addEventListener('touchstart', handleStart.bind(this), false);
        this.canvas.addEventListener('touchend', handleEnd.bind(this), false);
        this.canvas.addEventListener('touchcancel', handleCancel.bind(this), false);
        this.canvas.addEventListener('touchmove', handleMove.bind(this), false);

        const touchesList = [];
        let longTapTimer = undefined;
        const longTapMillis = 500;
        const longTapMoveThreshold = 0.01;
        let startTouch = undefined;
        let prevDistance = -1;
        const zoomDistanceThreshold = 300;
        const touchSelectionScale = 3;
        function handleStart(event) {
            event.preventDefault();
            //console.log(event);
            //console.log('');
            //console.log('start '+ event.changedTouches.length);
            const touches = event.changedTouches;
            const touch = touches[0];

            const mouse = this.calcSceneCoord(touch.clientX + touch.radiusX,
                                              touch.clientY + touch.radiusY);
            // ジェネレータを選択していたかどうか, 選択していたジェネレータのIDを保存してから選択処理に移る
            this.prevSelected = this.scene.selectedState.isSelectingObj();
            if(this.prevSelected) this.prevId = this.scene.selectedState.selectedObj.id;
            // 指によって正確に選択するのは難しいので選択半径はtouchSelectionScaleで大きめにとる
            this.scene.select(mouse, this.scale, touchSelectionScale);
            this.render();

            this.mouseState.prevPosition = mouse;
            this.mouseState.prevTranslate = this.translate;

            // ロングタップ検出用タイマーがキャンセルされなければジェネレータの削除判定を行ない削除する
            if(this.allowDeleteComponents) {
                longTapTimer = setTimeout(() => {
                    this.scene.remove(mouse);
                }, longTapMillis);
            }
            console.log(touch);
            touchesList.push(copyTouch(touch));
            startTouch = copyTouch(touch);
        }

        // TODO: 指が二本から一本になったとき, prevPositionがかわってしまうのでtranslateがおかしくなる
        // 二本から一本にかわったら残った指とのprevPositionを計算しなおす
        function handleMove(event) {
            event.preventDefault();
            //console.log('move '+ event.changedTouches.length);
            const touches = event.changedTouches;
            const touch = touches[0];
            const mouse = this.calcSceneCoord(touch.clientX + touch.radiusX,
                                              touch.clientY + touch.radiusY);

            this.mouseState.position = mouse;
            if(touches.length === 1) {
                if(this.scene.selectionState.isSelectingObj()) {
                    this.scene.move(mouse);
                } else {
                    // ジェネレータ以外をドラッグしたときはシーンの平行移動
                    this.translate = this.translate.sub(mouse.sub(this.mouseState.prevPosition));
                }
                this.isRendering = true;
            } else if(touches.length === 2) {
                // 二本指によるジェスチャ
                const t1 = touchesList[0];
                const t2 = touchesList[1];
                const m1 = new Vec2(t1.clientX, t1.clientY);
                const m2 = new Vec2(t2.clientX, t2.clientY);
                const distance = Vec2.distance(m1, m2);
                // 指同士の間隔がある程度離れているならばピンチイン/アウトでズーム
                if(prevDistance > 0 && distance > zoomDistanceThreshold) {
                    if(distance > prevDistance) {
                        // 指を広げている
                        this.scale /= this.scaleFactor;
                    } else {
                        // 指を近づけている
                        this.scale *= this.scaleFactor;
                    }
                    this.scale = Math.min(this.scaleMax, Math.max(this.scaleMin, this.scale));
                }
                prevDistance = distance;
                this.isRendering = true;

                // update touches
                for (let i = 0; i < touches.length; i++) {
                    const idx = touchIndexById(touchesList[i].identifier);
                    if (idx >= 0) {
                        touchesList.splice(idx, 1, copyTouch(touches[i]));
                    }
                }
            }


            // ロングタップの検出. 閾値よりも大きく動いたらロングタップ判定をキャンセル
            // TODO scaleによって閾値がかわってしまうのでdistanceをclientX, clientYで計算する
            if(longTapTimer !== undefined &&
               Vec2.distance(this.mouseState.prevPosition, mouse) > longTapMoveThreshold) {
                clearTimeout(longTapTimer);
                longTapTimer = undefined;
            }
        }

        function handleEnd(event) {
            event.preventDefault();
            //console.log('end ' + event.changedTouches.length);
            const touches = event.changedTouches;
            const touch = touches[0];
            const mouse = this.calcSceneCoord(touch.clientX + touch.radiusX,
                                              touch.clientY + touch.radiusY);
            if (Vec2.distance(mouse, this.mouseState.prevPosition) < 0.001 && // 画面をタッチしてから動いていない(ドラッグしていない)
                this.prevSelected && //一つ前のタッチで選択状態になっている
                this.scene.selectedState.isSelectingObj() &&
                this.scene.selectedState.selectedObj.id === this.prevId && // 一つ前のmouseDownで選択したジェネレータと同一のものをクリック
                !this.scene.selectedState.selectedObj.isHandle(this.scene.selectedState.componentId)) { // 制御点をタップしたときは選択状態を解除しない
                this.scene.unselect();
                this.render();
            }
            this.mouseState.isPressing = false;
            this.isRendering = false;
            this.scene.mouseUp();

            if(longTapTimer !== undefined) {
                clearTimeout(longTapTimer);
                longTapTimer = undefined;
            }

            // タッチリストを削除
            console.log(touchesList);
            for (let i = 0; i < touchesList.length; i++) {
                const idx = touchIndexById(touchesList[i].identifier);
                if (idx >= 0) {
                    touchesList.splice(idx, 1);
                }
            }
            console.log('');
            prevDistance = -1;
        }

        function handleCancel(event) {
            event.preventDefault();
        }

        this.canvas.addEventListener('mousedown', this.boundMouseDownListener);
        this.canvas.addEventListener('mouseup', this.boundMouseUpListener);
        this.canvas.addEventListener('wheel', this.boundMouseWheelListener);
        this.canvas.addEventListener('mousemove', this.boundMouseMoveListener);
        this.canvas.addEventListener('mouseleave', this.boundMouseLeaveListener);
        this.canvas.addEventListener('dblclick', this.boundDblClickLisntener);
        this.canvas.addEventListener('keydown', this.boundKeydown);
        this.canvas.addEventListener('keyup', this.boundKeyup);
        this.canvas.addEventListener('contextmenu', event => event.preventDefault());

        this.resizeCanvas();
        this.gl = GetWebGL2Context(this.canvas);
        this.vertexBuffer = CreateSquareVbo(this.gl);

        this.renderCanvasProgram = this.gl.createProgram();
        AttachShader(this.gl, RENDER_VERTEX,
                     this.renderCanvasProgram, this.gl.VERTEX_SHADER);
        AttachShader(this.gl, RENDER_FRAGMENT,
                     this.renderCanvasProgram, this.gl.FRAGMENT_SHADER);
        LinkProgram(this.gl, this.renderCanvasProgram);
        this.renderCanvasVAttrib = this.gl.getAttribLocation(this.renderCanvasProgram,
                                                             'a_vertex');

        this.productRenderProgram = this.gl.createProgram();
        AttachShader(this.gl, RENDER_FLIPPED_VERTEX,
                     this.productRenderProgram, this.gl.VERTEX_SHADER);
        AttachShader(this.gl, RENDER_FRAGMENT,
                     this.productRenderProgram, this.gl.FRAGMENT_SHADER);
        LinkProgram(this.gl, this.productRenderProgram);
        this.productRenderVAttrib = this.gl.getAttribLocation(this.renderCanvasProgram,
                                                              'a_vertex');

        // render to texture
        this.compileRenderShader();
        this.initRenderTextures();
        this.texturesFrameBuffer = this.gl.createFramebuffer();

        this.productRenderFrameBuffer = this.gl.createFramebuffer();
        this.productRenderResolution = new Vec2(512, 512);
        this.initProductRenderTextures();
    }

    /**
     * Calculate screen coordinates from mouse position
     * scale * [-width/2, width/2]x[-height/2, height/2]
     * @param {number} mx
     * @param {number} my
     * @returns {Vec2}
     */
    calcCanvasCoord(mx, my) {
        const rect = this.canvas.getBoundingClientRect();
        return new Vec2(this.scale * (((mx - rect.left) * this.pixelRatio) /
                                      this.canvas.height - this.canvasRatio),
                        this.scale * -(((my - rect.top) * this.pixelRatio) /
                                       this.canvas.height - 0.5));
    }

    /**
     * Calculate coordinates on scene (consider translation) from mouse position
     * @param {number} mx
     * @param {number} my
     * @returns {Vec2}
     */
    calcSceneCoord(mx, my) {
        return this.calcCanvasCoord(mx, my).add(this.translate);
    }

    mouseWheelListener(event) {
        event.preventDefault();

        if (event.deltaY < 0) {
            this.scale /= this.scaleFactor;
        } else {
            this.scale *= this.scaleFactor;
        }

        this.scale = Math.min(this.scaleMax, Math.max(this.scaleMin, this.scale));
        this.render();
    }

    mouseDownListener(event) {
        event.preventDefault();
        this.canvas.focus();
        const mouse = this.calcSceneCoord(event.clientX, event.clientY);
        this.mouseState.button = event.button;

        if (event.button === Canvas.MOUSE_BUTTON_LEFT) {
            if (this.isRenderingOrbitOrigin &&
                Vec2.distance(mouse, this.orbitOrigin) < 0.01) {
                this.draggingOrbitOrigin = true;
            } else {
                this.prevSelected = this.scene.selectedState.isSelectingObj();
                if(this.prevSelected) this.prevId = this.scene.selectedState.selectedObj.id;
                this.scene.select(mouse, this.scale);
                this.render();
            }
        } else if (event.button === Canvas.MOUSE_BUTTON_WHEEL) {
            if(this.displayMode === 'iframe') return;
            this.scene.addCircle(mouse, this.scale);
            this.compileRenderShader();
            this.render();
        }
        this.mouseState.prevPosition = mouse;
        this.mouseState.prevTranslate = this.translate;
        this.mouseState.isPressing = true;
        if(this.cursorType === 'grab') {
            // カーソルがジェネレータの制御点や円周の上
            this.cursorType = 'grabbing';
        }
    }

    mouseDblClickListener(event) {
        if (event.button === Canvas.MOUSE_BUTTON_LEFT && this.allowDeleteComponents) {
            this.scene.remove(this.calcSceneCoord(event.clientX, event.clientY));
        }
    }

    mouseUpListener(event) {
        const mouse = this.calcSceneCoord(event.clientX, event.clientY);
        // 選択状態の解除
        if (Vec2.distance(mouse, this.mouseState.prevPosition) < 0.001 &&
            Vec2.distance(mouse, this.mouseState.prevTranslate) < 0.001 &&
            this.prevSelected && //一つ前のmouseDownで選択状態になっている
            this.scene.selectedState.isSelectingObj() &&
            this.scene.selectedState.selectedObj.id === this.prevId && // 一つ前のmouseDownで選択したジェネレータと同一のものをクリック
            !this.scene.selectedState.selectedObj.isHandle(this.scene.selectedState.componentId)) {
            this.scene.unselect();
            this.render();
        }

        this.mouseState.isPressing = false;
        this.isRendering = false;
        this.scene.mouseUp();
        this.draggingOrbitOrigin = false;
        const selectionState = this.scene.getComponentOnMouse(mouse, this.scale);
        if(this.isRenderingOrbitOrigin &&
           Vec2.distance(mouse, this.orbitOrigin) < 0.01) {
            // Orbit表示機能の原点を離したときのカーソル
            this.cursorType = 'grab';
        } else if(selectionState.isSelectingObj()) {
            if(selectionState.selectedObj.isBody(selectionState.componentId)) {
                // カーソルがジェネレータの制御点や円周以外の上
                this.cursorType = 'crosshair';
            } else {
                // カーソルがジェネレータの制御点や円周などの上
                this.cursorType = 'grab';
            }
        } else {
            // デフォルトのカーソル
            this.cursorType = 'allScroll';
        }
    }

    mouseLeaveListener(event) {
        this.mouseState.isPressing = false;
        this.isRendering = false;
    }

    mouseMoveListener(event) {
        clearTimeout(this.deselectTimer);
        const mouse = this.calcSceneCoord(event.clientX, event.clientY);
        // マウスカーソルがジェネレータ上にある時マウスカーソルを変更する
        const selectionState = this.scene.getComponentOnMouse(mouse, this.scale);
        if(this.isRenderingOrbitOrigin &&
           Vec2.distance(mouse, this.orbitOrigin) < 0.01) {
            // Orbit表示機能の原点をつかむときのカーソル
            if(this.mouseState.isPressing) {
                this.cursorType = 'grabbing';
            } else {
                this.cursorType = 'grab';
            }
        } else if(selectionState.isSelectingObj()) {
            if(selectionState.selectedObj.isBody(selectionState.componentId)) {
                // ジェネレータの制御点, 境界以外の上にあるときのカーソル
                this.cursorType = 'crosshair';
            } else {
                // ジェネレータの制御点, 円周などの上のカーソル
                if(this.mouseState.isPressing) {
                    this.cursorType = 'grabbing';
                } else {
                    this.cursorType = 'grab';
                }
            }
        } else {
            // デフォルトのカーソル
            if(this.cursorType !== 'grabbing') {
                this.cursorType = 'allScroll';
            }
        }
        // Mouse Dragging
        // envent.button return 0 when the mouse is not pressed.
        // Thus we check if the mouse is pressed.
        if (!this.mouseState.isPressing) return;
        this.mouseState.position = mouse;
        if(this.scene.isRenderingGenerator) {
            if (this.mouseState.button === Canvas.MOUSE_BUTTON_LEFT) {
                if(this.draggingOrbitOrigin) {
                    this.orbitOrigin = mouse;
                    this.isRendering = true;
                } else {
                    if(event.shiftKey || event.ctrlKey) {
                        this.scene.moveAlongAxis(this.mouseState, this.keyState);
                    } else if(this.scene.selectedState.isSelectingObj()){
                        this.scene.move(mouse);
                    } else {
                        // ジェネレータ以外をドラッグしたときはシーンの平行移動
                        this.translate = this.translate.sub(mouse.sub(this.mouseState.prevPosition));
                    }
                    this.isRendering = true;
                }
            }
        } else {
            if(event.ctrlKey) {
                this.scale += 0.1 * (this.mouseState.prevPosition.y - mouse.y);
                this.isRendering = true;
            } else {
                this.translate = this.translate.sub(mouse.sub(this.mouseState.prevPosition));
                this.isRendering = true;
            }
        }
    }

    keydownListener(event) {
        if (event.key === 's') {
            this.scene.toggleSnapMode();
        } else if (event.key === '+') {
            this.maxIterations++;
            this.render();
        } else if (event.key === '-') {
            if (this.maxIterations < 0) return;
            this.maxIterations--;
            this.render();
        } else if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
            console.log('redo');
            this.scene.redo();
        } else if (event.ctrlKey && event.key === 'z') {
            console.log('undo');
            this.scene.undo();
        } else if (event.key === 'h') {
            this.scene.addHalfPlane(new Vec2(0, 0), 1);
        } else if (event.key === 'l') {
            this.scene.addTwoCircles(new Vec2(0, 0), 1);
        } else if (event.key === 'x') {
            this.scene.addLoxodromic(new Vec2(0, 0), 1);
        } else if (event.shiftKey) {
            this.keyState.isPressingShift = true;
            this.isRendering = true;
        } else if(event.ctrlKey) {
            this.keyState.isPressingCtrl = true;
            this.isRendering = true;
            if(event.key === 'c') {
                this.scene.copy();
            } else if(event.key === 'v') {
                if(this.scene.copiedGenerator !== undefined) {
                    this.scene.paste();
                }
            }
        }
    }

    keyupListener(event) {
        this.keyState.isPressingShift = false;
        this.keyState.isPressingCtrl = false;
        this.isRendering = false;
        this.render();
    }

    compileRenderShader() {
        this.renderProgram = this.gl.createProgram();
        AttachShader(this.gl, RENDER_VERTEX, this.renderProgram, this.gl.VERTEX_SHADER);
        // attachShader(this.gl, CIRCLE_EDGE_SHADER_TMPL.render(this.scene.getContext()),
        //              this.renderProgram, this.gl.FRAGMENT_SHADER);
        //console.log(CIRCLES_SHADER_TMPL.render(this.scene.getContext()));
        AttachShader(this.gl, CIRCLES_SHADER_TMPL.render(this.scene.getContext()),
                     this.renderProgram, this.gl.FRAGMENT_SHADER);
        LinkProgram(this.gl, this.renderProgram);
        this.renderVAttrib = this.gl.getAttribLocation(this.renderProgram, 'a_vertex');
        this.getRenderUniformLocations();
    }

    initRenderTextures() {
        this.renderTextures = CreateRGBATextures(this.gl, this.canvas.width,
                                                 this.canvas.height, 2);
    }

    initProductRenderTextures() {
        this.productRenderTextures = CreateRGBATextures(this.gl,
                                                        this.productRenderResolution.x,
                                                        this.productRenderResolution.y, 2);
        this.productRenderResultTexture = CreateRGBATextures(this.gl,
                                                             this.productRenderResolution.x,
                                                             this.productRenderResolution.y, 1)[0];
    }

    getRenderUniformLocations() {
        this.uniLocations = [];
        let textureIndex = 0;
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_accTexture'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_videoTexture'));
        for(let i = 0; i < this.textureManager.textures.length; i++) {
            this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                              `u_imageTextures[${i}]`));
        }
        for(let i = 0; i < this.textureManager.canvasTextures.length; i++) {
            this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                              `u_canvasTextures[${i}]`));
        }
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_resolution'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_geometry'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_maxIISIterations'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_isPressingShift'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_isPressingCtrl'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_orbitOrigin'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_backgroundColor'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_generatorBoundaryColor'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_isRenderingOrbit'));
        this.scene.setUniformLocation(this.gl, this.uniLocations, this.renderProgram);
    }

    setRenderUniformValues(width, height, texture) {
        let i = 0;
        // acc texture
        let textureIndex = 0;
        this.gl.activeTexture(this.gl.TEXTURE0 + textureIndex);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.uniform1i(this.uniLocations[i++], textureIndex++);
        // video texture
        this.gl.activeTexture(this.gl.TEXTURE0 + textureIndex);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.videoManager.texture);
        if(this.videoManager.streaming) {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,
                               this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.videoManager.video);
        }
        this.gl.uniform1i(this.uniLocations[i++], textureIndex++);
        // image textures for orbit seed
        for(const tex of this.textureManager.textures) {
            this.gl.activeTexture(this.gl.TEXTURE0 + textureIndex);
            this.gl.bindTexture(this.gl.TEXTURE_2D, tex.textureObj);
            if(tex.isLoaded && tex.isCopiedToGLTexture === false) {
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,
                                   this.gl.RGBA, this.gl.UNSIGNED_BYTE, tex.img);
                tex.isCopiedToGLTexture = true;
            }
            this.gl.uniform1i(this.uniLocations[i++], textureIndex++);
        }

        for(const tex of this.textureManager.canvasTextures) {
            this.gl.activeTexture(this.gl.TEXTURE0 + textureIndex);
            this.gl.bindTexture(this.gl.TEXTURE_2D, tex.textureObj);
            if(tex.isLoaded && tex.isCopiedToGLTexture === false) {
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,
                                   this.gl.RGBA, this.gl.UNSIGNED_BYTE, tex.img);
                tex.isCopiedToGLTexture = true;
            }
            this.gl.uniform1i(this.uniLocations[i++], textureIndex++);
        }

        this.gl.uniform2f(this.uniLocations[i++], width, height);
        this.gl.uniform3f(this.uniLocations[i++],
                          this.translate.x, this.translate.y, this.scale);
        this.gl.uniform1i(this.uniLocations[i++], this.maxIterations);
        this.gl.uniform1i(this.uniLocations[i++], this.keyState.isPressingShift);
        this.gl.uniform1i(this.uniLocations[i++], this.keyState.isPressingCtrl);
        this.gl.uniform2f(this.uniLocations[i++],
                          this.orbitOrigin.x,
                          this.orbitOrigin.y);
        this.gl.uniform4f(this.uniLocations[i++],
                          this.backgroundColor[0],
                          this.backgroundColor[1],
                          this.backgroundColor[2],
                          this.backgroundColor[3]);
        this.gl.uniform3f(this.uniLocations[i++],
                          this.generatorBoundaryColor[0],
                          this.generatorBoundaryColor[1],
                          this.generatorBoundaryColor[2]);
        this.gl.uniform1f(this.uniLocations[i++], this.isRenderingOrbitOrigin);
        i = this.scene.setUniformValues(this.gl, this.uniLocations, i, this.scale);
    }

    renderToTexture(textures, width, height) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.texturesFrameBuffer);
        this.gl.viewport(0, 0, width, height);
        this.gl.useProgram(this.renderProgram);
        this.setRenderUniformValues(width, height, textures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0,
                                     this.gl.TEXTURE_2D, textures[1], 0);
        this.gl.enableVertexAttribArray(this.renderVAttrib);
        this.gl.vertexAttribPointer(this.renderVAttrib, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        textures.reverse();
    }

    renderTexturesToCanvas(textures) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.useProgram(this.renderCanvasProgram);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, textures[0]);
        const tex = this.gl.getUniformLocation(this.renderProgram, 'u_texture');
        this.gl.uniform1i(tex, textures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.renderCanvasVAttrib, 2,
                                    this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.flush();
    }

    renderProductAndSave() {
        this.productRenderResolution.x = this.canvas.width;
        this.productRenderResolution.y = this.canvas.height;

        this.initProductRenderTextures();
        this.renderToTexture(this.productRenderTextures,
                             this.productRenderResolution.x,
                             this.productRenderResolution.y);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.productRenderFrameBuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D,
                                     this.productRenderResultTexture, 0);
        this.gl.viewport(0, 0, this.productRenderResolution.x, this.productRenderResolution.y);
        this.gl.useProgram(this.productRenderProgram);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.productRenderTextures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.productRenderVAttrib, 2,
                                    this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.flush();

        this.saveImage(this.gl,
                       this.productRenderResolution.x,
                       this.productRenderResolution.y,
                       'schottky.png');
    }

    renderFlippedTex(textures, width, height) {
        this.gl.viewport(0, 0, width, height);
        this.gl.useProgram(this.productRenderProgram);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, textures[0]);
        const tex = this.gl.getUniformLocation(this.productRenderProgram, 'u_texture');
        this.gl.uniform1i(tex, textures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.renderVAttrib, 2,
                                    this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.flush();
    }

    renderAndGetCanvasURL(width) {
        const ratio = this.canvas.height / this.canvas.width;
        this.productRenderResolution.x = width;
        this.productRenderResolution.y = parseInt(ratio * width);

        console.log(this.productRenderResolution);
        console.log(width);

        this.initProductRenderTextures();
        this.renderToTexture(this.productRenderTextures,
                             this.productRenderResolution.x,
                             this.productRenderResolution.y);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.productRenderFrameBuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D,
                                     this.productRenderResultTexture, 0);
        this.renderFlippedTex(this.productRenderTextures,
                              this.productRenderResolution.x,
                              this.productRenderResolution.y);

        return this.getCanvasDataURL(this.gl,
                                     this.productRenderResolution.x,
                                     this.productRenderResolution.y);
    }

    render() {
        this.renderToTexture(this.renderTextures, this.canvas.width, this.canvas.height);
        this.renderTexturesToCanvas(this.renderTextures);
    }

    saveCanvas() {
        this.render();
        this.saveImage(this.gl,
                       this.canvas.width, this.canvas.height,
                       'schottky.png');
    }

    loadParameterFromQueryString(parsedQuery) {
        if(this.queryParameter === undefined) {
            this.queryParameter = parsedQuery;
        }
        if (parsedQuery['scale'] !== undefined) {
            const array = parsedQuery['scale'].split(',');
            if(array.length === 1) {
                this.scale = Math.max(0, parseFloat(array[0]));
            } else if(array.length === 3) {
                const a = array.map(parseFloat);
                this.scale = Math.max(0, a[0]);
                this.scaleMin = Math.max(0, a[1]);
                this.scaleMax = Math.max(0, a[2]);
            }
        }
        if (parsedQuery['translateX'] !== undefined) {
            this.translate.x = parseFloat(parsedQuery['translateX']);
        }
        if (parsedQuery['translateY'] !== undefined) {
            this.translate.y = parseFloat(parsedQuery['translateY']);
        }
        if (parsedQuery['maxIterations'] !== undefined) {
            this.maxIterations = Math.min(100, Math.max(0, parseInt(parsedQuery['maxIterations'])));
        }
        if (parsedQuery['backgroundColor'] !== undefined) {
            this.backgroundColor = parsedQuery['backgroundColor'].split(',').map(v=>{return Math.max(0, Math.min(1, parseFloat(v)));});
        }
        if (parsedQuery['generatorBoundaryColor'] !== undefined) {
            this.generatorBoundaryColor = parsedQuery['generatorBoundaryColor'].split(',').map(v=>{return Math.max(0, Math.min(1, parseFloat(v)));});
        }

        if (parsedQuery['allowDeleteComponent'] !== undefined) {
            this.allowDeleteComponents = parsedQuery['allowDeleteComponents'] === 'true';
        }
    }

    reloadParameter() {
        this.loadParameterFromQueryString(this.queryParameter);
    }

    exportAsQueryString() {
        let queryString = location.protocol +'//'+ location.hostname + location.pathname +'?';
        queryString += `displayMode=${this.displayMode}&`;
        queryString += `scale=${this.scale.toFixed(4)}&`;
        queryString += `translateX=${this.translate.x.toFixed(4)}&`;
        queryString += `translateY=${this.translate.y.toFixed(4)}&`;
        queryString += `maxIterations=${this.maxIterations}&`;
        queryString += `backgroundColor=${this.backgroundColor[0]},${this.backgroundColor[1]},${this.backgroundColor[2]},${this.backgroundColor[3]}&`;
        queryString += `generatorBoundaryColor=${this.generatorBoundaryColor[0]},${this.generatorBoundaryColor[1]},${this.generatorBoundaryColor[2]}&`;
        queryString += `allowDeleteComponents=${this.allowDeleteComponents}&`;
        queryString += this.scene.exportAsQueryString();
        return queryString;
    }
}
