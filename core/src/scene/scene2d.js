import InversionCircle from '../generators/2d/inversionCircle.js';
import HalfPlane from '../generators/2d/halfPlane.js';
import Scene from './scene.js';
import AddGeneratorCommand from './command/addGeneratorCommand.js';
import RemoveGeneratorCommand from './command/removeGeneratorCommand';

const GeneratorTypes = [InversionCircle.Type, HalfPlane.Type];

export default class Scene2d extends Scene {
    generators = {};
    constructor() {
        super();
        for(const genType of GeneratorTypes) {
            this.generators[genType] = [];
        }
    }

    removeGenerator(generator) {
        this.addCommand(new RemoveGeneratorCommand(this, generator));
    }

    addGenerator(generator) {
        this.addCommand(new AddGeneratorCommand(this, generator));
    }

    addInversionCircle(center, r) {
        this.addGenerator(new InversionCircle(center, r));
    }

    addHalfPlane(origin, normal) {
        this.addGenerator(new HalfPlane(origin, normal));
    }
}
