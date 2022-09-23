import Vec2 from '../vector2d.js';
import Generator from './generator.js';
import SelectionState from './selectionState.js';
import OrbitSeed from './orbitSeed.js';

export default class CanvasSeed extends OrbitSeed {
    /**
     *       width
     *   -------------
     *   |           |
     *   |-----------| height
     *   |           |
     *   +------------
     * corner
     * @param {number} cornerX
     * @param {number} cornerY
     * @param {number} width
     * @param {number} height
     */
    constructor(cornerX, cornerY, width, height) {
        super(cornerX, cornerY, width, height);
        this.textureIndex = 0;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_canvasSeed${index}.corner`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_canvasSeed${index}.size`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_canvasSeed${index}.ui`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_canvasSeed${index}.selected`));
    }

    static loadFromArray(array) {
        const gen = new CanvasSeed(array[0], array[1], // cornerX, cornerY
                             array[2], array[3]);// width, height
        if(array.length === 5 && array[4] === 1) {
            gen.isFixed = true;
        }
        return gen;
    }

    exportAsQueryString() {
        return `CanvasSeed[]=${this.corner.x.toFixed(this.digits)},${this.corner.y.toFixed(this.digits)},${this.size.x.toFixed(this.digits)},${this.size.y.toFixed(this.digits)}`;
    }

    cloneDeeply() {
        const canvasSeed = new CanvasSeed(this.corner.x, this.corner.y,
                                          this.size.x, this.size.y);
        canvasSeed.textureIndex = this.textureIndex;
        return canvasSeed;
    }

    static loadJson(obj, scene) {
        const nh = new CanvasSeed(obj.corner[0], obj.corner[1],
                                 obj.width, obj.height);
        nh.setId(obj.id);
        return nh;
    }

    get name() {
        return 'CanvasSeed';
    }
}