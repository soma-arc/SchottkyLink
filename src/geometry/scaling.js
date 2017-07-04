import Vec2 from '../vector2d.js';
import Shape from './shape.js';
import Circle from './circle.js';

export default class Scaling extends Shape {
    /**
     *
     * @param {Vec2} center
     * @param {Vec2} scalingFactor
     */
    constructor(center, scalingFactor) {
        super();
        this.center = center;
        this.scalingFactor = scalingFactor;
        this.c1 = new Circle(this.center, 1);
        this.c2 = new Circle(this.center, scalingFactor.length());
    }

    update() {
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform2f(uniLocation[uniI++],
                     this.center.x, this.center.y);
        gl.uniform2f(uniLocation[uniI++],
                     this.scalingFactor.x, this.scalingFactor.y);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_scaling${index}.center`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_scaling${index}.scalingFactor`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_scaling${index}.selected`));
    }

    exportJson() {
        return {
            id: this.id,
            center: [this.center.x, this.center.y],
            scalingFactor: [this.scalingFactor.x, this.scalingFactor.y]
        };
    }

    static loadJson(obj, scene) {
        const no = new Scaling(new Vec2(obj.center.x, obj.center.y),
                               new Vec2(obj.scalingFactor.x, obj.scalingFactor.y));
        no.setId(obj.id);
        return no;
    }

    get name() {
        return 'Scaling';
    }
}
