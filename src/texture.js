import { CreateRGBATextures } from './glUtils.js';


export default class Texture {
    constructor(filename, imgUrl) {
        this.filename = filename;
        this.imgUrl = imgUrl;
        this.img = new Image();
        this.isLoaded = false;
        this.isCopiedToGLTexture = false;
    }

    init(gl) {
        this.textureObj = CreateRGBATextures(gl, 1, 1, 1)[0];
    }

    load(gl) {
        const p = new Promise((resolve, reject) => {
            this.img.addEventListener('load', () => {
                this.isLoaded = true;
                this.width = this.img.width;
                this.height = this.img.height;
                this.textureObj = CreateRGBATextures(gl, 1, 1, 1)[0];
                resolve();
            });
        });
        this.img.src = this.imgUrl;
        return p;
    }
}
