import Vec2 from '../vector2d.js';
import Shape from './shape.js';
import Circle from './circle.js';
import SelectionState from './selectionState.js';

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
        this.c2 = new Circle(this.center, 1.5);

        this.line1P = this.c1.center.add(new Vec2(1, 0).scale(this.c1.r));
        this.line2P = this.c2.center.add(new Vec2(1, 1).normalize().scale(this.c2.r));

        this.pointRadius = 0.01;
        this.lineWidth = 0.01;

        this.update();
    }

    update() {
        this.c1d = this.c2.invertOnCircle(this.c1);

        this.line1Dir = this.line1P.sub(this.c1.center);
        this.line1Normal = new Vec2(-this.line1Dir.y, this.line1Dir.x).normalize();
        this.line2Dir = this.line2P.sub(this.c1.center);
        this.line2Normal = new Vec2(-this.line2Dir.y, this.line2Dir.x).normalize();
    }

    select(mouse, sceneScale) {
        const dpl1 = mouse.sub(this.line1P);
        if (dpl1.length() < this.pointRadius * sceneScale) {
            return new SelectionState().setObj(this)
                .setComponentId(Scaling.LINE1_POINT)
                .setDiffObj(dpl1);
        }

        const dpl2 = mouse.sub(this.line2P);
        if (dpl2.length() < this.pointRadius * sceneScale) {
            return new SelectionState().setObj(this)
                .setComponentId(Scaling.LINE2_POINT)
                .setDiffObj(dpl2);
        }

        const c1State = this.c1.select(mouse, sceneScale);
        if (c1State.isSelectingObj()) {
            if (c1State.componentId === Circle.BODY) {
                return new SelectionState().setObj(this)
                    .setComponentId(Scaling.BODY)
                    .setDiffObj(c1State.diffObj);
            } else if (c1State.componentId === Circle.CIRCUMFERENCE) {
                return new SelectionState().setObj(this)
                    .setComponentId(Scaling.C1_CIRCUMFERENCE)
                    .setDistToComponent(c1State.distToComponent);
            }
        }

        const c2State = this.c2.select(mouse, sceneScale);
        if (c2State.isSelectingObj()) {
            if (c2State.componentId === Circle.BODY) {
                return new SelectionState().setObj(this)
                    .setComponentId(Scaling.BODY)
                    .setDiffObj(c2State.diffObj);
            } else if (c2State.componentId === Circle.CIRCUMFERENCE) {
                return new SelectionState().setObj(this)
                    .setComponentId(Scaling.C2_CIRCUMFERENCE)
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
        case Scaling.BODY: {
            const diffLine1P = this.line1P.sub(this.c1.center);
            const diffLine2P = this.line2P.sub(this.c2.center);
            this.c2.center = mouse.sub(selectionState.diffObj);
            this.c1.center = this.c2.center;
            this.line1P = this.c1.center.add(diffLine1P);
            this.line2P = this.c1.center.add(diffLine2P);
            this.update();
            break;
        }
        case Scaling.C1_CIRCUMFERENCE: {
            const nr = Vec2.distance(this.c1.center, mouse) + selectionState.distToComponent;
            const max = this.c2.center.sub(this.c1.center).length();
            if (this.c2.r - nr < max) {
                this.c1.r = -max + this.c2.r;
                this.c1.update();
                break;
            }
            this.c1.r = nr;
            this.c1.update();
            this.c1d = this.c2.invertOnCircle(this.c1);

            this.line1P = this.c1.center.add(this.line1Dir.normalize().scale(this.c1.r));
            break;
        }
        case Scaling.C2_CIRCUMFERENCE: {
            const nr = Vec2.distance(this.c2.center, mouse) + selectionState.distToComponent;
            const max = this.c2.center.sub(this.c1.center).length();
            if (nr - this.c1.r < max) {
                this.c2.r = max + this.c1.r;
                this.c2.update();
                break;
            }
            this.c2.r = nr;

            this.c2.update();
            this.c1d = this.c2.invertOnCircle(this.c1);

            this.line2P = this.c2.center.add(this.line2Dir.normalize().scale(this.c2.r));
            break;
        }
        case Scaling.LINE1_POINT: {
            const np = mouse.sub(selectionState.diffObj);
            this.line1Dir = np.sub(this.c1.center).normalize();
            this.line1P = this.c1.center.add(this.line1Dir.scale(this.c1.r));
            this.line1Normal = new Vec2(-this.line1Dir.y, this.line1Dir.x).normalize();
            break;
        }
        case Scaling.LINE2_POINT: {
            const np = mouse.sub(selectionState.diffObj);
            this.line2Dir = np.sub(this.c1.center).normalize();
            this.line2P = this.c1.center.add(this.line2Dir.scale(this.c2.r));
            this.line2Normal = new Vec2(-this.line2Dir.y, this.line2Dir.x).normalize();
            break;
        }
        }

//        this.update();
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform4f(uniLocation[uniI++],
                     this.c1.center.x, this.c1.center.y, this.c1.r, this.c1.rSq);
        gl.uniform4f(uniLocation[uniI++],
                     this.c2.center.x, this.c2.center.y, this.c2.r, this.c2.rSq);
        gl.uniform4f(uniLocation[uniI++],
                     this.c1d.center.x, this.c1d.center.y, this.c1d.r, this.c1d.rSq);
        gl.uniform4f(uniLocation[uniI++],
                     this.line1P.x, this.line1P.y, this.line1Normal.x, this.line1Normal.y);
        gl.uniform4f(uniLocation[uniI++],
                     this.line2P.x, this.line2P.y, this.line2Normal.x, this.line2Normal.y);
        gl.uniform2f(uniLocation[uniI++],
                     this.pointRadius * sceneScale, this.lineWidth);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_scaling${index}.c1`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_scaling${index}.c2`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_scaling${index}.c1d`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_scaling${index}.line1`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_scaling${index}.line2`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_scaling${index}.ui`));
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
        const no = new Scaling(new Vec2(obj.center[0], obj.center[1]),
                               new Vec2(obj.scalingFactor[0], obj.scalingFactor[1]));
        no.setId(obj.id);
        return no;
    }

    get name() {
        return 'Scaling';
    }

    static get BODY() {
        return 0;
    }

    static get C1_CIRCUMFERENCE() {
        return 1;
    }

    static get C2_CIRCUMFERENCE() {
        return 2;
    }

    static get LINE1_POINT() {
        return 3;
    }

    static get LINE2_POINT() {
        return 4;
    }
}
