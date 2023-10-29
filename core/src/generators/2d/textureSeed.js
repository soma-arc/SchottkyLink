import OrbitSeed from './orbitSeed.js';

export default class TextureSeed extends OrbitSeed {
    /**
     *       width
     *   -------------
     *   |           |
     *   |-----------| height
     *   |           |
     *   +------------
     * origin
     * @param {number} origin
     * @param {number} width
     * @param {number} height
     * @param {Texture} texture
     */
    constructor(origin, width, height, texture) {
        super(origin, width, height);
        this.texture = texture;
    }

    setUniformValues(gl, uniforms) {
        let uniI = 0;
        gl.uniform2f(uniforms[uniI++], this.origin.x, this.origin.y);
        gl.uniform2f(uniforms[uniI++], this.normal.x, this.normal.y);
        gl.uniform1f(uniforms[uniI++], this.rotationRadians);
        gl.uniform1i(uniforms[uniI++], this.texture.index);
        gl.uniform1i(uniforms[uniI++], false);
    }

    getUniformLocations(gl, program, index) {
        const uniforms = [];
        uniforms.push(gl.getUniformLocation(program, `u_textureSeed[${index}].origin`));
        uniforms.push(gl.getUniformLocation(program, `u_textureSeed[${index}].size`));
        uniforms.push(gl.getUniformLocation(program, `u_textureSeed[${index}].rotationRadians`));
        uniforms.push(gl.getUniformLocation(program, `u_textureSeed[${index}].textureIndex`));
        uniforms.push(gl.getUniformLocation(program, `u_textureSeed[${index}].selected`));
        return uniforms;
    }

    get type() {
        return 'TextureSeed';
    }

    static get Type() {
        return 'TextureSeed';
    }
}
