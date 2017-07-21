import Shape3d from './shape3d.js';
import Vec2 from '../vector2d.js';
import Vec3 from '../vector3d.js';
import IsectInfo from './isectInfo.js';
import HyperPlane from './hyperPlane.js';

export default class ParallelPlanes extends Shape3d {
    /**
     * //// hp2 /////
     * //////////////
     * ------+-------
     *       ^ normal
     *       |
     *       |
     * ------+-------
     * ///// p //////
     * //////////////
     * //// hp1 /////
     * @param {Vec3} p
     * @param {number} normalTheta
     * @param {number} normalPhi
     * @param {number} planeDist
     */
    constructor(p, normalTheta, normalPhi, planeDist) {
        super();
        this.p = p;
        this.uiRectSize = new Vec2(1000, 1000);
        this.basisCylinderRadius = 20;

        this.theta = normalTheta;
        this.phi = normalPhi;
        this.planeDist = planeDist;

        this.torsionAngle = 0;
        this.torsionMat3 = [1, 0, 0,
                            0, 1, 0,
                            0, 0, 1];

        this.hp1 = new HyperPlane(this.p, this.theta, this.phi);
        this.hp2 = new HyperPlane(this.p, this.theta, this.phi);
        this.update();
    }

    computeTorsionMatrix(angle, axis) {
        const a = axis.normalize();
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const r = 1.0 - c;
        return [
            a.x * a.x * r + c,
            a.y * a.x * r + a.z * s,
            a.z * a.x * r - a.y * s,
            a.x * a.y * r - a.z * s,
            a.y * a.y * r + c,
            a.z * a.y * r + a.x * s,
            a.x * a.z * r + a.y * s,
            a.y * a.z * r - a.x * s,
            a.z * a.z * r + c
        ];
    }

    update() {
        this.normal = new Vec3(Math.cos(this.phi) * Math.cos(this.theta),
                               Math.sin(this.phi),
                               Math.cos(this.phi) * Math.sin(this.theta));

        const upPhi = this.phi + Math.PI * 0.5;
        this.up = new Vec3(Math.cos(upPhi) * Math.cos(this.theta),
                           Math.sin(upPhi),
                           Math.cos(upPhi) * Math.sin(this.theta));
        this.hp1.center = this.p;
        this.hp1.theta = this.theta;
        this.hp1.phi = this.phi;
        this.hp1.update();
        this.hp2.center = this.p.add(this.normal.scale(this.planeDist));
        this.hp2.theta = this.theta;
        this.hp2.phi = this.phi;
        this.hp2.update();

        this.torsionMat3 = this.computeTorsionMatrix(this.torsionAngle, this.normal);
    }

    setObjBasisUniformValues(gl, uniLocation, uniIndex) {
        if (this.hp1.selected) {
            gl.uniform3f(uniLocation[uniIndex++],
                         this.hp1.center.x, this.hp1.center.y, this.hp1.center.z);
            gl.uniform1f(uniLocation[uniIndex++],
                         this.basisCylinderRadius);
            gl.uniform1f(uniLocation[uniIndex++],
                         this.uiRectSize.x * 0.5);
            gl.uniform1i(uniLocation[uniIndex++], true);
            gl.uniform2f(uniLocation[uniIndex++],
                         this.uiRectSize.x * 0.5, this.basisCylinderRadius);
        } else if (this.hp2.selected) {
            gl.uniform3f(uniLocation[uniIndex++],
                         this.hp2.center.x, this.hp2.center.y, this.hp2.center.z);
            gl.uniform1f(uniLocation[uniIndex++],
                         this.basisCylinderRadius);
            gl.uniform1f(uniLocation[uniIndex++],
                         this.uiRectSize.x * 0.5);
            gl.uniform1i(uniLocation[uniIndex++], false);
            gl.uniform2f(uniLocation[uniIndex++],
                         0, 0);
        }
        return uniIndex;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_parallelPlanes${index}.p`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_parallelPlanes${index}.normal`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_parallelPlanes${index}.torsion`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_parallelPlanes${index}.up`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_parallelPlanes${index}.dist`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_parallelPlanes${index}.ui`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_parallelPlanes${index}.selected`));
    }

    setUniformValues(gl, uniLocation, uniIndex) {
        gl.uniform3f(uniLocation[uniIndex++],
                     this.p.x, this.p.y, this.p.z);
        gl.uniform3f(uniLocation[uniIndex++],
                     this.normal.x, this.normal.y, this.normal.z);
        gl.uniformMatrix3fv(uniLocation[uniIndex++], false, this.torsionMat3);
        gl.uniform3f(uniLocation[uniIndex++],
                     this.up.x, this.up.y, this.up.z);
        gl.uniform2f(uniLocation[uniIndex++],
                     this.planeDist, this.planeDist * 2);
        gl.uniform2f(uniLocation[uniIndex++],
                     this.uiRectSize.x, this.uiRectSize.y);
        gl.uniform1i(uniLocation[uniIndex++],
                     this.selected);
        return uniIndex;
    }

    /**
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    castRay(rayOrg, rayDir, isectInfo) {
        let componentInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);
        this.hp1.castRay(rayOrg, rayDir, componentInfo);
        if (componentInfo.isectComponentId !== -1 &&
            componentInfo.tmin < isectInfo.tmin) {
            isectInfo.setInfo(componentInfo.tmin, this, ParallelPlanes.HP1);
        }
        componentInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);
        this.hp2.castRay(rayOrg, rayDir, componentInfo);
        if (componentInfo.isectComponentId !== -1 &&
            componentInfo.tmin < isectInfo.tmin) {
            isectInfo.setInfo(componentInfo.tmin, this, ParallelPlanes.HP2);
        }
    }

    /**
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    castRayToBasis(rayOrg, rayDir, isectInfo) {
        let center;
        if (this.hp1.selected) {
            center = this.hp1.center;
        } else if (this.hp2.selected) {
            center = this.hp2.center;
        }

        this.intersectXYBasis(center, this.basisCylinderRadius,
                              this.uiRectSize.x * 0.5,
                              rayOrg, rayDir, isectInfo); // Z-axis
        this.intersectYZBasis(center, this.basisCylinderRadius,
                              this.uiRectSize.x * 0.5,
                              rayOrg, rayDir, isectInfo); // X-axis
        this.intersectXZBasis(center, this.basisCylinderRadius,
                              this.uiRectSize.x * 0.5,
                              rayOrg, rayDir, isectInfo); // Y-axis

        if (this.hp1.selected) {
            this.intersectRotationTorus(this.hp1.center,
                                        this.uiRectSize.x * 0.5,
                                        this.basisCylinderRadius,
                                        rayOrg, rayDir, isectInfo);
        }
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
            this.intersectYZCylinder(isectInfo.prevShape.getAxisOrg(),
                                     this.basisCylinderRadius,
                                     camera.pos, ray, tmpInfo);
            this.p = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisCylinderRadius));
            this.update();
            return true;
        }
        case Shape3d.Y_AXIS: {
            this.intersectXZCylinder(isectInfo.prevShape.getAxisOrg(),
                                     this.basisCylinderRadius,
                                     camera.pos, ray, tmpInfo);
            this.p = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisCylinderRadius));
            this.update();
            return true;
        }
        case Shape3d.Z_AXIS: {
            this.intersectXYCylinder(isectInfo.prevShape.getAxisOrg(),
                                     this.basisCylinderRadius,
                                     camera.pos, ray, tmpInfo);
            this.p = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisCylinderRadius));
            this.update();
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

    unselect() {
        this.selected = false;
        this.hp1.selected = false;
        this.hp2.selected = false;
    }

    select(isectInfo) {
        this.selected = true;
        if (isectInfo.isectComponentId === ParallelPlanes.HP1) {
            this.hp1.selected = true;
        } else if (isectInfo.isectComponentId === ParallelPlanes.HP2) {
            this.hp2.selected = true;
        }
    }

    getAxisOrg() {
        if (this.hp1.selected) return this.hp1.center;
        if (this.hp2.selected) return this.hp2.center;
    }

    cloneDeeply() {
        const p = new ParallelPlanes(new Vec3(this.p.x, this.p.y, this.p.z),
                                     this.theta, this.phi, this.planeDist);
        p.selected = this.selected;
        p.hp1.selected = this.hp1.selected;
        p.hp2.selected = this.hp2.selected;
        return p;
    }

    static loadJson(obj, scene) {
        const n = new ParallelPlanes(new Vec3(obj.p[0], obj.p[1], obj.p[2]),
                                          obj.normalTheta, obj.normalPhi,
                                          obj.planeDist);
        n.setId(obj.id);
        return n;
    }

    exportJson() {
        return {
            id: this.id,
            p: [this.p.x, this.p.y, this.p.z],
            normalTheta: this.theta,
            normalPhi: this.phi,
            planeDist: this.planeDist
        };
    }

    get name() {
        return 'ParallelPlanes';
    }

    static get HP1() {
        return 0;
    }

    static get HP2() {
        return 1;
    }
}
