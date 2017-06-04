import assert from 'power-assert';
import Vec2 from '../vector.js';
import SelectionState from './selectionState.js';
import Circle from './circle.js';
import Point from './point.js';

// TODO: generate this object automatically
const STR_CLASS_MAP = { 'Circle': Circle,
                        'Point': Point };

export default class Scene {
    constructor() {
        this.objects = {};
        this.selectedState = new SelectionState();
    }

    select (mouse) {
        assert.ok(mouse instanceof Vec2);
        const objKeyNames = Object.keys(this.objects);
        for (const objName of objKeyNames) {
            for (const obj of this.objects[objName]) {
                const state = obj.select(mouse);
                if (state.isSelectingObj()) {
                    this.selectedState = state;
                    return true;
                }
            }
        }
        this.selectedState = new SelectionState();
        return false;
    }

    move (mouse) {
        if (this.selectedState.isSelectingObj()) {
            this.selectedState.selectedObj.move(this.selectedState, mouse);
            return true;
        }
        return false;
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
