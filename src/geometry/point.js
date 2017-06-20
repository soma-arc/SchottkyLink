import SelectionState from './selectionState.js';
import Vec2 from '../vector.js';
import Shape from './shape.js'

export default class Point extends Shape {
    constructor(x, y) {
        super();
        this.pos = new Vec2(x, y);
        // radius of the point
        this.uiRadius = 0.01;

        this.parents = [];
    }

    addParent(parent) {
        this.parents.push(parent);
    }

    update() {
        for (const parent of this.parents) {
            parent.update();
        }
    }

    /**
     *
     * @param {Vec2} translation
     */
    translate(translation) {
        this.pos = this.pos.add(translation);
        this.update();
    }

    removable(mouse) {
        const d = Vec2.distance(mouse, this);
        return d < this.r;
    }

    /**
     *
     * @param {Vec2} mouse
     */
    select(mouse, sceneScale) {
        const dp = mouse.sub(this.pos);
        const d = dp.length();
        if (d > this.uiRadius * sceneScale) return new SelectionState();

        return new SelectionState().setObj(this)
            .setDiffObj(dp);
    }

    /**
     * Move circle
     * @param { SelectionState } selectionState
     * @param { Vec2 } mouse
     */
    move(selectionState, mouse) {
        this.pos = mouse.sub(selectionState.diffObj);
        this.update();
    }

    cloneDeeply() {
        return new Point(this.pos.x, this.pos.y);
    }

    /**
     *
     * @param {WebGL2RenderingContext} gl
     * @param {} uniLocation
     * @param {number} uniIndex
     * @param {number} sceneScale
     * @returns {number}
     */
    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform3f(uniLocation[uniI++],
                     this.pos.x, this.pos.y, this.uiRadius * sceneScale);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_point${index}`));
    }

    exportJson() {
        return {
            id: this.id,
            position: [this.pos.x, this.pos.y],
        };
    }

    static loadJson(obj) {
        const np = new Point(obj.position[0], obj.position[1]);
        np.setId(obj.id);
        return np;
    }
}
