import Vec2 from '../vector2d.js';
import HalfPlane from './halfPlane.js';
import SelectionState from './selectionState.js';
import DistanceState from './distanceState.js';
import Generator from './generator.js';
import Radians from '../radians.js';

export default class ParallelTranslation extends Generator {
    /**
     * Translation is 2 * (distance between hp1 and hp2)
     * //// hp2 /////
     * //////////////
     * ------+-------
     *       ^ normal
     *       |
     *       |
     * ------+-------
     * ///// p //////
     * //////////////
     * //// hp1 /////
     * @param {Vec2} p
     * @param {Vec2} normal
     * @param {number} planeDist
     */
    constructor(p, normal, planeDist) {
        super();
        this.p = p;
        this.normal = normal.normalize();
        this.planeDist = planeDist;

        this.normalUIRingRadius = 0.1;
        this.UIPointRadius = 0.01;

        this.update();
    }

    update() {
        this.normalAngleRad = Math.atan2(this.normal.y, this.normal.x);
        this.normalAngleRad += this.normalAngleRad < 0 ? 2 * Math.PI : 0;
        this.normalAngleDeg = Radians.RadToDeg(this.normalAngleRad);
        this.normalAngleDeg = this.normalAngleDeg % 360;
        this.boundaryDir = new Vec2(-this.normal.y,
                                    this.normal.x);
        this.hp1 = new HalfPlane(this.p, this.normal);
        this.hp2 = new HalfPlane(this.p.add(this.normal.scale(this.planeDist)),
                                 this.normal.scale(-1));
    }

    updateFromNormal() {
        this.boundaryDir = new Vec2(-this.normal.y,
                                    this.normal.x);
        this.hp1 = new HalfPlane(this.p, this.normal);
        this.hp2 = new HalfPlane(this.p.add(this.normal.scale(this.planeDist)),
                                 this.normal.scale(-1));
    }

    select(mouse, sceneScale) {
        // normal control point
        const dpNormal = mouse.sub(this.p.add(this.normal.scale(this.normalUIRingRadius * sceneScale)));
        if (dpNormal.length() < this.UIPointRadius * sceneScale) {
            return new SelectionState().setObj(this)
                .setComponentId(ParallelTranslation.NORMAL_POINT)
                .setDiffObj(dpNormal);
        }

        return this.selectBody(mouse, sceneScale);
    }

    selectBody(mouse, sceneScale) {
        const dp = mouse.sub(this.p);
        // point of hp2
        const dp2 = mouse.sub(this.p.add(this.normal.scale(this.planeDist)));
        if (dp2.length() < this.UIPointRadius * sceneScale) {
            return new SelectionState().setObj(this)
                .setComponentId(ParallelTranslation.POINT_HP2)
                .setDiffObj(dp2);
        }

        if (Vec2.dot(dp, this.normal) > 0 &&
            Vec2.dot(dp2, this.normal.scale(-1)) > 0) {
            return new SelectionState();
        }

        return new SelectionState().setObj(this)
            .setComponentId(ParallelTranslation.BODY)
            .setDiffObj(dp);
    }

    isHandle(componentId) {
        return componentId === ParallelTranslation.NORMAL_POINT ||
            componentId === ParallelTranslation.POINT_HP2;
    }

    removable(mouse) {
        const dp = mouse.sub(this.p);
        const dp2 = mouse.sub(this.p.add(this.normal.scale(this.planeDist)));
        if (Vec2.dot(dp, this.normal) < 0 ||
            Vec2.dot(dp2, this.normal.scale(-1)) < 0) {
            return true;
        }
        return false;
    }

    move(selectionState, mouse) {
        switch (selectionState.componentId) {
        case ParallelTranslation.BODY: {
            this.p = mouse.sub(selectionState.diffObj);
            break;
        }
        case ParallelTranslation.NORMAL_POINT: {
            this.normal = mouse.sub(this.p).normalize();
            let rad = Math.atan2(this.normal.y, this.normal.x);
            if (Math.abs(rad) < 0.1) {
                rad = 0;
            } else if (rad > 0) {
                if (Math.abs(rad - Radians.PI_12) < 0.1) {
                    rad = Radians.PI_12;
                } else if (Math.abs(rad - Radians.PI_6) < 0.1) {
                    rad = Radians.PI_6;
                } else if (Math.abs(rad - Radians.PI_4) < 0.1) {
                    rad = Radians.PI_4;
                } else if (Math.abs(rad - Radians.PI_3) < 0.1) {
                    rad = Radians.PI_3;
                } else if (Math.abs(rad - Radians.FIVE_PI_12) < 0.1) {
                    rad = Radians.FIVE_PI_12;
                } else if (Math.abs(rad - Radians.PI_2) < 0.1) {
                    rad = Radians.PI_2;
                } else if (Math.abs(rad - Radians.SEVEN_PI_12) < 0.1) {
                    rad = Radians.SEVEN_PI_12;
                } else if (Math.abs(rad - Radians.TWO_PI_3) < 0.1) {
                    rad = Radians.TWO_PI_3;
                } else if (Math.abs(rad - Radians.THREE_PI_4) < 0.1) {
                    rad = Radians.THREE_PI_4;
                } else if (Math.abs(rad - Radians.FIVE_PI_6) < 0.1) {
                    rad = Radians.FIVE_PI_6;
                } else if (Math.abs(rad - Radians.ELEVEN_PI_12) < 0.1) {
                    rad = Radians.ELEVEN_PI_12;
                } else if (Math.abs(rad - Radians.PI) < 0.1) {
                    rad = Radians.PI;
                }
            } else {
                if (Math.abs(rad + Radians.PI_12) < 0.1) {
                    rad = -Radians.PI_12;
                } else if (Math.abs(rad + Radians.PI_6) < 0.1) {
                    rad = -Radians.PI_6;
                } else if (Math.abs(rad + Radians.PI_4) < 0.1) {
                    rad = -Radians.PI_4;
                } else if (Math.abs(rad + Radians.PI_3) < 0.1) {
                    rad = -Radians.PI_3;
                } else if (Math.abs(rad + Radians.FIVE_PI_12) < 0.1) {
                    rad = -Radians.FIVE_PI_12;
                } else if (Math.abs(rad + Radians.PI_2) < 0.1) {
                    rad = -Radians.PI_2;
                } else if (Math.abs(rad + Radians.SEVEN_PI_12) < 0.1) {
                    rad = -Radians.SEVEN_PI_12;
                } else if (Math.abs(rad + Radians.TWO_PI_3) < 0.1) {
                    rad = -Radians.TWO_PI_3;
                } else if (Math.abs(rad + Radians.THREE_PI_4) < 0.1) {
                    rad = -Radians.THREE_PI_4;
                } else if (Math.abs(rad + Radians.FIVE_PI_6) < 0.1) {
                    rad = -Radians.FIVE_PI_6;
                } else if (Math.abs(rad + Radians.ELEVEN_PI_12) < 0.1) {
                    rad = -Radians.ELEVEN_PI_12;
                } else if (Math.abs(rad + Radians.PI) < 0.1) {
                    rad = Radians.PI;
                }
            }
            this.normal = new Vec2(Math.cos(rad), Math.sin(rad));
            break;
        }
        case ParallelTranslation.POINT_HP2: {
            const len = Vec2.dot(this.normal, mouse.sub(this.p));
            if (len < 0) return;
            this.planeDist = len;
            break;
        }
        }

        this.update();
    }

    moveAlongAxis(selectionState, mouseState, keyState, scene) {
        switch (selectionState.componentId) {
        case ParallelTranslation.BODY: {
            if (keyState.isPressingShift) {
                this.p.x = mouseState.position.sub(selectionState.diffObj).x;
            } else if (keyState.isPressingCtrl) {
                this.p.y = mouseState.position.sub(selectionState.diffObj).y;
            }
            break;
        }
        case ParallelTranslation.NORMAL_POINT: {
            this.normal = mouseState.position.sub(this.p).normalize();
            let rad = Math.atan2(this.normal.y, this.normal.x);
            if (Math.abs(rad) < 0.1) {
                rad = 0;
            } else if (rad > 0) {
                if (Math.abs(rad - Radians.PI_12) < 0.1) {
                    rad = Radians.PI_12;
                } else if (Math.abs(rad - Radians.PI_6) < 0.1) {
                    rad = Radians.PI_6;
                } else if (Math.abs(rad - Radians.PI_4) < 0.1) {
                    rad = Radians.PI_4;
                } else if (Math.abs(rad - Radians.PI_3) < 0.1) {
                    rad = Radians.PI_3;
                } else if (Math.abs(rad - Radians.FIVE_PI_12) < 0.1) {
                    rad = Radians.FIVE_PI_12;
                } else if (Math.abs(rad - Radians.PI_2) < 0.1) {
                    rad = Radians.PI_2;
                } else if (Math.abs(rad - Radians.SEVEN_PI_12) < 0.1) {
                    rad = Radians.SEVEN_PI_12;
                } else if (Math.abs(rad - Radians.TWO_PI_3) < 0.1) {
                    rad = Radians.TWO_PI_3;
                } else if (Math.abs(rad - Radians.THREE_PI_4) < 0.1) {
                    rad = Radians.THREE_PI_4;
                } else if (Math.abs(rad - Radians.FIVE_PI_6) < 0.1) {
                    rad = Radians.FIVE_PI_6;
                } else if (Math.abs(rad - Radians.ELEVEN_PI_12) < 0.1) {
                    rad = Radians.ELEVEN_PI_12;
                } else if (Math.abs(rad - Radians.PI) < 0.1) {
                    rad = Radians.PI;
                }
            } else {
                if (Math.abs(rad + Radians.PI_12) < 0.1) {
                    rad = -Radians.PI_12;
                } else if (Math.abs(rad + Radians.PI_6) < 0.1) {
                    rad = -Radians.PI_6;
                } else if (Math.abs(rad + Radians.PI_4) < 0.1) {
                    rad = -Radians.PI_4;
                } else if (Math.abs(rad + Radians.PI_3) < 0.1) {
                    rad = -Radians.PI_3;
                } else if (Math.abs(rad + Radians.FIVE_PI_12) < 0.1) {
                    rad = -Radians.FIVE_PI_12;
                } else if (Math.abs(rad + Radians.PI_2) < 0.1) {
                    rad = -Radians.PI_2;
                } else if (Math.abs(rad + Radians.SEVEN_PI_12) < 0.1) {
                    rad = -Radians.SEVEN_PI_12;
                } else if (Math.abs(rad + Radians.TWO_PI_3) < 0.1) {
                    rad = -Radians.TWO_PI_3;
                } else if (Math.abs(rad + Radians.THREE_PI_4) < 0.1) {
                    rad = -Radians.THREE_PI_4;
                } else if (Math.abs(rad + Radians.FIVE_PI_6) < 0.1) {
                    rad = -Radians.FIVE_PI_6;
                } else if (Math.abs(rad + Radians.ELEVEN_PI_12) < 0.1) {
                    rad = -Radians.ELEVEN_PI_12;
                } else if (Math.abs(rad + Radians.PI) < 0.1) {
                    rad = Radians.PI;
                }
            }
            this.normal = new Vec2(Math.cos(rad), Math.sin(rad));
            break;
        }
        case ParallelTranslation.POINT_HP2: {
            const len = Vec2.dot(this.normal, mouseState.position.sub(this.p));
            if (len < 0) return;
            this.planeDist = len;
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
        const d1 = Math.abs(Vec2.dot(p.sub(this.p), this.normal));
        const d2 = Math.abs(Vec2.dot(p.sub(this.hp2.p), this.hp2.normal));
        if (d1 < d2) {
            return [new DistanceState(d1, this.hp1, HalfPlane.BODY),
                    new DistanceState(d2, this.hp2, HalfPlane.BODY)];
        } else {
            return [new DistanceState(d2, this.hp2, HalfPlane.BODY),
                    new DistanceState(d1, this.hp1, HalfPlane.BODY)];
        }
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform2f(uniLocation[uniI++],
                     this.p.x, this.p.y);
        gl.uniform4f(uniLocation[uniI++],
                     this.normal.x, this.normal.y, this.planeDist, this.planeDist * 2);
        gl.uniform2f(uniLocation[uniI++],
                     this.normalUIRingRadius * sceneScale,
                     this.UIPointRadius * sceneScale);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_translate${index}.p`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_translate${index}.normal`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_translate${index}.ui`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_translate${index}.selected`));
    }

    exportAsQueryString() {
        return `ParallelTranslation[]=${this.p.x.toFixed(this.digits)},${this.p.y.toFixed(this.digits)},${this.normalAngleDeg.toFixed(this.digits)},${this.planeDist.toFixed(this.digits)}`;
    }

    exportJson() {
        return {
            id: this.id,
            p: [this.p.x, this.p.y],
            normal: [this.normal.x, this.normal.y],
            planeDist: this.planeDist
        };
    }

    cloneDeeply() {
        return new ParallelTranslation(this.p.cloneDeeply(),
                                       this.normal.cloneDeeply(),
                                       this.planeDist);
    }

    static loadFromArray(array) {
        if(array.length === 4) {
            return ParallelTranslation.createFromAngleDegree(array);
        }
        return undefined;
    }

    static createFromNormal(array) {
        return new ParallelTranslation(new Vec2(array[0], array[1]), // p
                                       new Vec2(array[2], array[3]), // normal
                                       array[4]); // plane dist
    }

    static createFromAngleDegree(array) {
        const angleDegree = array[2];
        const angleRadian = Radians.DegToRad(angleDegree);
        return new ParallelTranslation(new Vec2(array[0], array[1]), // p
                                       new Vec2(Math.cos(angleRadian), Math.sin(angleRadian)),
                                       array[3]);
    }

    static loadJson(obj, scene) {
        const nh = new ParallelTranslation(new Vec2(obj.p[0], obj.p[1]),
                                           new Vec2(obj.normal[0], obj.normal[1]),
                                           obj.planeDist);
        nh.setId(obj.id);
        return nh;
    }

    static get BODY() {
        return 0;
    }

    static get NORMAL_POINT() {
        return 1;
    }

    static get POINT_HP2() {
        return 2;
    }

    get name() {
        return 'ParallelTranslation';
    }
}
