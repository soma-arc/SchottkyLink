import Scene2D from './geometry2d/scene.js';
import Scene3D from './geometry3d/scene.js';
import Canvas2D from './canvas2d.js';
import { GeneratorCanvas, OrbitCanvas } from './canvas3d.js';

const RENDER_2D = 0;
const RENDER_3D = 1;

export default class canvasManager {
    constructor() {
        this.scene2d = new Scene2D();
        this.canvas2d = {};

        this.scene3d = new Scene3D();
        this.canvas3dGen = {};
        this.canvas3dOrb = {};

        this.mode = RENDER_2D;

        this.resizeCallback = this.resize.bind(this);
    }

    init() {
        // canvas should be initialize after initializing Vue
        this.canvas2d = new Canvas2D('canvas', this.scene2d);
        this.canvas2d.render();

        this.canvas3dGen = new GeneratorCanvas('canvas3dGen', this.scene3d);
        this.canvas3dOrb = new OrbitCanvas('canvas3dOrb', this.scene3d);
    }

    resize() {
        if (this.mode === RENDER_2D) {
            this.canvas2d.resizeCanvas();
            this.canvas2d.initRenderTextures();
            this.canvas2d.render();
        } else if (this.mode === RENDER_3D) {
            this.canvas3dGen.resizeCanvas();
            this.canvas3dOrb.resizeCanvas();
            this.canvas3dGen.initRenderTextures();
            this.canvas3dOrb.initRenderTextures();
            this.canvas3dGen.render();
            this.canvas3dOrb.render();
        }
    }

    switch2d() {
        if (this.mode === RENDER_2D) return;
        this.mode = RENDER_2D;
        window.setTimeout(this.resizeCallback, 1);
    }

    switch3d() {
        if (this.mode === RENDER_3D) return;
        this.mode = RENDER_3D;
        window.setTimeout(this.resizeCallback, 1);
    }

    renderLoop() {
        if (this.mode === RENDER_2D) {
            if (this.canvas2d.isRendering) {
                this.canvas2d.render();
            }
        } else if (this.mode === RENDER_3D) {
            if (this.scene3d.updated) {
                this.canvas3dOrb.callRender();
                this.canvas3dGen.callRender();
            } else {
                if (this.canvas3dOrb.isRendering) {
                    this.canvas3dOrb.callRender();
                }
                if (this.canvas3dGen.isRendering) {
                    this.canvas3dGen.callRender();
                }
            }
        }
    }

    clearCurrentScene() {
        if (this.mode === RENDER_2D) {
            this.scene2d.clear();
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        } else if (this.mode === RENDER_3D) {
            this.scene3d.clear();

            this.canvas3dGen.compileRenderShader();
            this.canvas3dGen.render();
            this.canvas3dOrb.compileRenderShader();
            this.canvas3dOrb.render();
        }
    }

    compile3dCanvases() {
        this.canvas3dGen.compileRenderShader();
        this.canvas3dGen.render();
        this.canvas3dOrb.compileRenderShader();
        this.canvas3dOrb.render();
    }

    get isRendering2d() {
        return this.mode === RENDER_2D;
    }

    get isRendering3d() {
        return this.mode === RENDER_3D;
    }
}
