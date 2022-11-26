import Vec2 from '../vector2d.js';
import HalfPlane from './halfPlane.js';
import SelectionState from './selectionState.js';
import DistanceState from './distanceState.js';
import Generator from './generator.js';
import Radians from '../radians.js';

export default class GlideReflection extends Generator {
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

    select(mouse, sceneScale, selectionScale) {
        if(selectionScale === undefined) {
            selectionScale = 1;
        }
        // normal control point
        const dpNormal = mouse.sub(this.p.add(this.normal.scale(this.normalUIRingRadius * sceneScale)));
        if (dpNormal.length() < this.UIPointRadius * sceneScale * selectionScale) {
            return new SelectionState().setObj(this)
                .setComponentId(GlideReflection.NORMAL_POINT)
                .setDiffObj(dpNormal);
        }
        // origin control point
        const dp = mouse.sub(this.p);
        if (dp.length() < this.UIPointRadius * sceneScale * selectionScale) {
            return new SelectionState().setObj(this)
                .setComponentId(GlideReflection.ORIGIN_POINT)
                .setDiffObj(dp);
        }

        return this.selectBody(mouse, sceneScale, selectionScale);
    }

    selectBody(mouse, sceneScale, selectionScale) {
        if(selectionScale === undefined) {
            selectionScale = 1;
        }
        const dp = mouse.sub(this.p);
        // point of hp2
        const dp2 = mouse.sub(this.p.add(this.normal.scale(this.planeDist)));
        if (dp2.length() < this.UIPointRadius * sceneScale * selectionScale) {
            return new SelectionState().setObj(this)
                .setComponentId(GlideReflection.POINT_HP2)
                .setDiffObj(dp2);
        }

        if (Vec2.dot(dp, this.normal) > 0 &&
            Vec2.dot(dp2, this.normal.scale(-1)) > 0) {
            return new SelectionState();
        }

        return new SelectionState().setObj(this)
            .setComponentId(GlideReflection.BODY)
            .setDiffObj(dp);
    }

    isHandle(componentId) {
        return componentId === GlideReflection.NORMAL_POINT ||
            componentId === GlideReflection.POINT_HP2;
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
        case GlideReflection.BODY:
        case GlideReflection.ORIGIN_POINT: {
            this.p = mouse.sub(selectionState.diffObj);
            break;
        }
        case GlideReflection.NORMAL_POINT: {
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
        case GlideReflection.POINT_HP2: {
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
        case GlideReflection.BODY: {
            if (keyState.isPressingShift) {
                this.p.x = mouseState.position.sub(selectionState.diffObj).x;
            } else if (keyState.isPressingCtrl) {
                this.p.y = mouseState.position.sub(selectionState.diffObj).y;
            }
            break;
        }
        case GlideReflection.NORMAL_POINT: {
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
        case GlideReflection.POINT_HP2: {
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
                                               `u_glideReflection${index}.p`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_glideReflection${index}.normal`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_glideReflection${index}.ui`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_glideReflection${index}.selected`));
    }

    exportAsQueryString() {
        return `GlideReflection[]=${this.p.x.toFixed(this.digits)},${this.p.y.toFixed(this.digits)},${this.normalAngleDeg.toFixed(this.digits)},${this.planeDist.toFixed(this.digits)}`;
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
        return new GlideReflection(this.p.cloneDeeply(),
                                   this.normal.cloneDeeply(),
                                   this.planeDist);
    }

    static loadJson(obj, scene) {
        const nh = new GlideReflection(new Vec2(obj.p[0], obj.p[1]),
                                       new Vec2(obj.normal[0], obj.normal[1]),
                                       obj.planeDist);
        nh.setId(obj.id);
        return nh;
    }

    static loadFromArray(array) {
        if(array.length === 4) {
            return GlideReflection.createFromAngleDegree(array);
        }
        return undefined;
    }

    static createFromNormal(array) {
        return new GlideReflection(new Vec2(array[0], array[1]), // p
                                   new Vec2(array[2], array[3]), // normal
                                   array[4]); // plane dist
    }

    static createFromAngleDegree(array) {
        const angleDegree = array[2];
        const angleRadian = Radians.DegToRad(angleDegree);
        return new GlideReflection(new Vec2(array[0], array[1]), // p
                                   new Vec2(Math.cos(angleRadian), Math.sin(angleRadian)),
                                   array[3]);
    }

    isBody(componentId) {
        return componentId === GlideReflection.BODY;
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

    static get ORIGIN_POINT() {
        return 3;
    }

    get name() {
        return 'GlideReflection';
    }
}
