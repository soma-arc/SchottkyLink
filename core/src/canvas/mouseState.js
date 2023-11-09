export default class MouseState {
    constructor(position) {
        this.position = position;
        this.prevPosition = undefined;
        this.prevTranslation = undefined;
        this.isPressing = false;
        this.button = undefined;
    }

    setPrevPosition(prevPosition) {
        this.prevPosition = prevPosition;
        return this;
    }

    setPrevTranslation(prevTranslation) {
        this.prevTranslation = prevTranslation;
        return this;
    }

    setIsPressing(isPressing) {
        this.isPressing = isPressing;
        return this;
    }

    setButton(button) {
        this.button = button;
        return this;
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
