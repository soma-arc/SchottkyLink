import Canvas from './canvas.js';
import Vec2 from '../math/vec2.js';
import MouseState from './mouseState.js';

export default class Canavas2D extends Canvas {
    constructor(canvasId) {
        super(canvasId);
    }

    init() {
        this.canvasElem = document.getElementById(this.canvasId);
        this.canvasAspectRatio = this.canvasElem.width / this.canvasElem.height / 2;
    }

    enableDefaultMouseListeners() {
    }

    addEventListener(event, listener) {
        this.canvasElem.addEventListener(event, listener);
    }

    /**
     * Calculate screen coordinates from mouse position
     * [-width/2, width/2]x[-height/2, height/2]
     * @param {number} mx
     * @param {number} my
     * @returns {Vec2}
     */
    calcCanvasCoord(mx, my) {
        const rect = this.canvasElem.getBoundingClientRect();
        return new Vec2((((mx - rect.left) * this.pixelRatio) /
                         this.canvasElem.height - this.canvasAspectRatio),
                        -(((my - rect.top) * this.pixelRatio) /
                          this.canvasElem.height - 0.5));
    }

    calcSceneCoord(canvasCoord) {
        return canvasCoord.scale(this.scene.scale).add(this.scene.translation);
    }

    get width() {
        return this.canvasElem.width;
    }

    get height() {
        return this.canvasElem.height;
    }
}
