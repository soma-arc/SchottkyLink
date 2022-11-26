import Scene from '../scene.js';
import Generator from '../generator2d/generator.js';
import Vec2 from '../vector2d.js';

export default class MoveCommand {
    /**
     *
     * @param {Scene} scene
     * @param {Generator} generator
     * @param {Vec2} translation
     */
    constructor(scene, generator, translation) {
        this.scene = scene;
        this.generator = generator;
        this.translation = translation;
        this.revTranslation = translation.scale(-1);

        this.scene.reRender();
    }

    undo() {
        console.log('undo move');
        //this.generator.translate(this.revTranslation);
        this.generator.setPosition(this.generator.getPosition().add(this.revTranslation));
        this.generator.update();
        this.scene.reRender();
    }

    redo() {
        console.log('redo move');
        this.generator.setPosition(this.generator.getPosition().add(this.translation));
        this.generator.update();
        this.scene.reRender();
    }
}
