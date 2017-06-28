import Shape from './shape.js';
import Circle from './circle.js';
import SelectionState from './selectionState.js';
import Vec2 from '../vector.js';

export default class TwoCircles extends Shape {
    /**
     *
     * @param {Circle} c1
     * @param {Circle} c2
     */
    constructor(c1, c2) {
        super();
        this.c1 = c1;
        this.c2 = c2;
        this.update();
    }

    update() {
        this.c1d = this.c2.invertOnCircle(this.c1);
    }

    select(mouse, sceneScale) {
        const c1State = this.c1.select(mouse, sceneScale);
        if (c1State.isSelectingObj()) {
            if (c1State.componentId === Circle.BODY) {
                return new SelectionState().setObj(this)
                    .setComponentId(TwoCircles.C1_BODY)
                    .setDiffObj(c1State.diffObj);
            } else if (c1State.componentId === Circle.CIRCUMFERENCE) {
                return new SelectionState().setObj(this)
                    .setComponentId(TwoCircles.C1_CIRCUMFERENCE)
                    .setDistToComponent(c1State.distToComponent);
            }
        }

        const c2State = this.c2.select(mouse, sceneScale);
        if (c2State.isSelectingObj()) {
            if (c2State.componentId === Circle.BODY) {
                return new SelectionState().setObj(this)
                    .setComponentId(TwoCircles.C2_BODY)
                    .setDiffObj(c2State.diffObj);
            } else if (c2State.componentId === Circle.CIRCUMFERENCE) {
                return new SelectionState().setObj(this)
                    .setComponentId(TwoCircles.C2_CIRCUMFERENCE)
                    .setDistToComponent(c2State.distToComponent);
            }
        }
        return new SelectionState();
    }

    /**
     * @param { SelectionState } selectionState
     * @param { Vec2 } mouse
     */
    move(selectionState, mouse) {
        switch (selectionState.componentId) {
        case TwoCircles.C1_BODY: {
            this.c1.center = mouse.sub(selectionState.diffObj);
            this.c1.update();
            break;
        }
        case TwoCircles.C1_CIRCUMFERENCE: {
            this.c1.r = Vec2.distance(this.c1.center, mouse) + selectionState.distToComponent;
            this.c1.update();
            break;
        }
        case TwoCircles.C2_BODY: {
            const d = this.c2.center;
            this.c2.center = mouse.sub(selectionState.diffObj);
            this.c1.center = this.c1.center.add(this.c2.center.sub(d));
            this.c2.update();
            break;
        }
        case TwoCircles.C2_CIRCUMFERENCE: {
            this.c2.r = Vec2.distance(this.c2.center, mouse) + selectionState.distToComponent;
            this.c2.update();
            break;
        }
        }

        this.update();
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform4f(uniLocation[uniI++],
                     this.c1.center.x, this.c1.center.y, this.c1.r, this.c1.rSq);
        gl.uniform4f(uniLocation[uniI++],
                     this.c2.center.x, this.c2.center.y, this.c2.r, this.c2.rSq);
        gl.uniform4f(uniLocation[uniI++],
                     this.c1d.center.x, this.c1d.center.y, this.c1d.r, this.c1d.rSq);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_hyperbolic${index}.c1`));
        uniLocation.push(gl.getUniformLocation(program, `u_hyperbolic${index}.c2`));
        uniLocation.push(gl.getUniformLocation(program, `u_hyperbolic${index}.c1d`));
        uniLocation.push(gl.getUniformLocation(program, `u_hyperbolic${index}.selected`));
    }

    exportJson() {
        return {
            id: this.id,
            c1: this.c1.exportJson(),
            c2: this.c2.exportJson(),
        };
    }

    static loadJson(obj, scene) {
        const nc = new TwoCircles(Circle.loadJson(obj.c1, scene),
                                  Circle.loadJson(obj.c2, scene));
        nc.setId(obj.id);
        return nc;
    }

    static get C1_BODY() {
        return 0;
    }

    static get C1_CIRCUMFERENCE() {
        return 1;
    }

    static get C2_BODY() {
        return 2;
    }

    static get C2_CIRCUMFERENCE() {
        return 3;
    }
}
