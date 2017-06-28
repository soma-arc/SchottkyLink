import assert from 'power-assert';
import Vec2 from '../vector.js';
import SelectionState from './selectionState.js';
import Circle from './circle.js';
import Point from './point.js';
import CircleFromPoints from './circleFromPoints.js';
import HalfPlane from './halfPlane.js';
import ParallelTranslation from './parallelTranslation.js'
import Rotation from './rotation.js';
import TwoCircles from './twoCircles.js';

// TODO: generate this object automatically
const STR_CLASS_MAP = { 'Circle': Circle,
                        'Point': Point,
                        'CircleFromPoints': CircleFromPoints,
                        'HalfPlane': HalfPlane,
                        'ParallelTranslation': ParallelTranslation,
                        'Rotation': Rotation,
                        'TwoCircles': TwoCircles };

export default class Scene {
    constructor() {
        this.objects = {};
        this.selectedState = new SelectionState();
    }

    select (mouse, sceneScale) {
        if (this.selectedState.isSelectingObj()) {
            this.selectedState.selectedObj.selected = false;
        }
        const objKeyNames = Object.keys(this.objects);
        for (const objName of objKeyNames) {
            for (const obj of this.objects[objName]) {
                const state = obj.select(mouse, sceneScale);
                if (state.isSelectingObj()) {
                    this.selectedState = state;
                    this.selectedState.selectedObj.selected = true;
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

    /**
     *
     * @param {Vec2} mouse
     */
    remove(mouse) {
        // TODO: implement this
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

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        assert.ok(typeof uniIndex === 'number');

        let uniI = uniIndex;
        const objKeyNames = Object.keys(this.objects);
        for (const objName of objKeyNames) {
            const objArray = this.objects[objName];
            for (let i = 0; i < objArray.length; i++) {
                uniI = objArray[i].setUniformValues(gl, uniLocation, uniI, sceneScale);
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
                this.objects[objName].push(STR_CLASS_MAP[objName].loadJson(objParam, this));
            }
        }
    }

    getObjFromId(id) {
        const objKeyNames = Object.keys(this.objects);
        for (const objName of objKeyNames) {
            const obj = this.objects[objName].find((elem, idxm, array) => {
                if (elem.id === id) {
                    return true;
                } else {
                    return false;
                }
            });
            if (obj !== undefined) return obj;
        }
        return undefined;
    }
}
