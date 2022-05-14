export default class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }

    prod(v) {
        return new Vec2(this.x * v.x, this.y * v.y);
    }

    div(v) {
        return new Vec2(this.x / v.x, this.y / v.y);
    }

    scale(k) {
        return new Vec2(this.x * k, this.y * k);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    lengthSq() {
        return (this.x * this.x + this.y * this.y);
    }

    normalize() {
        return this.scale(1.0 / this.length());
    }

    eq(v) {
        return Math.abs(this.x - v.x) <= Vec2.EPSILON &&
            Math.abs(this.y - v.y <= Vec2.EPSILON);
    }

    cloneDeeply() {
        return new Vec2(this.x, this.y);
    }

    static normalize(v) {
        return v.normalize();
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    static distance(v1, v2) {
        const l = v1.sub(v2);
        return Math.sqrt(l.x * l.x + l.y * l.y);
    }

    static get EPSILON() {
        return 0.00001;
    }

    getUniformArray() {
        return [this.x, this.y];
    }
}
