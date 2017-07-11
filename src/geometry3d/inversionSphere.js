import BaseSphere from './baseSphere.js';

export default class InversionSphere extends BaseSphere {
    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_inversionSphere${index}.center`));
        uniLocation.push(gl.getUniformLocation(program, `u_inversionSphere${index}.r`));
        uniLocation.push(gl.getUniformLocation(program, `u_inversionSphere${index}.selected`));
    }

    static loadJson(obj, scene) {
        const nc = new InversionSphere(obj.center[0], obj.center[1], obj.center[2],
                                       obj.radius);
        console.log(nc);
        nc.setId(obj.id);
        return nc;
    }

    get name() {
        return 'InversionSphere';
    }
}
