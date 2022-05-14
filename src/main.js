import Vue from 'vue';
import Buefy from 'buefy';
import Root from './vue/root.vue';
import 'buefy/dist/buefy.css';
import Scene2d from './scene2d.js';
import Scene3d from './scene3d.js';
import CanvasManager from './canvasManager.js';

window.addEventListener('load', () => {
    Vue.use(Buefy);
    window.Vue = Vue;

    const scene2d = new Scene2d();
    const scene3d = new Scene3d();
    const canvasManager = new CanvasManager(scene2d, scene3d);

    const d = { 'currentRoute': window.location.pathname,
                'scene2d': scene2d,
                'scene3d': scene3d,
                'canvasManager': canvasManager };

    /* eslint-disable no-unused-vars */
    const app = new Vue({
        el: '#app',
        data: d,
        render: (h) => {
            return h('root', { 'props': d });
        },
        components: { 'root': Root }
    });

    canvasManager.init(app);
    canvasManager.resize();

    let resizeTimer = setTimeout(canvasManager.resizeCallback, 500);
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(canvasManager.resizeCallback, 500);
    });

    canvasManager.render();

    window.addEventListener('popstate', () => {
        app.currentRoute = window.location.pathname;
    });

    function renderLoop() {
        canvasManager.renderLoop();
        requestAnimationFrame(renderLoop);
    }
    renderLoop();
});
