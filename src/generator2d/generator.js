import SelectionState from './selectionState.js';
import DistanceState from './distanceState.js';
import Vec2 from '../vector2d.js';

export default class Generator {
    constructor() {
        this.selected = false;
        this.id = new Date().getTime();
    }

    getPosition() {
        return new Vec2(0, 0);
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
     * @returns {Generator}
     */
    cloneDeeply() {
        return new Generator();
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
     * @param {Vec2} vec
     */
    translate(vec) {}

    /**
     *
     * @returns {Object.}
     */
    exportJson() {
        return {};
    }

    /**
     *
     * @param {Object.} obj
     * @returns {Generator}
     */
    static loadJson(obj, scene) {
        return new Generator();
    }

    /**
     *
     * @returns {String}
     */
    get name() {
        return 'generator';
    }
}
