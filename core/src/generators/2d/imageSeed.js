import OrbitSeed from './orbitSeed.js';

export default class ImageSeed extends OrbitSeed {
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
     * @param {Texture} imageTexture
     */
    constructor(origin, width, height, imageTexture) {
        super(origin, width, height);
        this.texture = imageTexture;
    }

    setUniformValues(gl) {
        gl.uniform2f(this.uniforms[0], this.origin.x, this.origin.y);
        gl.uniform2f(this.uniforms[1], this.normal.x, this.normal.y);
        gl.uniform1f(this.uniforms[2], this.rotationRadians);
        gl.uniform1i(this.uniforms[3], this.texture.index);
        gl.uniform1i(this.uniforms[4], false);
    }

    getUniformLocations(gl, program, index) {
        this.uniforms = [];
        this.uniforms.push(gl.getUniformLocation(program, `u_imageSeed[${index}].origin`));
        this.uniforms.push(gl.getUniformLocation(program, `u_imageSeed[${index}].size`));
        this.uniforms.push(gl.getUniformLocation(program, `u_imageSeed[${index}].rotationRadians`));
        this.uniforms.push(gl.getUniformLocation(program, `u_imageSeed[${index}].textureIndex`));
        this.uniforms.push(gl.getUniformLocation(program, `u_imageSeed[${index}].isSelected`));
    }
}
