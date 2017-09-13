import Vec2 from '../vector2d.js';
import SelectionState from './selectionState.js';
import DistanceState from './distanceState.js';
import Shape from './shape.js';
import Radians from '../radians.js';

export default class HalfPlane extends Shape {
    /**
     *
     *       ^ normal
     *       |
     * ------+-------
     *       p
     * //////////////
     * Make HalfPlane
     * @param {Vec2} p
     * @param {Vec2} normal
     */
    constructor(p, normal) {
        super();
        this.p = p;
        this.normal = normal.normalize();
        this.normalUIPointLen = 0.1;
        this.UIPointRadius = 0.01;
        this.update();
    }

    update() {
        this.normalAngle = Math.atan2(this.normal.y, this.normal.x);
        this.normalAngle += this.normalAngle < 0 ? 2 * Math.PI : 0;
        this.normalAngle *= 100 / (2 * Math.PI);
        this.normalAngle = Math.max(0.0, Math.min(this.normalAngle, 100.0));
        this.boundaryDir = new Vec2(-this.normal.y,
                                    this.normal.x);
    }

    select(mouse, sceneScale) {
        const dp = mouse.sub(this.p);
        const dpNormal = mouse.sub(this.p.add(this.normal.scale(this.normalUIPointLen * sceneScale)));
        if (dpNormal.length() < this.UIPointRadius * sceneScale) {
            return new SelectionState().setObj(this)
                .setComponentId(HalfPlane.NORMAL_POINT)
                .setDiffObj(dpNormal);
        }

        if (Vec2.dot(this.normal, dp) > 0) return new SelectionState();

        return new SelectionState().setObj(this)
            .setComponentId(HalfPlane.BODY)
            .setDiffObj(dp);
    }

    move(mouseState, mouse) {
        if (mouseState.componentId === HalfPlane.BODY) {
            this.p = mouse.sub(mouseState.diffObj);
        } else if (mouseState.componentId === HalfPlane.NORMAL_POINT) {
            this.normal = mouse.sub(this.p).normalize();
            let rad = Math.atan2(this.normal.y, this.normal.x);
            if (Math.abs(rad) < 0.2) {
                rad = 0;
            } else if (rad > 0) {
                if (Math.abs(rad - Radians.PI_4) < 0.2) {
                    rad = Radians.PI_4
                } else if (Math.abs(rad - Radians.PI_2) < 0.2) {
                    rad = Radians.PI_2;
                } else if (Math.abs(rad - Radians.THREE_PI_4) < 0.2){
                    rad = Radians.THREE_PI_4;
                } else if (Math.abs(rad - Radians.PI) < 0.2) {
                    rad = Radians.PI;
                }
            } else {
                if (Math.abs(rad + Radians.PI_4) < 0.2) {
                    rad = -Radians.PI_4;
                } else if (Math.abs(rad + Radians.PI_2) < 0.2) {
                    rad = -Radians.PI_2
                } else if (Math.abs(rad + Radians.THREE_PI_4) < 0.2) {
                    rad = -Radians.THREE_PI_4;
                } else if (Math.abs(rad + Radians.PI) < 0.2) {
                    rad = Radians.PI;
                }
            }

            this.normal = new Vec2(Math.cos(rad), Math.sin(rad));
        }

        this.update();
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

    exportJson() {
        return {
            id: this.id,
            p: [this.p.x, this.p.y],
            normal: [this.normal.x, this.normal.y],
        };
    }

    static loadJson(obj, scene) {
        const nh = new HalfPlane(new Vec2(obj.p[0], obj.p[1]),
                                 new Vec2(obj.normal[0], obj.normal[1]));
        nh.setId(obj.id);
        return nh;
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
