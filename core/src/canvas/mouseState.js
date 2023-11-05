export default class MouseState {
    constructor() {
        this.prevPosition = undefined;
        this.prevTranslation = undefined;
        this.isPressing = true;
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
