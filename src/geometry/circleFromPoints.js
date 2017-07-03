import Circle from './circle.js'
import SelectionState from './selectionState.js'
import Vec2 from '../vector2d.js'

export default class CircleFromPoints extends Circle {
    constructor(p1, p2, p3) {
        super(new Vec2(0, 0), 0); // dammy arguments
        p1.addParent(this);
        p2.addParent(this);
        p3.addParent(this);
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        this.update();
    }

    update() {
        const a = this.p1.pos;
        const b = this.p2.pos;
        const c = this.p3.pos;
        const lA = Vec2.distance(b, c);
        const lB = Vec2.distance(a, c);
        const lC = Vec2.distance(a, b);
        const coefA = lA * lA * (lB * lB + lC * lC - lA * lA);
        const coefB = lB * lB * (lA * lA + lC * lC - lB * lB);
        const coefC = lC * lC * (lA * lA + lB * lB - lC * lC);
        const denom = coefA + coefB + coefC;
        this.center = new Vec2((coefA * a.x + coefB * b.x + coefC * c.x) / denom,
                               (coefA * a.y + coefB * b.y + coefC * c.y) / denom);
        this.r = Vec2.distance(this.center, a);
        this.rSq = this.r * this.r;
    }

    removable(mouse) {
        return false;
    }

    select(mouse, sceneScale) {
        const dp = mouse.sub(this.center);
        const d = dp.length();
        if (d > this.r) return new SelectionState();

        return new SelectionState().setObj(this)
            .setComponentId(Circle.BODY).setDiffObj(dp);
    }

    /**
     * Move circle
     * @param { SelectionState } mouseState
     * @param { Vec2 } mouse
     */
    move(mouseState, mouse) {
        const d = mouse.sub(this.center);
        const translation = d.sub(mouseState.diffObj);
        this.p1.translate(translation);
        this.p2.translate(translation);
        this.p3.translate(translation);
    }

    cloneDeeply() {
        return new CircleFromPoints(this.p1.cloneDeeply(),
                                    this.p2.cloneDeeply(),
                                    this.p3.cloneDeeply());
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
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_circleFromPoints${index}.selected`));
    }

    exportJson() {
        return {
            id: this.id,
            p1Id: this.p1.id,
            p2Id: this.p2.id,
            p3Id: this.p3.id
        };
    }

    static loadJson(obj, scene) {
        // We assume the points are already defined
        const nc = new CircleFromPoints(scene.getObjFromId(obj.p1Id),
                                        scene.getObjFromId(obj.p2Id),
                                        scene.getObjFromId(obj.p3Id));
        nc.setId(obj.id);
        return nc;
    }

    get name() {
        return 'CircleFromPoints'
    }
}
