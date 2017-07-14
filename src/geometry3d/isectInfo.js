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
    }

    /**
     *
     * @param {number} tmin
     * @param {Shape3d} hitObject
     */
    setInfo(tmin, hitObject) {
        this.tmin = tmin;
        this.hitObject = hitObject;
    }

    get THRESHOLD() {
        return 0.000001;
    }
}
