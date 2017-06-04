import SelectionState from './selectionState.js';
import Vec2 from '../vector.js';

export default class Point extends Vec2 {
    constructor(x, y) {
        super(x, y);

        // radius of the point
        this.uiRadius = 10;
    }

    removable(mouse) {
        const d = Vec2.distance(mouse, this);
        return d < this.r;
    }

    /**
     *
     * @param {Vec2} mouse
     */
    select(mouse) {
        const dp = mouse.sub(this);
        const d = dp.length();
        if (d > this.uiRadius) return new SelectionState();

        return new SelectionState().setObj(this)
            .setDiffObj(dp);
    }

    /**
     * Move circle
     * @param { SelectionState } selectionState
     * @param { Vec2 } mouse
     */
    move(selectionState, mouse) {
        const diff = mouse.sub(selectionState.diffObj);
        this.x = diff.x;
        this.y = diff.y;
    }

    cloneDeeply() {
        return new Point(this.x, this.y);
    }

    getUniformArray() {
        return [this.x, this.y, this.uiRadius];
    }

    /**
     *
     * @param {WebGL2RenderingContext} gl
     * @param {} uniLocation
     * @param {number} uniIndex
     * @returns {number}
     */
    setUniformValues(gl, uniLocation, uniIndex) {
        let uniI = uniIndex;
        gl.uniform3f(uniLocation[uniI++],
                     this.x, this.y, this.uiRadius);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_point${index}`));
    }

    exportJson() {
        return {
            position: [this.x, this.y],
        };
    }

    static loadJson(obj) {
        return new Point(obj.position[0], obj.position[1]);
    }
}
