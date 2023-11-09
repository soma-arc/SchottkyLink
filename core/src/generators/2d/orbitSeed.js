import Generator from '../generator.js';
import Selection from '../../scene/selection.js';
import Vec2 from '../../math/vec2.js';

export default class OrbitSeed extends Generator {
    name = 'OrbitSeed';
    /**
     *       width
     *   -------------
     *   |           |
     *   |-----------| height
     *   |           |
     *   +------------
     * origin
     * @param {number} origin
     * @param {number} width
     * @param {number} height
     */
    constructor(origin, width, height) {
        super();
        this.origin = origin;
        this.width = width;
        this.height = height;
        this.rotationRadians = 0;
    }

    getOrigin() {
        return this.origin;
    }

    setOrigin(origin) {
        this.origin = origin;
    }

    select(mouse, sceneScale) {
        const size = new Vec2(this.width, this.height);
        const cornerSize = new Vec2(OrbitSeed.SeedBorderWidth * sceneScale,
                                    OrbitSeed.SeedBorderWidth * sceneScale);
        const bodyCorner = this.origin.add(cornerSize);
        const bodySize = size.sub(cornerSize.scale(2));

        const center = this.origin.add(size.scale(0.5));
        const upPoint = center.add(this.upDir.scale(this.controlPointRadius));
        const dpUp = mouse.sub(upPoint);
        if(dpUp.length() < this.controlPointRadius * sceneScale) {
            return new Selection().setObj(this)
                .setComponentId(OrbitSeed.COMPONENT_ORIGIN_POINT)
                .setDiffBetweenComponent(dpUp);
        }

        if (this.origin.x < mouse.x && mouse.x < this.origin.x + this.width &&
            this.origin.y < mouse.y && mouse.y < this.origin.y + this.height) {
            if (mouse.x < bodyCorner.x) {
                if (mouse.y < bodyCorner.y) {
                    const dp = mouse.sub(this.origin);
                    return new Selection().setObj(this)
                        .setComponentId(OrbitSeed.COMPONENT_CORNER_LEFT_BOTTOM)
                        .setDiffBetweenComponent(dp);
                } else if (bodyCorner.y + bodySize.y < mouse.y) {
                    const dp = mouse.sub(this.origin.add(new Vec2(0, size.y)));
                    return new Selection().setObj(this)
                        .setComponentId(OrbitSeed.COMPONENT_CORNER_LEFT_TOP)
                        .setDiffBetweenComponent(dp);
                }
            } else if (bodyCorner.x + bodySize.x < mouse.x) {
                if (mouse.y < bodyCorner.y) {
                    const dp = mouse.sub(this.origin.add(new Vec2(size.x, 0)));
                    return new Selection().setObj(this)
                        .setComponentId(OrbitSeed.COMPONENT_CORNER_RIGHT_BOTTOM)
                        .setDiffBetweenComponent(dp);
                } else if (bodyCorner.y + bodySize.y < mouse.y) {
                    const dp = mouse.sub(this.origin.add(size));
                    return new Selection().setObj(this)
                        .setComponentId(OrbitSeed.COMPONENT_CORNER_RIGHT_TOP)
                        .setDiffBetweenComponent(dp);
                }
            }

            const dpOrigin = mouse.sub(center);
            if(dpOrigin.length() < this.controlPointRadius * sceneScale) {
                return new Selection().setObj(this)
                    .setComponentId(OrbitSeed.COMPONENT_ORIGIN_POINT)
                    .setDiffBetweenComponent(dpOrigin);
            }

            const dp = mouse.sub(this.origin);
            return new Selection().setObj(this).setComponentId(OrbitSeed.COMPONENT_BODY)
                .setDiffBetweenComponent(dp);
        }
        return new Selection();
    }

    static get COMPONENT_BODY() {
        return 0;
    }

    static get COMPONENT_CORNER_RIGHT_TOP() {
        return 1;
    }

    static get COMPONENT_CORNER_RIGHT_BOTTOM() {
        return 2;
    }

    static get COMPONENT_CORNER_LEFT_TOP() {
        return 3;
    }

    static get COMPONENT_CORNER_LEFT_BOTTOM() {
        return 4;
    }

    static get COMPONENT_ORIGIN_POINT() {
        return 5;
    }

    static get COMPONENT_ROTATION_CONTROL_POINT() {
        return 6;
    }
}
