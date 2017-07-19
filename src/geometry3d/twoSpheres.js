import Shape3d from './shape3d.js';
import Sphere from './sphere.js';
import IsectInfo from './isectInfo.js';
import Vec2 from '../vector2d.js';

export default class TwoSpheres extends Shape3d {
    constructor(s1, s2) {
        super();
        this.s1 = s1;
        this.s2 = s2;
        this.update();
        this.basisRadius = 20;
    }

    update() {
        this.s1d = this.s2.invertOnSphere(this.s1);
    }

    setObjBasisUniformValues(gl, uniLocation, uniIndex) {
        if (this.s1.selected) {
            gl.uniform3f(uniLocation[uniIndex++],
                         this.s1.center.x, this.s1.center.y, this.s1.center.z);
            gl.uniform1f(uniLocation[uniIndex++],
                         this.basisRadius);
            gl.uniform1f(uniLocation[uniIndex++],
                         this.s1.r);
        } else if (this.s2.selected) {
            gl.uniform3f(uniLocation[uniIndex++],
                         this.s2.center.x, this.s2.center.y, this.s2.center.z);
            gl.uniform1f(uniLocation[uniIndex++],
                         this.basisRadius);
            gl.uniform1f(uniLocation[uniIndex++],
                         this.s2.r);
        }
        gl.uniform1i(uniLocation[uniIndex++], false);
        gl.uniform2f(uniLocation[uniIndex++], 0, 0);
        return uniIndex;
    }

    setUniformValues(gl, uniLocation, uniIndex) {
        let uniI = uniIndex;
        gl.uniform3f(uniLocation[uniI++],
                     this.s1.center.x, this.s1.center.y, this.s1.center.z);
        gl.uniform2f(uniLocation[uniI++],
                     this.s1.r, this.s1.rSq);
        gl.uniform1i(uniLocation[uniI++], this.s1.selected);

        gl.uniform3f(uniLocation[uniI++],
                     this.s2.center.x, this.s2.center.y, this.s2.center.z);
        gl.uniform2f(uniLocation[uniI++],
                     this.s2.r, this.s2.rSq);
        gl.uniform1i(uniLocation[uniI++], this.s1.selected);

        gl.uniform3f(uniLocation[uniI++],
                     this.s1d.center.x, this.s1d.center.y, this.s1d.center.z);
        gl.uniform2f(uniLocation[uniI++],
                     this.s1d.r, this.s1d.rSq);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_twoSpheres${index}.s1.center`));
        uniLocation.push(gl.getUniformLocation(program, `u_twoSpheres${index}.s1.r`));
        uniLocation.push(gl.getUniformLocation(program, `u_twoSpheres${index}.s1.selected`));
        uniLocation.push(gl.getUniformLocation(program, `u_twoSpheres${index}.s2.center`));
        uniLocation.push(gl.getUniformLocation(program, `u_twoSpheres${index}.s2.r`));
        uniLocation.push(gl.getUniformLocation(program, `u_twoSpheres${index}.s2.selected`));
        uniLocation.push(gl.getUniformLocation(program, `u_twoSpheres${index}.s1d.center`));
        uniLocation.push(gl.getUniformLocation(program, `u_twoSpheres${index}.s1d.r`));
    }

    /**
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    castRay(rayOrg, rayDir, isectInfo) {
        let componentInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);
        this.s1.castRay(rayOrg, rayDir, componentInfo);
        if (componentInfo.isectComponentId !== -1 &&
            componentInfo.tmin < isectInfo.tmin) {
            isectInfo.setInfo(componentInfo.tmin, this, TwoSpheres.S1BODY);
            return;
        }
        componentInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);
        this.s2.castRay(rayOrg, rayDir, componentInfo);
        if (componentInfo.isectComponentId !== -1 &&
            componentInfo.tmin < isectInfo.tmin) {
            isectInfo.setInfo(componentInfo.tmin, this, TwoSpheres.S2BODY);
        }
    }

    /**
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    castRayToBasis(rayOrg, rayDir, isectInfo) {
        let center;
        let r;
        if (this.s1.selected) {
            center = this.s1.center;
            r = this.s1.r;
        } else if (this.s2.selected) {
            center = this.s2.center;
            r = this.s2.r;
        }
        this.intersectXYBasis(center, this.basisRadius, r,
                              rayOrg, rayDir, isectInfo); // Z-axis
        this.intersectYZBasis(center, this.basisRadius, r,
                              rayOrg, rayDir, isectInfo); // X-axis
        this.intersectXZBasis(center, this.basisRadius, r,
                              rayOrg, rayDir, isectInfo); // Y-axis
    }

    move(width, height, mouse, camera, isectInfo, scene) {
        const tmpInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);
        if (isectInfo.isectComponentId === Shape3d.X_AXIS ||
            isectInfo.isectComponentId === Shape3d.Y_AXIS ||
            isectInfo.isectComponentId === Shape3d.Z_AXIS) {
            const centerOnScreen = camera.computeCoordOnScreen(isectInfo.prevShape.getAxisOrg(),
                                                               width, height);
            const v = mouse.sub(isectInfo.prevMouse);
            const d = Vec2.dot(v, isectInfo.axisDirection);
            const coord = centerOnScreen.add(isectInfo.axisDirection.scale(d));
            const ray = camera.computeRay(width, height, coord.x, coord.y);

            let operateSphere;
            if (this.s1.selected) {
                operateSphere = this.s1;
            } else {
                operateSphere = this.s2;
            }

            switch (isectInfo.isectComponentId) {
            case Shape3d.X_AXIS: {
                this.intersectYZCylinder(isectInfo.prevShape.getAxisOrg(), this.basisRadius,
                                         camera.pos, ray, tmpInfo);
                operateSphere.center = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisRadius));
                return true;
            }
            case Shape3d.Y_AXIS: {
                this.intersectXZCylinder(isectInfo.prevShape.getAxisOrg(), this.basisRadius,
                                         camera.pos, ray, tmpInfo);
                operateSphere.center = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisRadius));
                return true;
            }
            case Shape3d.Z_AXIS: {
                this.intersectXYCylinder(isectInfo.prevShape.getAxisOrg(), this.basisRadius,
                                         camera.pos, ray, tmpInfo);
                operateSphere.center = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisRadius));
                return true;
            }
            }
        }
        return false;
    }

    unselect() {
        this.selected = false;
        this.s1.selected = false;
        this.s2.selected = false;
    }

    select(isectInfo) {
        this.selected = true;
        if (isectInfo.isectComponentId === TwoSpheres.S1BODY) {
            this.s1.selected = true;
        } else if (isectInfo.isectComponentId === TwoSpheres.S2BODY) {
            this.s2.selected = true;
        }
    }

    cloneDeeply() {
        return new TwoSpheres(this.s1.cloneDeeply(),
                              this.s2.cloneDeeply());
    }

    getAxisOrg() {
        if (this.s1.selected) return this.s1.center;
        if (this.s2.selected) return this.s2.center;
    }

    exportJson() {
        return {
            id: this.id,
            s1: this.s1.exportJson(),
            s2: this.s2.exportJson()
        }
    }

    static loadJson(obj, scene) {
        const ns = new TwoSpheres(Sphere.loadJson(obj.s1, scene),
                                  Sphere.loadJson(obj.s2, scene));
        ns.setId(obj.id);
        return ns;
    }

    get name() {
        return 'TwoSpheres';
    }

    static get S1BODY() {
        return 0;
    }

    static get S2BODY() {
        return 2;
    }
}
