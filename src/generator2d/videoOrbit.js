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

    cloneDeeply() {
        return new VideoOrbit(this.corner.x, this.corner.y,
                              this.size.x, this.size.y);
    }

    static loadFromArray(array) {
        return new VideoOrbit(array[0], array[1], // cornerX, cornerY
                              array[2], array[3]);// width, height
    }

    get name() {
        return 'VideoOrbit';
    }
}
