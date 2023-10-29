import OrbitSeed from './orbitSeed.js';

export default class VideoSeed extends OrbitSeed {
    constructor(origin, width, height) {
        super(origin, width, height);
    }

    setUniformValues(gl, uniforms) {
        let uniI = 0;
        gl.uniform2f(uniforms[uniI++], this.origin.x, this.origin.y);
        gl.uniform2f(uniforms[uniI++], this.normal.x, this.normal.y);
        gl.uniform1f(uniforms[uniI++], this.rotationRadians);
        gl.uniform1i(uniforms[uniI++], false);
    }

    getUniformLocations(gl, program, index) {
        const uniforms = [];
        uniforms.push(gl.getUniformLocation(program, `u_videoSeed[${index}].origin`));
        uniforms.push(gl.getUniformLocation(program, `u_videoSeed[${index}].size`));
        uniforms.push(gl.getUniformLocation(program, `u_videoSeed[${index}].rotationRadians`));
        uniforms.push(gl.getUniformLocation(program, `u_videoSeed[${index}].selected`));
        return uniforms;
    }

    get type() {
        return 'VideoSeed';
    }

    static get Type() {
        return 'VideoSeed';
    }
}
