import Generator from '../generator.js';
import InversionCircle from '../generators/2d/inversionCircle.js';
import HalfPlane from '../generators/2d/halfPlane.js';
import TextureSeed from '../generators/2d/textureSeed.js';
import VideoSeed from '../generators/2d/videoSeed.js';
import CanvasSeed from '../generators/2d/canvasSeed.js';
import Scene from './scene.js';
import AddGeneratorCommand from './command/addGeneratorCommand.js';
import RemoveGeneratorCommand from './command/removeGeneratorCommand';
import Vec2 from '../math/vec2.js';

const GeneratorTypes = [typeof(InversionCircle), typeof(HalfPlane),
                        typeof(TextureSeed), typeof(VideoSeed), typeof(CanvasSeed)];


export default class Scene2d extends Scene {
    generators = {};
    constructor() {
        super();
        for(const genType of GeneratorTypes) {
            this.generators[genType] = [];
        }

        this.translation = new Vec2(0, 0);
        this.scale = 1;
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
        for(const genArray of this.generators.values()) {
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
        for (const genArray of this.generators.values()) {
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
            numTextureSeed: this.generators['TextureSeed'].length,
            numVideoSeed: this.generators['VideoSeed'].length,
            numCanvasSeed: this.generators['CanvasSeed'].length
        };
    }
}
