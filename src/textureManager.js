import { CreateRGBATextures } from './glUtils.js';
import Texture from './texture.js';
const DEFAULT_IMAGE_URLS = { 'cat_fish_run': require('./img/cat_fish_run.png')
                             };

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

    loadTextureFromDialogue(gl, scene, orbitSeed){
        const a = document.createElement('input');
        a.type = 'file';
        a.addEventListener('change', (event) => {
            const files = event.target.files;
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                const t = new Texture(files[0].name, reader.result);
                const p = t.load(gl);
                this.textures.push(t);
                p.then(() => {
                    orbitSeed.textureIndex = this.textures.length - 1;
                    orbitSeed.originalSize.x = t.width;
                    orbitSeed.originalSize.y = t.height;
                    orbitSeed.update();
                    scene.updateScene();
                    scene.reRender();
                });
            });
            
            reader.readAsDataURL(files[0]);
        });
        a.click();
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
