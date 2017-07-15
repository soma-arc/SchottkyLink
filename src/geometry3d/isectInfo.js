import Vec3 from '../vector3d.js';
import Shape3d from './shape3d.js';

export default class IsectInfo {
    /**
     *
     * @param {number} tmin
     * @param {number} tmax
     */
    constructor(tmin, tmax) {
        this.tmin = tmin;
        this.tmax = tmax;
        this.hitObject = undefined;
        this.isectComponentId = -1;
        this.axisDirection = undefined;
        this.prevMouse = undefined;
        this.prevShape = undefined;
    }

    /**
     *
     * @param {number} tmin
     * @param {Shape3d} hitObject
     * @param {number} isectComponentId
     */
    setInfo(tmin, hitObject, isectComponentId) {
        this.tmin = tmin;
        this.hitObject = hitObject;
        this.isectComponentId = isectComponentId;
    }

    get THRESHOLD() {
        return 0.000001;
    }
}
