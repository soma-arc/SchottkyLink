import Canvas from './canvas.js';

export default class Canvas2d extends Canvas {
    constructor(canvasId, scene) {
        super(canvasId, scene);
        this.canvasId = canvasId;
        this.scene = scene;
    }

}
