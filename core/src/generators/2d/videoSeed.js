import OrbitSeed from './orbitSeed.js';

export default class VideoSeed extends OrbitSeed {
    name = 'VideoSeed';
    constructor(origin, width, height) {
        super(origin, width, height);
    }

    setUniformValues(gl) {
        gl.uniform2f(this.uniforms[0], this.origin.x, this.origin.y);
        gl.uniform2f(this.uniforms[1], this.normal.x, this.normal.y);
        gl.uniform1f(this.uniforms[2], this.rotationRadians);
        gl.uniform1i(this.uniforms[3], false);
    }

    getUniformLocations(gl, program, index) {
        this.uniforms = [];
        this.uniforms.push(gl.getUniformLocation(program, `u_videoSeed[${index}].origin`));
        this.uniforms.push(gl.getUniformLocation(program, `u_videoSeed[${index}].size`));
        this.uniforms.push(gl.getUniformLocation(program, `u_videoSeed[${index}].rotationRadians`));
        this.uniforms.push(gl.getUniformLocation(program, `u_videoSeed[${index}].isSelected`));
    }
}
