let gId = 0;
let gIdList = [];

export default class Shape3d {
    constructor() {
        this.setId(gId);
        this.selected = false;
    }

    /**
     * Set unique id
     * @param {number} id
     */
    setId(id) {
        const index = gIdList.indexOf(id);
        if (index === -1) {
            this.id = id;
            gIdList.push(id);
            gId = id + 1;
        } else {
            gIdList.splice(index, 1, id);
            while (gIdList.indexOf(gId) !== -1) {
                gId++;
            }
        }
    }

    /**
     *
     * @param {WebGL2RenderingContext} gl
     * @param {Array.} uniLocation
     * @param {number} uniIndex
     * @param {number} sceneScale
     * @returns {number}
     */
    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        return uniIndex;
    }

    /**
     *
     * @param {WebGL2RenderingContext} gl
     * @param {Array.} uniLocation
     * @param {WebGLProgram} program
     * @param {number} index
     */
    setUniformLocation(gl, uniLocation, program, index) {}

    /**
     *
     * @returns {Object.}
     */
    exportJson() {
        return {}
    }

    /**
     *
     * @param {Object.} obj
     * @returns {Shape}
     */
    static loadJson(obj, scene) {
        return new Shape3d();
    }

    /**
     *
     * @returns {String}
     */
    get name() {
        return 'Shape';
    }
}
