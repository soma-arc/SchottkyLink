import Scene from '../scene.js';
import Generator from '../generator2d/generator.js';
import Vec2 from '../vector2d.js';

export default class LoxodromicCommand {
    /**
     *
     * @param {Scene} scene
     * @param {Loxodromic} loxodromic
     * @param {Vec2} translation
     */
    constructor(scene, loxodromic, translation) {
        this.scene = scene;
        this.loxodromic = loxodromic;
        this.translation = translation;
        this.revTranslation = translation.scale(-1);

        this.scene.reRender();
    }

    undo() {
        this.loxodromic.p = (this.loxodromic.p.add(this.revTranslation));
        this.loxodromic.update();
        this.scene.reRender();
    }

    redo() {
        this.loxodromic.p = (this.loxodromic.p.add(this.translation));
        this.loxodromic.update();
        this.scene.reRender();
    }
}
