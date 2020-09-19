import Vec2 from '../vector2d.js';
import SelectionState from './selectionState.js';
import DistanceState from './distanceState.js';
import Shape from './shape.js';
import Radians from '../radians.js';

export default class Rotation extends Shape {
     /**
     * //////+ bondaryDirPoint2 - control rotation angle
     * //////|
     * //////|
     * //////|
     * //////|
     * ------+------+ boundaryDirPoint1 control generator's rotation
     * //// p|///////
     * ////  |///////
     * //////|///////
     * @param {Vec2} p
     * @param {Vec2} boundaryDir
     * @param {number} radians
     */
    constructor(p, boundaryDir, radians) {
        super();
        this.p = p;
        this.radians = radians;
        this.boundaryDir1 = boundaryDir;
        this.normalUIRingRadius = 0.1;
        this.UIPointRadius = 0.01;
        this.update();
    }

    update() {
        const cosTheta = Math.cos(this.radians);
        const sinTheta = Math.sin(this.radians);
        this.normal1 = new Vec2(-this.boundaryDir1.y, this.boundaryDir1.x);
        this.normal2 = new Vec2(this.normal1.x * cosTheta - this.normal1.y * sinTheta,
                                this.normal1.x * sinTheta + this.normal1.y * cosTheta).scale(-1);
        this.boundaryDir2 = new Vec2(-this.normal2.y, this.normal2.x);
    }

    select(mouse, sceneScale) {
        const boundaryDirPoint1 = this.p.add(this.boundaryDir1.scale(this.normalUIRingRadius * sceneScale));
        const boundaryDirPoint2 = this.p.add(this.boundaryDir2.scale(this.normalUIRingRadius * sceneScale));

        // normal control point
        const dp = mouse.sub(boundaryDirPoint1);
        if (dp.length() < this.UIPointRadius * sceneScale) {
            return new SelectionState().setObj(this)
                .setComponentId(Rotation.BOUNDARY_POINT)
                .setDiffObj(dp);
        }

        // point of hp2
        const dp2 = mouse.sub(boundaryDirPoint2)
        if (dp2.length() < this.UIPointRadius * sceneScale) {
            return new SelectionState().setObj(this)
                .setComponentId(Rotation.ROTATION_POINT)
                .setDiffObj(dp2);
        }

        if (Vec2.dot(dp, this.normal1) > 0 &&
            Vec2.dot(dp2, this.normal2) > 0) {
            return new SelectionState();
        }

        return new SelectionState().setObj(this)
            .setComponentId(Rotation.BODY)
            .setDiffObj(mouse.sub(this.p));
    }

    removable(mouse) {
        const dp = mouse.sub(this.p);
        if (Vec2.dot(dp, this.normal1) < 0 ||
            Vec2.dot(dp, this.normal2) < 0) {
            return true;
        }
        return false;
    }

    move(mouseState, mouse) {
        switch (mouseState.componentId) {
        case Rotation.BODY: {
            this.p = mouse.sub(mouseState.diffObj);
            break;
        }
        case Rotation.BOUNDARY_POINT: {
            this.boundaryDir1 = mouse.sub(this.p).normalize();
            let rad = Math.atan2(this.boundaryDir1.y, this.boundaryDir1.x);
            rad = (Math.abs(rad) < 0.2) ? 0 : rad;
            rad = (Math.abs(rad - Radians.PI_4) < 0.2) ? Radians.PI_4 : rad;
            rad = (Math.abs(rad + Radians.PI_4) < 0.2) ? -Radians.PI_4 : rad;
            rad = (Math.abs(rad - Radians.PI_2) < 0.2) ? Radians.PI_2 : rad;
            rad = (Math.abs(rad + Radians.PI_2) < 0.2) ? -Radians.PI_2 : rad;
            rad = (Math.abs(rad - Radians.THREE_PI_4) < 0.2) ? Radians.THREE_PI_4 : rad;
            rad = (Math.abs(rad + Radians.THREE_PI_4) < 0.2) ? -Radians.THREE_PI_4 : rad;
            rad = (Math.abs(rad - Radians.PI) < 0.2) ? Radians.PI : rad;
            rad = (Math.abs(rad + Radians.PI) < 0.2) ? Radians.PI : rad;
            this.boundaryDir1 = new Vec2(Math.cos(rad), Math.sin(rad));
            break;
        }
        case Rotation.ROTATION_POINT: {
            const mp = mouse.sub(this.p);
            const theta1 = Math.atan2(mp.y, mp.x);
            const theta2 = Math.atan2(this.boundaryDir1.y, this.boundaryDir1.x);
            let rad = theta1 - theta2;
            rad = (rad > Radians.PI_2) ? Radians.PI_2 : rad;
            rad = (rad < 0) ? 0 : rad;
            rad = (Math.abs(rad - Radians.PI_4) < 0.15) ? Radians.PI_4 : rad;
            rad = (Math.abs(rad - Radians.PI_3) < 0.15) ? Radians.PI_3 : rad;
            rad = (Math.abs(rad - Radians.PI_6) < 0.15) ? Radians.PI_6 : rad;
            this.radians = rad;
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
        const boundaryDirPoint1 = this.p.add(this.boundaryDir1.scale(this.normalUIRingRadius));
        const boundaryDirPoint2 = this.p.add(this.boundaryDir2.scale(this.normalUIRingRadius));
        const d1 = Math.abs(Vec2.dot(p.sub(boundaryDirPoint1), this.normal1));
        const d2 = Math.abs(Vec2.dot(p.sub(boundaryDirPoint2), this.normal2));
        if (d1 < d2) {
            return [new DistanceState(d1, this, Rotation.BODY),
                    new DistanceState(d2, this, Rotation.BODY)]
        } else {
            return [new DistanceState(d2, this, Rotation.BODY),
                    new DistanceState(d1, this, Rotation.BODY)]
        }
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        const boundaryDirPoint1 = this.p.add(this.boundaryDir1.scale(this.normalUIRingRadius * sceneScale));
        const boundaryDirPoint2 = this.p.add(this.boundaryDir2.scale(this.normalUIRingRadius * sceneScale));
        let uniI = uniIndex;
        gl.uniform2f(uniLocation[uniI++],
                     this.p.x, this.p.y);
        gl.uniform4f(uniLocation[uniI++],
                     this.normal1.x, this.normal1.y,
                     this.normal2.x, this.normal2.y);
        gl.uniform4f(uniLocation[uniI++],
                     boundaryDirPoint1.x, boundaryDirPoint1.y,
                     boundaryDirPoint2.x, boundaryDirPoint2.y);
        gl.uniform2f(uniLocation[uniI++],
                     this.normalUIRingRadius * sceneScale,
                     this.UIPointRadius * sceneScale);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_rotation${index}.p`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_rotation${index}.normal`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_rotation${index}.boundaryPoint`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_rotation${index}.ui`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_rotation${index}.selected`));
    }

    exportJson() {
        return {
            id: this.id,
            p: [this.p.x, this.p.y],
            boundaryDir: [this.boundaryDir1.x, this.boundaryDir2.y],
            degrees: this.radians * 180 / Math.PI
        };
    }

    static loadJson(obj, scene) {
        const nh = new Rotation(new Vec2(obj.p[0], obj.p[1]),
                                new Vec2(obj.boundaryDir[0], obj.boundaryDir[1]),
                                obj.degrees * Math.PI / 180);
        nh.setId(obj.id);
        return nh;
    }

    static get BODY() {
        return 0;
    }

    static get BOUNDARY_POINT() {
        return 1;
    }

    static get ROTATION_POINT() {
        return 2;
    }

    get name() {
        return 'Rotation';
    }
}
