import Vec2 from '../vector.js';
import HalfPlane from './halfPlane.js';
import SelectionState from './selectionState.js';
import Shape from './shape.js';

export default class Rotation extends Shape {
    constructor(p, boundaryDir, degrees) {
        super();
        this.p = p;
        this.degrees = degrees;
        this.boundaryDir1 = boundaryDir;
        this.update();
    }

    update() {
        const radians = this.degrees * Math.PI / 180;
        const cosTheta = Math.cos(radians);
        const sinTheta = Math.sin(radians);
        this.normal1 = new Vec2(-this.boundaryDir1.y, this.boundaryDir1.x);
        this.normal2 = new Vec2(this.normal1.x * cosTheta - this.normal1.y * sinTheta,
                                this.normal1.x * sinTheta + this.normal1.y * cosTheta).scale(-1);
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform2f(uniLocation[uniI++],
                     this.p.x, this.p.y);
        gl.uniform4f(uniLocation[uniI++],
                     this.normal1.x, this.normal1.y,
                     this.normal2.x, this.normal2.y);
        gl.uniform2f(uniLocation[uniI++],
                     this.normalUIRingRadius * sceneScale,
                     this.UIPointRadius * sceneScale);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_rotation${index}.p`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_rotation${index}.normal`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_rotation${index}.ui`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_rotation${index}.selected`));
    }

    exportJson() {
        return {
            id: this.id,
            p: [this.p.x, this.p.y],
            boundaryDir: [this.boundaryDir1.x, this.boundaryDir2.y],
            degrees: this.degrees
        };
    }

    static loadJson(obj, scene) {
        const nh = new Rotation(new Vec2(obj.p[0], obj.p[1]),
                                new Vec2(obj.boundaryDir[0], obj.boundaryDir[1]),
                                obj.degrees);
        nh.setId(obj.id);
        return nh;
    }
}
