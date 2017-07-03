import Vue from 'vue';
import Canvas2D from './canvas2d';
import Scene from './geometry/scene.js';
import ControlPanel from './vue/controlPanel.vue';
import TextureHandler from './textureHandler.js';

window.addEventListener('load', () => {
    // load default textures
    const texLoad = TextureHandler.init();

    Promise.all(texLoad).then(function() {
        const scene = new Scene();
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

        window.addEventListener('keydown', function(event) {
            switch(event.key){
            case '0':
                scene.loadPreset(0);
                canvas2d.compileRenderShader();
                canvas2d.render();
                break;
            case '1':
                scene.loadPreset(1);
                canvas2d.compileRenderShader();
                canvas2d.render();
                break;
            }
        });
    });
});
