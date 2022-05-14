import { CreateRGBATextures } from './glUtils.js';
import Texture from './texture.js';
const DEFAULT_IMAGE_URLS = { 'cat_fish_run': require('./img/cat_fish_run.png') };

export default class TextureManager {
    constructor() {
        this.textures = [];
        for (const imgName of Object.keys(DEFAULT_IMAGE_URLS)) {
            this.textures.push(new Texture(imgName, DEFAULT_IMAGE_URLS[imgName]));
        }
    }

    loadDefaultImages(gl) {
        const promises = [];
        for (const tex of this.textures) {
            const promise = tex.load(gl);
            promises.push(promise);
        }
        return promises;
    }

    init(gl) {
        for(const tex of this.textures) {
            tex.init(gl);
        }
    }

    static get MAX_TEXTURES() {
        return 10;
    }
}
