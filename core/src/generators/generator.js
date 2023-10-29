export default class Generator{
    /** @type {string} */
    #id;
    constructor(){
        this.#id = crypto.randomUUID();
        this.controlPointRadius = 0.01;
        this.circumferenceThickness = 0.1;
        this.borderWidth = 0.01;
    }

    /**
     * @return {string}
     */
    getId() {
        return this.#id;
    }

    /**
     * @return {Vec2};
     */
    getOrigin() {
        return undefined;
    }

    /**
     * @param {Vec2} origin
     */
    setOrigin(origin) {
        this.origin = origin;
    }

    update() {
    }

    /**
     * @return {number}
     */
    static get CONTROL_POINT_RADIUS() {
        return 0.1;
    }

    /**
     * @return {number}
     */
    static get NORMAL_POINT_DISTANCE() {
        return 0.01;
    }

    /**
     * @return {number}
     */
    static get CIRCUMFERENCE_THICKNESS() {
        return 0.01;
    }

    static get type() {
        return 'Generator';
    }
}

