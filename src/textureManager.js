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
        a.accept = '.png,.jpg,.jpeg,.gif';
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
                    orbitSeed.aspect = t.height / t.width;
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

    async loadTextureFromQueryString(parsedObject, gl) {
        if(parsedObject['Texture'] === undefined) return;
        for(const textureParam of parsedObject['Texture']) {
            const commaIndex = textureParam.indexOf(',');
            const name = textureParam.substring(0, commaIndex);
            const base64 = decodeURIComponent(textureParam.substring(commaIndex + 1));
            const type = 'data:image/png;base64,';
            const tex = new Texture(name, base64);
            await tex.load(gl);
            this.textures.push(tex);
            console.log(this.textures);
        }
    }

    static get MAX_TEXTURES() {
        return 10;
    }
}
