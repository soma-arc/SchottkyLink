import assert from 'power-assert';
import { getWebGL2Context, createSquareVbo, attachShader,
         linkProgram, createRGBTextures } from './glUtils';
import Vec2 from './vector2d.js';
import TextureHandler from './textureHandler.js';
import Canvas from './canvas.js';

const RENDER_VERTEX = require('./shaders/render.vert');
const RENDER_FLIPPED_VERTEX = require('./shaders/renderFlipped.vert');
const RENDER_FRAGMENT = require('./shaders/render.frag');

const CIRCLES_SHADER_TMPL = require('./shaders/2dShader.njk.frag');

/**
 * canvas class
 * @param {} canvasId
 * @param {} scene
 */
export default class Canvas2D extends Canvas {
    constructor(canvasId, scene) {
        super(canvasId, scene)

        this.gl = getWebGL2Context(this.canvas);
        this.vertexBuffer = createSquareVbo(this.gl);

        // render to canvas
        this.renderCanvasProgram = this.gl.createProgram();
        attachShader(this.gl, RENDER_VERTEX,
                     this.renderCanvasProgram, this.gl.VERTEX_SHADER);
        attachShader(this.gl, RENDER_FRAGMENT,
                     this.renderCanvasProgram, this.gl.FRAGMENT_SHADER);
        linkProgram(this.gl, this.renderCanvasProgram);
        this.renderCanvasVAttrib = this.gl.getAttribLocation(this.renderCanvasProgram,
                                                             'a_vertex');

        this.productRenderProgram = this.gl.createProgram();
        attachShader(this.gl, RENDER_FLIPPED_VERTEX,
                     this.productRenderProgram, this.gl.VERTEX_SHADER);
        attachShader(this.gl, RENDER_FRAGMENT,
                     this.productRenderProgram, this.gl.FRAGMENT_SHADER);
        linkProgram(this.gl, this.productRenderProgram);
        this.productRenderVAttrib = this.gl.getAttribLocation(this.renderCanvasProgram,
                                                              'a_vertex');

        // render to texture
        this.compileRenderShader();
        this.initRenderTextures();
        this.texturesFrameBuffer = this.gl.createFramebuffer();

        this.productRenderFrameBuffer = this.gl.createFramebuffer();
        this.productRenderResolution = new Vec2(512, 512);
        this.initProductRenderTextures();

        // geometry
        this.scale = 1;
        this.scaleFactor = 1.25;
        this.translate = new Vec2(0, 0);

        this.maxIterations = 20;

        this.isRenderingGenerator = true;

        // mouse
        this.mouseState = {
            isPressing: false,
            prevPosition: new Vec2(0, 0),
            prevTranslate: new Vec2(0, 0),
            button: -1
        };
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
        console.log(this.mouseState.button);
        if (event.button === Canvas.MOUSE_BUTTON_LEFT) {
            this.scene.select(mouse, this.scale);
            this.render();
        } else if (event.button === Canvas.MOUSE_BUTTON_WHEEL) {
            // TODO: add circle
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
            const removed = this.scene.remove(this.calcSceneCoord(event.clientX, event.clientY));
            if(removed) {
                this.compileRenderShader();
                this.render();
            }
        }
    }

    mouseUpListener(event) {
        this.mouseState.isPressing = false;
        this.isRendering = false;
    }

    mouseMoveListener(event) {
        // envent.button return 0 when the mouse is not pressed.
        // Thus we check if the mouse is pressed.
        if (!this.mouseState.isPressing) return;
        const mouse = this.calcSceneCoord(event.clientX, event.clientY);
        if (this.mouseState.button === Canvas.MOUSE_BUTTON_LEFT) {
            const moved = this.scene.move(mouse);
            if (moved) this.isRendering = true;
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
            if (this.maxIterations < 1) return;
            this.maxIterations--;
            this.render();
        }
    }

    keyupListener(event) {
    }

    compileRenderShader() {
        this.renderProgram = this.gl.createProgram();
        attachShader(this.gl, RENDER_VERTEX, this.renderProgram, this.gl.VERTEX_SHADER);
        attachShader(this.gl, CIRCLES_SHADER_TMPL.render(this.scene.getContext()),
                     this.renderProgram, this.gl.FRAGMENT_SHADER);
        linkProgram(this.gl, this.renderProgram);
        this.renderVAttrib = this.gl.getAttribLocation(this.renderProgram, 'a_vertex');
        this.getRenderUniformLocations();
    }

    initRenderTextures() {
        this.renderTextures = createRGBTextures(this.gl, this.canvas.width,
                                                this.canvas.height, 2);
    }

    initProductRenderTextures() {
        this.productRenderTextures = createRGBTextures(this.gl,
                                                       this.productRenderResolution.x,
                                                       this.productRenderResolution.y, 2);
        this.productRenderResultTexture = createRGBTextures(this.gl,
                                                            this.productRenderResolution.x,
                                                            this.productRenderResolution.y, 1)[0];
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
                                                          'u_geometry'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_maxIISIterations'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_isRenderingGenerator'));
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
        textureIndex++;
        this.gl.activeTexture(this.gl.TEXTURE0 + textureIndex);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.uniform1i(this.uniLocations[i++], textureIndex);
        this.gl.uniform2f(this.uniLocations[i++], width, height);
        this.gl.uniform3f(this.uniLocations[i++],
                          this.translate.x, this.translate.y, this.scale);
        this.gl.uniform1i(this.uniLocations[i++], this.maxIterations);
        this.gl.uniform1i(this.uniLocations[i++], this.isRenderingGenerator);
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
}
