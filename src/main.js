import Vue from 'vue';
import Buefy from 'buefy';
import Root from './vue/root.vue';
import 'buefy/dist/buefy.css';
import Scene2d from './scene2d.js';
import Scene3d from './scene3d.js';
import CanvasManager from './canvasManager.js';
import TextureManager from './textureManager.js';
import VideoManager from './videoManager.js';
import Radians from './radians.js';
import Vec2 from './vector2d.js';
import Circle from './generator2d/circle.js';
const QueryString = require('query-string');

window.addEventListener('DOMContentLoaded',()=>{
    document.addEventListener('touchmove', e=>e.preventDefault(),{passive:false});
});

window.addEventListener('load', () => {
    Vue.use(Buefy);
    window.Vue = Vue;
    console.log(window.navigator.userAgent);

    const textureManager = new TextureManager();
    const videoManager = new VideoManager();
    const scene2d = new Scene2d(textureManager, videoManager);
    const scene3d = new Scene3d();
    const canvasManager = new CanvasManager(scene2d, scene3d, textureManager, videoManager);
    const route = '/'; //window.location.pathname;

    const parsed = QueryString.parse(location.search, {arrayFormat: 'bracket'});
    const downloadImage = (parsed['download'] !== undefined) && parsed['download'] === 'true';
    if(parsed['displayMode'] !== undefined) {
        const displayMode = parsed['displayMode'];
        canvasManager.displayMode = displayMode;
        canvasManager.canvas2d.displayMode = displayMode;
        scene2d.displayMode = displayMode;
        // if(displayMode === 'iframe' && localStorage.getItem('isOpenedWindow') === undefined) {
        //     localStorage.setItem('isOpenedWindow', true);
        //     const newWindow = open('/', '', 'width=0,height=0');
        //     if(newWindow !== null) {
        //         newWindow.addEventListener('load', () => {
        //             newWindow.close();
        //         });
        //     }
        // }
    }
    scene2d.loadFromQueryString(parsed);
    canvasManager.canvas2d.loadParameterFromQueryString(parsed);

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

    canvasManager.init(app);
    canvasManager.resize();

    scene2d.updateOrbitSeed();
    canvasManager.textureManager.loadTextureFromQueryString(parsed, canvasManager.canvas2d.gl);
    canvasManager.canvas2d.compileRenderShader();
    if (scene2d.objects['VideoOrbit'] !== undefined &&
        canvasManager.videoManager.streaming === false) {
        canvasManager.videoManager.connect(
            canvasManager.canvas2d.gl,
            () => {
                scene2d.updateVideoOrbit();
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
    window.changeCanvasSeedTextureURL = async (url) => {
        textureManager.canvasTextures[0].imgUrl = url;
        await textureManager.canvasTextures[0].load(canvasManager.canvas2d.gl);
        canvasManager.render();
    };

    window.executeCommandTweet = () => {
        canvasManager.saveImageAndTweet('');
    };

    window.executeCommandSaveImage = () => {
        canvasManager.canvas2d.renderProductAndSave();
    };

    window.executeCommandClearScene = () => {
        scene2d.removeAllGenerators();
    };

    window.executeCommandResetScene = async () => {
        canvasManager.canvas2d.reloadParameter();
        scene2d.reloadParameter();
        canvasManager.textureManager.canvasTextures[0].imgUrl = canvasManager.textureManager.getDefaultCanvasURL();
        await canvasManager.textureManager.canvasTextures[0].load(canvasManager.canvas2d.gl);

        canvasManager.canvas2d.compileRenderShader();
        canvasManager.canvas2d.render();
    };

    window.enableRenderGenerator = (enabled) => {
        scene2d.isRenderingGenerator = enabled;
        canvasManager.canvas2d.render();
    };

    window.enableVideoStream = (bool) => {
        videoManager.streaming = bool;
    };

    window.executeCommandGetURL = () => {
        const url = canvasManager.canvas2d.exportAsQueryString();
        return url;
    };

    window.executeCommandCopyURL = async () => {
        const url = canvasManager.canvas2d.exportAsQueryString();
        await navigator.clipboard.writeText(url);
    };

    // Canvas
    window.setMaxIterations = (iterations) => {
        canvasManager.canvas2d.maxIterations = iterations;
        canvasManager.canvas2d.render();
    };

    window.setScale = (scale) => {
        canvasManager.canvas2d.scale = scale;
        canvasManager.canvas2d.render();
    };

    window.setTranslateX = (x) => {
        canvasManager.canvas2d.translate.x = x;
        canvasManager.canvas2d.render();
    };

    window.setTranslateY = (y) => {
        canvasManager.canvas2d.translate.y = y;
        canvasManager.canvas2d.render();
    };

    window.setBackgroundColor = (r, g, b, a) => {
        canvasManager.canvas2d.backgroundColor = [r, g, b, a];
        canvasManager.canvas2d.render();
    };

    window.setGeneratorBoundaryColor = (r, g, b) => {
        canvasManager.canvas2d.generatorBoundaryColor = [r, g, b];
        canvasManager.canvas2d.render();
    };

    window.allowDeleteComponents = (bool) => {
        canvasManager.canvas2d.allowDeleteComponents = bool;
    };

    window.setCircle = (index, x, y, r) => {
        const circle = scene2d.getGenerator('Circle', index);
        if(circle === undefined) return;
        circle.center.x = x;
        circle.center.y = y;
        circle.r = r;
        circle.update();
        canvasManager.canvas2d.render();
    };

    window.setHalfPlane = (index, x, y, degree) => {
        const plane = scene2d.getGenerator('HalfPlane', index);
        if(plane === undefined) return;
        plane.p.x = x;
        plane.p.y = y;
        const rad = Radians.DegToRad(degree);
        plane.normal = new Vec2(Math.cos(rad), Math.sin(rad));
        plane.boundaryDir = new Vec2(plane.normal.y,
                                     plane.normal.x);
        canvasManager.canvas2d.render();
    };

    const setSeed = (name, index, x, y, width, height) => {
        const orbit = scene2d.getGenerator(name, index);
        if(orbit === undefined) return;
        orbit.corner = new Vec2(x, y);
        orbit.size = new Vec2(width, height);
        orbit.update();
        canvasManager.canvas2d.render();
    };

    window.setOrbitSeed = (index, x, y, width, height) => {
        setSeed('OrbitSeed', index, x, y, width, height);
    };

    window.setVideoOrbit = (index, x, y, width, height) => {
        setSeed('VideoOrbit', index, x, y, width, height);
    };

    window.setCanvasSeed = (index, x, y, width, height) => {
        setSeed('CanvasSeed', index, x, y, width, height);
    };

    const setParallelPlanes = (name, index, x, y, degree, distance) => {
        const gen = scene2d.getGenerator(name, index);
        if(gen === undefined) return;
        gen.p = new Vec2(x, y);
        const rad = Radians.DegToRad(degree);
        gen.normal = new Vec2(Math.cos(rad), Math.sin(rad));
        gen.planeDist = distance;
        gen.update();
        canvasManager.canvas2d.render();
    };

    window.setParallelInversions = (index, x, y, degree, distance) => {
        setParallelPlanes('ParallelInversions', index, x, y, degree, distance);
    };

    window.setParallelTranslation = (index, x, y, degree, distance) => {
        setParallelPlanes('ParallelTranslation', index, x, y, degree, distance);
    };

    window.setGlideReflection = (index, x, y, degree, distance) => {
        setParallelPlanes('GlideReflection', index, x, y, degree, distance);
    };

    const setTwoPlanes = (name, index, x, y, boundaryDegree, normalDegree) => {
        const gen = scene2d.getGenerator(name, index);
        if(gen === undefined) return;
        gen.p = new Vec2(x, y);
        const boundaryRad = Radians.DegToRad(boundaryDegree);
        const normalRad = Radians.DegToRad(normalDegree);
        gen.boundaryDir1 = new Vec2(Math.cos(boundaryRad), Math.sin(boundaryRad));
        gen.radians = normalRad;
        gen.update();
        canvasManager.canvas2d.render();
    };

    window.setCrossingInversions = (index, x, y, boundaryDegree, normalDegree) => {
        setTwoPlanes('CrossingInversions', index, x, y, boundaryDegree, normalDegree);
    };

    window.setRotation = (index, x, y, boundaryDegree, normalDegree) => {
        setTwoPlanes('Rotation', index, x, y, boundaryDegree, normalDegree);
    };

    window.setScaling = (index, x, y, c1r, c2r, angleDegree) => {
        const gen = scene2d.getGenerator('Scaling', index);
        if(gen === undefined) return;
        gen.center.x = x;
        gen.center.y = y;
        gen.c1 = new Circle(gen.center, c1r);
        gen.c2 = new Circle(gen.center, c2r);
        gen.rotationAngleDeg = angleDegree;
        gen.updateFromRotationAngle();
        canvasManager.canvas2d.render();
    };

    window.setTwoCircles = (index, c1x, c1y, c1r, c2x, c2y, c2r) => {
        const gen = scene2d.getGenerator('TwoCircles', index);
        if(gen === undefined) return;
        gen.c1 = new Circle(new Vec2(c1x, c1y), c1r);
        gen.c2 = new Circle(new Vec2(c2x, c2y), c2r);
        gen.update();
        canvasManager.canvas2d.render();
    };

    window.setLoxodromic = (index, c1x, c1y, c1r, c2x, c2y, c2r, px, py) => {
        const gen = scene2d.getGenerator('Loxodromic', index);
        if(gen === undefined) return;
        gen.c1 = new Circle(new Vec2(c1x, c1y), c1r);
        gen.c2 = new Circle(new Vec2(c2x, c2y), c2r);
        gen.p = new Vec2(px, py);
        gen.c1PrevRadius = gen.c1.r;
        gen.c2PrevRadius = gen.c2.r;
        gen.update();
        canvasManager.canvas2d.render();
    };
});
