/**
 * @module Vec2
 */
export default class Vec2 {
    /** X value of the vector.
     * @type {Number}
     */
    x;
    /** Y value of the vector.
     * @type {Number}
     */
    y;

    /**
       class
     * @param {Number} x
     * @param {Number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Add vector
     * @param {Vec2} v
     * @returns {Vec2}
     */
    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }

    /**
     *
     * @param {Vec2} v
     * @returns {Vec2}
     */
    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }

    /**
     *
     * @param {Vec2} v
     * @returns {Vec2}
     */
    prod(v) {
        return new Vec2(this.x * v.x, this.y * v.y);
    }


    /**
     *
     * @param {Vec2} v
     * @returns {Vec2}
     */
    div(v) {
        return new Vec2(this.x / v.x, this.y / v.y);
    }

    /**
     *
     * @param {Vec2} v
     * @returns {Vec2}
     */
    scale(k) {
        return new Vec2(this.x * k, this.y * k);
    }

    /**
     *
     * @returns {Number}
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     *
     * @returns {Number}
     */
    lengthSq() {
        return (this.x * this.x + this.y * this.y);
    }

    /**
     *
     * @param {Vec2} v
     * @returns {Vec2}
     */
    normalize() {
        return this.scale(1.0 / this.length());
    }

    /**
     *
     * @param {Vec2} v
     * @returns {Boolean}
     */
    eq(v) {
        return Math.abs(this.x - v.x) <= Vec2.EPSILON &&
            Math.abs(this.y - v.y <= Vec2.EPSILON);
    }

    /**
     *
     * @returns {Vec2}
     */
    cloneDeeply() {
        return new Vec2(this.x, this.y);
    }

    /**
     *
     * @param {Vec2} v
     * @returns {Vec2}
     */
    static normalize(v) {
        return v.normalize();
    }

    /**
     *
     * @param {Vec2} v1
     * @param {Vec2} v2
     * @returns {Number}
     */
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    /**
     *
     * @param {Vec2} v1
     * @param {Vec2} v2
     * @returns {Number}
     */
    static distance(v1, v2) {
        const l = v1.sub(v2);
        return Math.sqrt(l.x * l.x + l.y * l.y);
    }

    /**
     *
     * @returns {Number}
     */
    static get EPSILON() {
        return 0.00001;
    }

    /**
     *
     * @returns {Array.<Number>}
     */
    getUniformArray() {
        return [this.x, this.y];
    }
}
