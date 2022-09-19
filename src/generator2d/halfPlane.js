import Vec2 from '../vector2d.js';
import SelectionState from './selectionState.js';
import DistanceState from './distanceState.js';
import Generator from './generator.js';
import Radians from '../radians.js';

export default class HalfPlane extends Generator {
    /**
     *
     *       ^ normal
     *       |
     * ------+-------
     * //////p///////
     * //////////////
     * Make HalfPlane
     * @param {Vec2} p
     * @param {Vec2} normal
     */
    constructor(p, normal) {
        super();
        this.p = p;
        this.normal = normal.normalize();
        this.prevNormal = this.normal;
        this.normalUIPointLen = 0.1;
        this.UIPointRadius = 0.01;

        this.update();
    }

    getPosition() {
        return this.p;
    }

    setPosition(p) {
        this.p = p;
    }

    update() {
        this.normalAngleRad = Math.atan2(this.normal.y, this.normal.x);
        this.normalAngleRad += this.normalAngleRad < 0 ? 2 * Math.PI : 0;
        this.normalAngleDeg = Radians.RadToDeg(this.normalAngleRad);
        this.normalAngleDeg = this.normalAngleDeg % 360;
        this.boundaryDir = new Vec2(-this.normal.y,
                                    this.normal.x);
    }

    select(mouse, sceneScale) {
        const dpNormal = mouse.sub(this.p.add(this.normal.scale(this.normalUIPointLen * sceneScale)));
        if (dpNormal.length() < this.UIPointRadius * sceneScale) {
            this.prevNormal = this.normal;
            return new SelectionState().setObj(this)
                .setComponentId(HalfPlane.NORMAL_POINT)
                .setDiffObj(dpNormal);
        }

        return this.selectBody(mouse, sceneScale);
    }

    selectBody(mouse, sceneScale) {
        const dp = mouse.sub(this.p);
        if (Vec2.dot(this.normal, dp) > 0) return new SelectionState();

        return new SelectionState().setObj(this)
            .setComponentId(HalfPlane.BODY)
            .setDiffObj(dp);
    }

    isHandle(componentId) {
        return componentId === HalfPlane.NORMAL_POINT;
    }

    move(selectionState, mouse) {
        if (selectionState.componentId === HalfPlane.BODY) {
            this.p = mouse.sub(selectionState.diffObj);
        } else if (selectionState.componentId === HalfPlane.NORMAL_POINT) {
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
        if (selectionState.componentId === HalfPlane.BODY) {
            if (keyState.isPressingShift) {
                this.p.x = mouseState.position.sub(selectionState.diffObj).x;
            } else if (keyState.isPressingCtrl) {
                this.p.y = mouseState.position.sub(selectionState.diffObj).y;
            }
        } else if (selectionState.componentId === HalfPlane.NORMAL_POINT) {
            this.normal = selectionState.position.sub(this.p).normalize();
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
        }

        this.update();
    }

    outside(position) {
        const d = Vec2.dot(position.sub(this.p), this.normal);
        return d > 0;
    }

    /**
     *
     * @param {Vec2} p
     */
    getDistances(p) {
        return [new DistanceState(Math.abs(Vec2.dot(p.sub(this.p), this.normal)),
                                  this,
                                  HalfPlane.BODY)];
    }

    removable(mouse) {
        return !this.outside(mouse);
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform2f(uniLocation[uniI++],
                     this.p.x, this.p.y);
        gl.uniform4f(uniLocation[uniI++],
                     this.normal.x, this.normal.y,
                     this.normalUIPointLen * sceneScale,
                     this.UIPointRadius * sceneScale);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_halfPlane${index}.p`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_halfPlane${index}.normal`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_halfPlane${index}.selected`));
    }

    exportAsQueryString() {
        return `HalfPlane[]=${this.p.x.toFixed(this.digits)},${this.p.y.toFixed(this.digits)},${this.normal.x.toFixed(this.digits)},${this.normal.y.toFixed(this.digits)}`;
    }

    exportJson() {
        return {
            id: this.id,
            p: [this.p.x, this.p.y],
            normal: [this.normal.x, this.normal.y],
        };
    }

    cloneDeeply() {
        return new HalfPlane(this.p.cloneDeeply(), this.normal.cloneDeeply());
    }

    static loadJson(obj, scene) {
        const nh = new HalfPlane(new Vec2(obj.p[0], obj.p[1]),
                                 new Vec2(obj.normal[0], obj.normal[1]));
        nh.setId(obj.id);
        return nh;
    }

    static loadFromArray(array) {
        if(array.length === 3) {
            return HalfPlane.createFromAngleDegree(array);
        }
        return undefined;
    }

    static createFromNormal(array) {
        return new HalfPlane(new Vec2(array[0], array[1]), // p
                             new Vec2(array[2], array[3]));// normal
    }

    static createFromAngleDegree(array) {
        const angleDegree = array[2];
        const angleRadian = Radians.DegToRad(angleDegree);
        return new HalfPlane(new Vec2(array[0], array[1]), // p
                             new Vec2(Math.cos(angleRadian), Math.sin(angleRadian)));
    }

    static get BODY() {
        return 0;
    }

    static get NORMAL_POINT() {
        return 1;
    }

    get name() {
        return 'HalfPlane';
    }
}
