import Canvas2d from './canvas2d.js';

export default class CanvasManager {
    /**
     *
     * @param {Scene} scene
     */
    constructor(scene) {
        this.scene = scene;

        this.resizeCallback = this.resize.bind(this);
    }

    init() {
        this.canvas2d = new Canvas2d('canvas2d', this.scene);
    }

    render() {
        this.canvas2d.render();
    }

    resize() {
        this.canvas2d.resizeCanvas();
        this.canvas2d.render();
    }
}
