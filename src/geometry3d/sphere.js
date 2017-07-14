import Vec3 from '../vector3d.js';
import Shape3d from './shape3d.js';
import IsectInfo from './isectInfo.js'

export default class Sphere extends Shape3d {
    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} r
     */
    constructor (x, y, z, r) {
        super();
        this.center = new Vec3(x, y, z);
        this.r = r;
        this.update();
    }

    update() {
        this.rSq = this.r * this.r;
    }

    setUniformValues(gl, uniLocation, uniIndex) {
        let uniI = uniIndex;
        gl.uniform3f(uniLocation[uniI++],
                     this.center.x, this.center.y, this.center.z);
        gl.uniform2f(uniLocation[uniI++],
                     this.r, this.rSq);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    exportJson() {
        return {
            id: this.id,
            center: [this.center.x, this.center.y, this.center.z],
            radius: this.r,
        };
    }

    /**
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    castRay(rayOrg, rayDir, isectInfo) {
        const v = rayOrg.sub(this.center);
        const b = Vec3.dot(rayDir, v)
        const c = Vec3.dot(v, v) - this.r * this.r;
        const d = b * b - c;
        if (d >= 0) {
            const s = Math.sqrt(d);
            let t = -b - s;
            if (t < isectInfo.THRESHOLD) t = -b + s;
            if (0 < t && t < isectInfo.tmin) {
                isectInfo.setInfo(t, this);
            }
        }
    }
}
