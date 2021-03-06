import Vue from 'vue';
import { Camera } from '../camera.js';
import Vec2 from '../vector2d.js';
import Vec3 from '../vector3d.js';
import IsectInfo from './isectInfo.js';
import Shape3D from './shape3d.js';

import Sphere from './sphere.js';
import BaseSphere from './baseSphere.js';
import InversionSphere from './inversionSphere.js';
import HyperPlane from './hyperPlane.js';
import ParallelPlanes from './parallelTranslation.js';
import TwoSpheres from './twoSpheres.js';
import Loxodromic from './loxodromic.js';

const PRESETS_CONTEXT = require.context('../presets3d', true, /.json$/);
const PRESETS = [];
for (const k of PRESETS_CONTEXT.keys()) {
    PRESETS.push(PRESETS_CONTEXT(k));
}

// TODO: generate this object automatically
const STR_CLASS_MAP = { 'BaseSphere': BaseSphere,
                        'InversionSphere': InversionSphere,
                        'HyperPlane': HyperPlane,
                        'ParallelPlanes': ParallelPlanes,
                        'TwoSpheres': TwoSpheres,
                        'Loxodromic': Loxodromic };

export default class Scene3D {
    constructor() {
        this.objects = {};
        this.presets = PRESETS;
        this.sortPresetByIndex();

        this.selectedObj = undefined;
        this.selectionInfo = undefined;

        this.updated = false;
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

    setUniformLocation(gl, uniLocations, program) {
        uniLocations.push(gl.getUniformLocation(program,
                                                'u_isSelectingObj'));
        uniLocations.push(gl.getUniformLocation(program,
                                                'u_objBasis.center'));
        uniLocations.push(gl.getUniformLocation(program,
                                                'u_objBasis.r'));
        uniLocations.push(gl.getUniformLocation(program,
                                                'u_objBasis.len'));
        uniLocations.push(gl.getUniformLocation(program,
                                                'u_objBasis.hasRotationUI'));
        uniLocations.push(gl.getUniformLocation(program,
                                                'u_objBasis.rotationParam'));
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

        gl.uniform1i(uniLocation[uniI++], this.selectedObj !== undefined);
        if (this.selectedObj !== undefined) {
            uniI = this.selectedObj.setObjBasisUniformValues(gl, uniLocation, uniI);
        } else {
            uniI++;
            uniI++;
            uniI++;
            uniI++;
            uniI++;
        }

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
        const ray = camera.computeRay(width, height, mouse.x, mouse.y);
        const isectInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);
        isectInfo.prevMouse = mouse;
        if (this.selectedObj !== undefined) {
            this.selectedObj.castRayToBasis(camera.pos, ray, isectInfo);
            if (isectInfo.hitObject !== undefined) {
                this.selectionInfo = isectInfo;
                this.selectionInfo.prevShape = this.selectedObj.cloneDeeply();
                if (this.selectionInfo.isectComponentId === Shape3D.X_AXIS) {
                    this.selectionInfo.axisDirection = camera.computeXAxisDirOnScreen(this.selectedObj.getAxisOrg(),
                                                                                      width, height);
                } else if (this.selectionInfo.isectComponentId === Shape3D.Y_AXIS ||
                           this.selectionInfo.isectComponentId === Shape3D.ROTATION_YZ) {
                    this.selectionInfo.axisDirection = camera.computeYAxisDirOnScreen(this.selectedObj.getAxisOrg(),
                                                                                      width, height);
                } else if (this.selectionInfo.isectComponentId === Shape3D.Z_AXIS ||
                           this.selectionInfo.isectComponentId === Shape3D.ROTATION_XZ) {
                    this.selectionInfo.axisDirection = camera.computeZAxisDirOnScreen(this.selectedObj.getAxisOrg(),
                                                                                      width, height);
                }
                return;
            }
            //            this.selectedObj.selected = false;
            this.selectedObj.unselect();
        }

        const objKeyNames = Object.keys(STR_CLASS_MAP);
        for (const objName of objKeyNames) {
            if (this.objects[objName] === undefined) continue;
            for (const obj of this.objects[objName]) {
                obj.castRay(camera.pos, ray, isectInfo);
            }
        }
        this.selectedObj = isectInfo.hitObject;
        this.selectionInfo = isectInfo;
        if (this.selectedObj !== undefined) {
            //            this.selectedObj.selected = true;
            this.selectedObj.select(isectInfo);
        }
    }

    remove(width, height, mouse, camera) {
        const ray = camera.computeRay(width, height, mouse.x, mouse.y);
        const isectInfo = new IsectInfo(Number.MAX_VALUE, Number.MAX_VALUE);

        const objKeyNames = Object.keys(STR_CLASS_MAP);
        for (const objName of objKeyNames) {
            if (this.objects[objName] === undefined) continue;
            for (const obj of this.objects[objName]) {
                obj.castRay(camera.pos, ray, isectInfo);
            }

            this.selectedObj = isectInfo.hitObject;
            this.selectionInfo = isectInfo;
            if (this.selectedObj !== undefined &&
                this.selectedObj.selected) {
                this.selectedObj.select(isectInfo);
                const found = this.objects[objName].findIndex(element =>
                                                              element.id === this.selectedObj.id);
                this.objects[objName][found].selected = false;
                this.selectedObj = undefined;
                this.objects[objName].splice(found, 1);
                return true;
            }
        }

        return false;
    }

    move(width, height, mouse, camera) {
        if (this.selectedObj !== undefined &&
            this.selectionInfo.prevShape !== undefined) {
            return this.selectedObj.move(width, height,
                                         mouse, camera,
                                         this.selectionInfo, this);
        }
        return false;
    }

    keydown(mouse) {
        if (this.selectedObj === undefined) return;
        this.selectionInfo.prevMouse = mouse;
        this.selectionInfo.prevShape = this.selectedObj.cloneDeeply();
    }

    operateScale(width, height, mouse, camera) {
        if (this.selectedObj !== undefined) {
            return this.selectedObj.operateScale(width, height,
                                                 mouse, camera,
                                                 this.selectionInfo, this);
        }
        return false;
    }

    addBaseSphere() {
        if (this.objects['BaseSphere'] === undefined) {
            Vue.set(this.objects, 'BaseSphere', []);
        }
        this.objects['BaseSphere'].push(new BaseSphere(0, 0, 0, 125));
    }

    addInversionSphere() {
        if (this.objects['InversionSphere'] === undefined) {
            Vue.set(this.objects, 'InversionSphere', []);
        }
        this.objects['InversionSphere'].push(new InversionSphere(100, 100, 0, 125));
    }

    addHyperPlane() {
        if (this.objects['HyperPlane'] === undefined) {
            Vue.set(this.objects, 'HyperPlane', []);
        }
        this.objects['HyperPlane'].push(new HyperPlane(new Vec3(0, 0, 100),
                                                       Math.PI * 0.5, 0));
    }

    addParallelPlanes() {
        if (this.objects['ParallelPlanes'] === undefined) {
            Vue.set(this.objects, 'ParallelPlanes', []);
        }
        this.objects['ParallelPlanes'].push(new ParallelPlanes(new Vec3(0, 0, -500),
                                                               Math.PI * 0.5, 0, 1000));
    }

    addTwoSpheres() {
        if (this.objects['TwoSpheres'] === undefined) {
            Vue.set(this.objects, 'TwoSpheres', []);
        }
        this.objects['TwoSpheres'].push(new TwoSpheres(new Sphere(0, 0, 0, 100),
                                                       new Sphere(0, 0, 0, 200)));
    }

    addLoxodromic() {
        if (this.objects['Loxodromic'] === undefined) {
            Vue.set(this.objects, 'Loxodromic', []);
        }
        this.objects['Loxodromic'].push(new Loxodromic(new Sphere(10, 160, 645, 566),
                                                       new Sphere(100, 211, 666, 700),
                                                       new Vec3(0, 1111, -133),
                                                       new Vec3(100, -888, -133),
                                                       new Vec3(1000, 111, -143)));
    }

    exportJson() {
        const json = {};
        json['label'] = 'scene';
        json['mode'] = '3d';
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
