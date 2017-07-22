import Shape3d from './shape3d.js';
import Vec2 from '../vector2d.js';
import Vec3 from '../vector3d.js';
import IsectInfo from './isectInfo.js';

export default class HyperPlane extends Shape3d {

    /**
     *
     * @param {Vec3} center
     * @param {number}  normalTheta
     * @param {number} normalPhi
     */
    constructor(center, normalTheta, normalPhi) {
        super();
        this.center = center;

        this.uiRectSize = new Vec2(1000, 1000);
        this.basisCylinderRadius = 20;

        this.theta = normalTheta;
        this.phi = normalPhi;
        this.update();
    }

    update() {
        this.normal = new Vec3(Math.cos(this.phi) * Math.cos(this.theta),
                               Math.sin(this.phi),
                               Math.cos(this.phi) * Math.sin(this.theta));

        const upPhi = this.phi + Math.PI * 0.5;
        this.up = new Vec3(Math.cos(upPhi) * Math.cos(this.theta),
                           Math.sin(upPhi),
                           Math.cos(upPhi) * Math.sin(this.theta));
    }

    setObjBasisUniformValues(gl, uniLocation, uniIndex) {
        gl.uniform3f(uniLocation[uniIndex++],
                     this.center.x, this.center.y, this.center.z);
        gl.uniform1f(uniLocation[uniIndex++],
                     this.basisCylinderRadius);
        gl.uniform1f(uniLocation[uniIndex++],
                     this.uiRectSize.x * 0.5);
        gl.uniform1i(uniLocation[uniIndex++], true);
        gl.uniform2f(uniLocation[uniIndex++],
                     this.uiRectSize.x * 0.5, this.basisCylinderRadius);
        return uniIndex;
    }

    setUniformValues(gl, uniLocation, uniIndex) {
        let uniI = uniIndex;
        gl.uniform3f(uniLocation[uniI++],
                     this.center.x, this.center.y, this.center.z);
        gl.uniform3f(uniLocation[uniI++],
                     this.normal.x, this.normal.y, this.normal.z);
        gl.uniform3f(uniLocation[uniI++],
                     this.up.x, this.up.y, this.up.z);
        gl.uniform2f(uniLocation[uniI++],
                     this.uiRectSize.x, this.uiRectSize.y);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_hyperPlane${index}.center`));
        uniLocation.push(gl.getUniformLocation(program, `u_hyperPlane${index}.normal`));
        uniLocation.push(gl.getUniformLocation(program, `u_hyperPlane${index}.up`));
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
            const yAxis = this.up;
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
        this.intersectXYBasis(this.center, this.basisCylinderRadius,
                              this.uiRectSize.x * 0.5,
                              rayOrg, rayDir, isectInfo); // Z-axis
        this.intersectYZBasis(this.center, this.basisCylinderRadius,
                              this.uiRectSize.x * 0.5,
                              rayOrg, rayDir, isectInfo); // X-axis
        this.intersectXZBasis(this.center, this.basisCylinderRadius,
                              this.uiRectSize.x * 0.5,
                              rayOrg, rayDir, isectInfo); // Y-axis
        this.intersectRotationTorus(this.center,
                                    this.uiRectSize.x * 0.5,
                                    this.basisCylinderRadius,
                                    rayOrg, rayDir, isectInfo);
    }

    move(width, height, mouse, camera, isectInfo, scene) {
        const tmpInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);
        const centerOnScreen = camera.computeCoordOnScreen(isectInfo.prevShape.getAxisOrg(),
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
        case Shape3d.ROTATION_XZ: {
            this.theta = isectInfo.prevShape.theta + (v.x + v.y) * 0.01;
            this.update();
            return true;
        }
        case Shape3d.ROTATION_YZ: {
            this.phi = isectInfo.prevShape.phi + (v.x + v.y) * 0.01;
            this.update();
            return true;
        }
        }
        return false;
    }

    cloneDeeply() {
        return new HyperPlane(new Vec3(this.center.x, this.center.y, this.center.z),
                              this.theta, this.phi);
    }

    unselect() {
        this.selected = false;
    }

    select(isectInfo) {
        this.selected = true;
    }

    getAxisOrg() {
        return this.center;
    }

    static loadJson(obj, scene) {
        const n = new HyperPlane(new Vec3(obj.center[0], obj.center[1], obj.center[2]),
                                 obj.normalTheta, obj.normalPhi);
        n.setId(obj.id);
        return n;
    }

    exportJson() {
        return {
            id: this.id,
            center: [this.center.x, this.center.y, this.center.z],
            normalTheta: this.theta,
            normalPhi: this.phi
        };
    }

    get name() {
        return 'HyperPlane';
    }

    static get BODY() {
        return 0;
    }
}
