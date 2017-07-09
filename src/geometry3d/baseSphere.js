import Vec3 from '../vector3d.js';
import Shape3d from './shape3d.js';

export default class BaseSphere extends Shape3d {
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
        gl.uniform4f(uniLocation[uniI++],
                     this.center.x, this.center.y, this.center.z);
        gl.uniform2fv(uniLocation[uniI++],
                     this.r, this.rSq);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_baseSphere${index}.center`));
        uniLocation.push(gl.getUniformLocation(program, `u_baseSphere${index}.r`));
        uniLocation.push(gl.getUniformLocation(program, `u_baseSphere${index}.selected`));
    }

    exportJson() {
        return {
            id: this.id,
            center: [this.center.x, this.center.y, this.center.z],
            radius: this.r,
        };
    }

    static loadJson(obj, scene) {
        const nc = new BaseSphere(obj.center[0], obj.center[1], obj.center[2],
                                  obj.radius);
        nc.setId(obj.id);
        return nc;
    }

    get name() {
        return 'BaseSphere';
    }
}
