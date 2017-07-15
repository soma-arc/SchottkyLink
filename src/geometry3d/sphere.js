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
        switch (isectInfo.isectComponentId) {
        case Shape3d.X_AXIS: {
            const centerOnScreen = camera.computeCoordOnScreen(isectInfo.prevShapePosition,
                                                               width, height);
            const v = mouse.sub(isectInfo.prevMouse);
            const d = Vec2.dot(v, isectInfo.axisDirection);
            const coord = centerOnScreen.add(isectInfo.axisDirection.scale(d));
            const ray = camera.computeRay(width, height, coord.x, coord.y);
            this.intersectYZCylinder(isectInfo.prevShapePosition, this.basisRadius,
                                     camera.pos, ray, tmpInfo);
            this.center = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisRadius));
            return true;
        }
        case Shape3d.Y_AXIS: {
            const centerOnScreen = camera.computeCoordOnScreen(isectInfo.prevShapePosition,
                                                               width, height);
            const v = mouse.sub(isectInfo.prevMouse);
            const d = Vec2.dot(v, isectInfo.axisDirection);
            const coord = centerOnScreen.add(isectInfo.axisDirection.scale(d));
            const ray = camera.computeRay(width, height,
                                          coord.x, coord.y);
            this.intersectXZCylinder(isectInfo.prevShapePosition, this.basisRadius,
                                     camera.pos, ray, tmpInfo);
            this.center = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisRadius));
            return true;
        }
        case Shape3d.Z_AXIS: {
            const centerOnScreen = camera.computeCoordOnScreen(isectInfo.prevShapePosition,
                                                               width, height);
            const v = mouse.sub(isectInfo.prevMouse);
            const d = Vec2.dot(v, isectInfo.axisDirection);
            const coord = centerOnScreen.add(isectInfo.axisDirection.scale(d));
            const ray = camera.computeRay(width, height,
                                          coord.x, coord.y);
            this.intersectXYCylinder(isectInfo.prevShapePosition, this.basisRadius,
                                     camera.pos, ray, tmpInfo);
            this.center = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisRadius));
            return true;
        }
        }
        return false;
    }

    static get BODY() {
        return 3;
    }
}
