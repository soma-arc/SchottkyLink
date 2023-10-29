import Generator from '../generator.js';
import Selection from '../../scene/selection.js';
import Vec2 from '../../math/vec2.js';

export default class InversionCircle extends Generator {
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
     * @type {number} sceneScale
     * @return {Selection}
     */
    select(p, sceneScale) {
        const dp = p.sub(this.#center);
        const d = dp.length();
        if (d > this.#radius) return new Selection();

        const distFromCircumference = this.#radius - d;
        if (distFromCircumference < this.circumferenceThickness * sceneScale) {
            // ComponentOriginのような概念の導入が必要
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

    setUniformValues(gl, uniforms) {
        let uniI = 0;
        gl.uniform2f(uniforms[uniI++], this.#center.x, this.#center.y);
        gl.uniform1f(uniforms[uniI++], this.#radius);
        gl.uniform1i(uniforms[uniI++], false);
    }

    getUniformLocations(gl, program, index) {
        const uniforms = [];
        uniforms.push(gl.getUniformLocation(program, `u_circle[${index}].center`));
        uniforms.push(gl.getUniformLocation(program, `u_circle[${index}].radius`));
        uniforms.push(gl.getUniformLocation(program, `u_circle[${index}].selected`));
        return uniforms;
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

    get type() {
        return 'InversionCircle';
    }

    static get Type() {
        return 'InversionCircle';
    }
}
