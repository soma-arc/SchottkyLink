import Command from './command.js';

export default class RemoveGeneratorCommand extends Command {
    constructor(scene, generator) {
        super();

        this.scene = scene;
        this.generator = generator;

        this.removeIndex = this.scene.objects[this.generator.type].findIndex((elem) => {
            return elem.id === this.generator.id;
        });
        
        this.redo();
    }

    undo() {
        this.scene.generators[this.generator.type].splice(this.removeIndex, 0, this.generator);
    }

    redo() {
        this.scene.generators[this.generator.type].splice(this.removeIndex, 1);
    }
}
