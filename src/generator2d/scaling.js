import Vec2 from '../vector2d.js';
import Generator from './generator.js';
import Circle from './circle.js';
import SelectionState from './selectionState.js';
import DistanceState from './distanceState.js';
import Radians from '../radians.js';

export default class Scaling extends Generator {
    /**
     *
     * @param {Vec2} center
     * @param {Number} c1r
     * @param {Number} c2r
     * @param {Number} scalingFactor
     */
    constructor(center, c1r, c2r, rotationAngleRad) {
        super();
        this.center = center;
        this.c1 = new Circle(this.center, c1r);
        this.c2 = new Circle(this.center, c2r);
        this.rotationAngleRad = rotationAngleRad;
        this.rotationAngleDeg = Radians.RadToDeg(this.rotationAngleRad);

        this.line1Dir = new Vec2(1, 0);
        const cosTheta = Math.cos(this.rotationAngleRad);
        const sinTheta = Math.sin(this.rotationAngleRad);
        this.line2Dir = new Vec2(this.line1Dir.x * cosTheta - this.line1Dir.y * sinTheta,
                                 this.line1Dir.x * sinTheta + this.line1Dir.y * cosTheta);
        this.line1P = this.c1.center.add(this.line1Dir.scale(this.c1.r));
        this.line2P = this.c2.center.add(this.line2Dir.normalize().scale(this.c2.r));

        this.line1Normal = new Vec2(-this.line1Dir.y, this.line1Dir.x).normalize();
        this.line2Normal = new Vec2(-this.line2Dir.y, this.line2Dir.x).normalize();


        this.pointRadius = 0.01;
        this.lineWidth = 0.01;

        this.update();
    }

    update() {
        this.c1d = this.c2.invertOnCircle(this.c1);

        this.rotationAngleRad = Math.atan2(this.line2P.y - this.center.y, this.line2P.x - this.center.x);
        this.rotationAngleDeg = Radians.RadToDeg(this.rotationAngleRad);
    }

    updateFromCenter() {
        this.c1.center = this.center.cloneDeeply();
        this.c2.center = this.center.cloneDeeply();

        this.c1d = this.c2.invertOnCircle(this.c1);

        this.line1P = this.c1.center.add(this.line1Dir.scale(this.c1.r));
        this.line2P = this.c2.center.add(this.line2Dir.normalize().scale(this.c2.r));
    }

    updateFromRotationAngle() {
        this.rotationAngleRad = Radians.DegToRad(this.rotationAngleDeg);
        this.c1d = this.c2.invertOnCircle(this.c1);

        this.line1Dir = new Vec2(1, 0);
        const cosTheta = Math.cos(this.rotationAngleRad);
        const sinTheta = Math.sin(this.rotationAngleRad);
        this.line2Dir = new Vec2(this.line1Dir.x * cosTheta - this.line1Dir.y * sinTheta,
                                 this.line1Dir.x * sinTheta + this.line1Dir.y * cosTheta);
        this.line1P = this.c1.center.add(this.line1Dir.scale(this.c1.r));
        this.line2P = this.c2.center.add(this.line2Dir.normalize().scale(this.c2.r));

        this.line1Dir = this.line1P.sub(this.c1.center);
        this.line1Normal = new Vec2(-this.line1Dir.y, this.line1Dir.x).normalize();
        this.line2Dir = this.line2P.sub(this.c1.center);
        this.line2Normal = new Vec2(-this.line2Dir.y, this.line2Dir.x).normalize();
    }

    removable(mouse) {
        const d = Vec2.distance(mouse, this.c1d.center);
        return d < this.c1d.r;
    }

    select(mouse, sceneScale) {
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
            this.center = mouse.sub(selectionState.diffObj);
            this.c2.center = this.center;
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
        case Scaling.LINE2_POINT: {
            const np = mouse.sub(selectionState.diffObj);
            this.line2Dir = np.sub(this.c1.center).normalize();
            this.line2P = this.c1.center.add(this.line2Dir.scale(this.c2.r));
            this.line2Normal = new Vec2(-this.line2Dir.y, this.line2Dir.x).normalize();
            this.update();
            break;
        }
        }

//        this.update();
    }

    /**
     * @param { SelectionState } selectionState
     * @param { Object } mouseState
     * @param { Object } keyState
     * @param { Scene2d } scene
     */
    moveAlongAxis(selectionState, mouseState, keyState, scene) {
        switch (selectionState.componentId) {
        case Scaling.BODY: {
            const diffLine1P = this.line1P.sub(this.c1.center);
            const diffLine2P = this.line2P.sub(this.c2.center);

            if (keyState.isPressingShift) {
                this.center.x = mouseState.position.sub(selectionState.diffObj).x;
            } else if (keyState.isPressingCtrl) {
                this.center.y = mouseState.position.sub(selectionState.diffObj).y;
            }
            this.c2.center = this.center;
            this.c1.center = this.c2.center;
            this.line1P = this.c1.center.add(diffLine1P);
            this.line2P = this.c1.center.add(diffLine2P);
            this.update();
            break;
        }
        case Scaling.C1_CIRCUMFERENCE: {
            const nr = Vec2.distance(this.c1.center, mouseState.position) + selectionState.distToComponent;
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
            const nr = Vec2.distance(this.c2.center, mouseState.position) + selectionState.distToComponent;
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
        case Scaling.LINE2_POINT: {
            const np = mouseState.position.sub(selectionState.diffObj);
            this.line2Dir = np.sub(this.c1.center).normalize();
            this.line2P = this.c1.center.add(this.line2Dir.scale(this.c2.r));
            this.line2Normal = new Vec2(-this.line2Dir.y, this.line2Dir.x).normalize();
            this.update();
            break;
        }
        }

//        this.update();
    }

    /**
     *
     * @param {Vec2} p
     */
    getDistances(p) {
        const d1 = Math.abs(Vec2.distance(this.c1.center, p) - this.c1.r);
        const d2 = Math.abs(Vec2.distance(this.c1d.center, p) - this.c1d.r);
        if (d1 < d2) {
            return [new DistanceState(d1, this, Scaling.C1_CIRCUMFERENCE),
                    new DistanceState(d2, this, Scaling.C2_CIRCUMFERENCE)];
        } else {
            return [new DistanceState(d2, this, Scaling.C2_CIRCUMFERENCE),
                    new DistanceState(d1, this, Scaling.C1_CIRCUMFERENCE)];
        }
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

    exportAsQueryString() {
        return `Scaling[]=${this.center.x},${this.center.y},${this.c1.r},${this.c2.r},${this.rotationAngleDeg}`;
    }

    exportJson() {
        return {
            id: this.id,
            center: [this.center.x, this.center.y],
            c1r: this.c1r,
            c2r: this.c2r,
            rotationAngleRad: this.rotationAngleRad
        };
    }

    cloneDeeply() {
        return new Scaling(this.center.cloneDeeply(),
                           this.c1.r,
                           this.c2.r,
                           this.rotationAngleRad);
    }

    static loadJson(obj, scene) {
        const no = new Scaling(new Vec2(obj.center[0], obj.center[1]),
                               obj.c1r, obj.c2r, obj.rotationAngleRad);
        no.setId(obj.id);
        return no;
    }

    static loadFromArray(array) {
        return new Scaling(new Vec2(array[0], array[1]), // center
                           new Vec2(array[2], array[3]), // c1r, c2r
                           Radians.RadtoDeg(array[4])); // rotation angle degrees
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
