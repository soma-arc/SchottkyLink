export default class SelectionState {
    constructor () {
        this.selectedObj = undefined;
        this.componentId = -1;
        // difference between mouse and the object
        // (e.g. center of the circle)
        this.diffObj = -1;
        // distance between mouse and the selected component
        // (e.g. boundary of the circle)
        this.distToComponent = -1;
    }

    setObj (obj) {
        this.selectedObj = obj;
        return this;
    }

    setComponentId (componentId) {
        this.componentId = componentId;
        return this;
    }

    setDiffObj (diffObj) {
        this.diffObj = diffObj;
        return this;
    }

    setDistToComponent (distToComponent) {
        this.distToComponent = distToComponent;
        return this;
    }

    isSelectingObj () {
        return this.selectedObj !== undefined;
    }
}
