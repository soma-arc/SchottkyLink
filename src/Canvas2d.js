import assert from 'power-assert';
import nunjucks from 'nunjucks';
import { getWebGL2Context, createSquareVbo, attachShader,
         linkProgram, createRGBTextures } from './glUtils';

const RENDER_VERTEX = require('./render.vert');
const RENDER_FRAGMENT = require('./render.frag');
const CIRCLES_SHADER = require('./circles.frag');

const CIRCLES_SHADER_TMPL = require('./2dShader.njk.frag');

export default class Canvas2D {
    constructor(canvasId, scene) {
        this.canvasId = canvasId;
        this.scene = scene;
        this.canvas = document.getElementById(canvasId);
        this.gl = getWebGL2Context(this.canvas);
        this.vertexBuffer = createSquareVbo(this.gl);
        this.canvasRatio = this.canvas.width / this.canvas.height / 2;
        this.pixelRatio = window.devicePixelRatio;

        // render to canvas
        this.renderCanvasProgram = this.gl.createProgram();
        attachShader(this.gl, RENDER_VERTEX,
                     this.renderCanvasProgram, this.gl.VERTEX_SHADER);
        attachShader(this.gl, RENDER_FRAGMENT,
                     this.renderCanvasProgram, this.gl.FRAGMENT_SHADER);
        linkProgram(this.gl, this.renderCanvasProgram);
        this.renderCanvasVAttrib = this.gl.getAttribLocation(this.renderCanvasProgram,
                                                             'a_vertex');

        // render to texture
        this.compileRenderShader();
        this.renderTextures = createRGBTextures(this.gl, this.canvas.width,
                                                this.canvas.height, 2);
        this.texturesFrameBuffer = this.gl.createFramebuffer();

        // geometry
        this.scale = 500;
        this.scaleFactor = 1.5;
        this.translate = [0, 0];

        // mouse
        this.mouseState = {
            isPressing: false,
            prevPosition: [0, 0],
        };
        this.boundMouseDownListener = this.mouseDownListener.bind(this);
        this.boundMouseUpListener = this.mouseUpListener.bind(this);
        this.boundMouseWheelListener = this.mouseWheelListener.bind(this);
        this.boundMouseMoveListener = this.mouseMoveListener.bind(this);
        this.boundDblClickLisntener = this.mouseDblClickListener.bind(this);
        this.canvas.addEventListener('mousedown', this.boundMouseDownListener);
        this.canvas.addEventListener('mouseup', this.boundMouseUpListener);
        this.canvas.addEventListener('mousewheel', this.boundMouseWheelListener);
        this.canvas.addEventListener('mousemove', this.boundMouseMoveListener);
        this.canvas.addEventListener('dblclick', this.boundDblClickLisntener);
        this.canvas.addEventListener('contextmenu', event => event.preventDefault());
    }

    // Calculate screen coordinates from mouse position
    calcCoord(mx, my) {
        assert.equal(typeof mx, 'number');
        assert.equal(typeof my, 'number');

        const rect = this.canvas.getBoundingClientRect();
        return [this.scale * (((mx - rect.left) * this.pixelRatio) /
                              this.canvas.height - this.canvasRatio) +
                this.translate[0],
                this.scale * -(((my - rect.top) * this.pixelRatio) /
                               this.canvas.height - 0.5) +
                this.translate[1]];
    }

    mouseWheelListener(event) {
        assert.ok(event instanceof MouseEvent);
        event.preventDefault();
        if (event.wheelDelta > 0) {
            this.scale /= this.scaleFactor;
        } else {
            this.scale *= this.scaleFactor;
        }
        this.render();
    }

    mouseDownListener(event) {
        assert.ok(event instanceof MouseEvent);
        event.preventDefault();
        const mouse = this.calcCoord(event.clientX, event.clientY);
        if (event.button === Canvas2D.MOUSE_BUTTON_LEFT) {
            // TODO: call selectObject
        } else if (event.button === Canvas2D.MOUSE_BUTTON_WHEEL) {
            // TODO: add circle
        }

        this.mouseState.prevPosition = mouse;
        this.mouseState.isPressing = true;
    }

    mouseDblClickListener(event) {
        assert.ok(event instanceof MouseEvent);
        if (event.button === Canvas2D.MOUSE_BUTTON_LEFT) {
            // TODO: remove object
        }
    }

    mouseUpListener(event) {
        assert.ok(event instanceof MouseEvent);
        this.mouseState.isPressing = false;
    }

    mouseMoveListener(event) {
        assert.ok(event instanceof MouseEvent);
        // envent.button return 0 when the mouse is not pressed.
        // Thus we check if the mouse is pressed.
        if (!this.mouseState.isPressing) return;
        const [mx, my] = this.calcCoord(event.clientX, event.clientY);
        if (event.button === Canvas2D.MOUSE_BUTTON_LEFT) {
            // move
        } else if (event.button === Canvas2D.MOUSE_BUTTON_RIGHT) {
            this.translate[0] -= mx - this.mouseState.prevPosition[0];
            this.translate[1] -= my - this.mouseState.prevPosition[1];
            this.render();
        }
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

    getRenderUniformLocations() {
        this.uniLocations = [];
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_accTexture'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_resolution'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_geometry'));
        this.scene.setUniformLocation(this.gl, this.uniLocations, this.renderProgram);
    }

    setRenderUniformValues(width, height, texture) {
        let i = 0;
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.uniform1i(this.uniLocations[i++], texture);
        this.gl.uniform2f(this.uniLocations[i++], width, height);
        this.gl.uniform3f(this.uniLocations[i++],
                          this.translate[0], this.translate[1], this.scale);
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

    render() {
        this.renderToTexture(this.renderTextures, this.canvas.width, this.canvas.height);
        this.renderTexturesToCanvas(this.renderTextures);
    }

    static get MOUSE_BUTTON_LEFT() {
        return 0;
    }

    static get MOUSE_BUTTON_WHEEL() {
        return 1;
    }

    static get MOUSE_BUTTON_RIGHT() {
        return 2;
    }
}
