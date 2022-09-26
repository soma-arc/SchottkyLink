import Vue from 'vue';
import Buefy from 'buefy';
import Root from './vue/root.vue';
import 'buefy/dist/buefy.css';
import Scene2d from './scene2d.js';
import Scene3d from './scene3d.js';
import CanvasManager from './canvasManager.js';
import TextureManager from './textureManager.js';
import VideoManager from './videoManager.js';
const QueryString = require('query-string');

window.addEventListener('DOMContentLoaded',()=>{
    document.addEventListener('touchmove', e=>e.preventDefault(),{passive:false});
    document.addEventListener('mousewheel',e=>e.preventDefault(),{passive:false});
});

window.addEventListener('load', () => {
    Vue.use(Buefy);
    window.Vue = Vue;

    const textureManager = new TextureManager();
    const videoManager = new VideoManager();
    const scene2d = new Scene2d(textureManager, videoManager);
    const scene3d = new Scene3d();
    const canvasManager = new CanvasManager(scene2d, scene3d, textureManager, videoManager);
    const route = '/'; //window.location.pathname;
    const d = { 'currentRoute': route,
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

    const promises = canvasManager.init(app);
    canvasManager.resize();

    const parsed = QueryString.parse(location.search, {arrayFormat: 'bracket'});
    const downloadImage = (parsed['download'] !== undefined) && parsed['download'] === 'true';
    if(parsed['displayMode'] !== undefined) {
        const displayMode = parsed['displayMode'];
        canvasManager.displayMode = displayMode;
        canvasManager.canvas2d.displayMode = displayMode;
        scene2d.displayMode = displayMode;
        if(displayMode === 'iframe' && localStorage.getItem('isOpenedWindow') === undefined) {
            localStorage.setItem('isOpenedWindow', true);
            const newWindow = open('/', '', 'width=0,height=0');
            if(newWindow !== null) {
                newWindow.addEventListener('load', () => {
                    newWindow.close();
                });
            }
        }
    }
    scene2d.loadFromQueryString(parsed);
    scene2d.updateOrbitSeed();
    canvasManager.canvas2d.loadParameterFromQueryString(parsed);
    canvasManager.textureManager.loadTextureFromQueryString(parsed, canvasManager.canvas2d.gl);
    canvasManager.canvas2d.compileRenderShader();
    if (scene2d.objects['VideoOrbit'] !== undefined &&
        canvasManager.videoManager.streaming === false) {
        canvasManager.videoManager.connect(
            canvasManager.canvas2d.gl,
            () => {
                canvasManager.videoManager.streaming = true;
                if(downloadImage) {
                    canvasManager.canvas2d.renderProductAndSave();
                }
            },
            () => {
            });
    } else {
        if(downloadImage) {
            canvasManager.canvas2d.renderProductAndSave();
        }
    }

    let resizeTimer = setTimeout(canvasManager.resizeCallback, 500);
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(canvasManager.resizeCallback, 500);
    });

    window.addEventListener('popstate', () => {
        app.currentRoute = window.location.pathname;
    });

    function renderLoop() {
        canvasManager.renderLoop();
        requestAnimationFrame(renderLoop);
    }
    renderLoop();

    canvasManager.render();

    // iframe側からCanvasSeedのテクスチャを与える関数
    // document.getElementById('iframe').contentWindow.changeCanvasSeedTextureURL(base64URL);
    // のように呼ぶ
    window.changeCanvasSeedTextureURL = (url) => {
        textureManager.canvasTextures[0].imgUrl = url;
        const promise = textureManager.canvasTextures[0].load(canvasManager.canvas2d.gl);
        promise.then(() => {
            canvasManager.render();
        });
    };

    window.executeCommandTweet = () => {
        canvasManager.saveImageAndTweet();
    };

    window.executeCommandSaveImage = () => {
        canvasManager.canvas2d.renderProductAndSave();
    };

    window.executeCommandClearScene = () => {
        scene2d.removeAllGenerators();
    };

    window.executeCommandResetScene = () => {
        canvasManager.canvas2d.reloadParameter();
        scene2d.reloadParameter();
        canvasManager.textureManager.canvasTextures[0].imgUrl = canvasManager.textureManager.getDefaultCanvasURL();
        canvasManager.canvas2d.compileRenderShader();
        canvasManager.canvas2d.render();
    };
});
