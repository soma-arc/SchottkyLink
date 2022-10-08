import OrbitSeed from './orbitSeed.js';

export default class VideoSeed extends OrbitSeed {
    constructor(cornerX, cornerY, width, height) {
        super(cornerX, cornerY, width, height);
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_videoSeed${index}.corner`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_videoSeed${index}.size`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_videoSeed${index}.ui`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_videoSeed${index}.selected`));
    }

    updateTextureSize(width, height) {
        const textureWidth = width;
        const textureHeight = height;
        this.aspect = textureHeight / textureWidth;
        if(this.keepAspect && this.keepAspectFromHeight) {
            this.renderWidth = this.size.y / this.aspect;
        }
        this.update();
    }

    exportAsQueryString() {
        return `VideoSeed[]=${this.corner.x.toFixed(this.digits)},${this.corner.y.toFixed(this.digits)},${this.size.x.toFixed(this.digits)},${this.size.y.toFixed(this.digits)}`;
    }

    cloneDeeply() {
        return new VideoSeed(this.corner.x, this.corner.y,
                              this.size.x, this.size.y);
    }

    static loadFromArray(array) {
        const gen = new VideoSeed(array[0], array[1], // cornerX, cornerY
                                  array[2], array[3]);// width, height
        if(array.length === 5 && array[4] === 1) {
            gen.isFixed = true;
        }
        return gen;
    }

    get name() {
        return 'VideoSeed';
    }
}
