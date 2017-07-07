import Canvas from './canvas.js';
import Vec2 from './vector2d.js';
import Vec3 from './vector3d.js';
import TextureHandler from './textureHandler.js';
import { CameraOnSphere } from './camera.js';
import { getWebGL2Context, createSquareVbo, attachShader,
         linkProgram, createRGBTextures } from './glUtils';

const RENDER_VERTEX = require('./shaders/render.vert');
const RENDER_FRAGMENT_TMPL = require('./shaders/3dOrbit.njk.frag');

export default class Canvas3D extends Canvas {
    constructor(canvasId, scene) {
        super(canvasId, scene);
        this.camera = new CameraOnSphere(new Vec3(0, 0, 0), Math.PI / 3,
                                         100, new Vec3(0, 1, 0));

        this.numSamples = 0;
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

    }

    mouseDownListener(event) {
        event.preventDefault();
    }

    mouseDblClickListener(event) {
    }

    mouseUpListener(event) {
        this.mouseState.isPressing = false;
    }

    mouseMoveListener(event) {
    }

    compileRenderShader() {
        this.renderProgram = this.gl.createProgram();
        attachShader(this.gl, RENDER_VERTEX, this.renderProgram, this.gl.VERTEX_SHADER);
        attachShader(this.gl, RENDER_FRAGMENT_TMPL.render({}),
                     this.renderProgram, this.gl.FRAGMENT_SHADER);
        linkProgram(this.gl, this.renderProgram);
        this.renderVAttrib = this.gl.getAttribLocation(this.renderProgram, 'a_vertex');
        this.renderTextures = createRGBTextures(this.gl, this.canvas.width,
                                                this.canvas.height, 2);
        this.getRenderUniformLocations();
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
        this.camera.setUniformLocations(this.gl, this.uniLocations, this.renderProgram);
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
        this.gl.uniform3f(this.uniLocations[i++],
                          this.translate.x, this.translate.y, this.scale);
        this.gl.uniform1i(this.uniLocations[i++], this.maxIterations);
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

    render() {
        this.renderToTexture(this.renderTextures, this.canvas.width, this.canvas.height);
        this.renderTexturesToCanvas(this.renderTextures);
    }
}
