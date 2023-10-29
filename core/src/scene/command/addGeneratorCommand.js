import Command from './command.js';

export default class AddGeneratorCommand extends Command {
    constructor(scene, generator) {
        super();

        this.scene = scene;
        this.generator = generator;

        this.redo();
    }

    undo() {
        if (this.scene.generators[this.generator.type].length === 0) return;
        this.scene.generators[this.generator.type].pop();
    }

    redo() {
        this.scene.generators[this.generator.type].push(this.generator);
    }
}
