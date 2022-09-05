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
        this.scaleFactor = 1.25;
        this.translate = new Vec2(0, 0);

        this.maxIterations = 20;

        this.isPressingShift = false;

        // mouse
        this.mouseState = {
            isPressing: false,
            position: new Vec2(0, 0),
            prevPosition: new Vec2(0, 0),
            prevTranslate: new Vec2(0, 0),
            button: -1
        };

        this.scene.addSceneUpdateListener(this.compileRenderShader.bind(this));
        this.scene.addReRenderListener(this.render.bind(this));

        this.orbitOrigin = new Vec2(0, 0);
        this.draggingOrbitOrigin = false;

        this.isRenderingOrbitOrigin = false;
    }

    init() {
        this.canvas = document.getElementById(this.canvasId);
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
                this.scene.select(mouse, this.scale);
                this.render();
            }
        } else if (event.button === Canvas.MOUSE_BUTTON_WHEEL) {
            this.scene.addCircle(mouse, this.scale);
            this.compileRenderShader();
            this.render();
        }
        this.mouseState.prevPosition = mouse;
        this.mouseState.prevTranslate = this.translate;
        this.mouseState.isPressing = true;
    }

    mouseDblClickListener(event) {
        if (event.button === Canvas.MOUSE_BUTTON_LEFT) {
            this.scene.remove(this.calcSceneCoord(event.clientX, event.clientY));
        }
    }

    mouseUpListener(event) {
        this.mouseState.isPressing = false;
        this.isRendering = false;
        this.scene.mouseUp();
        this.draggingOrbitOrigin = false;
    }

    mouseLeaveListener(event) {
        this.mouseState.isPressing = false;
        this.isRendering = false;
    }

    mouseMoveListener(event) {
        // envent.button return 0 when the mouse is not pressed.
        // Thus we check if the mouse is pressed.
        if (!this.mouseState.isPressing) return;
        const mouse = this.calcSceneCoord(event.clientX, event.clientY);
        this.mouseState.position = mouse;
        if (this.mouseState.button === Canvas.MOUSE_BUTTON_LEFT) {
            if(this.draggingOrbitOrigin) {
                this.orbitOrigin = mouse;
                this.isRendering = true;
            } else {
                let moved;
                if(event.shiftKey) {
                    moved = this.scene.moveAlongAxis(this.mouseState);
                } else {
                    moved = this.scene.move(mouse);
                }
                if (moved) this.isRendering = true;
            }
        } else if (this.mouseState.button === Canvas.MOUSE_BUTTON_RIGHT) {
            this.translate = this.translate.sub(mouse.sub(this.mouseState.prevPosition));
            this.isRendering = true;
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
            this.isPressingShift = true;
            this.isRendering = true;
        } else if(event.ctrlKey && event.key === 'c') {
            this.scene.copy();
        } else if(event.ctrlKey && event.key === 'v') {
            if(this.scene.copiedGenerator !== undefined) {
                this.scene.paste();
            }
        }
    }

    keyupListener(event) {
        this.isPressingShift = false;
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
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_resolution'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_geometry'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_maxIISIterations'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_isPressingShift'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_orbitOrigin'));
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

        this.gl.uniform2f(this.uniLocations[i++], width, height);
        this.gl.uniform3f(this.uniLocations[i++],
                          this.translate.x, this.translate.y, this.scale);
        this.gl.uniform1i(this.uniLocations[i++], this.maxIterations);
        this.gl.uniform1i(this.uniLocations[i++], this.isPressingShift);
        this.gl.uniform2f(this.uniLocations[i++],
                          this.orbitOrigin.x,
                          this.orbitOrigin.y);
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
        if (parsedQuery['scale'] !== undefined) {
            this.scale = parseFloat(parsedQuery['scale']);
        }
        if (parsedQuery['translateX'] !== undefined) {
            this.translate.x = parseFloat(parsedQuery['translateX']);
        }
        if (parsedQuery['translateY'] !== undefined) {
            this.translate.y = parseFloat(parsedQuery['translateY']);
        }
    }
}
