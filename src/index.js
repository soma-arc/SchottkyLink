import Vue from 'vue';
import TextureHandler from './textureHandler.js';
import Root from './vue/root.vue';
import 'keen-ui/src/bootstrap';

import CanvasManager from './canvasManager.js';

window.addEventListener('load', () => {
    // load default textures
    const texLoad = TextureHandler.init();
    Promise.all(texLoad).then(function() {
        const canvasManager = new CanvasManager();

        const d = { 'canvasManager': canvasManager };

        /* eslint-disable no-new */
        const app = new Vue({
            el: '#app',
            data: d,
            render: (h) => {
                return h('root', { 'props': d })
            },
            components: { 'root': Root }
        })

        canvasManager.init();

        let resizeTimer = setTimeout(canvasManager.resizeCallback, 500);
        window.addEventListener('resize', () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(canvasManager.resizeCallback, 500);
        })

        function renderLoop() {
            canvasManager.renderLoop();
            requestAnimationFrame(renderLoop);
        }
        renderLoop();
    });
});
