export default class RemoveAllGeneratorsCommand {
    constructor(scene) {
        this.scene = scene;
        this.objects = this.scene.objects;

        this.scene.objects = {};
        this.scene.selectedObj = undefined;
        this.scene.updateScene();
        this.scene.reRender();
    }

    undo() {
        this.scene.objects = this.objects;
        this.scene.updateScene();
        this.scene.reRender();
    }

    redo() {
        this.scene.objects = {};
        this.scene.selectedObj = undefined;
        this.scene.updateScene();
        this.scene.reRender();
    }
}
