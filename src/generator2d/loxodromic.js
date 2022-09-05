import Generator from '../generator2d/generator.js';
import Vec2 from '../vector2d.js';
import Circle from './circle.js';
import SelectionState from './selectionState.js';
import DistanceState from './distanceState.js';

export default class Loxodromic extends Generator {
    /**
     *
     * @param {Circle} c1
     * @param {Circle} c2
     * @param {Vec2} p
     */
    constructor(c1, c2, p) {
        super();
        this.c1 = c1;
        this.c2 = c2;
        this.p = p;

        this.lineWidth = 0.01;
        this.pointRadius = 0.01;

        this.update();

        this.c1PrevRadius = c1.r;
        this.c2PrevRadius = c2.r;
    }

    getPosition() {
        return this.c2.center;
    }

    setPosition(p) {
        this.c2.center = p;
    }

    update() {
        this.c1.update();
        this.c2.update();
        this.c1d = this.c2.invertOnCircle(this.c1);
        this.pC1Inv = this.c1.invertOnPoint(this.p);
        this.pC2Inv = this.c2.invertOnPoint(this.p);

        this.c3 = Circle.fromPoints(this.p, this.pC1Inv, this.pC2Inv);
        this.lineDir = this.c2.center.sub(this.c1.center).normalize();
        this.lineNormal = new Vec2(-this.lineDir.y, this.lineDir.x);
    }

    removable(mouse) {
        const d = Vec2.distance(mouse, this.c2.center);
        return d < this.c2.r;
    }

    select(mouse, sceneScale) {
        const dp = mouse.sub(this.p);
        if (dp.length() < this.pointRadius * sceneScale) {
            return new SelectionState().setObj(this)
                .setComponentId(Loxodromic.POINT)
                .setDiffObj(dp);
        }

        const c1State = this.c1.select(mouse, sceneScale);
        if (c1State.isSelectingObj()) {
            if (c1State.componentId === Circle.BODY) {
                return new SelectionState().setObj(this)
                    .setComponentId(Loxodromic.C1_BODY)
                    .setDiffObj(c1State.diffObj)
                    .setPrevPosition(this.c1.center);
            } else if (c1State.componentId === Circle.CIRCUMFERENCE) {
                this.c1PrevRadius = this.c1.r;
                return new SelectionState().setObj(this)
                    .setComponentId(Loxodromic.C1_CIRCUMFERENCE)
                    .setDistToComponent(c1State.distToComponent);
            }
        }

        const c2State = this.c2.select(mouse, sceneScale);
        if (c2State.isSelectingObj()) {
            if (c2State.componentId === Circle.BODY) {
                return new SelectionState().setObj(this)
                    .setComponentId(Loxodromic.C2_BODY)
                    .setDiffObj(c2State.diffObj)
                    .setPrevPosition(this.c2.center);
            } else if (c2State.componentId === Circle.CIRCUMFERENCE) {
                this.c2PrevRadius = this.c2.r;
                return new SelectionState().setObj(this)
                    .setComponentId(Loxodromic.C2_CIRCUMFERENCE)
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
        case Loxodromic.C1_BODY: {
            const np = mouse.sub(selectionState.diffObj);
            const npc2Len = this.c2.center.sub(np).length();
            if (npc2Len > this.c2.r - this.c1.r) {
                const mv = np.sub(this.c2.center).normalize();
                this.c1.center = this.c2.center.add(mv.scale(this.c2.r - this.c1.r));
                selectionState.setDiffObj(mouse.sub(this.c1.center));
                break;
            }
            this.c1.center = np;
            this.c1.update();
            break;
        }
        case Loxodromic.C1_CIRCUMFERENCE: {
            const nr = Vec2.distance(this.c1.center, mouse) + selectionState.distToComponent;
            const max = this.c2.center.sub(this.c1.center).length();
            if (this.c2.r - nr < max) {
                this.c1.r = -max + this.c2.r;
                this.c1.update();
                break;
            }
            this.c1.r = nr;
            this.c1.update();
            break;
        }
        case Loxodromic.C2_BODY: {
            const prevC2Center = this.c2.center;
            this.c2.center = mouse.sub(selectionState.diffObj);
            this.c2.update();
            const diff = this.c2.center.sub(prevC2Center);
            this.c1.center = this.c1.center.add(diff);
            this.p = this.p.add(diff);
            break;
        }
        case Loxodromic.C2_CIRCUMFERENCE: {
            const nr = Vec2.distance(this.c2.center, mouse) + selectionState.distToComponent;
            const max = this.c2.center.sub(this.c1.center).length();
            console.log(max);
            if (nr - this.c1.r < max) {
                this.c2.r = max + this.c1.r;
                this.c2.update();
                break;
            }
            this.c2.r = nr;

            this.c2.update();
            break;
        }
        case Loxodromic.POINT: {
            this.p = mouse.sub(selectionState.diffObj);
            break;
        }
        }

        this.update();
    }

    /**
     *
     * @param {Vec2} p
     */
    getDistances(p) {
        const d1 = Math.abs(Vec2.distance(this.c1.center, p) - this.c1.r);
        const d2 = Math.abs(Vec2.distance(this.c1d.center, p) - this.c1d.r);
        if (d1 < d2) {
            return [new DistanceState(d1, this, Loxodromic.C1_CIRCUMFERENCE),
                    new DistanceState(d2, this, Loxodromic.C2_CIRCUMFERENCE)];
        } else {
            return [new DistanceState(d2, this, Loxodromic.C2_CIRCUMFERENCE),
                    new DistanceState(d1, this, Loxodromic.C1_CIRCUMFERENCE)];
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
                     this.c3.center.x, this.c3.center.y, this.c3.r, this.c3.rSq);
        gl.uniform2f(uniLocation[uniI++],
                     this.p.x, this.p.y);
        gl.uniform4f(uniLocation[uniI++],
                     this.lineDir.x, this.lineDir.y, this.lineNormal.x, this.lineNormal.y);
        gl.uniform3f(uniLocation[uniI++],
                     this.pointRadius * sceneScale, this.lineWidth,
                     this.c1.circumferenceThickness * sceneScale);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.c1`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.c2`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.c1d`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.c3`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.p`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.line`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.ui`));
        uniLocation.push(gl.getUniformLocation(program, `u_loxodromic${index}.selected`));
    }

    exportAsQueryString() {
        return `Loxodromic[]=${this.c1.center.x},${this.c1.center.y},${this.c1.r},${this.c2.center.x},${this.c2.center.y},${this.c2.center.r},${this.p.x},${this.p.y}`;
    }

    exportJson() {
        return {
            id: this.id,
            c1: this.c1.exportJson(),
            c2: this.c2.exportJson(),
            p: [this.p.x, this.p.y]
        };
    }

    cloneDeeply() {
        return new Loxodromic(this.c1.cloneDeeply(),
                              this.c2.cloneDeeply(),
                              this.p.cloneDeeply());
    }

    static loadJson(obj, scene) {
        const nc = new Loxodromic(Circle.loadJson(obj.c1, scene),
                                  Circle.loadJson(obj.c2, scene),
                                  new Vec2(obj.p[0], obj.p[1]));
        nc.setId(obj.id);
        return nc;
    }

    static loadFromArray(array) {
        return new Loxodromic(new Circle(new Vec2(array[0], array[1]), array[2]),
                              new Circle(new Vec2(array[3], array[4]), array[5]),
                              new Vec2(array[6], array[7]));
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

    static get POINT() {
        return 4;
    }

    get name() {
        return 'Loxodromic';
    }
}
