import Vec2 from '../vector2d.js';
import SelectionState from './selectionState.js';
import DistanceState from './distanceState.js';
import Generator from './generator.js';

export default class Circle extends Generator {
    constructor(center, r) {
        super();
        this.center = center;
        this.r = r;
        this.rSq = r * r;
        this.prevRadius = r;
        this.circumferenceThickness = 0.01;

        this.snapMode = Circle.SNAP_NONE;
    }

    getPosition() {
        return this.center;
    }

    setPosition(p) {
        this.center = p;
    }

    update() {
        this.rSq = this.r * this.r;
    }

    /**
     *
     * @param {Vec2} position
     */
    outside(position) {
        const d = Vec2.distance(position, this.center);
        return d > this.r;
    }

    removable(mouse) {
        return !this.outside(mouse);
    }

    generateNeighborGenerator() {
        const rad = Math.random() * Math.PI * 2;
        const dir = new Vec2(Math.cos(rad), Math.sin(rad));
        const r = this.r;
        const c = this.center.add(dir.scale(this.r + r));
        return new Circle(c, r);
    }

    select(mouse, sceneScale, selectionScale) {
        if(selectionScale === undefined) {
            selectionScale = 1;
        }
        const dp = mouse.sub(this.center);
        const d = dp.length();
        if (d > this.r) return new SelectionState();

        const distFromCircumference = this.r - d;
        if (distFromCircumference < this.circumferenceThickness * sceneScale * selectionScale) {
            this.prevRadius = this.r;
            return new SelectionState().setObj(this)
                .setComponentId(Circle.CIRCUMFERENCE)
                .setDistToComponent(distFromCircumference)
                .setPrevPosition(this.center);
        }

        return new SelectionState().setObj(this)
            .setComponentId(Circle.BODY)
            .setDiffObj(dp)
            .setPrevPosition(this.center);
    }

    selectBody(mouse, sceneScale) {
        return this.select(mouse, sceneScale);
    }

    translate(vec) {
        this.center.add(vec);
        this.update();
    }

    /**
     * Move circle
     * @param { SelectionState } selectionState
     * @param { Vec2 } mouse
     * @param { Scene } scene
     */
    move(selectionState, mouse, scene) {
        if (selectionState.componentId === Circle.CIRCUMFERENCE) {
            const nr = Vec2.distance(this.center, mouse) + selectionState.distToComponent;
            this.r = nr;
            if (this.snapMode === Circle.SNAP_NEAREST) {
                const nearObj = scene.getNearObjectsDistance(this, this.center)[0].obj;
                if (Math.abs(nr + nearObj.r - nearObj.center.sub(this.center).length()) < 0.015) {
                    this.r = -nearObj.r + nearObj.center.sub(this.center).length();
                }
            }
        } else {
            this.center = mouse.sub(selectionState.diffObj);
            if (this.snapMode === Circle.SNAP_NEAREST) {
                this.center = mouse.sub(selectionState.diffObj);
                const d = scene.getNearObjectsDistance(this, this.center)[0].distance;
                this.r = (d === Number.MAX_VALUE) ? this.r : d;
            } else if (this.snapMode === Circle.SNAP_TWO_CIRCLES) {
                for(let i = 0; i < 50; i++) {
                    const objStates = scene.getNearObjectsDistance(this, this.center);
                    const nearDistState1 = objStates[0];
                    const nearDistState2 = objStates[1];
                    const step = 0.1;
                    if (0 < (nearDistState1.distance) &&
                        (nearDistState1.distance) < 0.15) {
                        const dr = step * (nearDistState1.distance - this.r);
                        const dir = nearDistState1.obj.center.sub(this.center).normalize();
                        this.r += dr;
                        this.center = this.center.add(dir.scale(dr));
                    }
                    if(0 < (nearDistState2.distance) &&
                       (nearDistState2.distance) < 0.15) {
                        const dr = step * (nearDistState2.distance - this.r);
                        const dir = nearDistState2.obj.center.sub(this.center).normalize();
                        this.r += dr;
                        this.center = this.center.add(dir.scale(dr));
                    }
                }
            }
        }

        this.update();
    }

    /**
     * Move circle
     * @param { SelectionState } selectionState
     * @param { Object } mouseState
     * @param { Object } keyState
     * @param { Scene } scene
     */
    moveAlongAxis(selectionState, mouseState, keyState, scene) {
        if (selectionState.componentId === Circle.CIRCUMFERENCE) {
            const nr = Vec2.distance(this.center, mouseState.position) + selectionState.distToComponent;
            this.r = nr;
            if (this.snapMode === Circle.SNAP_NEAREST) {
                const nearObj = scene.getNearObjectsDistance(this, this.center)[0].obj;
                if (Math.abs(nr + nearObj.r - nearObj.center.sub(this.center).length()) < 0.015) {
                    this.r = -nearObj.r + nearObj.center.sub(this.center).length();
                }
            }
        } else {
            //console.log(this.center.x + ' '+ this.center.y);
            const prevCenterX = mouseState.prevPosition.x - selectionState.diffObj.x;
            const prevCenterY = mouseState.prevPosition.y - selectionState.diffObj.y;
            console.log(`*(${prevCenterX}, ${prevCenterY})`);
            //console.log(`${Math.abs(prevCenterX - mouseState.position.x)}, ${Math.abs(prevCenterY - mouseState.position.y)}`);
            if(keyState.isPressingShift) {
                this.center.x = prevCenterX + (mouseState.position.x - mouseState.prevPosition.x);
                this.center.y = prevCenterY;
            } else if(keyState.isPressingCtrl){
                this.center.x = prevCenterX;
                this.center.y = prevCenterY + (mouseState.position.y - mouseState.prevPosition.y);
            }
            //this.center = mouseState.position.sub(selectionState.diffObj);
            // if (this.snapMode === Circle.SNAP_NEAREST) {
            //   //  this.center = mouseState.position.sub(selectionState.diffObj);
            //     const d = scene.getNearObjectsDistance(this, this.center)[0].distance;
            //     this.r = (d === Number.MAX_VALUE) ? this.r : d;
            // } else if (this.snapMode === Circle.SNAP_TWO_CIRCLES) {
            //     for(let i = 0; i < 50; i++) {
            //         const objStates = scene.getNearObjectsDistance(this, this.center);
            //         const nearDistState1 = objStates[0];
            //         const nearDistState2 = objStates[1];
            //         const step = 0.1;
            //         if (0 < (nearDistState1.distance) &&
            //             (nearDistState1.distance) < 0.15) {
            //             const dr = step * (nearDistState1.distance - this.r);
            //             const dir = nearDistState1.obj.center.sub(this.center).normalize();
            //             this.r += dr;
            //             this.center = this.center.add(dir.scale(dr));
            //         }
            //         if(0 < (nearDistState2.distance) &&
            //            (nearDistState2.distance) < 0.15) {
            //             const dr = step * (nearDistState2.distance - this.r);
            //             const dir = nearDistState2.obj.center.sub(this.center).normalize();
            //             this.r += dr;
            //             this.center = this.center.add(dir.scale(dr));
            //         }
            //     }
            // }
        }

        this.update();
    }

    /**
     *
     * @param {Vec2} p
     */
    getDistances(p) {
        return [new DistanceState(Math.abs(Vec2.distance(this.center, p) - this.r),
                                  this,
                                  Circle.CIRCUMFERENCE)];
    }

    toggleSnapMode() {
        if (this.snapMode === Circle.SNAP_NONE) {
            this.snapMode = Circle.SNAP_NEAREST;
        } else {
            this.snapMode = Circle.SNAP_NONE;
        }
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

    exportAsQueryString() {
        return `Circle[]=${this.center.x.toFixed(this.digits)},${this.center.y.toFixed(this.digits)},${this.r.toFixed(this.digits)}`;
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

    static loadFromArray(array) {
        return new Circle(new Vec2(array[0], array[1]), array[2]);
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

    isBody(componentId) {
        return componentId === Circle.BODY;
    }

    static get BODY() {
        return 0;
    }

    static get CIRCUMFERENCE() {
        return 1;
    }

    static get SNAP_NONE() {
        return 0;
    }

    static get SNAP_NEAREST() {
        return 1;
    }

    static get SNAP_TWO_CIRCLES() {
        return 2;
    }

    get name() {
        return 'Circle';
    }
}
