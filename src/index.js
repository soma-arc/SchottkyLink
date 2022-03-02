import Vue from 'vue';
import TextureHandler from './textureHandler.js';
import Root from './vue/root.vue';
// import 'keen-ui/src/bootstrap';
import KeenUI from 'keen-ui';
import 'keen-ui/dist/keen-ui.css';
import CanvasManager from './canvasManager.js';
import CameraManager from './cameraManager.js';

window.addEventListener('load', () => {
    // load default textures
    Vue.use(KeenUI);

    const texLoad = TextureHandler.init();
    Promise.all(texLoad).then(function() {
        const cameraManager = new CameraManager();
        const canvasManager = new CanvasManager(cameraManager);
        const d = { 'canvasManager': canvasManager,
                    'cameraManager': cameraManager };

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
