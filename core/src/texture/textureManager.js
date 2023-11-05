export default class ImageTextureManager {
    constructor() {
        this.textures = [];
    }

    setUniformLocations(gl, program) {
        this.uniforms = [];
        for(let i = 0; i < this.textures.length; i++) {
            this.uniforms.push(gl.getUniformLocation(program, 'u_imageTexture'));
        }
    }

    setUniformValues(gl) {
        for(let i = 1; i < this.textures.length; )
        gl.activeTexture(gl.TEXTURE0 + textureIndex);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[]);
        gl.uniform1i(this.uniLocations[i++], textureIndex++);
    }


}
