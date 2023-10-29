import Generator from '../generator.js';
import Selection from '../../scene/selection.js';
import Vec2 from '../../math/vec2.js';

export default class HalfPlane extends Generator {
    /**
     *
     *       ^ normal
     *       |
     * ------+-------
     *     origin
     * //////////////
     * Make HalfPlane
     * @param {Vec2} origin
     * @param {Vec2} normal
     */
    constructor(origin, normal){
        super();
        this.origin = origin;
        this.normal = normal;
    }

    /**
     * @type {Vec2} p
     * @type {number} sceneScale
     * @return {Selection}
     */
    select(p, sceneScale) {
        const dp = p.sub(this.origin);
        if(dp.length() < Generator.CONTROL_POINT_RADIUS * sceneScale) {
            return new Selection().setObj(this)
                .setComponentId(HalfPlane.COMPONENT_ORIGIN_POINT)
                .setDiffObj(dp);
        }
        
        const dpNormal = p.sub(this.origin.add(this.normal.scale(Generator.NORMAL_POINT_DISTANCE * sceneScale)));
        if (dpNormal.length() < Generator.CONTROL_POINT_RADIUS * sceneScale) {
            return new Selection().setObj(this)
                .setComponentId(HalfPlane.COMPONENT_NORMAL_POINT)
                .setDiffBetweenComponent(dpNormal);
        }

        if (Vec2.dot(this.normal, dp) > 0) return new Selection();

        return new Selection().setObj(this)
            .setComponentId(HalfPlane.COMPONENT_BODY)
            .setDiffBetweenComponent(dp);
    }

    setUniformValues(gl, uniforms) {
        let uniI = 0;
        gl.uniform2f(uniforms[uniI++], this.origin.x, this.origin.y);
        gl.uniform2f(uniforms[uniI++], this.normal.x, this.normal.y);
        gl.uniform1i(uniforms[uniI++], false);
    }

    getUniformLocations(gl, program, index) {
        const uniforms = [];
        uniforms.push(gl.getUniformLocation(program, `u_halfPlane[${index}].origin`));
        uniforms.push(gl.getUniformLocation(program, `u_halfPlane[${index}].normal`));
        uniforms.push(gl.getUniformLocation(program, `u_halfPlane[${index}].selected`));
        return uniforms;
    }
    
    /**
     * @return {number}
     */
    static get COMPONENT_BODY() {
        return 0;
    }

    /**
     * @return {number}
     */
    static get COMPONENT_NORMAL_POINT() {
        return 1;
    }

    /**
     * @return {number}
     */
    static get COMPONENT_ORIGIN_POINT() {
        return 2;
    }

    /**
     * @return {string}
     */
    get type() {
        return 'HalfPlane';
    }

    static get Type() {
        return 'HalfPlane';
    }
}
