import Sphere from './sphere.js';

export default class BaseSphere extends Sphere {
    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_baseSphere${index}.center`));
        uniLocation.push(gl.getUniformLocation(program, `u_baseSphere${index}.r`));
        uniLocation.push(gl.getUniformLocation(program, `u_baseSphere${index}.selected`));
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
