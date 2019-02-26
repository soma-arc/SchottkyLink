import Canvas from './canvas.js';
import Vec2 from './vector2d.js';
import Vec3 from './vector3d.js';
import TextureHandler from './textureHandler.js';
import { CameraOnSphere } from './camera.js';
import { getWebGL2Context, createSquareVbo, attachShader,
         linkProgram, createRGBTextures } from './glUtils';

const RENDER_VERTEX = require('./shaders/render.vert');
const RENDER_FRAGMENT = require('./shaders/render.frag');

const RENDER_ORBIT_TMPL = require('./shaders/3dOrbit.njk.frag');
const RENDER_GENERATOR_TMPL = require('./shaders/3dGen.njk.frag');

export class Canvas3D extends Canvas {

    /**
     * @param {String} canvasId
     * @param {Scene3D} scene
     * @param {} renderFragmentTmpl
     */
    constructor(canvasId, scene, renderFragmentTmpl) {
        super(canvasId, scene);
        this.pixelRatio = 1;
        this.camera = new CameraOnSphere(new Vec3(0, 0, 0), Math.PI / 3,
                                         1500, new Vec3(0, 1, 0));
        this.cameraDistScale = 1.25;

        this.gl = getWebGL2Context(this.canvas);
        this.vertexBuffer = createSquareVbo(this.gl);

        this.renderFragmentTmpl = renderFragmentTmpl;

        this.renderCanvasProgram = this.gl.createProgram();
        attachShader(this.gl, RENDER_VERTEX,
                     this.renderCanvasProgram, this.gl.VERTEX_SHADER);
        attachShader(this.gl, RENDER_FRAGMENT,
                     this.renderCanvasProgram, this.gl.FRAGMENT_SHADER);
        linkProgram(this.gl, this.renderCanvasProgram);
        this.renderCanvasVAttrib = this.gl.getAttribLocation(this.renderCanvasProgram,
                                                             'a_vertex');

        this.lowResRatio = 0.5;
        this.numSamples = 0;
        this.maxSamples = 10;
        this.compileRenderShader();
        this.initRenderTextures();
        this.texturesFrameBuffer = this.gl.createFramebuffer();

        this.maxIterations = 12;

        this.mouseState = {
            isPressing: false,
            prevPosition: new Vec2(0, 0),
            button: -1
        };

        this.isKeepingSampling = false;
        this.isRenderingLowRes = false;
        this.renderTimer = undefined;

        this.renderGenerators = false;

        this.canvas.style.outline = 'none';
    }

    /**
     * Calculate screen coordinates from mouse position
     * [0, 0]x[width, height]
     * @param {number} mx
     * @param {number} my
     * @returns {Vec2}
     */
    calcCanvasCoord(mx, my) {
        const rect = this.canvas.getBoundingClientRect();
        return new Vec2((mx - rect.left) * this.pixelRatio,
                        (my - rect.top) * this.pixelRatio);
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
            this.camera.cameraDistance /= this.cameraDistScale;
        } else {
            this.camera.cameraDistance *= this.cameraDistScale;
        }
        this.camera.update();
        this.numSamples = 0;
        this.render();
    }

    mouseDownListener(event) {
        event.preventDefault();
        this.canvas.focus();
        this.mouseState.isPressing = true;
        const mouse = this.calcCanvasCoord(event.clientX, event.clientY);
        this.mouseState.prevPosition = mouse;
        this.mouseState.button = event.button;
        if (event.button === Canvas.MOUSE_BUTTON_WHEEL) {
            this.camera.prevThetaPhi = new Vec2(this.camera.theta, this.camera.phi);
        } else if (event.button === Canvas.MOUSE_BUTTON_RIGHT) {
            this.camera.prevTarget = this.camera.target;
        }
    }

    mouseDblClickListener(event) {
    }

    mouseUpListener(event) {
        this.mouseState.isPressing = false;
        this.isRendering = false;
        this.scene.updated = false;
    }

    mouseMoveListener(event) {
        event.preventDefault();
        if (!this.mouseState.isPressing) return;
        const mouse = this.calcCanvasCoord(event.clientX, event.clientY);
        if (this.mouseState.button === Canvas.MOUSE_BUTTON_WHEEL) {
            const prevThetaPhi = this.camera.prevThetaPhi;
            this.camera.theta = prevThetaPhi.x + (this.mouseState.prevPosition.x - mouse.x) * 0.01;
            this.camera.phi = prevThetaPhi.y - (this.mouseState.prevPosition.y - mouse.y) * 0.01;
            this.camera.update();
            this.numSamples = 0;
            this.isRendering = true;
        } else if (this.mouseState.button === Canvas.MOUSE_BUTTON_RIGHT) {
            const d = mouse.sub(this.mouseState.prevPosition);
            const [xVec, yVec] = this.camera.getFocalXYVector(this.canvas.width,
                                                              this.canvas.height);
            this.camera.target = this.camera.prevTarget.add(xVec.scale(-d.x).add(yVec.scale(-d.y)));
            this.camera.update();
            this.numSamples = 0;
            this.isRendering = true;
        }
    }

    compileRenderShader() {
        this.numSamples = 0;
        this.renderProgram = this.gl.createProgram();
        attachShader(this.gl, RENDER_VERTEX, this.renderProgram, this.gl.VERTEX_SHADER);
        attachShader(this.gl,
                     this.renderFragmentTmpl.render(this.scene.getContext()),
                     this.renderProgram, this.gl.FRAGMENT_SHADER);
        linkProgram(this.gl, this.renderProgram);
        this.renderVAttrib = this.gl.getAttribLocation(this.renderProgram, 'a_vertex');
        this.getRenderUniformLocations();
    }

    initRenderTextures() {
        this.renderTextures = createRGBTextures(this.gl, this.canvas.width,
                                                this.canvas.height, 2);
        this.lowResTextures = createRGBTextures(this.gl,
                                                this.canvas.width * this.lowResRatio,
                                                this.canvas.height * this.lowResRatio, 2);
    }

    getRenderUniformLocations() {
        this.uniLocations = [];
        const textureIndex = 0;
        this.imageTextures = TextureHandler.createTextures(this.gl, textureIndex);
        TextureHandler.setUniformLocation(this.gl, this.uniLocations, this.renderProgram);
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_accTexture'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_resolution'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_textureWeight'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_numSamples'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_maxIISIterations'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_renderGenerators'));
        this.camera.setUniformLocations(this.gl, this.uniLocations, this.renderProgram);
        this.scene.setUniformLocation(this.gl, this.uniLocations, this.renderProgram);
    }

    setRenderUniformValues(width, height, texture) {
        let i = 0;
        let textureIndex = 0;
        for (const tex of this.imageTextures) {
            this.gl.activeTexture(this.gl.TEXTURE0 + textureIndex);
            this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
            this.gl.uniform1i(this.uniLocations[i++], textureIndex);
            textureIndex++;
        }
        this.gl.activeTexture(this.gl.TEXTURE0 + textureIndex);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.uniform1i(this.uniLocations[i++], textureIndex);
        this.gl.uniform2f(this.uniLocations[i++], width, height);
        this.gl.uniform1f(this.uniLocations[i++], this.numSamples / (this.numSamples + 1));
        this.gl.uniform1f(this.uniLocations[i++], this.numSamples);
        this.gl.uniform1i(this.uniLocations[i++], this.maxIterations);
        this.gl.uniform1i(this.uniLocations[i++], this.renderGenerators);
        i = this.camera.setUniformValues(this.gl, this.uniLocations, i);
        i = this.scene.setUniformValues(this.gl, this.uniLocations, i);
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

    callRender() {
        if (this.isRenderingLowRes) {
            this.renderLowRes();
        } else {
            this.render();
        }
    }

    render() {
        this.renderToTexture(this.renderTextures,
                             this.canvas.width, this.canvas.height);
        this.renderTexturesToCanvas(this.renderTextures);
        if (this.isKeepingSampling &&
            this.numSamples < this.maxSamples) {
            this.numSamples++;
        }
    }

    renderLowRes() {
        if (this.renderTimer !== undefined) window.clearTimeout(this.renderTimer);
        this.renderToTexture(this.lowResTextures,
                             this.canvas.width * this.lowResRatio,
                             this.canvas.height * this.lowResRatio);
        this.renderTexturesToCanvas(this.lowResTextures);
        if (this.isKeepingSampling === false) {
            this.renderTimer = window.setTimeout(this.render.bind(this), 200);
        }
    }
}

export class GeneratorCanvas extends Canvas3D {
    constructor(canvasId, scene) {
        super(canvasId, scene, RENDER_GENERATOR_TMPL);
        this.operateScale = false;
    }

    mouseDownListener(event) {
        event.preventDefault();
        this.canvas.focus();
        this.mouseState.isPressing = true;
        const mouse = this.calcCanvasCoord(event.clientX, event.clientY);
        this.mouseState.prevPosition = mouse;
        this.mouseState.button = event.button;
        if (this.operateScale) {
            this.scene.keydown(mouse);
        } else if (event.button === Canvas.MOUSE_BUTTON_LEFT) {
            this.scene.select(this.canvas.width, this.canvas.height,
                              mouse, this.camera);
            this.render();
        } else if (event.button === Canvas.MOUSE_BUTTON_WHEEL) {
            this.camera.prevThetaPhi = new Vec2(this.camera.theta, this.camera.phi);
        } else if (event.button === Canvas.MOUSE_BUTTON_RIGHT) {
            this.camera.prevTarget = this.camera.target;
        }
    }

    mouseMoveListener(event) {
        event.preventDefault();
        const mouse = this.calcCanvasCoord(event.clientX, event.clientY);
        if (!this.mouseState.isPressing) return;
        if (this.operateScale) {
            const operated = this.scene.operateScale(this.canvas.width, this.canvas.height,
                                                     mouse, this.camera);
            if (operated) {
                this.scene.updated = true;
                this.numSamples = 0;
            } else {
                this.isRendering = false;
            }
        } else if (this.mouseState.button === Canvas.MOUSE_BUTTON_LEFT) {
            const moved = this.scene.move(this.canvas.width, this.canvas.height,
                                          mouse, this.camera);
            if (moved) {
                this.scene.updated = true;
                this.numSamples = 0;
            } else {
                this.isRendering = false;
            }
        } else if (this.mouseState.button === Canvas.MOUSE_BUTTON_WHEEL) {
            const prevThetaPhi = this.camera.prevThetaPhi;
            this.camera.theta = prevThetaPhi.x + (this.mouseState.prevPosition.x - mouse.x) * 0.01;
            this.camera.phi = prevThetaPhi.y - (this.mouseState.prevPosition.y - mouse.y) * 0.01;
            this.camera.update();
            this.numSamples = 0;
            this.isRendering = true;
        } else if (this.mouseState.button === Canvas.MOUSE_BUTTON_RIGHT) {
            const moveTargetScale = 5;
            const d = mouse.sub(this.mouseState.prevPosition);
            const [xVec, yVec] = this.camera.getFocalXYVector(this.canvas.width,
                                                              this.canvas.height);
            this.camera.target = this.camera.prevTarget.add(xVec.scale(-d.x * moveTargetScale).add(yVec.scale(-d.y * moveTargetScale)));
            this.camera.update();
            this.numSamples = 0;
            this.isRendering = true;
        }
    }

    keydownListener(event) {
        if (event.key === 's') {
            this.operateScale = true;
        }
    }

    keyupListener(event) {
        this.operateScale = false;
    }
}

export class OrbitCanvas extends Canvas3D {
    constructor(canvasId, scene) {
        super(canvasId, scene, RENDER_ORBIT_TMPL);
    }

    keydownListener(event) {
        if (event.key === '+') {
            this.maxIterations++;
            this.numSamples = 0;
            this.render();
        } else if (event.key === '-') {
            console.log('min')
            if (this.maxIterations < 0) return;
            this.maxIterations--;
            this.numSamples = 0;
            this.render();
        }
    }
}
