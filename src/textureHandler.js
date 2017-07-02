const IMG_CAT_FISH_RUN = require('./img/cat_fish_run.png');

const TextureData = {}

export default class TextureHandler {
    static init(resolve, reject) {
        const tex = new Image();
        tex.addEventListener('load', () => {
            resolve();
        })
        tex.src = IMG_CAT_FISH_RUN;
        TextureData['cat_fish_run'] = tex;
    }

    static get textureCatFishRun() {
        return TextureData['cat_fish_run'];
    }
}
