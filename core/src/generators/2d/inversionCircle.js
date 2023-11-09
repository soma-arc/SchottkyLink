import Generator from '../generator.js';
import Selection from '../../scene/selection.js';
import Vec2 from '../../math/vec2.js';

export default class InversionCircle extends Generator {
    name = 'InversionCircle';
    /** @type Vec2 */
    #center;
    /** @type number */
    #radius;
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} r
     */
    constructor(x, y, r) {
        super();
        this.#center = new Vec2(x, y);
        this.#radius = r;
    }

    /**
     * @type {Vec2} p
     * @type {number} sceneScale UIをズーム倍率によらず描画するために使用する
     * @return {Selection}
     */
    select(p, sceneScale) {
        const dp = p.sub(this.#center);
        const d = dp.length();
        if (d > this.#radius) return new Selection();

        const distFromCircumference = this.#radius - d;
        if (distFromCircumference < InversionCircle.CircumferenceThickness * sceneScale) {
            // ComponentOriginのよいうな概念の導入が必要
            return new Selection().setObj(this)
                .setComponentId(InversionCircle.COMPONENT_CIRCUMFERENCE)
                .setDiffBetweenComponent(dp);
        }

        return new Selection().setObj(this)
            .setComponentId(InversionCircle.COMPONENT_BODY)
            .setDiffBetweenComponent(dp);
    }

    getOrigin() {
        return this.#center;
    }

    setOrigin(origin) {
        this.#center = origin;
    }

    setUniformValues(gl) {
        gl.uniform2f(this.uniforms[0], this.#center.x, this.#center.y);
        gl.uniform1f(this.uniforms[1], this.#radius);
        gl.uniform1i(this.uniforms[2], this.selected);
    }

    getUniformLocations(gl, program, index) {
        this.uniforms = [];
        this.uniforms.push(gl.getUniformLocation(program, `u_circle[${index}].center`));
        this.uniforms.push(gl.getUniformLocation(program, `u_circle[${index}].radius`));
        this.uniforms.push(gl.getUniformLocation(program, `u_circle[${index}].isSelected`));
    }

    exportAsObject() {
        return {
            id: this.getId(),
            center: [this.center.x, this.center.y],
            radius: this.#radius
        };
    }

    clone() {
        return InversionCircle(this.#center.x, this.#center.y, this.#radius);
    }

    static get COMPONENT_BODY() {
        return 0;
    }

    static get COMPONENT_CIRCUMFERENCE() {
        return 1;
    }

    static get COMPONENT_CENTER() {
        return 2;
    }
}
