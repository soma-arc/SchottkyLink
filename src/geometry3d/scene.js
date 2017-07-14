import BaseSphere from './baseSphere.js'
import InversionSphere from './inversionSphere.js';
import Vue from 'vue';
import { Camera } from '../camera.js';
import Vec2 from '../vector2d.js';
import IsectInfo from './isectInfo.js';

const PRESETS_CONTEXT = require.context('../presets3d', true, /.json$/);
const PRESETS = [];
for (const k of PRESETS_CONTEXT.keys()) {
    PRESETS.push(PRESETS_CONTEXT(k));
}

// TODO: generate this object automatically
const STR_CLASS_MAP = { 'BaseSphere': BaseSphere,
                        'InversionSphere': InversionSphere };

export default class Scene3D {
    constructor() {
        this.objects = {};
        this.presets = PRESETS;

        this.selectedObj = undefined;
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
                Vue.set(this.objects, objName, []);
            }
            for (const objParam of generators[objName]) {
                this.objects[objName].push(STR_CLASS_MAP[objName].loadJson(objParam, this));
            }
        }
    }

    clear() {
        this.objects = {};
        this.selectedObj = undefined;
    }

    /**
     * @param {number} width
     * @param {number} height
     * @param {Vec2} mouse
     * @param {Camera} camera
     */
    select(width, height, mouse, camera) {
        if (this.selectedObj !== undefined) this.selectedObj.selected = false;
        const ray = camera.computeRay(width, height, mouse.x, mouse.y);
        const isectInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);
        const objKeyNames = Object.keys(STR_CLASS_MAP);
        for (const objName of objKeyNames) {
            if (this.objects[objName] === undefined) continue;
            for (const obj of this.objects[objName]) {
                obj.castRay(camera.pos, ray, isectInfo);
            }
        }
        this.selectedObj = isectInfo.hitObject;
        if (this.selectedObj !== undefined) this.selectedObj.selected = true;
    }
}
