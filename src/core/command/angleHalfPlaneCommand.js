import Scene from '../scene.js';
import Generator from '../generator2d/generator.js';
import Vec2 from '../vector2d.js';

export default class AngleHalfPlaneCommand {
    /**
     *
     * @param {Scene} scene
     * @param {Generator} generator
     * @param {Vec2} prevNormal
     * @param {Vec2} normal
     */
    constructor(scene, generator, prevNormal, normal) {
        this.scene = scene;
        this.generator = generator;
        this.prevNormal = prevNormal;
        this.normal = normal;

        this.scene.reRender();
    }

    undo() {
        this.generator.normal = this.prevNormal;
        this.generator.update();
        this.scene.reRender();
    }

    redo() {
        this.generator.normal = this.normal;
        this.generator.update();
        this.scene.reRender();
    }
}
