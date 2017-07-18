import Vec2 from '../vector2d.js';
import Vec3 from '../vector3d.js';
import IsectInfo from './isectInfo.js';

let gId = 0;
let gIdList = [];

export default class Shape3d {
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

    /**
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    castRay(rayOrg, rayDir, isectInfo) {}

    /**
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    castRayToBasis(rayOrg, rayDir, isectInfo) {}

    /**
     * @param {Vec3} center
     * @param {Number} r
     * @param {Number} len
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    intersectXYBasis(center, r, len,
                     rayOrg, rayDir, isectInfo) {
        const rayPos = rayOrg.sub(center);
        const a = rayDir.x * rayDir.x + rayDir.y * rayDir.y;
        const b = 2 * (rayPos.x * rayDir.x + rayPos.y * rayDir.y);
        const c = rayPos.x * rayPos.x + rayPos.y * rayPos.y - r * r;
        const d = b * b - 4 * a * c;
        if (d >= 0) {
            const s = Math.sqrt(d);
            let t = (-b - s) / (2 * a);
            if (t <= isectInfo.THRESHOLD) t = (-b + s) / (2 * a);
            const p = rayPos.add(rayDir.scale(t));
            if (isectInfo.THRESHOLD < t && t < isectInfo.tmin &&
                0 < p.z && p.z < len) {
                isectInfo.setInfo(t, this, Shape3d.Z_AXIS);
            }
        }
    }

    /**
     * @param {Vec3} center
     * @param {Number} r
     * @param {Number} len
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    intersectYZBasis(center, r, len,
                     rayOrg, rayDir, isectInfo) {
        const rayPos = rayOrg.sub(center);
        const a = rayDir.y * rayDir.y + rayDir.z * rayDir.z;
        const b = 2 * (rayPos.y * rayDir.y + rayPos.z * rayDir.z);
        const c = rayPos.y * rayPos.y + rayPos.z * rayPos.z - r * r;
        const d = b * b - 4 * a * c;
        if (d >= 0) {
            const s = Math.sqrt(d);
            let t = (-b - s) / (2 * a);
            if (t <= isectInfo.THRESHOLD) t = (-b + s) / (2 * a);
            const p = rayPos.add(rayDir.scale(t));
            if (isectInfo.THRESHOLD < t && t < isectInfo.tmin &&
                0 < p.x && p.x < len) {
                isectInfo.setInfo(t, this, Shape3d.X_AXIS);
            }
        }
    }

    /**
     * @param {Vec3} center
     * @param {Number} r
     * @param {Number} len
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    intersectXZBasis(center, r, len,
                     rayOrg, rayDir, isectInfo) {
        const rayPos = rayOrg.sub(center);
        const a = rayDir.x * rayDir.x + rayDir.z * rayDir.z;
        const b = 2 * (rayPos.x * rayDir.x + rayPos.z * rayDir.z);
        const c = rayPos.x * rayPos.x + rayPos.z * rayPos.z - r * r;
        const d = b * b - 4 * a * c;
        if (d >= 0) {
            const s = Math.sqrt(d);
            let t = (-b - s) / (2 * a);
            if (t <= isectInfo.THRESHOLD) t = (-b + s) / (2 * a);
            const p = rayPos.add(rayDir.scale(t));
            if (isectInfo.THRESHOLD < t && t < isectInfo.tmin &&
                0 < p.y && p.y < len) {
                isectInfo.setInfo(t, this, Shape3d.Y_AXIS);
            }
        }
    }

    /**
     * @param {Vec3} center
     * @param {Number} r
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    intersectXYCylinder(center, r,
                        rayOrg, rayDir, isectInfo) {
        const rayPos = rayOrg.sub(center);
        const a = rayDir.x * rayDir.x + rayDir.y * rayDir.y;
        const b = 2 * (rayPos.x * rayDir.x + rayPos.y * rayDir.y);
        const c = rayPos.x * rayPos.x + rayPos.y * rayPos.y - r * r;
        const d = b * b - 4 * a * c;
        if (d >= 0) {
            const s = Math.sqrt(d);
            let t = (-b - s) / (2 * a);
            if (t <= isectInfo.THRESHOLD) t = (-b + s) / (2 * a);
            if (isectInfo.THRESHOLD < t && t < isectInfo.tmin) {
                isectInfo.setInfo(t, this, Shape3d.Z_AXIS);
            }
        }
    }

    /**
     * @param {Vec3} center
     * @param {Number} r
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    intersectYZCylinder(center, r,
                        rayOrg, rayDir, isectInfo) {
        const rayPos = rayOrg.sub(center);
        const a = rayDir.y * rayDir.y + rayDir.z * rayDir.z;
        const b = 2 * (rayPos.y * rayDir.y + rayPos.z * rayDir.z);
        const c = rayPos.y * rayPos.y + rayPos.z * rayPos.z - r * r;
        const d = b * b - 4 * a * c;
        if (d >= 0) {
            const s = Math.sqrt(d);
            let t = (-b - s) / (2 * a);
            if (t <= isectInfo.THRESHOLD) t = (-b + s) / (2 * a);
            if (isectInfo.THRESHOLD < t && t < isectInfo.tmin) {
                isectInfo.setInfo(t, this, Shape3d.X_AXIS);
            }
        }
    }

    /**
     * @param {Vec3} center
     * @param {Number} r
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    intersectXZCylinder(center, r,
                        rayOrg, rayDir, isectInfo) {
        const rayPos = rayOrg.sub(center);
        const a = rayDir.x * rayDir.x + rayDir.z * rayDir.z;
        const b = 2 * (rayPos.x * rayDir.x + rayPos.z * rayDir.z);
        const c = rayPos.x * rayPos.x + rayPos.z * rayPos.z - r * r;
        const d = b * b - 4 * a * c;
        if (d >= 0) {
            const s = Math.sqrt(d);
            let t = (-b - s) / (2 * a);
            if (t <= isectInfo.THRESHOLD) t = (-b + s) / (2 * a);
            if (isectInfo.THRESHOLD < t && t < isectInfo.tmin) {
                isectInfo.setInfo(t, this, Shape3d.Y_AXIS);
            }
        }
    }

    distRotationTorus(pos, center, radius, pipeRadius) {
        const p = pos.sub(center);
        const yz = new Vec2(p.y, p.z);
        const xz = new Vec2(p.x, p.z);
        const dYZ = new Vec2(yz.length() - radius, p.x).length() - pipeRadius;
        const dXZ = new Vec2(xz.length() - radius, p.y).length() - pipeRadius;
        return (dYZ < dXZ) ? [dYZ, Shape3d.ROTATION_YZ] : [dXZ, Shape3d.ROTATION_XZ];
    }

    intersectRotationTorus(center, radius, pipeRadius,
                           rayOrg, rayDir, isectInfo) {
        let rayLength = 0;
        let rayPos = rayOrg.add(rayDir.scale(rayLength));
        let dist;
        for (let i = 0; i < 1000; i++) {
            if (rayLength > isectInfo.tmin) break;
            dist = this.distRotationTorus(rayPos, center, radius, pipeRadius);
            rayLength += dist[0];
            rayPos = rayOrg.add(rayDir.scale(rayLength));
            if (dist[0] < 0.01) {
                isectInfo.setInfo(rayLength, this, dist[1]);
            }
        }
    }

    cloneDeeply() {}

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
        return new Shape3d();
    }

    /**
     *
     * @returns {String}
     */
    get name() {
        return 'Shape';
    }

    static get X_AXIS() {
        return -2;
    }

    static get Y_AXIS() {
        return -3;
    }

    static get Z_AXIS() {
        return -4;
    }

    static get ROTATION_YZ() {
        return -5;
    }

    static get ROTATION_XZ() {
        return -6;
    }
}
