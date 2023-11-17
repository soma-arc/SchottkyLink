<template>
<div class="contentParent">
  <div class="canvasPanel">
    <div class="canvasParent" id="canvasParent">
      <canvas id="canvas2d" tabIndex="1000" v-bind:class="[ mode, canvasManager.canvas2d.cursorType ]"/><br>
    </div>
    <div id="right-ui">
      <img-button label="Circle" :src="circleUrl"
                  width="128px" height="128px" @click.native="addCircle"/>
      <img-button label="Half Plane" :src="halfPlaneUrl"
                  width="128px" height="128px" @click.native="addHalfPlane"/>
      <img-button label="Orbit Seed" :src="textureSeedUrl" @click.native="addTextureSeed"
                  width="128px" height="128px"/>
      <img-button label="Video Input" :src="cameraUrl" @click.native="addVideoSeed"
                  width="128px" height="128px"/>
      <img-button label="Video Input" :src="gomiUrl" @click.native="clearScene"
                  width="128px" height="128px"/>
    </div>
  </div>
    <!-- <div class="controlPanel"> -->
    <!-- <underControlPanel2d :scene2d="scene2d" :canvasManager="canvasManager" v-if="display"/>
  <!--   <div class="controlPanel"> -->
  <!--     <img-button label="Circle" :src="circleUrl" -->
  <!--                 width="128px" height="128px" @click.native="addCircle"/> -->
  <!--   </div> -->
  <!-- <controlPanel2d :scene2d="scene2d" :canvasManager="canvasManager" v-if="display"/> -->
</div>
</template>

<script>
import ControlPanel2d from './controlPanel2d.vue';
import UnderControlPanel2d from './underControlPanel2d.vue';
import ImgButton from './imgButton.vue';
import Vec2 from '../vector2d.js';
import Circle from '../generator2d/circle.js';

const CIRCLE_IMG = require('../img/2dGenerators/whiteCircle.png');
const HALF_PLANE_IMG = require('../img/2dGenerators/halfPlaneWhite.png');
const PARALLEL_TRANSLATION_IMG = require('../img/2dGenerators/parallelTranslation.png');
const ROTATION_IMG = require('../img/2dGenerators/rotation.png');
const SCALING_IMG = require('../img/2dGenerators/scaling.png');
const TWO_CIRCLES_IMG = require('../img/2dGenerators/twoCircles.png');
const LOXODROMIC_IMG = require('../img/2dGenerators/loxodromic.png');
const TEXTURE_SEED_IMG = require('../img/2dGenerators/cat_fish_run.png');
const CAMERA_IMG = require('../img/2dGenerators/video_camera_transparent.png');
const GOMIBAKO_IMG = require('../img/2dGenerators/gomibako_full.png');

export default {
    props: ['scene2d', 'canvasManager'],
    components: { ControlPanel2d, UnderControlPanel2d, ImgButton },
    data: function() {
        return { 'circleUrl': CIRCLE_IMG,
                 'halfPlaneUrl': HALF_PLANE_IMG,
                 'parallelTranslationUrl': PARALLEL_TRANSLATION_IMG,
                 'rotationUrl': ROTATION_IMG,
                 'scalingUrl': SCALING_IMG,
                 'twoCirclesUrl': TWO_CIRCLES_IMG,
                 'loxodromicUrl': LOXODROMIC_IMG,
                 'textureSeedUrl': TEXTURE_SEED_IMG,
                 'cameraUrl': CAMERA_IMG,
                 'gomiUrl': GOMIBAKO_IMG,
                 activeTab: 0
               }
    },
    computed: {
        display: function() {
            return this.canvasManager.displayMode !== 'iframe';
        },
        mode: function() {
            return this.display ? 'defaultMode' : 'iframeMode';
        }
    },
    methods: {
        addCircle: function() {
            //this.scene2d.addCircle(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
            this.scene2d.addGenWithoutDuplicate(new Circle(new Vec2(0, 0), 0.1 * this.canvasManager.canvas2d.scale));
            this.canvasManager.canvas2d.compileRenderShader();
        },
        addHalfPlane: function() {
            this.scene2d.addHalfPlane(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
            this.canvasManager.canvas2d.compileRenderShader();
        },
        addTextureSeed: function() {
            this.scene2d.addTextureSeed(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
            this.canvasManager.canvas2d.compileRenderShader();
        },
        addVideoSeed: function(){
             if (this.canvasManager.videoManager.streaming === false) {
                 this.canvasManager.videoManager.connect(
                     this.canvasManager.canvas2d.gl,
                     () => {
                         this.scene2d.addVideoSeed(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
                         this.canvasManager.canvas2d.compileRenderShader();
                         this.canvasManager.videoManager.streaming = true;
                     },
                     () => {
                     });
             } else {
                 this.scene2d.addVideoSeed(new Vec2(0, 0), this.canvasManager.canvas2d.scale);
                 this.canvasManager.canvas2d.compileRenderShader();
             }
        },
        clearScene() {
            this.scene2d.clear();
            this.canvasManager.canvas2d.compileRenderShader();
            this.canvasManager.canvas2d.render();
        },
    }
}
</script>

<style>
.contentParent {
    /* flex: 1; */
    /* display: flex; */
    /* flex-direction: row; */
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.canvasParent {
    /* flex: 1; */
    width: 100%;
    height: 100%;
    /* display: flex; */
}

#canvas2d {
    width: 100%;
    height: 100%;
     border-style: none;
    /* border-color: gray; */
    outline: none;
}

.defaultMode {
    border-style: none;
    border-color: gray
}

.iframeMode {
    border:0;
    border-style: none;
}

.canvasPanel {
    /* flex: 1; */
    /* display: flex; */
    /* flex-direction: column; */
    width: 100%;
    height: 100%;    
    overflow: hidden;
}

.crosshair {
    cursor: crosshair;
}

.allScroll {
    cursor: all-scroll;
}

.grab {
    cursor: grab;
}

.grabbing {
    cursor: grabbing;
}

underControlPanel2d {
    flex-basis: 50px;
    display: flex;
    flex-direction: row;
}

.controlPanel {
    flex-direction: column;
    width:300px;
    /* overflow: auto; */
}

#right-ui {
    display: flex;
    flex-direction: column;
    align-items: center;
    position:relative;
    position: absolute;
    left: calc(100% - 150px);
    top: 0px;
    padding-top: 20px;
}

img-button {
    position:relative;
    background-color: white;
    margin-top: 20px;
    margin-bottom: 20px;
}
</style>
