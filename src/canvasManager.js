import Canvas2d from './canvas2d.js';
import VideoManager from './videoManager.js';
import TextureManager from './textureManager.js';

export default class CanvasManager {
    /**
     *
     * @param {Scene} scene2d
     * @param {Scene} scene3d
     */
    constructor(scene2d, scene3d, textureManager, videoManager) {
        this.scene2d = scene2d;
        this.scene3d = scene3d;
        this.textureManager = textureManager;
        this.videoManager = videoManager;
        this.resizeCallback = this.resize.bind(this);

        this.canvas2d = new Canvas2d('canvas2d', this.scene2d, this.videoManager, this.textureManager);
    }

    init(app) {
        this.app = app;
        this.canvas2d.init();
        this.videoManager.init(this.canvas2d.gl);
        this.textureManager.init(this.canvas2d.gl);
        return this.textureManager.loadDefaultImages(this.canvas2d.gl);
    }

    render() {
        this.canvas2d.render();
    }

    resize() {
        if (this.mode() === CanvasManager.RENDER_2D) {
            this.canvas2d.resizeCanvas();
            this.canvas2d.initRenderTextures();
            this.canvas2d.render();
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
            if (this.canvas2d.isRendering || this.videoManager.streaming) {
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
