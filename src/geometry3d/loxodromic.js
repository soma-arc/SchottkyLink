import Vec2 from '../vector2d.js';
import Vec3 from '../vector3d.js';
import Shape3d from './shape3d.js';
import Sphere from './sphere.js';
import IsectInfo from './isectInfo.js';

export default class Loxodromic extends Shape3d {
    /**
     *
     * @param {Sphere} s1
     * @param {Sphere} s2
     * @param {Vec3} p
     * @param {Vec3} q1
     * @param {Vec3} q2
     */
    constructor(s1, s2, p, q1, q2) {
        super();
        this.uiSphereRadius = 50;
        this.basisRadius = 20;
        this.s1 = s1;
        this.s2 = s2;
        this.p = new Sphere(p.x, p.y, p.z, this.uiSphereRadius);
        this.q1 = new Sphere(q1.x, q1.y, q1.z, this.uiSphereRadius);
        this.q2 = new Sphere(q2.x, q2.y, q2.z, this.uiSphereRadius);

        this.update();
    }

    update() {
        this.s1d = this.s2.invertOnSphere(this.s1);
        this.pInInv = this.s1.invertOnPoint(this.p.center);
        this.pOutInv = this.s2.invertOnPoint(this.p.center);
        this.s3 = Sphere.makeSphereFromPoints(this.p.center, this.pInInv,
                                              this.pOutInv, this.q1.center);
        this.s4 = Sphere.makeSphereFromPoints(this.p.center, this.pInInv,
                                              this.pOutInv, this.q2.center);
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
        } else if (this.p.selected) {
            gl.uniform3f(uniLocation[uniIndex++],
                         this.p.center.x, this.p.center.y, this.p.center.z);
            gl.uniform1f(uniLocation[uniIndex++],
                         this.basisRadius);
            gl.uniform1f(uniLocation[uniIndex++],
                         this.p.r * 2);
        } else if (this.q1.selected) {
            gl.uniform3f(uniLocation[uniIndex++],
                         this.q1.center.x, this.q1.center.y, this.q1.center.z);
            gl.uniform1f(uniLocation[uniIndex++],
                         this.basisRadius);
            gl.uniform1f(uniLocation[uniIndex++],
                         this.q1.r * 2);
        } else if (this.q2.selected) {
            gl.uniform3f(uniLocation[uniIndex++],
                         this.q2.center.x, this.q2.center.y, this.q2.center.z);
            gl.uniform1f(uniLocation[uniIndex++],
                         this.basisRadius);
            gl.uniform1f(uniLocation[uniIndex++],
                         this.q2.r * 2);
        }
        gl.uniform1i(uniLocation[uniIndex++], false);
        gl.uniform2f(uniLocation[uniIndex++], 0, 0);
        return uniIndex;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.selected`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.s1.center`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.s1.r`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.s1.selected`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.s2.center`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.s2.r`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.s2.selected`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.s1d.center`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.s1d.r`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.s3.center`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.s3.r`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.s3.selected`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.s4.center`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.s4.r`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.s4.selected`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.p`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.q1`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.q2`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.ui`));
    }

    setUniformValues(gl, uniLocation, uniIndex) {
        gl.uniform1i(uniLocation[uniIndex++], this.selected);

        gl.uniform3f(uniLocation[uniIndex++],
                     this.s1.center.x, this.s1.center.y, this.s1.center.z);
        gl.uniform2f(uniLocation[uniIndex++],
                     this.s1.r, this.s1.rSq);
        gl.uniform1i(uniLocation[uniIndex++], this.s1.selected);

        gl.uniform3f(uniLocation[uniIndex++],
                     this.s2.center.x, this.s2.center.y, this.s2.center.z);
        gl.uniform2f(uniLocation[uniIndex++],
                     this.s2.r, this.s2.rSq);
        gl.uniform1i(uniLocation[uniIndex++], this.s2.selected);

        gl.uniform3f(uniLocation[uniIndex++],
                     this.s1d.center.x, this.s1d.center.y, this.s1d.center.z);
        gl.uniform2f(uniLocation[uniIndex++],
                     this.s1d.r, this.s1d.rSq);

        gl.uniform3f(uniLocation[uniIndex++],
                     this.s3.center.x, this.s3.center.y, this.s3.center.z);
        gl.uniform2f(uniLocation[uniIndex++],
                     this.s3.r, this.s3.rSq);
        gl.uniform1i(uniLocation[uniIndex++], this.s3.selected);

        gl.uniform3f(uniLocation[uniIndex++],
                     this.s4.center.x, this.s4.center.y, this.s4.center.z);
        gl.uniform2f(uniLocation[uniIndex++],
                     this.s4.r, this.s4.rSq);
        gl.uniform1i(uniLocation[uniIndex++], this.s4.selected);

        gl.uniform4f(uniLocation[uniIndex++],
                     this.p.center.x, this.p.center.y, this.p.center.z, this.p.selected);
        gl.uniform4f(uniLocation[uniIndex++],
                     this.q1.center.x, this.q1.center.y, this.q1.center.z, this.q1.selected);
        gl.uniform4f(uniLocation[uniIndex++],
                     this.q2.center.x, this.q2.center.y, this.q2.center.z, this.q2.selected);

        gl.uniform1f(uniLocation[uniIndex++],
                     this.uiSphereRadius);
        return uniIndex;
    }

    /**
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @param {IsectInfo} isectInfo
     */
    castRay(rayOrg, rayDir, isectInfo) {
        let componentInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);

        componentInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);
        this.p.castRay(rayOrg, rayDir, componentInfo);
        if (componentInfo.isectComponentId !== -1 &&
            componentInfo.tmin < isectInfo.tmin) {
            isectInfo.setInfo(componentInfo.tmin, this, Loxodromic.P);
            return;
        }

        componentInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);
        this.q1.castRay(rayOrg, rayDir, componentInfo);
        if (componentInfo.isectComponentId !== -1 &&
            componentInfo.tmin < isectInfo.tmin) {
            isectInfo.setInfo(componentInfo.tmin, this, Loxodromic.Q1);
            return;
        }

        componentInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);
        this.q2.castRay(rayOrg, rayDir, componentInfo);
        if (componentInfo.isectComponentId !== -1 &&
            componentInfo.tmin < isectInfo.tmin) {
            isectInfo.setInfo(componentInfo.tmin, this, Loxodromic.Q2);
            return;
        }

        componentInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);
        this.s1.castRay(rayOrg, rayDir, componentInfo);
        if (componentInfo.isectComponentId !== -1 &&
            componentInfo.tmin < isectInfo.tmin) {
            isectInfo.setInfo(componentInfo.tmin, this, Loxodromic.S1);
            return;
        }

        componentInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);
        this.s2.castRay(rayOrg, rayDir, componentInfo);
        if (componentInfo.isectComponentId !== -1 &&
            componentInfo.tmin < isectInfo.tmin) {
            isectInfo.setInfo(componentInfo.tmin, this, Loxodromic.S2);
        }
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
            let vecToOther;
            if (this.s1.selected) {
                operateSphere = this.s1;
            } else if (this.s2.selected) {
                operateSphere = this.s2;
                vecToOther = this.s1.center.sub(this.s2.center);
            } else if (this.p.selected) {
                operateSphere = this.p;
            } else if (this.q1.selected) {
                operateSphere = this.q1;
            } else if (this.q2.selected) {
                operateSphere = this.q2;
            }

            switch (isectInfo.isectComponentId) {
            case Shape3d.X_AXIS: {
                this.intersectYZCylinder(isectInfo.prevShape.getAxisOrg(), this.basisRadius,
                                         camera.pos, ray, tmpInfo);
                operateSphere.center = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisRadius));
                if (this.s2.selected) {
                    this.s1.center = operateSphere.center.add(vecToOther);
                }
                this.update();
                return true;
            }
            case Shape3d.Y_AXIS: {
                this.intersectXZCylinder(isectInfo.prevShape.getAxisOrg(), this.basisRadius,
                                         camera.pos, ray, tmpInfo);
                operateSphere.center = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisRadius));
                if (this.s2.selected) {
                    this.s1.center = operateSphere.center.add(vecToOther);
                }
                this.update();
                return true;
            }
            case Shape3d.Z_AXIS: {
                this.intersectXYCylinder(isectInfo.prevShape.getAxisOrg(), this.basisRadius,
                                         camera.pos, ray, tmpInfo);
                operateSphere.center = camera.pos.add(ray.scale(tmpInfo.tmin + this.basisRadius));
                if (this.s2.selected) {
                    this.s1.center = operateSphere.center.add(vecToOther);
                }
                this.update();
                return true;
            }
            }
        }
        return false;
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
        } else if (this.p.selected) {
            center = this.p.center;
            r = this.p.r * 2;
        } else if (this.q1.selected) {
            center = this.q1.center;
            r = this.q1.r * 2;
        } else if (this.q2.selected) {
            center = this.q2.center;
            r = this.q2.r * 2;
        }
        this.intersectXYBasis(center, this.basisRadius, r,
                              rayOrg, rayDir, isectInfo); // Z-axis
        this.intersectYZBasis(center, this.basisRadius, r,
                              rayOrg, rayDir, isectInfo); // X-axis
        this.intersectXZBasis(center, this.basisRadius, r,
                              rayOrg, rayDir, isectInfo); // Y-axis
    }

    unselect() {
        this.selected = false;
        this.s1.selected = false;
        this.s2.selected = false;
        this.p.selected = false;
        this.q1.selected = false;
        this.q2.selected = false;
    }

    select(isectInfo) {
        this.selected = true;
        if (isectInfo.isectComponentId === Loxodromic.S1) {
            this.s1.selected = true;
        } else if (isectInfo.isectComponentId === Loxodromic.S2) {
            this.s2.selected = true;
        } else if (isectInfo.isectComponentId === Loxodromic.P) {
            this.p.selected = true;
        } else if (isectInfo.isectComponentId === Loxodromic.Q1) {
            this.q1.selected = true;
        } else if (isectInfo.isectComponentId === Loxodromic.Q2) {
            this.q2.selected = true;
        }
    }

    operateScale(width, height, mouse, camera, isectInfo, scene) {
        const centerOnScreen = camera.computeCoordOnScreen(isectInfo.prevShape.getAxisOrg(),
                                                           width, height);
        const distCenterPrevMouse = Vec2.distance(centerOnScreen, isectInfo.prevMouse);
        const distCenterCurrentMouse = Vec2.distance(centerOnScreen, mouse);
        const d = distCenterCurrentMouse - distCenterPrevMouse;
        const scaleFactor = 3;
        if (this.s1.selected) {
            this.s1.r = Math.abs(isectInfo.prevShape.s1.r + d * scaleFactor);
            this.s1.update();
            this.update();
        } else if (this.s2.selected) {
            this.s2.r = Math.abs(isectInfo.prevShape.s2.r + d * scaleFactor);
            this.s2.update();
            this.update();
        } else {
            return false;
        }
        return true;
    }

    cloneDeeply() {
        const loxo = new Loxodromic(this.s1.cloneDeeply(),
                                    this.s2.cloneDeeply(),
                                    this.p.center,
                                    this.q1.center,
                                    this.q2.center);
        loxo.p.selected = this.p.selected;
        loxo.q1.selected = this.q1.selected;
        loxo.q2.selected = this.q2.selected;
        return loxo;
    }

    getAxisOrg() {
        if (this.s1.selected) return this.s1.center;
        if (this.s2.selected) return this.s2.center;
        if (this.p.selected) return this.p.center;
        if (this.q1.selected) return this.q1.center;
        if (this.q2.selected) return this.q2.center;
    }

    exportJson() {
        return {
            id: this.id,
            s1: this.s1.exportJson(),
            s2: this.s2.exportJson(),
            p: [this.p.center.x, this.p.center.y, this.p.center.z],
            q1: [this.q1.center.x, this.q1.center.y, this.q1.center.z],
            q2: [this.q2.center.x, this.q2.center.y, this.q2.center.z]
        }
    }

    static laodJson(obj, scene) {
        const ns = new Loxodromic(Sphere.loadJson(obj.s1, scene),
                                  Sphere.loadJson(obj.s2, scene),
                                  new Vec3(obj.p[0], obj.p[1], obj.p[2]),
                                  new Vec3(obj.q1[0], obj.q1[1], obj.q1[2]),
                                  new Vec3(obj.q2[0], obj.q2[1], obj.q2[2]));
        ns.setId(obj.id);
        return ns;
    }

    get name() {
        return 'Loxodromic';
    }

    static get S1() {
        return 0;
    }

    static get S2() {
        return 1;
    }

    static get P() {
        return 4;
    }

    static get Q1() {
        return 5;
    }

    static get Q2() {
        return 6;
    }
}
