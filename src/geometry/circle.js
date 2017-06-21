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
        this.circumferenceThickness = 0.01;
    }

    update() {
        this.rSq = this.r * this.r;
    }

    removable(mouse) {
        const d = Vec2.distance(mouse, this.center);
        return d < this.r;
    }

    select(mouse, sceneScale) {
        const dp = mouse.sub(this.center);
        const d = dp.length();
        if (d > this.r) return new SelectionState();

        const distFromCircumference = this.r - d;
        if (distFromCircumference < this.circumferenceThickness * sceneScale) {
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

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform2f(uniLocation[uniI++],
                     this.center.x, this.center.y);
        gl.uniform3f(uniLocation[uniI++],
                     this.r, this.rSq, this.circumferenceThickness * sceneScale);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_circle${index}.center`));
        uniLocation.push(gl.getUniformLocation(program, `u_circle${index}.radius`));
        uniLocation.push(gl.getUniformLocation(program, `u_circle${index}.selected`));
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