import Scene2D from './geometry2d/scene.js';
import Canvas2D from './canvas2d.js';

const RENDER_2D = 0;
const RENDER_3D = 1;

export default class canvasManager {
    constructor() {
        this.scene2d = new Scene2D();
        this.canvas2d = {};

        this.scene3d = {};
        this.canvas3dGen = {};
        this.canvas3dOrb = {};

        this.mode = RENDER_2D;

        this.resizeCallback = this.resize.bind(this);
    }

    init() {
        // canvas should be initialize after initializing Vue
        this.canvas2d = new Canvas2D('canvas', this.scene2d);
        this.canvas2d.render();
    }

    resize() {
        if (this.mode === RENDER_2D) {
            this.canvas2d.resizeCanvas();
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        } else if (this.mode === RENDER_3D) {

        }
    }

    switch2d() {
        if (this.mode === RENDER_2D) return;
        this.mode = RENDER_2D;
        window.setTimeout(this.resize, 1000);
    }

    switch3d() {
        if (this.mode === RENDER_3D) return;
        this.mode = RENDER_3D;
    }

    get isRendering2d() {
        return this.mode === RENDER_2D;
    }

    get isRendering3d() {
        return this.mode === RENDER_3D;
    }
}
