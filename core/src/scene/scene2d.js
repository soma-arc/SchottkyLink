import Generator from '../generators/generator.js';
import InversionCircle from '../generators/2d/inversionCircle.js';
import HalfPlane from '../generators/2d/halfPlane.js';
import ImageSeed from '../generators/2d/imageSeed.js';
import VideoSeed from '../generators/2d/videoSeed.js';
import CanvasSeed from '../generators/2d/canvasSeed.js';
import Scene from './scene.js';
import AddGeneratorCommand from './command/addGeneratorCommand.js';
import RemoveGeneratorCommand from './command/removeGeneratorCommand';
import Vec2 from '../math/vec2.js';
import MouseState from '../canvas/mouseState.js';
import Selection from './selection.js';

const GENERATOR_TYPES = ['InversionCircle', 'HalfPlane',
                        'ImageSeed', 'VideoSeed', 'CanvasSeed'];


export default class Scene2d extends Scene {
    constructor() {
        super();
        this.generators = {};
        for(const genType of GENERATOR_TYPES) {
            this.generators[genType] = [];
        }

        this.generators['InversionCircle'].push(new InversionCircle(0, 0, 0.1));

        this.translation = new Vec2(0, 0);
        this.scale = 1;

        this.selection = new Selection();
        this.sceneChangedListeners = [];
        this.reRenderListeners = [];
    }

    removeGenerator(generator) {
        this.addCommand(new RemoveGeneratorCommand(this, generator));
    }

    addGenerator(generator) {
        this.addCommand(new AddGeneratorCommand(this, generator));
    }

    addInversionCircle(center, r) {
        this.addGenerator(new InversionCircle(center, r));
    }

    addHalfPlane(origin, normal) {
        this.addGenerator(new HalfPlane(origin, normal));
    }

    getUniformLocations(gl, program) {
        this.uniforms = [];
        this.uniforms.push(gl.getUniformLocation(program, 'u_geometry'));
        this.uniforms.push(gl.getUniformLocation(program, 'u_uiControlPointRadius'));
        this.uniforms.push(gl.getUniformLocation(program, 'u_circumferenceThickness'));
        this.uniforms.push(gl.getUniformLocation(program, 'u_seedBorderWidth'));
        for(const genArray of Object.values(this.generators)) {
            let i = 0;
            for(const gen of genArray) {
                gen.getUniformLocations(gl, program, i++);
            }
        }
    }

    setUniformValues(gl) {
        gl.uniform3f(this.uniforms[0], this.translation.x, this.translation.y, this.scale);
        gl.uniform1f(this.uniforms[1], Generator.ControlPointRadis);
        gl.uniform1f(this.uniforms[2], Generator.CircumferenceThickness);
        gl.uniform1f(this.uniforms[3], Generator.SeedBorderWidth);
        for (const genArray of Object.values(this.generators)) {
            for (const gen of genArray) {
                gen.setUniformValues(gl);
            }
        }
    }
    
    /**
     * シェーダの生成用にシーン情報を出力する
     */
    getSceneInfo() {
        return {
            numImageTexture: 1,
            numCamvasTexture: 1,
            numCircle: this.generators['InversionCircle'].length,
            numHalfPlane: this.generators['HalfPlane'].length,
            numImageSeed: this.generators['ImageSeed'].length,
            numVideoSeed: this.generators['VideoSeed'].length,
            numCanvasSeed: this.generators['CanvasSeed'].length
        };
    }

    calcSceneCoord(canvasCoord) {
        return canvasCoord.scale(this.scale).add(this.translation);
    }

    /**
     * @param{Vec2} mousePos
     */
    select(mousePos) {
        if(this.selection.isSelecting()) {
            this.selection.selectedObj.selected = false;
            const currentSelection = this.selection.selectedObj.select(mousePos, this.scale);
            if (currentSelection.isSelecting()) {
                this.selection = currentSelection;
                this.selection.selectedObj.selected = true;
                return true;
            }
        }

        for(const type of GENERATOR_TYPES) {
            for(const gen of this.generators[type]) {
                this.selection = gen.select(mousePos, this.scale);
                if(this.selection.isSelecting()) {
                    this.selection.selectedObj.selected = true;
                    return true;
                }
            }
        }

        this.selection = new Selection();
        return false;
    }
    
    getDefaultCanvasMouseDownListener(canvas) {
        return (event) => {
            event.preventDefault();
            canvas.canvasElem.focus();
            const mousePos = this.calcSceneCoord(canvas.calcCanvasCoord(event.clientX,
                                                                        event.clientY));
            if(event.button === MouseState.MOUSE_BUTTON_LEFT) {
                const selected = this.select(mousePos);
                // if(selected) {
                // }
                this.reRender();
            }
        };
    }

    addSceneChangedListener(listener) {
        this.sceneChangedListeners.push(listener);
    }

    sceneChanged() {
        for(const listener of this.sceneChangedListeners) {
            listener();
        }
    }

    addReRenderListener(listener) {
        this.reRenderListeners.push(listener);
    }

    reRender() {
        for(const listener of this.reRenderListeners) {
            listener();
        }
    }
}
