<template>
<div class="controlPanel">
  <b-tabs position="is-centered" v-model="activeTab">
      <b-tab-item label="Component">
        <section id="component">
          <img-button label="Circle" :src="circleUrl"
                      width="128px" height="128px" @click.native="addCircle"/>
          <img-button label="Half Plane" :src="halfPlaneUrl"
                      width="128px" height="128px" @click.native="addHalfPlane"/>
          <img-button label="Orbit Seed" :src="orbitSeedUrl" @click.native="addOrbitSeed"
                      width="128px" height="128px"/>
          <img-button label="Video Input" :src="cameraUrl" @click.native="addVideoOrbit"
                      width="128px" height="128px"/>
          <img-button label="Parallel Translation" :src="parallelTranslationUrl"
                      width="128px" height="128px" @click.native="addParallelTranslation"/>
          <img-button label="Parallel Inversions" :src="parallelTranslationUrl"
                      width="128px" height="128px" @click.native="addParallelInversions"/>
          <img-button label="Glide Reflection" :src="parallelTranslationUrl"
                      width="128px" height="128px" @click.native="addGlideReflection"/>
          <img-button label="Rotation" :src="rotationUrl"
                      width="128px" height="128px" @click.native="addRotation"/>
          <img-button label="Scaling" :src="scalingUrl"
                      width="128px" height="128px" @click.native="addScaling"/>
          <img-button label="Two Circles" :src="twoCirclesUrl"
                      width="128px" height="128px" @click.native="addTwoCircles"/>
          <img-button label="Loxodromic" :src="loxodromicUrl" @click.native="addLoxodromic"
                      width="128px" height="128px"/>
        </section>
        </b-tab-item>
        <b-tab-item label="Scene">
          <section>
            <scene-object-panel :scene="scene2d" :canvas2d="canvasManager.canvas2d"
                                :textureManager="canvasManager.textureManager"></scene-object-panel>
          </section>
        </b-tab-item>
        <b-tab-item label="Render">
        </b-tab-item>
      </b-tabs>
  </div>
</template>

<script>
import ImgButton from './imgButton.vue';
import Vec2 from '../vector2d.js';
import SceneObjectPanel from './sceneObjectPanel.vue';

const CIRCLE_IMG = require('../img/2dGenerators/circle.png');
const HALF_PLANE_IMG = require('../img/2dGenerators/halfPlane.png');
const PARALLEL_TRANSLATION_IMG = require('../img/2dGenerators/parallelTranslation.png');
const ROTATION_IMG = require('../img/2dGenerators/rotation.png');
const SCALING_IMG = require('../img/2dGenerators/scaling.png');
const TWO_CIRCLES_IMG = require('../img/2dGenerators/twoCircles.png');
const LOXODROMIC_IMG = require('../img/2dGenerators/loxodromic.png');
const ORBIT_SEED_IMG = require('../img/2dGenerators/orbitSeed.png');
const CAMERA_IMG = require('../img/2dGenerators/video_camera.png');

export default {
    props: ['scene2d', 'canvasManager'],
    components: { ImgButton, SceneObjectPanel },
    data: function() {
        return { 'circleUrl': CIRCLE_IMG,
                 'halfPlaneUrl': HALF_PLANE_IMG,
                 'parallelTranslationUrl': PARALLEL_TRANSLATION_IMG,
                 'rotationUrl': ROTATION_IMG,
                 'scalingUrl': SCALING_IMG,
                 'twoCirclesUrl': TWO_CIRCLES_IMG,
                 'loxodromicUrl': LOXODROMIC_IMG,
                 'orbitSeedUrl': ORBIT_SEED_IMG,
                 'cameraUrl': CAMERA_IMG,
                 activeTab: 0
               }
    },
    methods: {
        addCircle: function() {
            this.scene2d.addCircle(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
            this.canvasManager.canvas2d.compileRenderShader();
        },
        addHalfPlane: function() {
            this.scene2d.addHalfPlane(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
            this.canvasManager.canvas2d.compileRenderShader();
        },
        addParallelTranslation: function() {
            this.scene2d.addParallelTranslation(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
            this.canvasManager.canvas2d.compileRenderShader();
        },
        addRotation: function() {
            this.scene2d.addRotation(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
            this.canvasManager.canvas2d.compileRenderShader();
        },
        addScaling: function() {
            this.scene2d.addScaling(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
            this.canvasManager.canvas2d.compileRenderShader();
        },
        addTwoCircles: function() {
            this.scene2d.addTwoCircles(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
            this.canvasManager.canvas2d.compileRenderShader();
        },
        addLoxodromic: function() {
            this.scene2d.addLoxodromic(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
            this.canvasManager.canvas2d.compileRenderShader();
        },
        addOrbitSeed: function() {
            this.scene2d.addOrbitSeed(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
            this.canvasManager.canvas2d.compileRenderShader();
        },
        addVideoOrbit: function(){
             if (this.canvasManager.videoManager.streaming === false) {
                 this.canvasManager.videoManager.connect(
                     this.canvasManager.canvas2d.gl,
                     () => {
                         this.scene2d.addVideoOrbit(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
                         this.canvasManager.canvas2d.compileRenderShader();
                         this.canvasManager.videoManager.streaming = true;
                     },
                     () => {
                     });
             } else {
                 this.scene2d.addVideoOrbit(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
                 this.canvasManager.canvas2d.compileRenderShader();
             }
        },
        addRotation: function() {
            this.scene2d.addRotation(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
            this.canvasManager.canvas2d.compileRenderShader();
        },
        addParallelTranslation: function() {
            this.scene2d.addParallelTranslation(new Vec2(-0.5, 0), this.canvasManager.canvas2d.scale);
            this.canvasManager.canvas2d.compileRenderShader();
        },
        addParallelInversions: function() {
            this.scene2d.addParallelInversions(new Vec2(-0.5, 0), this.canvasManager.canvas2d.scale);
            this.canvasManager.canvas2d.compileRenderShader();
        },
        addGlideReflection: function() {
            this.scene2d.addGlideReflection(new Vec2(-0.5, 0), this.canvasManager.canvas2d.scale);
            this.canvasManager.canvas2d.compileRenderShader();
        },
        changeMouseMode: function() {
            this.scene2d.deselectAll();
            this.canvasManager.canvas2d.render();
        }
    },
    computed: {
        sceneObjectsList: function() {
            return Array.prototype.concat.apply([],
                                                Object.values(this.scene2d.objects));
        }
    }
}
</script>

<style>
.controlPanel {
    border-style: ridge;
    border-color: gray;

    flex-direction: column;
    width:300px;
    overflow: auto;
}

#component {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.img-button {
    padding: 5px;
}

</style>
