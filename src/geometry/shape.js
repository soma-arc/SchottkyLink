import SelectionState from './selectionState.js';

let gId = 0;
let gIdList = [];
export default class Shape {
    constructor() {
        this.setId(gId);
    }

    /**
     * Set unique id
     * @param {number} id
     */
    setId(id) {
        const index = gIdList.indexOf(id);
        if (index === -1) {
            this.id = id;
            gIdList.push(id);
            gId = id + 1;
        } else {
            gIdList.splice(index, 1, id);
            while (gIdList.indexOf(gId) !== -1) {
                gId++;
            }
        }
    }

    /**
     * update
     */
    update() {}

    /**
     * check if this shape is removable
     * @param {Vec2} mouse
     * @returns {boolean} if this shape is removable or not
     */
    removable(mouse) {
        return false;
    }

    /**
     *
     * @param {Vec2} mouse
     * @returns {SelectionState}
     */
    select(mouse) {
        return new SelectionState();
    }

    /**
     *
     * @param {SelectionState} mouseState
     * @param {Vec2} mouse
     */
    move(mouseState, mouse) {}

    /**
     *
     * @returns {Shape}
     */
    cloneDeeply() {
        return new Shape();
    }

    /**
     *
     * @returns {Array.}
     */
    getUniformArray() {
        return [];
    }

    /**
     *
     * @param {WebGL2RenderingContext} gl
     * @param {Array.} uniLocation
     * @param {number} uniIndex
     * @returns {number}
     */
    setUniformValues(gl, uniLocation, uniIndex) {
        return uniIndex;
    }

    /**
     *
     * @param {WebGL2RenderingContext} gl
     * @param {Array.} uniLocation
     * @param {WebGLProgram} program
     * @param {number} index
     */
    setUniformLocation(gl, uniLocation, program, index) {}

    /**
     *
     * @returns {Object.}
     */
    exportJson() {
        return {}
    }

    /**
     *
     * @param {Object.} obj
     * @returns {Shape}
     */
    static loadJson(obj) {
        return new Shape();
    }
}
