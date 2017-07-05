import Vue from 'vue';
import Canvas2D from './canvas2d';
import Scene from './geometry/scene.js';
import ControlPanel from './vue/controlPanel.vue';
import TextureHandler from './textureHandler.js';
import Root from './vue/root.vue';
import 'keen-ui/src/bootstrap';

window.addEventListener('load', () => {
    // load default textures
    const texLoad = TextureHandler.init();

    Promise.all(texLoad).then(function() {
        const scene = new Scene();

        const d = { 'scene': scene,
                    'canvas2d': {} };

        /* eslint-disable no-new */
        new Vue({
            el: '#app',
            data: d,
            render: (h) => {
                return h('root', { 'props': d })
            },
            components: { 'root': Root }
        })
        d.canvas2d = new Canvas2D('canvas', scene);
        const canvas2d = d.canvas2d;
        canvas2d.render();

        function resized() {
            canvas2d.resizeCanvas();
            canvas2d.compileRenderShader();
            canvas2d.render();
        }

        let resizeTimer = setTimeout(resized, 500);
        window.addEventListener('resize', () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(resized, 500);
        })

        window.addEventListener('keydown', function(event) {
            switch (event.key) {
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
