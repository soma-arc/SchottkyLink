import Scene from '../scene.js';
import Generator from '../generator2d/generator.js';
import Vue from 'vue';

export default class AddGeneratorCommand {
    /**
     * @param {Scene} scene
     * @param {Generator} generator
     */
    constructor(scene, generator) {
        this.scene = scene;
        this.generator = generator;
        this.type = generator.name;

        const objList = this.scene.objects[this.type];
        if (objList === undefined) {
            Vue.set(this.scene.objects, this.type, []);
        }

        this.scene.objects[this.type].push(this.generator);
        this.scene.updateScene();
        this.scene.reRender();
    }

    undo() {
        if (this.scene.objects.length === 0) return;
        this.scene.objects[this.type].pop();
        this.scene.updateScene();
        this.scene.reRender();
    }

    redo() {
        this.scene.objects[this.type].push(this.generator);
        this.scene.updateScene();
        this.scene.reRender();
    }
}
