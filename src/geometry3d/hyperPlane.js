import Shape3d from './shape3d.js';
import Vec2 from '../vector2d.js';
import Vec3 from '../vector3d.js';
import IsectInfo from './isectInfo.js';

export default class HyperPlane extends Shape3d {

    /**
     *
     * @param {Vec3} center
     * @param {Vec3} normal
     */
    constructor(center, normal){
        super();
        this.center = center;
        this.normal = normal;

        this.uiRectSize = new Vec2(1000, 1000);
        this.basisCylinderRadius = 20;
    }

    setObjBasisUniformValues(gl, uniLocation, uniIndex) {
        gl.uniform3f(uniLocation[uniIndex++],
                     this.center.x, this.center.y, this.center.z);
        gl.uniform1f(uniLocation[uniIndex++],
                     this.basisCylinderRadius);
        gl.uniform1f(uniLocation[uniIndex++],
                     this.uiRectSize.x * 0.5);
        return uniIndex;
    }

    setUniformValues(gl, uniLocation, uniIndex) {
        let uniI = uniIndex;
        gl.uniform3f(uniLocation[uniI++],
                     this.center.x, this.center.y, this.center.z);
        gl.uniform3f(uniLocation[uniI++],
                     this.normal.x, this.normal.y, this.normal.z);
        gl.uniform2f(uniLocation[uniI++],
                     this.uiRectSize.x, this.uiRectSize.y);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_hyperPlane${index}.center`));
        uniLocation.push(gl.getUniformLocation(program, `u_hyperPlane${index}.normal`));
        uniLocation.push(gl.getUniformLocation(program, `u_hyperPlane${index}.ui`));
        uniLocation.push(gl.getUniformLocation(program, `u_hyperPlane${index}.selected`));
    }

    castRay(rayOrg, rayDir, isectInfo) {
        rayOrg = rayOrg.sub(this.center);
        const v = Vec3.dot(this.normal, rayDir);
        const t = -(Vec3.dot(this.normal, rayOrg)) / v;
        if (isectInfo.THRESHOLD < t && t < isectInfo.tmin) {
            const p = rayOrg.add(rayDir.scale(t));
            const hSize = this.uiRectSize.scale(0.5);
            const yAxis = new Vec3(this.normal.x, -this.normal.z, this.normal.y);
            const xAxis = Vec3.cross(yAxis, this.normal);
            const x = Vec3.dot(p, xAxis);
            const y = Vec3.dot(p, yAxis);
            if (-hSize.x <= x && x <= hSize.x &&
                -hSize.y <= y && y <= hSize.y) {
                isectInfo.setInfo(t, this, HyperPlane.BODY);
            }
        }
    }

    /**
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    castRayToBasis(rayOrg, rayDir, isectInfo) {
        this.intersectXYBasis(this.center, this.basisCylinderRadius, this.uiRectSize.x * 0.5,
                              rayOrg, rayDir, isectInfo); // Z-axis
        this.intersectYZBasis(this.center, this.basisCylinderRadius, this.uiRectSize.x * 0.5,
                              rayOrg, rayDir, isectInfo); // X-axis
        this.intersectXZBasis(this.center, this.basisCylinderRadius, this.uiRectSize.x * 0.5,
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
                this.intersectYZCylinder(isectInfo.prevShape.center, this.basisCylinderRadius,
                                         camera.pos, ray, tmpInfo);
                this.center = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisCylinderRadius));
                return true;
            }
            case Shape3d.Y_AXIS: {
                this.intersectXZCylinder(isectInfo.prevShape.center, this.basisCylinderRadius,
                                         camera.pos, ray, tmpInfo);
                this.center = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisCylinderRadius));
                return true;
            }
            case Shape3d.Z_AXIS: {
                this.intersectXYCylinder(isectInfo.prevShape.center, this.basisCylinderRadius,
                                         camera.pos, ray, tmpInfo);
                this.center = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisCylinderRadius));
                return true;
            }
            }
        }
        return false;
    }

    cloneDeeply() {
        return new HyperPlane(new Vec3(this.center.x, this.center.y, this.center.z),
                              new Vec3(this.normal.x, this.normal.y, this.normal.z));
    }

    static loadJson(obj, scene) {
        const n = new HyperPlane(new Vec3(obj.center[0], obj.center[1], obj.center[2]),
                                 new Vec3(obj.normal[0], obj.normal[1], obj.normal[2]));
        n.setId(obj.id);
        return n;
    }

    exportJson() {
        return {
            id: this.id,
            center: [this.center.x, this.center.y, this.center.z],
            normal: [this.normal.x, this.normal.y, this.normal.z],
        };
    }

    get name() {
        return 'HyperPlane';
    }

    static get BODY() {
        return 3;
    }
}
