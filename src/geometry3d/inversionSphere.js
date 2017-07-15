import Sphere from './sphere.js';

export default class InversionSphere extends Sphere {
    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_inversionSphere${index}.center`));
        uniLocation.push(gl.getUniformLocation(program, `u_inversionSphere${index}.r`));
        uniLocation.push(gl.getUniformLocation(program, `u_inversionSphere${index}.selected`));
    }

    static loadJson(obj, scene) {
        const nc = new InversionSphere(obj.center[0], obj.center[1], obj.center[2],
                                       obj.radius);
        nc.setId(obj.id);
        return nc;
    }

    cloneDeeply() {
        return new InversionSphere(this.center.x, this.center.y, this.center.z, this.r);
    }

    get name() {
        return 'InversionSphere';
    }
}
