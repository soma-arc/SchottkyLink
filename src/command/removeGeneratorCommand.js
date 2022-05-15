import Vue from 'vue';

export default class RemoveGeneratorCommand {
    /**
     * @param {Scene} scene
     * @param {Generator} generator
     * @param {String} type
     * @param {Number} index
     */
    constructor(scene, generator, type, index) {
        this.scene = scene;
        this.generator = generator;
        this.type = type;
        this.index = index;

        this.scene.objects[type].splice(index, 1);
        this.generator.selected = false;
        this.scene.updateScene();
        this.scene.reRender();
    }

    undo() {
        this.scene.objects[this.type].splice(this.index, 0, this.generator);
        this.generator.selected = true;
        this.scene.selectedObj = this.generator;
        this.scene.updateScene();
        this.scene.reRender();
    }

    redo() {
        this.scene.objects[this.type].splice(this.index, 1);
        this.generator.selected = false;
        this.scene.selectedObj = undefined;
        this.scene.updateScene();
        this.scene.reRender();
    }
}
