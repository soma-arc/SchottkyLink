import assert from 'power-assert';
import Vec2 from '../vector2d.js';
import Shape from './shape.js';
import SelectionState from './selectionState.js';
import Circle from './circle.js';
import Point from './point.js';
import CircleFromPoints from './circleFromPoints.js';
import HalfPlane from './halfPlane.js';
import ParallelTranslation from './parallelTranslation.js'
import Rotation from './rotation.js';
import TwoCircles from './twoCircles.js';
import Loxodromic from './loxodromic.js';
import Scaling from './scaling.js';
import OrbitSeed from './orbitSeed.js';
import Vue from 'vue';

// TODO: generate this object automatically
const STR_CLASS_MAP = { 'Circle': Circle,
                        'Point': Point,
                        'CircleFromPoints': CircleFromPoints,
                        'HalfPlane': HalfPlane,
                        'ParallelTranslation': ParallelTranslation,
                        'Rotation': Rotation,
                        'TwoCircles': TwoCircles,
                        'Loxodromic': Loxodromic,
                        'Scaling': Scaling,
                        'OrbitSeed': OrbitSeed };

const PRESETS_CONTEXT = require.context('../presets2d', true, /.json$/);
const PRESETS = [];
for (const k of PRESETS_CONTEXT.keys()) {
    PRESETS.push(PRESETS_CONTEXT(k));
}

export default class Scene {
    constructor() {
        this.objects = {};
        this.presets = PRESETS;

        this.selectedObj = undefined;
        this.selectedState = new SelectionState();
    }

    unselectAll () {
        const objKeyNames = Object.keys(this.objects);
        for (const objName of objKeyNames) {
            for (const obj of this.objects[objName]) {
                obj.selected = false;
            }
        }
    }

    select (mouse, sceneScale) {
        if (this.selectedObj !== undefined) {
            this.selectedObj.selected = false;
        }

        const objKeyNames = Object.keys(this.objects);
        for (const objName of objKeyNames) {
            for (const obj of this.objects[objName]) {
                const state = obj.select(mouse, sceneScale);
                if (state.isSelectingObj()) {
                    this.selectedState = state;
                    this.selectedObj = this.selectedState.selectedObj;
                    this.selectedState.selectedObj.selected = true;
                    return true;
                }
            }
        }
        this.selectedState = new SelectionState();
        this.selectedObj = undefined;
        return false;
    }

    addCircle(position, sceneScale) {
        if (this.objects['Circle'] === undefined) {
            Vue.set(this.objects, 'Circle', []);
        }
        this.objects['Circle'].push(new Circle(position, 0.1 * sceneScale));
    }

    addHalfPlane(position, sceneScale) {
        if (this.objects['HalfPlane'] === undefined) {
            Vue.set(this.objects, 'HalfPlane', []);
        }
        this.objects['HalfPlane'].push(new HalfPlane(position, new Vec2(1, 0)));
    }

    addTwoCircles(position, sceneScale) {
        if (this.objects['TwoCircles'] === undefined) {
            Vue.set(this.objects, 'TwoCircles', []);
        }
        this.objects['TwoCircles'].push(new TwoCircles(new Circle(position, 0.1 * sceneScale),
                                                       new Circle(position, 0.2 * sceneScale)));
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
                Vue.set(this.objects, objName, []);
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

    loadPreset(index) {
        if (0 <= index && index < PRESETS.length) {
            this.load(PRESETS[index]);
        }
    }
}
