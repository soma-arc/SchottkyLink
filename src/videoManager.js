import { CreateRGBTextures } from './glUtils';

export default class VideoManager {
    constructor() {
        this.video = document.createElement('video');
        this.streaming = false;
        this.width = 256;
        this.height = 256;
    }

    init(gl) {
        this.texture = CreateRGBTextures(gl, this.width, this.height, 1)[0];
    }

    connect(gl, canplayCallback, failure) {
        const media = { video: true, audio: false };

        const successCallback = (localMediaStream) => {
            this.video = document.createElement('video');
            this.video.srcObject = localMediaStream;
            const canplayListener = () => {
                this.video.removeEventListener('canplay', canplayListener);
                this.streaming = true;
                this.width = this.video.videoWidth;
                this.height = this.video.videoHeight;

                this.texture = CreateRGBTextures(gl,
                                                 this.width, this.height, 1)[0];
                canplayCallback(this.width, this.height);
            };
            this.video.addEventListener('canplay', canplayListener);
            this.video.play();
        };

        const failureCallback = (err) => {
            failure();
            console.log('failure');
            if (err.name === 'PermissionDeniedError') {
                console.log('denied permission');
            } else {
                console.log(err);
                console.log('can not be used webcam');
            }
        };

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(media).then(successCallback,
                                                            failureCallback);
        } else {
            console.log('not supported getUserMedia');
        }
    }
}
