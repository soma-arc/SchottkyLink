import Generator from '../generator.js';
import Selection from '../../scene/selection.js';
import Vec2 from '../../math/vec2.js';

export default class HalfPlane extends Generator {
    name = 'HalfPlane';
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
        if(dp.length() < HalfPlane.ControlPointRadius * sceneScale) {
            return new Selection().setObj(this)
                .setComponentId(HalfPlane.COMPONENT_ORIGIN_POINT)
                .setDiffObj(dp);
        }
        
        const dpNormal = p.sub(this.origin.add(this.normal.scale(HalfPlane.NormalPointDistance * sceneScale)));
        if (dpNormal.length() < HalfPlane.ControlPointRadius * sceneScale) {
            return new Selection().setObj(this)
                .setComponentId(HalfPlane.COMPONENT_NORMAL_POINT)
                .setDiffBetweenComponent(dpNormal);
        }

        if (Vec2.dot(this.normal, dp) > 0) return new Selection();

        return new Selection().setObj(this)
            .setComponentId(HalfPlane.COMPONENT_BODY)
            .setDiffBetweenComponent(dp);
    }

    setUniformValues(gl) {
        gl.uniform2f(this.uniforms[0], this.origin.x, this.origin.y);
        gl.uniform2f(this.uniforms[1], this.normal.x, this.normal.y);
        gl.uniform1i(this.uniforms[2], false);
    }

    getUniformLocations(gl, program, index) {
        this.uniforms = [];
        this.uniforms.push(gl.getUniformLocation(program, `u_halfPlane[${index}].origin`));
        this.uniforms.push(gl.getUniformLocation(program, `u_halfPlane[${index}].normal`));
        this.uniforms.push(gl.getUniformLocation(program, `u_halfPlane[${index}].isSelected`));
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
}
