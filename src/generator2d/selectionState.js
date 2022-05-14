import Shape from './generator.js';
import Vec2 from '../vector2d.js';

export default class SelectionState {
    /**
     *
     */
    constructor () {
        this.selectedObj = undefined;
        this.componentId = -1;
        // difference between mouse and the object
        // (e.g. center of the circle)
        this.diffObj = -1;
        // distance between mouse and the selected component
        // (e.g. boundary of the circle)
        this.distToComponent = -1;
        // Previous position
        // (e.g. previous position of the generator)
        this.prevPosition = new Vec2(0, 0);
    }

    /**
     *
     * @param {Shape} obj
     * @returns {SelectionState}
     */
    setObj (obj) {
        this.selectedObj = obj;
        return this;
    }

    /**
     *
     * @param {number} componentId
     * @returns {SelectionState}
     */
    setComponentId (componentId) {
        this.componentId = componentId;
        return this;
    }

    /**
     *
     * @param {Vec2} diffObj
     * @returns {SelectionState}
     */
    setDiffObj (diffObj) {
        this.diffObj = diffObj;
        return this;
    }

    /**
     *
     * @param {number} distToComponent
     * @returns {SelectionState}
     */
    setDistToComponent (distToComponent) {
        this.distToComponent = distToComponent;
        return this;
    }

    /**
     *
     * @param {Vec2} p
     * @returns {SelectionState}
     */
    setPrevPosition(p) {
        this.prevPosition = p;
        return this;
    }

    /**
     *
     * @returns {boolean}
     */
    isSelectingObj () {
        return this.selectedObj !== undefined;
    }
}
