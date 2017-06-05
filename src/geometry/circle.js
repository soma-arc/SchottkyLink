import assert from 'power-assert';
import Vec2 from '../vector.js';
import SelectionState from './selectionState.js';
import Shape from './shape.js';

export default class Circle extends Shape {
    constructor(center, r) {
        super();
        this.center = center;
        this.r = r;
        this.rSq = r * r;
        this.circumferenceThickness = 10;
    }

    update() {
        this.rSq = this.r * this.r;
    }

    removable(mouse) {
        assert.ok(mouse instanceof Vec2);
        const d = Vec2.distance(mouse, this.center);
        return d < this.r;
    }

    select(mouse) {
        assert.ok(mouse instanceof Vec2);

        const dp = mouse.sub(this.center);
        const d = dp.length();
        if (d > this.r) return new SelectionState();

        const distFromCircumference = this.r - d;
        if (distFromCircumference < this.circumferenceThickness) {
            return new SelectionState().setObj(this)
                .setComponentId(Circle.CIRCUMFERENCE)
                .setDistToComponent(distFromCircumference);
        }

        return new SelectionState().setObj(this)
            .setComponentId(Circle.BODY)
            .setDiffObj(dp);
    }

    /**
     * Move circle
     * @param { SelectionState } mouseState
     * @param { Vec2 } mouse
     */
    move(mouseState, mouse) {
        assert.ok(mouse instanceof Vec2);

        if (mouseState.componentId === Circle.CIRCUMFERENCE) {
            this.r = Vec2.distance(this.center, mouse) + mouseState.distToComponent;
        } else {
            this.center = mouse.sub(mouseState.diffObj);
        }

        this.update();
    }

    cloneDeeply() {
        return new Circle(this.center.cloneDeeply(), this.r);
    }

    getUniformArray() {
        return this.center.getUniformArray().concat([this.r, this.rSq]);
    }

    setUniformValues(gl, uniLocation, uniIndex) {
        assert.ok(typeof uniIndex === 'number');
        let uniI = uniIndex;
        gl.uniform4f(uniLocation[uniI++],
                     this.center.x, this.center.y, this.r, this.rSq);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        assert.ok(typeof index === 'number');
        uniLocation.push(gl.getUniformLocation(program, `u_circle${index}`));
    }

    exportJson() {
        return {
            id: this.id,
            center: [this.center.x, this.center.y],
            radius: this.r,
        };
    }

    static loadJson(obj, scene) {
        const nc = new Circle(new Vec2(obj.center[0], obj.center[1]),
                              obj.radius);
        nc.setId(obj.id);
        return nc;
    }

    static get BODY() {
        return 0;
    }

    static get CIRCUMFERENCE() {
        return 1;
    }
}
