import Vue from 'vue';
import Canvas2D from './canvas2d';
import Scene from './geometry/scene.js';
import ControlPanel from './vue/controlPanel.vue';
import TextureHandler from './textureHandler.js';

const PRESET = require('./preset.json');

window.addEventListener('load', () => {
    // load default textures
    const texLoad = new Promise(function(resolve, reject) {
        TextureHandler.init(resolve, reject);
    });

    texLoad.then(() => {
        const scene = new Scene();
        scene.load(PRESET);
        const canvas2d = new Canvas2D('canvas', scene);
        canvas2d.render();

        const d = { 'scene': scene };

        new Vue({
            el: '#controlPanel',
            data: d,
            render: (h) => {
                return h('control-panel', { 'props': d })
            },
            components: { 'control-panel': ControlPanel }
        })
    });
});
