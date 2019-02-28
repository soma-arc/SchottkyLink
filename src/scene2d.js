import SelectionState from './generator2d/selectionState.js';
import DistanceState from './generator2d/distanceState.js';
import Circle from './generator2d/circle.js';
import Vue from 'vue';

// TODO: generate this object automatically
const STR_CLASS_MAP = { 'Circle': Circle };

const PRESETS_CONTEXT = require.context('./presets2d', true, /.json$/);
const PRESETS = [];
for (const k of PRESETS_CONTEXT.keys()) {
    PRESETS.push(PRESETS_CONTEXT(k));
}

export default class Scene2d {
    constructor() {
        this.objects = {};
        this.presets = PRESETS;
        this.sortPresetByIndex();
        this.selectedObj = undefined;
        this.selectedState = new SelectionState();
    }

    sortPresetByIndex() {
        this.presets.sort(function(a, b) {
            const aIdx = a.index;
            const bIdx = b.index;
            if (aIdx === undefined && bIdx === undefined) {
                return 0;
            } else if (aIdx === undefined) {
                return 1;
            } else if (bIdx === undefined) {
                return -1;
            }
            return aIdx - bIdx;
        });
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

        const objKeyNames = Object.keys(STR_CLASS_MAP);
        for (const objName of objKeyNames) {
            if (this.objects[objName] === undefined) continue;
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

    toggleSnapMode() {
        if (this.selectedObj !== undefined) {
            this.selectedObj.toggleSnapMode();
        }
    }

    addCircle(position, sceneScale) {
        if (this.objects['Circle'] === undefined) {
            Vue.set(this.objects, 'Circle', []);
        }
        this.objects['Circle'].push(new Circle(position, 0.1 * sceneScale));
    }

    move (mouse) {
        if (this.selectedState.isSelectingObj()) {
            this.selectedState.selectedObj.move(this.selectedState, mouse, this);
            return true;
        }
        return false;
    }

    /**
     * @param {Shape} selectedObj
     * @param {Vec2} p
     */
    getNearObjectsDistance(selectedObj, p) {
        let minDist1 = new DistanceState(Number.MAX_VALUE, undefined, 0);
        let minDist2 = new DistanceState(Number.MAX_VALUE, undefined, 0);

        const objKeyNames = Object.keys(STR_CLASS_MAP);
        for (const objName of objKeyNames) {
            if (this.objects[objName] === undefined) continue;
            for (const obj of this.objects[objName]) {
                if (obj.id === selectedObj.id) continue;
                for (const distState of obj.getDistances(p)) {
                    const dist = distState.distance;
                    if (dist < minDist1.distance) {
                        minDist2 = minDist1;
                        minDist1 = distState;
                    } else if (dist < minDist2.distance) {
                        minDist2 = distState;
                    }
                }
            }
        }
        return [minDist1, minDist2];
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

    clear() {
        this.objects = {};
        this.selectedObj = undefined;
    }

    exportJson() {
        const json = {};
        json['label'] = 'scene';
        json['mode'] = '2d';
        const generators = {};
        const objKeyNames = Object.keys(STR_CLASS_MAP);
        for (const objName of objKeyNames) {
            if (this.objects[objName] === undefined) continue;
            generators[objName] = [];
            for (const obj of this.objects[objName]) {
                generators[objName].push(obj.exportJson());
            }
        }
        json['generators'] = generators;
        return json;
    }

    saveSceneAsJson() {
        const blob = new Blob([JSON.stringify(this.exportJson(), null, '    ')],
                              { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'scene.json';
        a.click();
    }
}
