import OrbitSeed from './orbitSeed.js';

export default class VideoOrbit extends OrbitSeed {
    constructor(cornerX, cornerY, width, height) {
        super(cornerX, cornerY, width, height);
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_videoOrbit${index}.corner`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_videoOrbit${index}.size`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_videoOrbit${index}.ui`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_videoOrbit${index}.selected`));
    }
    
    get name() {
        return 'VideoOrbit';
    }
}
