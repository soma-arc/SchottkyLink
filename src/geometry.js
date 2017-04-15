import assert from 'power-assert';
import Vec2 from './Vector';

export default class Circle {
    constructor(center, r) {
        assert.ok(center instanceof Vec2);
        this.center = center;
        this.r = r;

        this.circumferenceThickness = 10;
    }

    update() {
        // nothing to do
    }

    removable(mouse) {
        assert.ok(mouse instanceof Vec2);
        const d = Vec2.distance(mouse, this.center);
        return d < this.r;
    }

    // return {id, difference between mouse and selected component }
    select(mouse) {
        assert.ok(mouse instanceof Vec2);

        const dp = mouse.sub(this.center);
        const d = dp.length();
        if (d > this.r) return { id: -1 };

        const distFromCircumference = this.r - d;
        if (distFromCircumference < this.circumferenceThickness) {
            return { id: Circle.CIRCUMFERENCE,
                     diff: distFromCircumference };
        }

        return { id: Circle.CIRCUMFERENCE,
                 diff: dp };
    }

    move(selectState, mouse) {
        assert.ok(mouse instanceof Vec2);

        if (selectState.id === Circle.CIRCUMFERENCE) {
            assert.ok(typeof selectState.diff === 'number');
            this.r = Vec2.distance(this.center, mouse) + selectState.diff;
        } else {
            assert.ok(selectState.diff instanceof Vec2);
            this.center = mouse.sub(selectState.diff);
        }
    }

    cloneDeeply() {
        return new Circle(this.center.cloneDeeply, this.r);
    }

    getUniformArray() {
        this.center.uniformArray.concat([this.r]);
    }

    exportJson() {
        return {
            center: [this.center.x, this.center.y],
            radius: this.r,
        };
    }

    static get BODY() {
        return 0;
    }

    static get CIRCUMFERENCE() {
        return 1;
    }
}
