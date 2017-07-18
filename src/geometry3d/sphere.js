import Vec3 from '../vector3d.js';
import Shape3d from './shape3d.js';
import IsectInfo from './isectInfo.js'
import Scene from './scene.js';
import Vec2 from '../vector2d.js';

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

        this.basisRadius = 20;
    }

    update() {
        this.rSq = this.r * this.r;
    }

    setObjBasisUniformValues(gl, uniLocation, uniIndex) {
        gl.uniform3f(uniLocation[uniIndex++],
                     this.center.x, this.center.y, this.center.z);
        gl.uniform1f(uniLocation[uniIndex++],
                     this.basisRadius);
        gl.uniform1f(uniLocation[uniIndex++],
                     this.r);
        gl.uniform1i(uniLocation[uniIndex++], false);
        gl.uniform2f(uniLocation[uniIndex++], 0, 0);
        return uniIndex;
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
                isectInfo.setInfo(t, this, Sphere.BODY);
            }
        }
    }

    /**
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    castRayToBasis(rayOrg, rayDir, isectInfo) {
        this.intersectXYBasis(this.center, this.basisRadius, this.r,
                              rayOrg, rayDir, isectInfo); // Z-axis
        this.intersectYZBasis(this.center, this.basisRadius, this.r,
                              rayOrg, rayDir, isectInfo); // X-axis
        this.intersectXZBasis(this.center, this.basisRadius, this.r,
                              rayOrg, rayDir, isectInfo); // Y-axis
    }

    move(width, height, mouse, camera, isectInfo, scene) {
        const tmpInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);
        if (isectInfo.isectComponentId === Shape3d.X_AXIS ||
            isectInfo.isectComponentId === Shape3d.Y_AXIS ||
            isectInfo.isectComponentId === Shape3d.Z_AXIS) {
            const centerOnScreen = camera.computeCoordOnScreen(isectInfo.prevShape.center,
                                                               width, height);
            const v = mouse.sub(isectInfo.prevMouse);
            const d = Vec2.dot(v, isectInfo.axisDirection);
            const coord = centerOnScreen.add(isectInfo.axisDirection.scale(d));
            const ray = camera.computeRay(width, height, coord.x, coord.y);

            switch (isectInfo.isectComponentId) {
            case Shape3d.X_AXIS: {
                this.intersectYZCylinder(isectInfo.prevShape.center, this.basisRadius,
                                         camera.pos, ray, tmpInfo);
                this.center = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisRadius));
                return true;
            }
            case Shape3d.Y_AXIS: {
                this.intersectXZCylinder(isectInfo.prevShape.center, this.basisRadius,
                                         camera.pos, ray, tmpInfo);
                this.center = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisRadius));
                return true;
            }
            case Shape3d.Z_AXIS: {
                this.intersectXYCylinder(isectInfo.prevShape.center, this.basisRadius,
                                         camera.pos, ray, tmpInfo);
                this.center = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisRadius));
                return true;
            }
            }
        }
        return false;
    }

    operateScale(width, height, mouse, camera, isectInfo, scene) {
        const centerOnScreen = camera.computeCoordOnScreen(isectInfo.prevShape.center,
                                                           width, height);
        const distCenterPrevMouse = Vec2.distance(centerOnScreen, isectInfo.prevMouse);
        const distCenterCurrentMouse = Vec2.distance(centerOnScreen, mouse);
        const d = distCenterCurrentMouse - distCenterPrevMouse;
        const scaleFactor = 3;
        this.r = Math.abs(isectInfo.prevShape.r + d * scaleFactor);
        this.update();
        return true;
    }

    cloneDeeply() {
        return new Sphere(this.center.x, this.center.y, this.center.z, this.r);
    }

    static get BODY() {
        return 3;
    }
}
