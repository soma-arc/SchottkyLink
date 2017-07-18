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
        this.hp1 = new HyperPlane(this.p, this.theta, this.phi);
        this.hp2 = new HyperPlane(this.p.add(this.normal.scale(this.planeDist)),
                                  this.theta, this.phi);
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_parallelPlanes${index}.p`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_parallelPlanes${index}.normal`));
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

    cloneDeeply() {
        return new ParallelPlanes(new Vec3(this.p.x, this.p.y, this.p.z),
                                       this.theta, this.phi, this.planeDist);
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
