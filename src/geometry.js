import assert from 'power-assert';
import Vec2 from './Vector';

export class Circle {
    constructor(center, r) {
        assert.ok(center instanceof Vec2);
        this.center = center;
        this.r = r;
        this.rSq = r * r;
        this.circumferenceThickness = 10;
    }

    update() {
        this.rSq = this.r * this.r;
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

        this.update();
    }

    cloneDeeply() {
        return new Circle(this.center.cloneDeeply(), this.r);
    }

    getUniformArray() {
        return this.center.getUniformArray().concat([this.r, this.rSq]);
    }

    setUniformValues(gl, uniLocation, uniIndex) {
        assert.ok(typeof uniIndex === 'number');
        let uniI = uniIndex;
        gl.uniform4f(uniLocation[uniI++],
                     this.center.x, this.center.y, this.r, this.rSq);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        assert.ok(typeof index === 'number');
        uniLocation.push(gl.getUniformLocation(program, `u_circle${index}`));
    }

    exportJson() {
        return {
            center: [this.center.x, this.center.y],
            radius: this.r,
        };
    }

    static loadJson(obj) {
        return new Circle(new Vec2(obj.position[0], obj.position[1]),
                          obj.radius);
    }

    static get BODY() {
        return 0;
    }

    static get CIRCUMFERENCE() {
        return 1;
    }
}

// TODO: generate this object automatically
const STR_CLASS_MAP = { 'Circle': Circle };

export class Scene {
    constructor() {
        this.objects = {};
    }

    select(mouse) {
        assert.ok(mouse instanceof Vec2);
        const objKeyNames = Object.keys(this.objects);
        for (const objName of objKeyNames) {
            if (Object.prototype.hasOwnProperty.call(objKeyNames, objName)) {
                for (const obj of this.objects[objName]) {
                    const state = obj.select(mouse);
                    if (state.id !== -1) return state;
                }
            }
        }
        return { id: -1 };
    }

    setUniformLocation(gl, uniLocations, program) {
        const objKeyNames = Object.keys(this.objects);
        for (const objName of objKeyNames) {
            const objArray = this.objects[objName];
            for (let i = 0; i < objArray.length; i++) {
                objArray[i].setUniformLocation(gl, uniLocations, program, i);
            }
        }
    }

    setUniformValues(gl, uniLocation, uniIndex) {
        assert.ok(typeof uniIndex === 'number');

        let uniI = uniIndex;
        const objKeyNames = Object.keys(this.objects);
        for (const objName of objKeyNames) {
            const objArray = this.objects[objName];
            for (let i = 0; i < objArray.length; i++) {
                uniI = objArray[i].setUniformValues(gl, uniLocation, uniI);
            }
        }
        return uniI;
    }

    getContext() {
        const context = {};
        const objKeyNames = Object.keys(this.objects);
        for (const objName of objKeyNames) {
            context[`num${objName}`] = this.objects[objName].length;
        }
        return context;
    }

    load(sceneObjects) {
        this.objects = {};
        const generators = sceneObjects.generators;
        const objKeyNames = Object.keys(generators);

        for (const objName of objKeyNames) {
            if (this.objects[objName] === undefined) {
                this.objects[objName] = [];
            }
            for (const objParam of generators[objName]) {
                this.objects[objName].push(STR_CLASS_MAP[objName].loadJson(objParam));
            }
        }
    }
}
