export default class Generator{
    static ControlPointRadius = 0.01;
    static CircumferenceThickness = 0.1;
    static SeedBorderWidth = 0.01;
    static NormalPointDistance = 0.01;

    /** @type {string} */
    #id;
    constructor(){
        this.#id = crypto.randomUUID();
        this.uniforms = [];
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
}
