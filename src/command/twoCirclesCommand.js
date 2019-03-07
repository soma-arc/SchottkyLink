import Scene from '../scene.js';
import Generator from '../generator2d/generator.js';
import Vec2 from '../vector2d.js';

export default class TwoCirclesCommand {
    /**
     *
     * @param {Scene} scene
     * @param {TwoCircles} twoCircles
     * @param {Vec2} translation
     */
    constructor(scene, twoCircles, translation) {
        this.scene = scene;
        this.twoCircles = twoCircles;
        this.translation = translation;
        this.revTranslation = translation.scale(-1);

        this.scene.reRender();
    }

    undo() {
        console.log('undo move');
        //this.generator.translate(this.revTranslation);
        this.twoCircles.c2.setPosition(this.twoCircles.c2.getPosition().add(this.revTranslation));
        this.twoCircles.c1.setPosition(this.twoCircles.c1.getPosition().add(this.revTranslation));
        this.twoCircles.update();
        this.scene.reRender();
    }

    redo() {
        console.log('redo move');
        this.twoCircles.c2.setPosition(this.twoCircles.c2.getPosition().add(this.translation));
        this.twoCircles.c1.setPosition(this.twoCircles.c1.getPosition().add(this.translation));
        this.twoCircles.update();
        this.scene.reRender();
    }
}
