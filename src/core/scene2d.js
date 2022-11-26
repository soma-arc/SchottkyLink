import SelectionState from './generator2d/selectionState.js';
import DistanceState from './generator2d/distanceState.js';
import Circle from './generator2d/circle.js';
import Scene from './scene.js';
import Vue from 'vue';
import AddGeneratorCommand from './command/AddGeneratorCommand.js';
import MoveCommand from './command/moveCommand.js';
import RadiusCommand from './command/radiusCommand.js';
import AngleHalfPlaneCommand from './command/angleHalfPlaneCommand.js';
import HalfPlane from './generator2d/halfPlane.js';
import TwoCircles from './generator2d/twoCircles.js';
import Loxodromic from './generator2d/loxodromic.js';
import TextureSeed from './generator2d/textureSeed.js';
import VideoSeed from './generator2d/videoSeed.js';
import CanvasSeed from './generator2d/canvasSeed.js';
import CrossingInversions from './generator2d/crossingInversions.js';
import Rotation from './generator2d/rotation.js';
import ParallelTranslation from './generator2d/parallelTranslation.js';
import ParallelInversions from './generator2d/parallelInversions.js';
import GlideReflection from './generator2d/glideReflection.js';
import Scaling from './generator2d/scaling.js';
import TwoCirclesCommand from './command/twoCirclesCommand.js';
import TwoCirclesC1Command from './command/twoCirclesC1Command.js';
import TwoCirclesC1RCommand from './command/twoCirclesC1RCommand.js';
import TwoCirclesC2RCommand from './command/twoCirclesC2RCommand.js';
import LoxodromicPointCommand from './command/LoxodromicPointCommand.js';
import RemoveGeneratorCommand from './command/removeGeneratorCommand.js';
import Vec2 from './vector2d.js';
import RemoveAllGeneratorsCommand from './command/removeAllGeneratorsCommand.js';
import { ToastProgrammatic as Toast } from 'buefy';
import TextureManager from './textureManager.js';

// TODO: generate this object automatically
const STR_CLASS_MAP = {'CanvasSeed': CanvasSeed,
                       'TextureSeed': TextureSeed,
                       'VideoSeed': VideoSeed,
                       'Scaling': Scaling,
                       'Circle': Circle,
                       'HalfPlane': HalfPlane,
                       'TwoCircles': TwoCircles,
                       'Loxodromic': Loxodromic,
                       'CrossingInversions': CrossingInversions,
                       'ParallelTranslation': ParallelTranslation,
                       'ParallelInversions': ParallelInversions,
                       'GlideReflection': GlideReflection,
                       'Rotation': Rotation
                      };

const PRESETS_CONTEXT = require.context('./presets2d', true, /.json$/);
const PRESETS = [];
for (const k of PRESETS_CONTEXT.keys()) {
    PRESETS.push(PRESETS_CONTEXT(k));
}

export default class Scene2d extends Scene {
    constructor(textureManager, videoManager) {
        super();
        this.objects = {};
        this.presets = PRESETS;
        this.sortPresetByIndex();
        this.selectedState = new SelectionState();

        this.updateSceneListeners = [];
        this.reRenderListeners = [];

        this.copiedGenerator = undefined;

        this.isRenderingGenerator = true;
        this.queryParameter = undefined;

        this.textureManager = textureManager;
        this.videoManager = videoManager;

        this.displayMode = 'default';

        this.fundamentalDomain = [];
    }

    addSceneUpdateListener(listener) {
        this.updateSceneListeners.push(listener);
    }

    addReRenderListener(listener) {
        this.reRenderListeners.push(listener);
    }

    updateScene() {
        for(const listener of this.updateSceneListeners) {
            listener();
        }
    }

    reRender() {
        for(const listener of this.reRenderListeners) {
            listener();
        }
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

    unselect() {
        if(this.selectedState.isSelectingObj()) {
            this.selectedState.selectedObj.selected = false;
            this.selectedState = new SelectionState();
            this.selectedState.selectedObj = undefined;
        }
    }

    select (mouse, sceneScale, selectionScale) {
        // 既に選択済みのジェネレータから選択処理を行う
        if (this.selectedState.isSelectingObj()) {
            this.selectedState.selectedObj.selected = false;
            if(this.selectedState.selectedObj.isFixed === false) {
                const state = this.selectedState.selectedObj.select(mouse, sceneScale, selectionScale);
                if (state.isSelectingObj()) {
                    this.selectedState = state;
                    this.selectedState.selectedObj.selected = true;
                    this.selectedState.setPrevPosition(this.selectedState.selectedObj.getPosition());
                    return true;
                }
            }
        }

        const objKeyNames = Object.keys(STR_CLASS_MAP);
        for (const objName of objKeyNames) {
            // ジェネレータが描画されないときはTextureSeedやVideoOrbit, CanvasSeedのみが表示されるのでそれ以外は選択できない
            if(this.isRenderingGenerator === false &&
               (objName !== 'TextureSeed' && objName !== 'VideoOrbit' && objName !== 'CanvasSeed')) continue;

            if (this.objects[objName] === undefined) continue;
            for (const obj of this.objects[objName]) {
                if(obj.isFixed) continue;
                const state = obj.selectBody(mouse, sceneScale, selectionScale);
                if (state.isSelectingObj()) {
                    this.selectedState = state;
                    this.selectedState.selectedObj.selected = true;
                    this.selectedState.setPrevPosition(this.selectedState.selectedObj.getPosition());
                    return true;
                }
            }
        }
        this.selectedState = new SelectionState();
        return false;
    }

    getComponentOnMouse(mouse, sceneScale) {
        if (this.selectedState.isSelectingObj()) {
            const state = this.selectedState.selectedObj.select(mouse, sceneScale);
            if (state.isSelectingObj()) {
                return state;
            }
        }

        const objKeyNames = Object.keys(STR_CLASS_MAP);
        for (const objName of objKeyNames) {
            if (this.objects[objName] === undefined) continue;
            for (const obj of this.objects[objName]) {
                const state = obj.selectBody(mouse, sceneScale);
                if(state.isSelectingObj()) {
                    return state;
                }
            }
        }
        return new SelectionState();
    }

    inOutsideOfGenerators(position) {
        const objKeyNames = Object.keys(this.objects);
        for (const objName of objKeyNames) {
            for (const obj of this.objects[objName]) {
                if(!obj.outside(position)) {
                    return false;
                }
            }
        }
        return true;
    }

    gen(generator) {
        for(let i = 0; i < 10; i++) {
            if(this.inOutsideOfGenerators(generator.getPosition())) {
                return generator;
            }
            generator = generator.generateNeighborGenerator();
        }
        return generator;
    }

    toggleSnapMode() {
        if (this.selectedState.isSelectingObj()) {
            this.selectedState.selectedObj.toggleSnapMode();
        }
    }

    addGenWithoutDuplicate(generator) {
        this.addGenerator(this.gen(generator));
    }

    addGenerator(generator) {
        this.addCommand(new AddGeneratorCommand(this, generator));
    }

    addCircle(position, sceneScale) {
        const c = new Circle(position, 0.1 * sceneScale);
        this.addCommand(new AddGeneratorCommand(this, c));
    }

    addHalfPlane(position, sceneScale) {
        const h = new HalfPlane(position, new Vec2(1, 0));
        this.addCommand(new AddGeneratorCommand(this, h));
    }

    addTwoCircles(position, sceneScale) {
        const h = new TwoCircles(new Circle(position.cloneDeeply(), 0.1 * sceneScale),
                                 new Circle(position.cloneDeeply(), 0.2 * sceneScale));
        this.addCommand(new AddGeneratorCommand(this, h));
    }

    addLoxodromic(position, sceneScale) {
        const l = new Loxodromic(new Circle(position.cloneDeeply(), 0.1 * sceneScale),
                                 new Circle(position.add(new Vec2(0.05, 0.0)), 0.2 * sceneScale),
                                 position.add(new Vec2(0, 0.3)));
        this.addCommand(new AddGeneratorCommand(this, l));
    }

    addTextureSeed(position, sceneScale) {
        const aspect = this.textureManager.textures[0].height / this.textureManager.textures[0].width;
        const o = new TextureSeed(position.x - 0.05 * sceneScale,
                                  position.y - 0.05 * sceneScale,
                                  0.1 * sceneScale,
                                  0.1 * sceneScale * aspect);
        this.addCommand(new AddGeneratorCommand(this, o));
    }

    addVideoSeed(position, sceneScale) {
        const aspect = this.videoManager.height / this.videoManager.width;
        const o = new VideoSeed(position.x - 0.05 * sceneScale, position.y - 0.05 * sceneScale,
                                0.1 * sceneScale, 0.1 * sceneScale * aspect);
        this.addCommand(new AddGeneratorCommand(this, o));
    }

    addCanvasSeed(position, sceneScale) {
        const o = new CanvasSeed(position.x - 0.05 * sceneScale,
                                 position.y - 0.05 * sceneScale,
                                 0.1 * sceneScale,
                                 0.1 * sceneScale);
        this.addCommand(new AddGeneratorCommand(this, o));
    }

    addCrossingInversions(position, sceneScale) {
        const r = new CrossingInversions(position, new Vec2(1, 0), 0.5 * Math.PI);
        this.addCommand(new AddGeneratorCommand(this, r));
    }

    addRotation(position, sceneScale) {
        const r = new Rotation(position, new Vec2(1, 0), 0.5 * Math.PI);
        this.addCommand(new AddGeneratorCommand(this, r));
    }

    addParallelTranslation(position, sceneScale) {
        const t = new ParallelTranslation(position, new Vec2(1, 0), 1);
        this.addCommand(new AddGeneratorCommand(this, t));
    }

    addParallelInversions(position, sceneScale) {
        const t = new ParallelInversions(position, new Vec2(1, 0), 1);
        this.addCommand(new AddGeneratorCommand(this, t));
    }

    addGlideReflection(position, sceneScale) {
        const t = new GlideReflection(position, new Vec2(1, 0), 1);
        this.addCommand(new AddGeneratorCommand(this, t));
    }

    addScaling(position, sceneScale) {
        const s = new Scaling(position, 0.5, 1, 0.5 * Math.PI);
        this.addCommand(new AddGeneratorCommand(this, s));
    }

    move (mouse) {
        if (this.selectedState.isSelectingObj()) {
            if(this.selectedState.selectedObj.isFixed ||
               this.selectedState.selectedObj.isBody(this.selectedState.componentId)) return false;
            this.selectedState.selectedObj.move(this.selectedState, mouse, this);
            return true;
        }
        return false;
    }

    moveAlongAxis(mouseState, keyState) {
        if (this.selectedState.isSelectingObj()) {
            this.selectedState.selectedObj.moveAlongAxis(this.selectedState, mouseState, keyState, this);
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
            if (this.objects[key] !== undefined) {
                for (const obj of this.objects[key]) {
                    if (obj.removable(mouse)) {
                        const index = this.objects[key].findIndex((elem) => {
                            return elem.id === obj.id;
                        });
                        this.addCommand(new RemoveGeneratorCommand(this, obj, index));
                        return true;
                    }
                }
            }
        }

        return false;
    }

    removeAllGenerators() {
        this.addCommand(new RemoveAllGeneratorsCommand(this));
    }

    setUniformLocation(gl, uniLocations, program) {
        const objKeyNames = Object.keys(this.objects);
        for (const objName of objKeyNames) {
            const objArray = this.objects[objName];
            for (let i = 0; i < objArray.length; i++) {
                objArray[i].setUniformLocation(gl, uniLocations, program, i);
            }
        }
        uniLocations.push(gl.getUniformLocation(program,
                                                'u_isRenderingGenerator'));
        uniLocations.push(gl.getUniformLocation(program,
                                                'u_fundamentalDomain'));
    }

    setUniformValues(gl, uniLocations, uniIndex, sceneScale) {
        let uniI = uniIndex;
        const objKeyNames = Object.keys(this.objects);
        for (const objName of objKeyNames) {
            const objArray = this.objects[objName];
            for (let i = 0; i < objArray.length; i++) {
                uniI = objArray[i].setUniformValues(gl, uniLocations, uniI, sceneScale);
            }
        }
        gl.uniform1f(uniLocations[uniI++], this.isRenderingGenerator);
        gl.uniform2fv(uniLocations[uniI++], this.fundamentalDomain);
        return uniI;
    }

    getContext() {
        const context = {};
        const objKeyNames = Object.keys(this.objects);
        for (const objName of objKeyNames) {
            context[`num${objName}`] = this.objects[objName].length;
        }

        context['maxNumImageTextures'] = TextureManager.MAX_TEXTURES;
        context['maxNumCanvasTextures'] = TextureManager.MAX_CANVAS_TEXTURES;

        const textureIndexes = [];
        if(this.objects['TextureSeed'] !== undefined &&
           this.objects['TextureSeed'].length > 0) {
            for(const textureSeed of this.objects['TextureSeed']) {
                textureIndexes.push(textureSeed.textureIndex);
            }
        }
        context['TextureSeedTexIndexes'] = textureIndexes;
        context['numFundamentalDomainPoints'] = this.fundamentalDomain.length / 2;
        return context;
    }

    loadFromQueryString(parsedObject) {
        if(this.queryParameter === undefined) {
            this.queryParameter = parsedObject;
        }
        this.objects = {};
        const objKeyNames = Object.keys(parsedObject);
        const generators = Object.keys(STR_CLASS_MAP);
        for (const objName of objKeyNames) {
            if(!generators.includes(objName)) continue;
            if (this.objects[objName] === undefined) {
                Vue.set(this.objects, objName, []);
            }
            for (const objParam of parsedObject[objName]) {
                const paramArray = objParam.split(',').map(Number.parseFloat);
                this.objects[objName].push(STR_CLASS_MAP[objName].loadFromArray(paramArray));
            }
        }

        if (parsedObject['renderGenerator'] !== undefined) {
            this.isRenderingGenerator = parsedObject['renderGenerator'] === 'true';
        }

        if (parsedObject['FundamentalDomain'] !== undefined) {
            const domain = parsedObject['FundamentalDomain'].split(',').map((v) => parseFloat(v));
            if (domain.length >= 3 && domain.length % 2 === 1) {
                console.log('Fundamental Domain is invalid');
            } else {
                this.fundamentalDomain = domain;
            }
        }
    }

    // TextureSeedにテクスチャ解像度を通知する
    updateTextureSeed() {
        if(this.objects['TextureSeed'] === undefined) return;
        for(const textureSeed of this.objects['TextureSeed']) {
            textureSeed.updateTextureSize(this.textureManager.textures);
        }
    }

    updateVideoSeed() {
        if(this.objects['VideoSeed'] === undefined) return;
        for(const videoSeed of this.objects['VideoSeed']) {
            videoSeed.updateTextureSize(this.videoManager.width, this.videoManager.height);
        }
    }

    reloadParameter() {
        this.loadFromQueryString(this.queryParameter);
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
        this.selectedState = new SelectionState();
    }

    exportAsQueryString() {
        let queryString = '';
        queryString += `renderGenerator=${this.isRenderingGenerator}&`;

        const objKeyNames = Object.keys(STR_CLASS_MAP);
        for (const objName of objKeyNames) {
            if (this.objects[objName] === undefined) continue;
            for (const obj of this.objects[objName]) {
                queryString += obj.exportAsQueryString() +'&';
            }
        }

        return queryString.substring(0, queryString.length - 1);
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

    mouseUp() {
        if (this.selectedState.isSelectingObj()) {
            if (this.selectedState.selectedObj.name === 'Circle' &&
                this.selectedState.componentId === Circle.CIRCUMFERENCE) {
                this.addCommand(new RadiusCommand(this, this.selectedState.selectedObj,
                                                  this.selectedState.selectedObj.prevRadius,
                                                  this.selectedState.selectedObj.r));
            } else if (this.selectedState.selectedObj.name === 'HalfPlane' &&
                       this.selectedState.componentId === HalfPlane.NORMAL_POINT) {
                this.addCommand(new AngleHalfPlaneCommand(this, this.selectedState.selectedObj,
                                                          this.selectedState.selectedObj.prevNormal,
                                                          this.selectedState.selectedObj.normal));
            } else if (this.selectedState.selectedObj.name === 'TwoCircles') {
                if (this.selectedState.componentId === TwoCircles.C2_BODY) {
                    const d = (this.selectedState.selectedObj.c2.center).sub(this.selectedState.prevPosition);
                    this.addCommand(new TwoCirclesCommand(this, this.selectedState.selectedObj, d));
                } else if (this.selectedState.componentId === TwoCircles.C1_BODY) {
                    const d = (this.selectedState.selectedObj.c1.center).sub(this.selectedState.prevPosition);
                    this.addCommand(new TwoCirclesC1Command(this, this.selectedState.selectedObj, d));
                } else if (this.selectedState.componentId === TwoCircles.C2_CIRCUMFERENCE) {
                    this.addCommand(new TwoCirclesC2RCommand(this, this.selectedState.selectedObj,
                                                             this.selectedState.selectedObj.c2PrevRadius,
                                                             this.selectedState.selectedObj.c2.r));
                } else if (this.selectedState.componentId === TwoCircles.C1_CIRCUMFERENCE) {
                    this.addCommand(new TwoCirclesC1RCommand(this, this.selectedState.selectedObj,
                                                             this.selectedState.selectedObj.c1PrevRadius,
                                                             this.selectedState.selectedObj.c1.r));
                }
            } else if (this.selectedState.selectedObj.name === 'Loxodromic') {
                if (this.selectedState.componentId === Loxodromic.C2_BODY) {
                    const d = (this.selectedState.selectedObj.getPosition()).sub(this.selectedState.prevPosition);
                    this.addCommand(new TwoCirclesCommand(this, this.selectedState.selectedObj, d));
                } else if (this.selectedState.componentId === Loxodromic.C1_BODY) {
                    const d = (this.selectedState.selectedObj.c1.center).sub(this.selectedState.prevPosition);
                    this.addCommand(new TwoCirclesC1Command(this, this.selectedState.selectedObj, d));
                } else if (this.selectedState.componentId === Loxodromic.C2_CIRCUMFERENCE) {
                    this.addCommand(new TwoCirclesC2RCommand(this, this.selectedState.selectedObj,
                                                             this.selectedState.selectedObj.c2PrevRadius,
                                                             this.selectedState.selectedObj.c2.r));
                } else if (this.selectedState.componentId === Loxodromic.C1_CIRCUMFERENCE) {
                    this.addCommand(new TwoCirclesC1RCommand(this, this.selectedState.selectedObj,
                                                             this.selectedState.selectedObj.c1PrevRadius,
                                                             this.selectedState.selectedObj.c1.r));
                } else if (this.selectedState.componentId === Loxodromic.POINT) {
                    this.addCommand(new LoxodromicPointCommand(this, this.selectedObj, this.selectedObj.p));
                }
            } else {
                const d = (this.selectedState.selectedObj.getPosition()).sub(this.selectedState.prevPosition);
                if(d.length() < 0.0000001)
                    return;
                this.addCommand(new MoveCommand(this, this.selectedState.selectedObj, d));
            }
        }
    }

    copy() {
        if(this.selectedState.selectedObj !== undefined) {
            this.copiedGenerator = this.selectedState.selectedObj;
            Toast.open({message: 'Copied.',
                        position: 'is-bottom'});
        }
    }

    paste() {
        if(this.copiedGenerator !== undefined) {
            Toast.open({message: 'Pasted.',
                        position: 'is-bottom'});
            if(this.copiedGenerator.name === 'Circle') {
                this.addGenWithoutDuplicate(new Circle(this.copiedGenerator.center.cloneDeeply(), this.copiedGenerator.r));
            } else {
                this.addCommand(new AddGeneratorCommand(this, this.copiedGenerator.cloneDeeply()));
            }
        }
    }

    mouseLeave() {
    }

    getGenerator(genName, index) {
        const gens = this.objects[genName];
        if(gens === undefined) return undefined;
        const gen = gens[index];
        if(gen === undefined) return undefined;
        return gen;
    }
}