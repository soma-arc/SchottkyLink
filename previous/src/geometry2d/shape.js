import SelectionState from './selectionState.js';
import DistanceState from './distanceState.js';

let gId = 0;
let gIdList = [];
export default class Shape {
    constructor() {
        this.setId(gId);
        this.selected = false;
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
     * @param  {number} sceneScale
     * @returns {SelectionState}
     */
    select(mouse, sceneScale) {
        return new SelectionState();
    }

    /**
     *
     * @param {SelectionState} mouseState
     * @param {Vec2} mouse
     */
    move(mouseState, mouse) {}

    /**
     * compute distance between p and object's components
     * @param {Vec2} p
     */
    getDistances(p) {
        return [new DistanceState(Number.MAX_VALUE, this, 0)];
    }

    /**
     *
     * @returns {Shape}
     */
    cloneDeeply() {
        return new Shape();
    }

    /**
     *
     * @param {WebGL2RenderingContext} gl
     * @param {Array.} uniLocation
     * @param {number} uniIndex
     * @param {number} sceneScale
     * @returns {number}
     */
    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
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

    toggleSnapMode() {}

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
    static loadJson(obj, scene) {
        return new Shape();
    }

    /**
     *
     * @returns {String}
     */
    get name() {
        return 'Shape';
    }
}
