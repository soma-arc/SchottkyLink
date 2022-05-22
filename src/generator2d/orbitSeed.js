import Vec2 from '../vector2d.js';
import Generator from './generator.js';
import SelectionState from './selectionState.js';

export default class OrbitSeed extends Generator {
    /**
     *       width
     *   -------------
     *   |           |
     *   |-----------| height
     *   |           |
     *   +------------
     * corner
     * @param {number} cornerX
     * @param {number} cornerY
     * @param {number} width
     * @param {number} height
     */
    constructor(cornerX, cornerY, width, height) {
        super();
        this.corner = new Vec2(cornerX, cornerY);
        this.size = new Vec2(width, height);
        this.aspect = height / width;
        this.cornerSelectionWidth = 0.01;
        this.textureIndex = 0;
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform2f(uniLocation[uniI++],
                     this.corner.x, this.corner.y);
        gl.uniform2f(uniLocation[uniI++],
                     this.size.x, this.size.y);
        const cornerSize = new Vec2(this.cornerSelectionWidth * sceneScale,
                                    this.cornerSelectionWidth * sceneScale);
        const bodyCorner = this.corner.add(cornerSize);
        const bodyCornerDiagonal = this.corner.add(this.size).sub(cornerSize);
        gl.uniform4f(uniLocation[uniI++],
                     bodyCorner.x, bodyCorner.y,
                     bodyCornerDiagonal.x, bodyCornerDiagonal.y);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_orbitSeed${index}.corner`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_orbitSeed${index}.size`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_orbitSeed${index}.ui`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_orbitSeed${index}.selected`));
    }

    select(mouse, sceneScale) {
        const cornerSize = new Vec2(this.cornerSelectionWidth * sceneScale,
                                    this.cornerSelectionWidth * sceneScale);
        const bodyCorner = this.corner.add(cornerSize);
        const bodySize = this.size.sub(cornerSize.scale(2));

        if (this.corner.x < mouse.x && mouse.x < this.corner.x + this.size.x &&
            this.corner.y < mouse.y && mouse.y < this.corner.y + this.size.y) {
            if (mouse.x < bodyCorner.x) {
                if (mouse.y < bodyCorner.y) {
                    const dp = mouse.sub(this.corner);
                    return new SelectionState().setObj(this)
                        .setComponentId(OrbitSeed.CORNER_LEFT_BELOW)
                        .setDiffObj(dp);
                } else if (bodyCorner.y + bodySize.y < mouse.y) {
                    const dp = mouse.sub(this.corner.add(new Vec2(0, this.size.y)));
                    return new SelectionState().setObj(this)
                        .setComponentId(OrbitSeed.CORNER_LEFT_ABOVE)
                        .setDiffObj(dp);
                }
            } else if (bodyCorner.x + bodySize.x < mouse.x) {
                if (mouse.y < bodyCorner.y) {
                    const dp = mouse.sub(this.corner.add(new Vec2(this.size.x, 0)));
                    return new SelectionState().setObj(this)
                        .setComponentId(OrbitSeed.CORNER_RIGHT_BELOW)
                        .setDiffObj(dp);
                } else if (bodyCorner.y + bodySize.y < mouse.y) {
                    const dp = mouse.sub(this.corner.add(this.size));
                    return new SelectionState().setObj(this)
                        .setComponentId(OrbitSeed.CORNER_RIGHT_ABOVE)
                        .setDiffObj(dp);
                }
            }
            const dp = mouse.sub(this.corner);
            return new SelectionState().setObj(this).setComponentId(OrbitSeed.BODY)
                .setDiffObj(dp);
        }
        return new SelectionState();
    }

    removable(mouse) {
        if (this.corner.x < mouse.x && mouse.x < this.corner.x + this.size.x &&
            this.corner.y < mouse.y && mouse.y < this.corner.y + this.size.y) {
            return true;
        }
        return false;
    }

    move(selectionState, mouse) {
        switch (selectionState.componentId) {
        case OrbitSeed.BODY: {
            this.corner = mouse.sub(selectionState.diffObj);
            break;
        }
        case OrbitSeed.CORNER_LEFT_BELOW: {
            const nc = mouse.sub(selectionState.diffObj);
            const sizeDiff = this.corner.sub(nc);
            const d = Math.max(sizeDiff.x, sizeDiff.y);
            this.corner = this.corner.sub(new Vec2(d, d));
            this.size = this.size.add(new Vec2(d, d));
            break;
        }
        case OrbitSeed.CORNER_LEFT_ABOVE: {
            break;
        }
        case OrbitSeed.CORNER_RIGHT_BELOW: {
            break;
        }
        case OrbitSeed.CORNER_RIGHT_ABOVE: {
            const nc = mouse.sub(selectionState.diffObj);
            const sizeDiff = nc.sub(this.corner.add(this.size));
            const d = Math.max(sizeDiff.x, sizeDiff.y);
            this.size = this.size.add(new Vec2(d, d));
            break;
        }
        }
    }

    exportJson() {
        return {
            id: this.id,
            corner: [this.corner.x, this.corner.y],
            width: this.size.x,
            height: this.size.y
        };
    }

    static loadJson(obj, scene) {
        const nh = new OrbitSeed(obj.corner[0], obj.corner[1],
                                 obj.width, obj.height);
        nh.setId(obj.id);
        return nh;
    }

    static get BODY() {
        return 0;
    }

    static get CORNER_RIGHT_ABOVE() {
        return 1;
    }

    static get CORNER_RIGHT_BELOW() {
        return 2;
    }

    static get CORNER_LEFT_ABOVE() {
        return 3;
    }

    static get CORNER_LEFT_BELOW() {
        return 4;
    }

    get name() {
        return 'OrbitSeed';
    }
}