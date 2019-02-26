import Vue from 'vue';
import Buefy from 'buefy';
import Root from './vue/root.vue';
import 'buefy/dist/buefy.css';
import Scene from './scene.js';
import CanvasManager from './canvasManager.js';

window.addEventListener('load', () => {
    Vue.use(Buefy);
    window.Vue = Vue;

    const scene = new Scene();
    const canvasManager = new CanvasManager(scene);

    const d = { 'currentRoute': window.location.pathname,
                'scene': scene,
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

    canvasManager.init();
    canvasManager.resize();

    let resizeTimer = setTimeout(canvasManager.resizeCallback, 500);
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(canvasManager.resizeCallback, 500);
    });

    canvasManager.render();

    window.addEventListener('popstate', () => {
        app.currentRoute = window.location.pathname;
    })
});
