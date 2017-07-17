import Vue from 'vue';
import { Camera } from '../camera.js';
import Vec2 from '../vector2d.js';
import Vec3 from '../vector3d.js';
import IsectInfo from './isectInfo.js';
import Shape3D from './shape3d.js';

import BaseSphere from './baseSphere.js'
import InversionSphere from './inversionSphere.js';
import HyperPlane from './hyperPlane.js';

const PRESETS_CONTEXT = require.context('../presets3d', true, /.json$/);
const PRESETS = [];
for (const k of PRESETS_CONTEXT.keys()) {
    PRESETS.push(PRESETS_CONTEXT(k));
}

// TODO: generate this object automatically
const STR_CLASS_MAP = { 'BaseSphere': BaseSphere,
                        'InversionSphere': InversionSphere,
                        'HyperPlane': HyperPlane };

export default class Scene3D {
    constructor() {
        this.objects = {};
        this.presets = PRESETS;

        this.selectedObj = undefined;
        this.selectionInfo = undefined;

        this.updated = false;
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
                    this.selectionInfo.axisDirection = camera.computeXAxisDirOnScreen(this.selectedObj.center, width, height);
                } else if (this.selectionInfo.isectComponentId === Shape3D.Y_AXIS) {
                    this.selectionInfo.axisDirection = camera.computeYAxisDirOnScreen(this.selectedObj.center, width, height);
                } else if (this.selectionInfo.isectComponentId === Shape3D.Z_AXIS) {
                    this.selectionInfo.axisDirection = camera.computeZAxisDirOnScreen(this.selectedObj.center, width, height);
                }
                return;
            }
            this.selectedObj.selected = false;
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
            this.selectedObj.selected = true;
        }
    }

    move(width, height, mouse, camera) {
        if (this.selectedObj !== undefined) {
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
                                                       new Vec3(0, 0, 1)));
    }
}
