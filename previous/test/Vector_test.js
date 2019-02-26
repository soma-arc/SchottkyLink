import Vec2 from '../src/Vector';

const assert = require('power-assert');

describe('Vector', () => {
    const a = new Vec2(1, 2);
    const aa = new Vec2(1, 2);
    const b = new Vec2(0.9999999, 1.9999999);
    const c = new Vec2(3, 4);
    const d = new Vec2(0.9, 1.9);
    const e = new Vec2(5, 10);

    const EPSILON = 0.00000001;

    describe('eq', () => {
        it('should return true when the a is equal to b', () => {
            assert.equal(a.eq(a), true);
            assert.equal(a.eq(aa), true);
            assert.equal(a.eq(b), true);
        });
        it('should return false when the a is not equal to b', () => {
            assert.equal(a.eq(c), false);
            assert.equal(a.eq(d), false);
        });
    });

    describe('op', () => {
        it('vector addition', () => {
            assert.ok(a.add(c).eq(new Vec2(4, 6)));
            assert.ok(a.add(d).eq(new Vec2(1.9, 3.9)));
        });

        it('vector subtraction', () => {
            assert.ok(a.sub(aa).eq(new Vec2(0, 0)));
            assert.ok(a.sub(c).eq(new Vec2(-2, -2)));
        });

        it('vector production', () => {
            assert.ok(a.prod(c).eq(new Vec2(3, 8)));
            assert.ok(a.prod(d).eq(new Vec2(0.9, 3.8)));
        });

        it('vector division', () => {
            assert.ok(a.div(c).eq(new Vec2(0.333333333, 0.5)));
            assert.ok(a.div(e).eq(new Vec2(0.2, 0.2)));
        });

        it('vector scaling', () => {
            assert.ok(e.scale(6).eq(new Vec2(30, 60)));
            assert.ok(e.scale(-3).eq(new Vec2(-15, -30)));
        });

        it('vector length', () => {
            assert.ok(a.length() - 2.2360679775 < EPSILON);
        });
    });
});
