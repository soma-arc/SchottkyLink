import assert from 'power-assert';
import Vec2 from './Vector';

export class Circle {
    constructor(center, r) {
        assert.ok(center instanceof Vec2);
        this.center = center;
        this.r = r;

        this.circumferenceThickness = 10;
    }

    update() {
        // nothing to do
    }

    removable(mouse) {
        assert.ok(mouse instanceof Vec2);
        const d = Vec2.distance(mouse, this.center);
        return d < this.r;
    }

    // return {id, difference between mouse and selected component }
    select(mouse) {
        assert.ok(mouse instanceof Vec2);

        const dp = mouse.sub(this.center);
        const d = dp.length();
        if (d > this.r) return { id: -1 };

        const distFromCircumference = this.r - d;
        if (distFromCircumference < this.circumferenceThickness) {
            return { id: Circle.CIRCUMFERENCE,
                     diff: distFromCircumference };
        }

        return { id: Circle.CIRCUMFERENCE,
                 diff: dp };
    }

    move(selectState, mouse) {
        assert.ok(mouse instanceof Vec2);

        if (selectState.id === Circle.CIRCUMFERENCE) {
            assert.ok(typeof selectState.diff === 'number');
            this.r = Vec2.distance(this.center, mouse) + selectState.diff;
        } else {
            assert.ok(selectState.diff instanceof Vec2);
            this.center = mouse.sub(selectState.diff);
        }
    }

    cloneDeeply() {
        return new Circle(this.center.cloneDeeply(), this.r);
    }

    getUniformArray() {
        this.center.uniformArray().concat([this.r]);
    }

    setUniformValues(gl, uniLocation, uniIndex) {
        assert.ok(typeof uniIndex === 'number');
        let uniI = uniIndex;
        gl.uniform3f(uniLocation[uniI++], this.getUniformArray());
        return uniI;
    }

    setUniformLocation(gl, uniLocation, index, program) {
        assert.ok(typeof index === 'number');
        uniLocation.push(gl.getUniformLocation(program, `u_schottkyCircle${index}`));
    }

    exportJson() {
        return {
            center: [this.center.x, this.center.y],
            radius: this.r,
        };
    }

    static get BODY() {
        return 0;
    }

    static get CIRCUMFERENCE() {
        return 1;
    }
}

export class Scene {
    constructor() {
        this.objects = {};
        this.objects.Circle = [];
    }

    select(mouse) {
        assert.ok(mouse instanceof Vec2);
        const objKeyNames = Object.keys(this.objects);
        for (const objName in objKeyNames) {
            if (Object.prototype.hasOwnProperty.call(objKeyNames, objName)) {
                for (const obj of this.objects[objName]) {
                    const state = obj.select(mouse);
                    if (state.id !== -1) return state;
                }
            }
        }
        return { id: -1 };
    }

    setUniformLocation(gl, uniLocation, program) {
        assert.ok(typeof uniIndex === 'number');

        const objKeyNames = Object.keys(this.objects);
        for (const objName in objKeyNames) {
            if (Object.prototype.hasOwnProperty.call(objKeyNames, objName)) {
                const objArray = this.objects[objName];
                for (let i = 0; i < objArray.length; i++) {
                    objArray[i].setUniformLocation(gl, uniLocation, program, i);
                }
            }
        }
    }

    setUniformValues(gl, uniLocation, uniIndex) {
        assert.ok(typeof uniIndex === 'number');

        let uniI = uniIndex;
        const objKeyNames = Object.keys(this.objects);
        for (const objName in objKeyNames) {
            if (Object.prototype.hasOwnProperty.call(objKeyNames, objName)) {
                const objArray = this.objects[objName];
                for (let i = 0; i < objArray.length; i++) {
                    uniI = objArray[i].setUniformValues(gl, uniLocation, uniI);
                }
            }
        }
        return uniI;
    }
}
