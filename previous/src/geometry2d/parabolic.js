import Shape from './shape.js';
import Circle from './circle.js';

export default class Parabolic extends Shape {
    /**
     * 
     * @param {Circle} c2
     * @param {Vec2} contactDir
     * @param {number} c1Radius
     */
    constructor(c2, contactDir, c1r) {
        super();
        this.c2 = c2;
        const bp = c2.center.add(contactDir.scale(c2.r));
        this.c1 = new Circle(bp.sub(contactDir.scale(-c1r)), c1r);
        this.c1Inv = this.c2.invertOnCircle(this.c1);
        this.contactDir = contactDir;
    }

    get name() {
        return 'Parabolic';
    }
}
