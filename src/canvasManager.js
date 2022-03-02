import Vec2 from './vector2d.js';
import Scene2D from './geometry2d/scene.js';
import Scene3D from './geometry3d/scene.js';
import Canvas2D from './canvas2d.js';
import { GeneratorCanvas, OrbitCanvas } from './canvas3d.js';

const RENDER_2D = 0;
const RENDER_3D = 1;

export default class canvasManager {
    constructor(cameraManager) {
        this.scene2d = new Scene2D();
        this.canvas2d = { 'productRenderResolution': new Vec2(0, 0) };

        this.scene3d = new Scene3D();
        this.canvas3dGen = {};
        this.canvas3dOrb = {};

        this.mode = RENDER_2D;
        this.cameraManager = cameraManager;
        
        this.resizeCallback = this.resize.bind(this);
    }

    init() {
        // canvas should be initialize after initializing Vue
        this.canvas2d = new Canvas2D('canvas', this.scene2d);
        this.canvas2d.render();

        this.canvas3dGen = new GeneratorCanvas('canvas3dGen', this.scene3d, this);
        this.canvas3dOrb = new OrbitCanvas('canvas3dOrb', this.scene3d);
    }

    resize() {
        if (this.mode === RENDER_2D) {
            this.canvas2d.resizeCanvas();
            this.canvas2d.initRenderTextures();
            this.canvas2d.render();
        } else if (this.mode === RENDER_3D) {
            this.canvas3dGen.resizeCanvas();
            this.canvas3dOrb.resizeCanvas();
            this.canvas3dGen.initRenderTextures();
            this.canvas3dOrb.initRenderTextures();
            this.canvas3dGen.render();
            this.canvas3dOrb.render();
        }
    }

    switch2d() {
        if (this.mode === RENDER_2D) return;
        this.mode = RENDER_2D;
        window.setTimeout(this.resizeCallback, 1);
    }

    switch3d() {
        if (this.mode === RENDER_3D) return;
        this.mode = RENDER_3D;
        window.setTimeout(this.resizeCallback, 1);
    }

    renderLoop() {
        if (this.mode === RENDER_2D) {
            if (this.cameraManager.streaming) {
                this.canvas2d.gl.bindTexture(this.canvas2d.gl.TEXTURE_2D, this.cameraManager.cameraTexture);
                this.canvas2d.gl.texImage2D(this.canvas2d.gl.TEXTURE_2D, 0, this.canvas2d.gl.RGBA,
                                            this.canvas2d.gl.RGBA,
                                            this.canvas2d.gl.UNSIGNED_BYTE, this.cameraManager.video);
                this.canvas2d.render();
            } else if (this.canvas2d.isRendering) {
                this.canvas2d.render();
            }
        } else if (this.mode === RENDER_3D) {
            if (this.scene3d.updated) {
                this.canvas3dOrb.numSamples = 0;
                this.canvas3dOrb.callRender();
                this.canvas3dGen.callRender();
            } else {
                if (this.canvas3dOrb.isRendering) {
                    this.canvas3dOrb.numSamples = 0;
                    this.canvas3dOrb.callRender();
                } else if (this.canvas3dOrb.isKeepingSampling &&
                           this.canvas3dOrb.numSamples < this.canvas3dOrb.maxSamples) {
                    this.canvas3dOrb.render();
                }
                if (this.canvas3dGen.isRendering) {
                    this.canvas3dGen.callRender();
                }
            }
        }
    }

    clearCurrentScene() {
        if (this.mode === RENDER_2D) {
            this.scene2d.clear();
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        } else if (this.mode === RENDER_3D) {
            this.scene3d.clear();

            this.canvas3dGen.compileRenderShader();
            this.canvas3dGen.render();
            this.canvas3dOrb.compileRenderShader();
            this.canvas3dOrb.render();
        }
    }

    compile3dCanvases() {
        this.canvas3dGen.compileRenderShader();
        this.canvas3dGen.render();
        this.canvas3dOrb.compileRenderShader();
        this.canvas3dOrb.render();
    }

    saveScene() {
        if (this.mode === RENDER_2D) {
            this.scene2d.saveSceneAsJson();
        } else if (this.mode === RENDER_3D) {
            this.scene3d.saveSceneAsJson();
        }
    }

    loadSceneFromFile() {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            if (this.mode === RENDER_2D) {
                this.scene2d.load(JSON.parse(reader.result));
                this.canvas2d.compileRenderShader();
                this.canvas2d.render();
            } else if (this.mode === RENDER_3D) {
                this.scene3d.load(JSON.parse(reader.result));
                this.compile3dCanvases();
            }
        });
        const a = document.createElement('input');
        a.type = 'file';
        a.addEventListener('change', function(event) {
            const files = event.target.files;
            reader.readAsText(files[0]);
        });
        a.click();
    }

    get isRendering2d() {
        return this.mode === RENDER_2D;
    }

    get isRendering3d() {
        return this.mode === RENDER_3D;
    }
}
