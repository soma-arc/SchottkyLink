import assert from 'power-assert';
import Vec2 from '../vector2d.js';
import Shape from './shape.js';
import SelectionState from './selectionState.js';
import DistanceState from './distanceState.js';
import Circle from './circle.js';
import Point from './point.js';
import CircleFromPoints from './circleFromPoints.js';
import HalfPlane from './halfPlane.js';
import ParallelTranslation from './parallelTranslation.js'
import ParallelInversions from './parallelInversions.js';
import Rotation from './rotation.js';
import CrossingInversions from './crossingInversions.js';
import TwoCircles from './twoCircles.js';
import Loxodromic from './loxodromic.js';
import Scaling from './scaling.js';
import OrbitSeed from './orbitSeed.js';
import CameraOrbit from './cameraOrbit.js';
import Vue from 'vue';
import TextureHandler from '../textureHandler.js';

// TODO: generate this object automatically
const STR_CLASS_MAP = { 'OrbitSeed': OrbitSeed,
                        'CameraOrbit': CameraOrbit,
                        'Circle': Circle,
                        'Point': Point,
                        'CircleFromPoints': CircleFromPoints,
                        'HalfPlane': HalfPlane,
                        'ParallelTranslation': ParallelTranslation,
                        'ParallelInversions': ParallelInversions,
                        'Rotation': Rotation,
                        'CrossingInversions': CrossingInversions,
                        'TwoCircles': TwoCircles,
                        'Loxodromic': Loxodromic,
                        'Scaling': Scaling };

const PRESETS_CONTEXT = require.context('../presets2d', true, /.json$/);
const PRESETS = [];
for (const k of PRESETS_CONTEXT.keys()) {
    PRESETS.push(PRESETS_CONTEXT(k));
}

export default class Scene {
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

    addHalfPlane(position, sceneScale) {
        if (this.objects['HalfPlane'] === undefined) {
            Vue.set(this.objects, 'HalfPlane', []);
        }
        this.objects['HalfPlane'].push(new HalfPlane(position, new Vec2(1, 0)));
    }

    addParallelTranslation(position, sceneScale) {
        if (this.objects['ParallelTranslation'] === undefined) {
            Vue.set(this.objects, 'ParallelTranslation', []);
        }
        this.objects['ParallelTranslation'].push(new ParallelTranslation(position, new Vec2(1, 0), 2));
    }

    addParallelInversions(position, sceneScale) {
        if (this.objects['ParallelInversions'] === undefined) {
            Vue.set(this.objects, 'ParallelInversions', []);
        }
        this.objects['ParallelInversions'].push(new ParallelInversions(position, new Vec2(1, 0), 2));
    }

    addRotation(position, sceneScale) {
        if (this.objects['Rotation'] === undefined) {
            Vue.set(this.objects, 'Rotation', []);
        }
        this.objects['Rotation'].push(new Rotation(position, new Vec2(1, 0), Math.PI / 4));
    }

    addCrossingInversions(position, sceneScale) {
        if (this.objects['CrossingInversions'] === undefined) {
            Vue.set(this.objects, 'CrossingInversions', []);
        }
        this.objects['CrossingInversions'].push(new CrossingInversions(position, new Vec2(1, 0), Math.PI / 4));
    }

    addTwoCircles(position, sceneScale) {
        if (this.objects['TwoCircles'] === undefined) {
            Vue.set(this.objects, 'TwoCircles', []);
        }
        this.objects['TwoCircles'].push(new TwoCircles(new Circle(position, 0.1 * sceneScale),
                                                       new Circle(position, 0.2 * sceneScale)));
    }

    addLoxodromic(position, sceneScale) {
        if (this.objects['Loxodromic'] === undefined) {
            Vue.set(this.objects, 'Loxodromic', []);
        }
        this.objects['Loxodromic'].push(new Loxodromic(new Circle(position, 0.1 * sceneScale),
                                                       new Circle(position.add(new Vec2(0.01 * sceneScale, 0.0)),
                                                                  0.15 * sceneScale),
                                                       position.add(new Vec2(sceneScale, sceneScale))));
    }

    addScaling(position, sceneScale) {
        if (this.objects['Scaling'] === undefined) {
            Vue.set(this.objects, 'Scaling', []);
        }
        this.objects['Scaling'].push(new Scaling(position, new Vec2(1, 0)));
    }

    addOrbitSeed(position, sceneScale) {
        if (this.objects['OrbitSeed'] === undefined) {
            Vue.set(this.objects, 'OrbitSeed', []);
        }
        this.objects['OrbitSeed'].push(new OrbitSeed(position.x - 0.05 * sceneScale, position.y - 0.05 * sceneScale,
                                                     0.1 * sceneScale, 0.1 * sceneScale, TextureHandler.getTextureIndex('cat_fish_run')));
    }

    addCameraOrbit(position, sceneScale, tex) {
        if (this.objects['CameraOrbit'] === undefined) {
            Vue.set(this.objects, 'CameraOrbit', []);
        }
        this.objects['CameraOrbit'].push(new CameraOrbit(position.x - 0.05 * sceneScale, position.y - 0.05 * sceneScale,
                                                         0.1 * sceneScale, 0.1 * sceneScale, 1, tex));
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
        for (const key of Object.keys(STR_CLASS_MAP)) {
            if (this.objects.hasOwnProperty(key)) {
                for (const c of this.objects[key]) {
                    if (c.removable(mouse)) {
                        const found = this.objects[key].findIndex(element =>
                                                                  element.id === c.id);
                        this.objects[key].splice(found, 1);
                        
                        return true;
                    }
                }
            }
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
