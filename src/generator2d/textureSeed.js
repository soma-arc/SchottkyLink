import Vec2 from '../vector2d.js';
import Generator from './generator.js';
import SelectionState from './selectionState.js';

export default class TextureSeed extends Generator {
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
        if(Number.isNaN(width)) {
            // TextureSeed[]=float,float,,float
            this.keepAspect = true;
            this.keepAspectFromHeight = true;
        } else if(Number.isNaN(height)) {
            // TextureSeed[]=float,float,float,
            this.keepAspect = true;
            this.renderWidth = width;
        } else {
            this.keepAspect = false;
        }
        this.corner = new Vec2(cornerX, cornerY);
        this.size = new Vec2(width, height);
        this.aspect = height / width;
        this.renderWidth = width;
        this.cornerSelectionWidth = 0.01;
        this.uiPointRadius = 0.01;
        this.textureIndex = 0;

        this.cropPolygon = [0.0, 0.0];

        // 画像の上方向. 回転に用いる.
        this.upDir = new Vec2(0, 1);
        this.upPointRadius = Vec2.distance(this.corner, this.corner.add(this.size)) * 0.5;
        this.rotationRadian = Math.atan2(this.upDir.y, this.upDir.x) - Math.PI / 2;

        this.upUIPointLen = 0.1;
    }

    getPosition() {
        return this.corner;
    }

    setCropPolygon(cropPolygon) {
        this.cropPolygon = cropPolygon;
    }

    update() {
        if (this.keepAspect) {
            this.size = new Vec2(this.renderWidth, this.aspect * this.renderWidth);
            this.upPointRadius = Vec2.distance(this.corner, this.corner.add(this.size)) * 0.5;
        }
    }

    updateTextureSize(textures) {
        const textureWidth = textures[this.textureIndex].width;
        const textureHeight = textures[this.textureIndex].height;
        this.aspect = textureHeight / textureWidth;
        if(this.keepAspect && this.keepAspectFromHeight) {
            this.renderWidth = this.size.y / this.aspect;
        }
        this.update();
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform2f(uniLocation[uniI++],
                     this.corner.x, this.corner.y);
        gl.uniform2f(uniLocation[uniI++],
                     this.size.x, this.size.y);
        gl.uniform1f(uniLocation[uniI++],
                     this.rotationRadian);
        const cornerSize = new Vec2(this.cornerSelectionWidth * sceneScale,
                                    this.cornerSelectionWidth * sceneScale);
        gl.uniform4f(uniLocation[uniI++],
                     cornerSize.x, cornerSize.y,
                     this.uiPointRadius * sceneScale,
                     this.upUIPointLen * sceneScale);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        gl.uniform2fv(uniLocation[uniI++],
                      this.cropPolygon);
        return uniI;
    }

    setUniformLocation(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_textureSeed${index}.corner`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_textureSeed${index}.size`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_textureSeed${index}.rotationRadian`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_textureSeed${index}.ui`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_textureSeed${index}.selected`));
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_textureSeed${index}.cropPolygon`));
    }

    select(mouse, sceneScale, selectionScale) {
        // selection scale タッチ操作時にデフォルトの制御点の大きさだと選択しにくいのでスケールをかける
        if(selectionScale === undefined) {
            selectionScale = 1;
        }

        const cornerSize = new Vec2(this.cornerSelectionWidth * sceneScale,
                                    this.cornerSelectionWidth * sceneScale);
        const bodyCorner = this.corner.add(cornerSize);
        const bodySize = this.size.sub(cornerSize.scale(2));

        const center = this.corner.add(this.size.scale(0.5));
        const upPoint = center.add(this.upDir.scale(this.upPointRadius));
        const dpUp = mouse.sub(upPoint);
        if(dpUp.length() < this.uiPointRadius * sceneScale * selectionScale) {
            return new SelectionState().setObj(this)
                .setComponentId(TextureSeed.UP_POINT)
                .setDiffObj(dpUp);
        }
        
        if (this.corner.x < mouse.x && mouse.x < this.corner.x + this.size.x &&
            this.corner.y < mouse.y && mouse.y < this.corner.y + this.size.y) {
            if (mouse.x < bodyCorner.x) {
                if (mouse.y < bodyCorner.y) {
                    const dp = mouse.sub(this.corner);
                    return new SelectionState().setObj(this)
                        .setComponentId(TextureSeed.CORNER_LEFT_BELOW)
                        .setDiffObj(dp);
                } else if (bodyCorner.y + bodySize.y < mouse.y) {
                    const dp = mouse.sub(this.corner.add(new Vec2(0, this.size.y)));
                    return new SelectionState().setObj(this)
                        .setComponentId(TextureSeed.CORNER_LEFT_ABOVE)
                        .setDiffObj(dp);
                }
            } else if (bodyCorner.x + bodySize.x < mouse.x) {
                if (mouse.y < bodyCorner.y) {
                    const dp = mouse.sub(this.corner.add(new Vec2(this.size.x, 0)));
                    return new SelectionState().setObj(this)
                        .setComponentId(TextureSeed.CORNER_RIGHT_BELOW)
                        .setDiffObj(dp);
                } else if (bodyCorner.y + bodySize.y < mouse.y) {
                    const dp = mouse.sub(this.corner.add(this.size));
                    return new SelectionState().setObj(this)
                        .setComponentId(TextureSeed.CORNER_RIGHT_ABOVE)
                        .setDiffObj(dp);
                }
            }

            const dpOrigin = mouse.sub(center);
            if(dpOrigin.length() < this.uiPointRadius * sceneScale * selectionScale) {
                return new SelectionState().setObj(this)
                    .setComponentId(TextureSeed.ORIGIN_POINT)
                    .setDiffObj(dpOrigin);
            }

            const dp = mouse.sub(this.corner);
            return new SelectionState().setObj(this).setComponentId(TextureSeed.BODY)
                .setDiffObj(dp);
        }
        return new SelectionState();
    }

    outside(position) {
        if (position.x < this.corner.x || this.corner.x + this.size.x < position.x ||
            position.y < this.corner.y || this.corner.y + this.size.y < position.y) {
            return true;
        }
        return false;
    }

    removable(mouse) {
        return !this.outside(mouse);
    }

    move(selectionState, mouse) {
        switch (selectionState.componentId) {
        case TextureSeed.ORIGIN_POINT: {
            this.corner = mouse.sub(selectionState.diffObj).sub(this.size.scale(0.5));
            break;
        }
        case TextureSeed.BODY: {
            this.corner = mouse.sub(selectionState.diffObj);
            break;
        }
        case TextureSeed.CORNER_LEFT_BELOW: {
            const nc = mouse.sub(selectionState.diffObj);
            const sizeDiff = this.corner.sub(nc);
            if(this.keepAspect) {
                this.renderWidth = this.size.x + sizeDiff.x;
                this.corner.x = this.corner.x - sizeDiff.x;
                this.update();
            } else {
                this.size = this.size.add(sizeDiff);
                this.renderWidth = this.size.x;
                this.corner = this.corner.sub(sizeDiff);
            }
            break;
        }
        case TextureSeed.CORNER_LEFT_ABOVE: {
            break;
        }
        case TextureSeed.CORNER_RIGHT_BELOW: {
            break;
        }
        case TextureSeed.CORNER_RIGHT_ABOVE: {
            const nc = mouse.sub(selectionState.diffObj);
            const sizeDiff = nc.sub(this.corner.add(this.size));
            if(this.keepAspect) {
                this.renderWidth = this.size.x + sizeDiff.x;
                this.update();
            } else {
                const newSize = this.size.add(sizeDiff);
                if(newSize.x > 0 && newSize.y > 0) {
                    this.renderWidth = newSize.x;
                    this.size = newSize;
                }
            }
            break;
        }
        case TextureSeed.UP_POINT: {
            const center = this.corner.add(this.size.scale(0.5));
            this.upDir = mouse.sub(center).normalize();
            this.rotationRadian = Math.atan2(this.upDir.y, this.upDir.x) - Math.PI / 2;
            break;
        }
        default:
            break;
        }
    }

    moveAlongAxis(selectionState, mouseState, keyState, scene) {
        switch (selectionState.componentId) {
        case TextureSeed.BODY: {
            if (keyState.isPressingShift) {
                this.corner.x = mouseState.position.sub(selectionState.diffObj).x;
            } else if (keyState.isPressingCtrl) {
                this.corner.y = mouseState.position.sub(selectionState.diffObj).y;
            }
            break;
        }
        case TextureSeed.CORNER_LEFT_BELOW: {
            const nc = mouseState.position.sub(selectionState.diffObj);
            const sizeDiff = this.corner.sub(nc);
            if(this.keepAspect) {
                this.renderWidth = this.size.x + sizeDiff.x;
                this.corner.x = this.corner.x - sizeDiff.x;
                this.update();
            } else {
                this.size = this.size.add(sizeDiff);
                this.renderWidth = this.size.x;
                this.corner = this.corner.sub(sizeDiff);
            }
            break;
        }
        case TextureSeed.CORNER_LEFT_ABOVE: {
            break;
        }
        case TextureSeed.CORNER_RIGHT_BELOW: {
            break;
        }
        case TextureSeed.CORNER_RIGHT_ABOVE: {
            const nc = mouseState.position.sub(selectionState.diffObj);
            const sizeDiff = nc.sub(this.corner.add(this.size));
            if(this.keepAspect) {
                this.renderWidth = this.size.x + sizeDiff.x;
                this.update();
            } else {
                const newSize = this.size.add(sizeDiff);
                if(newSize.x > 0 && newSize.y > 0) {
                    this.renderWidth = newSize.x;
                    this.size = newSize;
                }
            }
            break;
        }
        }
    }

    static loadFromArray(array) {
        const gen = new TextureSeed(array[0], array[1], // cornerX, cornerY
                                  array[2], array[3]);// width, height
        if(array.length === 5 && array[4] === 1) {
            gen.isFixed = true;
        }
        return gen;
    }

    exportAsQueryString() {
        return `TextureSeed[]=${this.corner.x.toFixed(this.digits)},${this.corner.y.toFixed(this.digits)},${this.size.x.toFixed(this.digits)},${this.size.y.toFixed(this.digits)}`;
    }

    exportJson() {
        return {
            id: this.id,
            corner: [this.corner.x, this.corner.y],
            width: this.size.x,
            height: this.size.y
        };
    }

    cloneDeeply() {
        const textureSeed = new TextureSeed(this.corner.x, this.corner.y,
                                            this.size.x, this.size.y);
        textureSeed.textureIndex = this.textureIndex;
        return textureSeed;
    }

    static loadJson(obj, scene) {
        const nh = new TextureSeed(obj.corner[0], obj.corner[1],
                                   obj.width, obj.height);
        nh.setId(obj.id);
        return nh;
    }

    isBody(componentId) {
        return componentId === TextureSeed.BODY;
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

    static get ORIGIN_POINT() {
        return 5;
    }

    static get UP_POINT() {
        return 6;
    }

    get name() {
        return 'TextureSeed';
    }
}
