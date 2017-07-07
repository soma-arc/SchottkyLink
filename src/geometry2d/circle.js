import assert from 'power-assert';
import Vec2 from '../vector2d.js';
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
     * @param { SelectionState } selectionState
     * @param { Vec2 } mouse
     */
    move(selectionState, mouse) {
        if (selectionState.componentId === Circle.CIRCUMFERENCE) {
            this.r = Vec2.distance(this.center, mouse) + selectionState.distToComponent;
        } else {
            this.center = mouse.sub(selectionState.diffObj);
        }

        this.update();
    }

    cloneDeeply() {
        return new Circle(this.center.cloneDeeply(), this.r);
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform4f(uniLocation[uniI++],
                     this.center.x, this.center.y, this.r, this.rSq);
        gl.uniform1f(uniLocation[uniI++],
                     this.circumferenceThickness * sceneScale);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_circle${index}.centerAndRadius`));
        uniLocation.push(gl.getUniformLocation(program, `u_circle${index}.ui`));
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

    /**
     * Apply inversion to a given point
     * @param {Vec2} p
     */
    invertOnPoint (p) {
        const r2 = this.r * this.r;
        const d = p.sub(this.center);
        const lenSq = d.lengthSq();
        return d.scale(r2 / lenSq).add(this.center);
    }

    /**
     * Apply inversion to a given circle
     * @param {Circle} c
     * @returns {Circle}
     */
    invertOnCircle (c) {
        const coeffR = c.r * Math.sqrt(2) / 2;
        const p1 = this.invertOnPoint(c.center.add(new Vec2(coeffR, coeffR)));
        const p2 = this.invertOnPoint(c.center.add(new Vec2(-coeffR, -coeffR)));
        const p3 = this.invertOnPoint(c.center.add(new Vec2(coeffR, -coeffR)));
        return Circle.fromPoints(p1, p2, p3);
    }

    /**
     * Compute a circle passing through three points
     * @param {Vec2} a
     * @param {Vec2} b
     * @param {Vec2} c
     * @returns {Circle}
     */
    static fromPoints (a, b, c) {
        const lA = Vec2.distance(b, c);
        const lB = Vec2.distance(a, c);
        const lC = Vec2.distance(a, b);
        const coefA = lA * lA * (lB * lB + lC * lC - lA * lA);
        const coefB = lB * lB * (lA * lA + lC * lC - lB * lB);
        const coefC = lC * lC * (lA * lA + lB * lB - lC * lC);
        const denom = coefA + coefB + coefC;
        const center = new Vec2((coefA * a.x + coefB * b.x + coefC * c.x) / denom,
                                (coefA * a.y + coefB * b.y + coefC * c.y) / denom);
        const r = Vec2.distance(center, a);
        return new Circle(center, r);
    }

    static get BODY() {
        return 0;
    }

    static get CIRCUMFERENCE() {
        return 1;
    }

    get name() {
        return 'Circle';
    }
}
