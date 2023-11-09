/**
 * 与えられたフラグメントシェーダによってレンダリングを行なう
 * レンダリング結果は一度テクスチャに書き出される
 * 画像出力用に上下反転させた状態でレンダリングを行なうことができる
 */

import GLUtils from '../utils/glUtils.js';
import Vec2 from '../math/vec2.js';

const RENDER_VERTEX = require('./shaders/render.vert');
const RENDER_FLIPPED_VERTEX = require('./shaders/renderFlipped.vert');
const RENDER_FRAGMENT = require('./shaders/render.frag');

export default class Renderer {
    constructor(canvas, fragmentShaderTmpl, scene) {
        this.canvas = canvas;
        this.gl = GLUtils.GetWebGL2Context(canvas.canvasElem);
        this.fragmentShaderTmpl = fragmentShaderTmpl;
        this.scene = scene;

        this.setResolution(this.canvas.width, this.canvas.height);

        // vertex buffer objectはprogram間で使い回せる
        this.vertexBuffer = GLUtils.CreateSquareVbo(this.gl);

        this.setupRenderProgram();
        this.setupCanvasRenderProgram();
        this.setupUniformLocations();
    }

    setResolution(width, height) {
        this.resolution = new Vec2(width, height);
        this.initRenderTextures();
    }

    /**
     * Canvasに描画するためのリソースを準備する
     */
    setupCanvasRenderProgram() {
        this.renderCanvasProgram = this.gl.createProgram();
        GLUtils.AttachShader(this.gl, RENDER_VERTEX,
                             this.renderCanvasProgram, this.gl.VERTEX_SHADER);
        GLUtils.AttachShader(this.gl, RENDER_FRAGMENT,
                             this.renderCanvasProgram, this.gl.FRAGMENT_SHADER);
        GLUtils.LinkProgram(this.gl, this.renderCanvasProgram);
        this.renderCanvasVAttrib = this.gl.getAttribLocation(this.renderCanvasProgram,
                                                             'a_vertex');
    }

    /**
     * テクスチャを上下反転してキャンバスに描画するための準備
     */
    setupFlippedCanvasRenderProgram() {
        this.flippedRenderCanvasProgram = this.gl.createProgram();
        GLUtils.AttachShader(this.gl, RENDER_FLIPPED_VERTEX,
                     this.flippedRenderCanvasProgram, this.gl.VERTEX_SHADER);
        GLUtils.AttachShader(this.gl, RENDER_FRAGMENT,
                     this.flippedRenderCanvasProgram, this.gl.FRAGMENT_SHADER);
        GLUtils.LinkProgram(this.gl, this.flippedRenderCanvasProgram);
        this.flippedRenderVAttrib = this.gl.getAttribLocation(this.flippedRenderCanvasProgram,
                                                              'a_vertex');
        this.flippedRenderFramebuffer = this.gl.createFramebuffer();
    }

    /**
     * 与えられたシェーダーテンプレートにシーンのコンテクストを与えてコードを生成, コンパイルする
     */
    setupRenderProgram() {
        this.renderProgram = this.gl.createProgram();
        GLUtils.AttachShader(this.gl, RENDER_VERTEX, this.renderProgram, this.gl.VERTEX_SHADER);
        GLUtils.AttachShader(this.gl, this.fragmentShaderTmpl.render(this.scene.getSceneInfo()),
                             this.renderProgram, this.gl.FRAGMENT_SHADER);
        GLUtils.LinkProgram(this.gl, this.renderProgram);
        this.renderVAttrib = this.gl.getAttribLocation(this.renderProgram, 'a_vertex');
        this.renderFramebuffer = this.gl.createFramebuffer();
    }

    initRenderTextures() {
        this.renderTextures = GLUtils.CreateRGBAUnsignedByteTextures(this.gl,
                                                                     this.resolution.x,
                                                                     this.resolution.y, 2);
    }

    setupUniformLocations() {
        this.uniforms = [];
        this.uniforms.push(this.gl.getUniformLocation(this.renderProgram, 'u_resolution'));

        this.uniforms.push(this.gl.getUniformLocation(this.renderProgram, 'u_accTexture'));

        // for(let i = 0; i < this.textures.length; i++) {
        //     this.uniforms.push(this.gl.getUniformLocation(this.renderProgram, 'u_imageTexture'));
        // }

        this.scene.getUniformLocations(this.gl, this.renderProgram);
    }

    /**
     * @param {number} width
     * @param {number} height
     * @param {WebGLTexture} accTexture サンプルしてきたテクスチャ
     */
    setRenderUniformValues(width, height, accTexture) {
        this.gl.uniform2f(this.uniforms[0], width, height);

        // srcとなるテクスチャはTEXTURE0固定とする
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, accTexture);
        this.gl.uniform1i(this.uniforms[1], 0);

        this.scene.setUniformValues(this.gl);
    }

    /**
     * サンプルしていくためにテクスチャを二枚用意し, 出力先のテクスチャを入れ替えてレンダリングしていく
     * @param {[WebGLTexture, WebGLTexture]} textures
     * @param {number} width
     * @param {number} height
     */
    renderToTexture(textures, width, height) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.renderFramebuffer);
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

    /**
     * テクスチャをキャンバスに書き出す(フレームバッファをnullにして書き出す)
     * @param {[WebGLTexture, WebGLTexture]} textures
     * @param {number} width
     * @param {number} height
     */
    renderToCanvas(textures, width, height) {
        // フレームバッファは既にnullであることを前提にしている
        // renderToTextureでnullがセットされているはずなので, ここではbinfFramebufferしない
        // this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        this.gl.viewport(0, 0, width, height);
        this.gl.useProgram(this.renderCanvasProgram);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, textures[0]);
        this.gl.uniform1i(this.gl.getUniformLocation(this.renderProgram, 'u_texture'),
                          textures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.renderCanvasVAttrib, 2,
                                    this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.flush();
    }

    /**
     * 
     * @param {[WebGLTexture, WebGLTexture]} textures
     * @param {number} width
     * @param {number} height
     */
    renderFlippedTexture(textures, width, height) {
        this.gl.viewport(0, 0, width, height);
        this.gl.useProgram(this.flippedRenderCanvasProgram);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, textures[0]);
        this.gl.uniform1i(this.gl.getUniformLocation(this.flippedRenderCanvasProgram,
                                                     'u_texture'),
                          textures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.flippedRenderVAttrib, 2,
                                    this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.flush();
    }

    render() {
        this.renderToTexture(this.renderTextures,
                             this.resolution.x, this.resolution.y);
        this.renderToCanvas(this.renderTextures,
                            this.resolution.x, this.resolution.y);
    }
}
