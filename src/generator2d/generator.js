import SelectionState from './selectionState.js';
import DistanceState from './distanceState.js';
import Vec2 from '../vector2d.js';

export default class Generator {
    constructor() {
        this.p;
        this.selected = false;
        this.id = new Date().getTime().toString(16) + Math.floor(1000 * Math.random()).toString(16);
        this.isFixed = false;
    }

    getPosition() {
        return this.p;
    }

    /**
     * update
     */
    update() {}

    /**
     * check if this shape is removable
     * @param {Vec2} mouse
     * @returns {boolean} if this shape is removable or not
     */
    removable(mouse) {
        return false;
    }

    /**
     *
     * @param {Vec2} mouse
     * @param  {number} sceneScale
     * @returns {SelectionState}
     */
    select(mouse, sceneScale) {
        return new SelectionState();
    }

    /**
     * ハンドルなどのUIを除いた選択判定を行う
     * @param {Vec2} mouse
     * @param  {number} sceneScale
     * @param  {number} selectionScale
     * @returns {SelectionState}
     */
    selectBody(mouse, sceneScale, selectionScale) {
        return this.select(mouse, sceneScale, selectionScale);
    }

    // 与えられたコンポーネントIDがハンドル型UI
    // (HalfPlaneにおける回転を制御するNORMAL_POINTや半平面同士の距離を制御するPOINT_HP2など)であるかどうかを判定する
    isHandle(componentId) {
        return false;
    }

    /**
     *
     * @param {SelectionState} mouseState
     * @param {Vec2} mouse
     * @param { Scene } scene
     */
    move(mouseState, mouse, scene) {}

    /**
     *
     * @param {SelectionState} SelectionState
     * @param {Object} mouseState
     * @param {Object} keyState
     * @param { Scene } scene
     */
    moveAlongAxis(SelectionState, mouseState, keyState, scene) {}

    /**
     * compute distance between p and object's components
     * @param {Vec2} p
     */
    getDistances(p) {
        return [new DistanceState(Number.MAX_VALUE, this, 0)];
    }

    /**
     *
     * @returns {Generator}
     */
    cloneDeeply() {
        return new Generator();
    }

    /**
     *
     * @param {WebGL2RenderingContext} gl
     * @param {Array.} uniLocation
     * @param {number} uniIndex
     * @param {number} sceneScale
     * @returns {number}
     */
    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        return uniIndex;
    }

    /**
     *
     * @param {WebGL2RenderingContext} gl
     * @param {Array.} uniLocation
     * @param {WebGLProgram} program
     * @param {number} index
     */
    setUniformLocation(gl, uniLocation, program, index) {}

    toggleSnapMode() {}

    /**
     *
     * @param {Vec2} position
     */
    outside(position) {
        return true;
    }

    /**
     *
     * @param {Vec2} vec
     */
    translate(vec) {}

    /**
     *
     * @returns {String.}
     */
    exportAsQueryString() {
        return '';
    }

    /**
     *
     * @returns {Object.}
     */
    exportJson() {
        return {};
    }

    isBody(componentId) {
        return false;
    }

    static loadFromArray(array) {
        return new Generator();
    }

    /**
     *
     * @param {Object.} obj
     * @returns {Generator}
     */
    static loadJson(obj, scene) {
        return new Generator();
    }

    /**
     *
     * @returns {String}
     */
    get name() {
        return 'generator';
    }

    get digits() {
        return 4;
    }
}
