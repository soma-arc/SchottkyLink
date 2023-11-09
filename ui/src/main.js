import { createApp } from 'vue';
import Root from './vue/root.vue';
import Canvas2D from '../../core/src/canvas/canvas2d.js';
import Scene2D from '../../core/src/scene/scene2d.js';
import Renderer from '../../core/src/renderer/renderer.js';

const SCHOTTKY_FRAGMENT = require('./shaders/2dShader.njk.frag');

window.addEventListener('load', () => {
    const canvas = new Canvas2D('canvas');
    
    const props = {'canvas': canvas,
                   'renderer': undefined,
                   'scene': undefined};
    const app = createApp(Root, props);
    app.mount('#app');

    canvas.init();

    const scene = new Scene2D();
    canvas.addEventListener('mousedown', scene.getDefaultCanvasMouseDownListener(canvas));
    scene.addReRenderListener(() => {
        renderer.render();
    });
    const renderer = new Renderer(canvas, SCHOTTKY_FRAGMENT, scene);
    renderer.render();
});
