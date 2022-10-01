import Canvas2d from './canvas2d.js';
import VideoManager from './videoManager.js';
import TextureManager from './textureManager.js';
import { ToastProgrammatic as Toast } from 'buefy';

export default class CanvasManager {
    /**
     *
     * @param {Scene} scene2d
     * @param {Scene} scene3d
     */
    constructor(scene2d, scene3d, textureManager, videoManager) {
        this.scene2d = scene2d;
        this.scene3d = scene3d;
        this.textureManager = textureManager;
        this.videoManager = videoManager;
        this.resizeCallback = this.resize.bind(this);

        this.canvas2d = new Canvas2d('canvas2d', this.scene2d, this.videoManager, this.textureManager);
        this.displayMode = 'default';
    }

    init(app) {
        this.app = app;
        this.canvas2d.init();
        this.videoManager.init(this.canvas2d.gl);
        this.textureManager.init(this.canvas2d.gl);
        this.textureManager.loadDefaultImages(this.canvas2d.gl);
    }

    render() {
        this.canvas2d.render();
    }

    resize() {
        if (this.mode() === CanvasManager.RENDER_2D) {
            this.canvas2d.resizeCanvas();
            this.canvas2d.initRenderTextures();
            this.canvas2d.render();
        }
    }

    mode() {
        if (this.app.currentRoute === '/' ||
            this.app.currentRoute === '/2d') {
            return CanvasManager.RENDER_2D;
        } else if (this.app.currentRoute === '/3d') {
            return CanvasManager.RENDER_3D;
        }
        return CanvasManager.RENDER_NONE;
    }

    renderLoop() {
        if (this.mode() === CanvasManager.RENDER_2D) {
            if (this.canvas2d.isRendering || this.videoManager.streaming) {
                this.canvas2d.render();
            }
        }
    }

    saveImageAndTweet(tag) {
        const UPLOAD_URL = 'https://script.google.com/a/tessellation.jp/macros/s/AKfycbxvOHV4YIuHy8mzDx0cCNnxG_g24I1WaL11aV-0nEAgkO_WDjGS2iN5nf_HWl3DxxNOHQ/exec';
        const formData = new FormData();
        const width = 600;
        const canvasDataURL = this.canvas2d.renderAndGetCanvasURL(width);
        formData.append('filename', (new Date()).getTime()+'.png');
        formData.append('type', 'image/png');
        formData.append('content', canvasDataURL.replace(/^data:image\/png;base64,/,''));
        Toast.open({message: 'Uploading image ...',
                    position: 'is-bottom'});
        this.fetchUpload(UPLOAD_URL, formData,
                         (json) => {
                             const fileURL = 'https://drive.google.com/file/d/' + json.id + '/view';
                             const array = [fileURL, '#SchottkyLink'];
                             if(tag !== undefined) array.push(tag);
                             const tweet = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(array.join('\n'));
                             window.open(tweet);
                         },
                         (error) => {
                             alert('Error: '+ error);
                         });
    }

    fetchUpload(url, body, successCallback, errorCallback) {
        fetch(url, {
            method: 'POST',
            body: body,
            mode: 'cors',
            redirect: 'follow',
        }).then(r => r.json())
            .then(j => {
                if (successCallback) {
                    successCallback(j);
                }
            }).catch(e => {
                if (errorCallback) {
                    errorCallback(e);
                } else {
                    console.error(e);
                }
            });
    }

    static get RENDER_2D() {
        return 0;
    }

    static get RENDER_3D() {
        return 1;
    }

    static get RENDER_NONE() {
        return -1;
    }
}
