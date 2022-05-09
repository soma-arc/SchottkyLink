<template>
  <div id="generatorPanel2d">
    <img-button label="Circle" :src="circleUrl"
                width="128px" height="128px" @click.native="addCircle"/>
    <img-button label="Half Plane" :src="halfPlaneUrl"
                width="128px" height="128px" @click.native="addHalfPlane"/>
    <img-button label="Orbit Seed" :src="orbitSeedUrl" @click.native="addOrbitSeed"
                width="128px" height="128px"/>
    <img-button label="Camera Input" :src="videoUrl" @click.native="addCameraOrbit"
                width="128px" height="128px"/>
    <img-button label="Parallel Translation" :src="parallelTranslationUrl"
                width="128px" height="128px" @click.native="addParallelTranslation"/>
    <img-button label="Parallel Inversions" :src="parallelTranslationUrl"
                width="128px" height="128px" @click.native="addParallelInversions"/>
    <img-button label="GlideReflection" :src="parallelTranslationUrl"
                width="128px" height="128px" @click.native="addGlideReflection"/>
    <img-button label="Rotation" :src="rotationUrl"
                width="128px" height="128px" @click.native="addRotation"/>
    <img-button label="Crossing Inversions" :src="rotationUrl"
                width="128px" height="128px" @click.native="addCrossingInversions"/>
    <img-button label="Scaling" :src="scalingUrl"
                width="128px" height="128px" @click.native="addScaling"/>
    <img-button label="Two Circles" :src="twoCirclesUrl"
                width="128px" height="128px" @click.native="addTwoCircles"/>
    <img-button label="Loxodromic" :src="loxodromicUrl" @click.native="addLoxodromic"
                width="128px" height="128px"/>
  </div>
</template>

<script>
import ImgButton from './imgButton.vue';
import Vec2 from '../vector2d.js';

const CIRCLE_IMG = require('../img/2dGenerators/circle.png');
const HALF_PLANE_IMG = require('../img/2dGenerators/halfPlane.png');
const PARALLEL_TRANSLATION_IMG = require('../img/2dGenerators/parallelTranslation.png');
const ROTATION_IMG = require('../img/2dGenerators/rotation.png');
const SCALING_IMG = require('../img/2dGenerators/scaling.png');
const TWO_CIRCLES_IMG = require('../img/2dGenerators/twoCircles.png');
const LOXODROMIC_IMG = require('../img/2dGenerators/loxodromic.png');
const ORBIT_SEED_IMG = require('../img/2dGenerators/orbitSeed.png');
const VIDEO_IMG = require('../img/2dGenerators/video_camera.png');

export default {
    props: ['scene', 'canvas2d', 'cameraManager'],
    components: { ImgButton },
    data: function() {
        return { 'circleUrl': CIRCLE_IMG,
                 'halfPlaneUrl': HALF_PLANE_IMG,
                 'parallelTranslationUrl': PARALLEL_TRANSLATION_IMG,
                 'rotationUrl': ROTATION_IMG,
                 'scalingUrl': SCALING_IMG,
                 'twoCirclesUrl': TWO_CIRCLES_IMG,
                 'loxodromicUrl': LOXODROMIC_IMG,
                 'orbitSeedUrl': ORBIT_SEED_IMG,
                 'videoUrl': VIDEO_IMG }
    },
    methods: {
        addCircle: function() {
            this.scene.addCircle(new Vec2(0, 0), this.canvas2d.scale);
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        },
        addHalfPlane: function() {
            this.scene.addHalfPlane(new Vec2(0, 0), this.canvas2d.scale);
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        },
        addParallelTranslation: function() {
            this.scene.addParallelTranslation(new Vec2(0, 0), this.canvas2d.scale);
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        },
        addParallelInversions: function() {
            this.scene.addParallelInversions(new Vec2(0, 0), this.canvas2d.scale);
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        },
        addGlideReflection: function() {
            this.scene.addGlideReflection(new Vec2(0, 0), this.canvas2d.scale);
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        },
        addRotation: function() {
            this.scene.addRotation(new Vec2(0, 0), this.canvas2d.scale);
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        },
        addCrossingInversions: function() {
            this.scene.addCrossingInversions(new Vec2(0, 0), this.canvas2d.scale);
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        },
        addScaling: function() {
            this.scene.addScaling(new Vec2(0, 0), this.canvas2d.scale);
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        },
        addTwoCircles: function() {
            this.scene.addTwoCircles(new Vec2(0, 0), this.canvas2d.scale);
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        },
        addLoxodromic: function() {
            this.scene.addLoxodromic(new Vec2(0, 0), this.canvas2d.scale);
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        },
        addOrbitSeed: function() {
            this.scene.addOrbitSeed(new Vec2(0, 0), this.canvas2d.scale);
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        },
        addCameraOrbit: function() {
            if (this.cameraManager.streaming === false) {
                this.cameraManager.connect(this.canvas2d.gl,
                                           () => {
                                               this.cameraManager.streaming = true;
                                               this.scene.addCameraOrbit(new Vec2(0, 0),
                                                                         this.canvas2d.scale,
                                                                         this.cameraManager.cameraTexture);
                                               this.canvas2d.compileRenderShader();
                                               this.canvas2d.render();
                                           },
                                           () => {
                                           });
            } else {
                this.scene.addCameraOrbit(new Vec2(0, 0), this.canvas2d.scale, this.cameraManager.cameraTexture);
                this.canvas2d.compileRenderShader();
                this.canvas2d.render();
            }
        }
    }
}
</script>

<style>
#generatorPanel2d {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height:1rem;
    overflow: hidden;
}

.imgBtn {
    padding: 5px;
}

</style>
