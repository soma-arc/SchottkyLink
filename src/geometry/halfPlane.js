import Vec2 from '../vector.js';
import SelectionState from './selectionState.js';
import Shape from './shape.js';

export default class HalfPlane extends Shape {
    /**
     *
     *       ^ normal
     *       |
     * ------+-------
     *       p
     * //////////////
     * Make HalfPlane
     * @param {Vec2} p
     * @param {Vec2} normal
     */
    constructor(p, normal) {
        super();
        this.p = p;
        this.normal = normal.normalize();
        this.update();
    }

    update() {
        this.boundaryDir = new Vec2(-this.normal.y,
                                    this.normal.x);
    }

    select(mouse) {
        const dp = mouse.sub(this.p);
        if (this.normal.dot(this.p) > 0) return new SelectionState();

        return new SelectionState().setObj(this)
            .setComponentId(HalfPlane.BODY)
            .setDiffObj(dp);
    }

    static get BODY() {
        return 0;
    }

    static get CIRCUMFERENCE() {
        return 1;
    }
}
