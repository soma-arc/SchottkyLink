import Canvas2d from './canvas2d.js';

export default class CanvasManager {
    /**
     *
     * @param {Scene} scene2d
     * @param {Scene} scene3d
     */
    constructor(scene2d, scene3d) {
        this.scene2d = scene2d;
        this.scene3d = scene3d;
        this.resizeCallback = this.resize.bind(this);
    }

    init(app) {
        this.app = app;
        this.canvas2d = new Canvas2d('canvas2d', this.scene2d);
    }

    render() {
        this.canvas2d.render();
    }

    resize() {
        console.log(this.app.currentRoute);
        if (this.mode() === CanvasManager.RENDER_2D) {
            this.canvas2d.resizeCanvas();
            this.canvas2d.render();
        } else if (this.mode() === CanvasManager.RENDER_3D) {
        }
    }

    mode() {
        if (this.app.currentRoute === '/' ||
            this.app.currentRoute === '/2d') {
            return CanvasManager.RENDER_2D;
        } else if (this.app.currentRoute === '/3d') {
            return CanvasManager.RENDER_3D;
        }
        return CanvasManager.RENDER_NONE;
    }

    renderLoop() {
        if (this.mode() === CanvasManager.RENDER_2D) {
            if (this.canvas2d.isRendering) {
                this.canvas2d.render();
            }
        }
    }

    static get RENDER_2D() {
        return 0;
    }

    static get RENDER_3D() {
        return 1;
    }

    static get RENDER_NONE() {
        return -1;
    }
}
