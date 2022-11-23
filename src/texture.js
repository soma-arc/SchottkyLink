import GLUtils from './glUtils.js';

export default class Texture {
    constructor(filename, imgUrl) {
        this.filename = filename;
        this.imgUrl = imgUrl;
        this.img = new Image();
        this.isLoaded = false;
        this.isCopiedToGLTexture = false;
    }

    init(gl) {
        this.textureObj = GLUtils.CreateRGBAUnsignedByteTextures(gl, 1, 1, 1)[0];
    }

    load(gl) {
        this.img = new Image();
        this.isLoaded = false;
        this.isCopiedToGLTexture = false;
        const p = new Promise((resolve) => {
            this.img.addEventListener('load', () => {
                this.isLoaded = true;
                this.width = this.img.width;
                this.height = this.img.height;
                this.textureObj = GLUtils.CreateRGBAUnsignedByteTextures(gl, 1, 1, 1)[0];
                resolve();
            });
        });
        this.img.src = this.imgUrl;
        return p;
    }
}
