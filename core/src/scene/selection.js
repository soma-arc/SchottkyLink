import Vec2 from '../math/vec2.js';

export default class Selection {
    /**
     *
     */
    constructor () {
        this.selectedObj = undefined;
        this.selectedComponentId = -1;
        this.componentOrigin = undefined;
        // difference between mouse and the object
        // (e.g. center of the circle)
        /** @type{Vec2} */
        this.diffBetweenComponent = new Vec2(0, 0);
        // distance between mouse and the selected component
        // (e.g. boundary of the circle)
        /** @type{number} */
        this.distToComponent = -1;
    }

    /**
     *
     * @param {} obj
     * @returns {Selection}
     */
    setObj (obj) {
        this.selectedObj = obj;
        return this;
    }

    /**
     *
     * @param {number} componentId
     * @returns {Selection}
     */
    setComponentId (componentId) {
        this.componentId = componentId;
        return this;
    }

    /**
     *
     * @param {Vec2} componentOrigin
     * @returns {Selection}
     */
    setComponentOrigin(componentOrigin) {
        this.componentOrigin = componentOrigin;
        return this;
    }

    /**
     *
     * @param {Vec2} diffBetweenComponent
     * @returns {Selection}
     */
    setDiffBetweenComponent (diffBetweenComponent) {
        this.diffBetweenComponent = diffBetweenComponent;
        this.distToComponent = this.diffBetweenComponent.length();
        return this;
    }

    /**
     *
     * @param {number} distToComponent
     * @returns {Selection}
     */
    // setDistToComponent (distToComponent) {
    //     this.distToComponent = distToComponent;
    //     return this;
    // }

    /**
     *
     * @returns {boolean}
     */
    isSelecting () {
        return this.selectedObj !== undefined;
    }
}
