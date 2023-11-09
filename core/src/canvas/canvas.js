export default class Canvas {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.pixelRatio = 1.0;//window.devicePixelRatio;
    }

    resizeCanvas() {
        const parent = this.canvasElem.parentElement;
        this.canvasElem.style.width = parent.clientWidth + 'px';
        this.canvasElem.style.height = parent.clientHeight + 'px';
        this.canvasElem.width = parent.clientWidth * this.pixelRatio;
        this.canvasElem.height = parent.clientHeight * this.pixelRatio;
        this.canvasAspectRatio = this.canvasElem.width / this.canvasElem.height / 2;
    }

    render() {}

    // https://stackoverflow.com/questions/37135417/download-canvas-as-png-in-fabric-js-giving-network-error
    dataURLtoBlob(dataurl) {
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

    saveImage(gl, width, height, filename) {
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
}
