export default class RemoveGeneratorCommand {
    /**
     * @param {Scene} scene
     * @param {Generator} generator
     * @param {Number} index
     */
    constructor(scene, generator, index) {
        this.scene = scene;
        this.generator = generator;
        this.type = generator.name;
        this.index = index;

        this.scene.objects[this.type].splice(index, 1);
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
