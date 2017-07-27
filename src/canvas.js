export default class Canvas {
    constructor(canvasId, scene) {
        this.canvasId = canvasId;
        this.scene = scene;
        this.canvas = document.getElementById(canvasId);
        this.pixelRatio = 1.0;//window.devicePixelRatio;
        this.resizeCanvas();

        this.isRendering = false;

        this.boundMouseDownListener = this.mouseDownListener.bind(this);
        this.boundMouseUpListener = this.mouseUpListener.bind(this);
        this.boundMouseWheelListener = this.mouseWheelListener.bind(this);
        this.boundMouseMoveListener = this.mouseMoveListener.bind(this);
        this.boundDblClickLisntener = this.mouseDblClickListener.bind(this);
        this.boundKeydown = this.keydownListener.bind(this);
        this.boundKeyup = this.keyupListener.bind(this);
        this.canvas.addEventListener('mousedown', this.boundMouseDownListener);
        this.canvas.addEventListener('mouseup', this.boundMouseUpListener);
        this.canvas.addEventListener('wheel', this.boundMouseWheelListener);
        this.canvas.addEventListener('mousemove', this.boundMouseMoveListener);
        this.canvas.addEventListener('dblclick', this.boundDblClickLisntener);
        this.canvas.addEventListener('keydown', this.boundKeydown);
        this.canvas.addEventListener('keyup', this.boundKeyup);
        this.canvas.addEventListener('contextmenu', event => event.preventDefault());

        this.renderCallback = this.render.bind(this);
    }

    resizeCanvas() {
        const parent = this.canvas.parentElement;
        this.canvas.style.width = parent.clientWidth + 'px';
        this.canvas.style.height = parent.clientHeight + 'px';
        this.canvas.width = parent.clientWidth * this.pixelRatio;
        this.canvas.height = parent.clientHeight * this.pixelRatio;
        this.canvasRatio = this.canvas.width / this.canvas.height / 2;
    }

    mouseWheelListener(event) {}

    mouseDownListener(event) {}

    mouseDblClickListener(event) {}

    mouseUpListener(event) {}

    mouseMoveListener(event) {}

    keydownListener(event) {}

    keyupListener(event) {}

    render() {}

    // https://stackoverflow.com/questions/37135417/download-canvas-as-png-in-fabric-js-giving-network-error
    dataURLtoBlob (dataurl) {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    saveImage (gl, width, height, filename) {
        const data = new Uint8Array(width * height * 4);
        const type = gl.UNSIGNED_BYTE;
        gl.readPixels(0, 0, width, height, gl.RGBA, type, data);

        const saveCanvas = document.createElement('canvas');
        saveCanvas.width = width;
        saveCanvas.height = height;
        const context = saveCanvas.getContext('2d');

        const imageData = context.createImageData(width, height);
        imageData.data.set(data);
        context.putImageData(imageData, 0, 0);
        const a = document.createElement('a');
        const canvasData = saveCanvas.toDataURL();
        const blob = this.dataURLtoBlob(canvasData);

        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
    }

    static get MOUSE_BUTTON_LEFT() {
        return 0;
    }

    static get MOUSE_BUTTON_WHEEL() {
        return 1;
    }

    static get MOUSE_BUTTON_RIGHT() {
        return 2;
    }
}
