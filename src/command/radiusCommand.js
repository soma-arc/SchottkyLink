import Scene from '../scene.js';
import Generator from '../generator2d/generator.js';
import Vec2 from '../vector2d.js';

export default class RadiusCommand {
    /**
     *
     * @param {Scene} scene
     * @param {Generator} generator
     * @param {Number} prevRadius
     * @param {Number} radius
     */
    constructor(scene, generator, prevRadius, radius) {
        this.scene = scene;
        this.generator = generator;
        this.prevRadius = prevRadius;
        this.radius = radius;

        this.scene.reRender();
    }

    undo() {
        this.generator.r = this.prevRadius;
        this.generator.update();
        this.scene.reRender();
    }

    redo() {
        console.log('redo move');
        this.generator.r = this.radius;
        this.generator.update();
        this.scene.reRender();
    }
}
