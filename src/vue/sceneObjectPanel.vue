<template>
  <div id="sceneObjPanel">
    <select size="5" @change="updateSelection"  v-model="scene.selectedState.selectedObj" class="objList">
      <template v-for="objs in scene.objects" v-bind:objs="objs">
        <option v-for="obj in objs" v-bind:value="obj">
          {{ obj.name }} - {{ obj.id }}
        </option>
      </template>
    </select>
    <div id="removeDeselectPanel">
      <b-button class="buttob" type="is-primary" @click="deleteSelectedObj">
        Remove
      </b-button>
      <b-button class="buttob" type="is-primary" @click="deselectObj">
        Deselect
      </b-button>
    </div>

    <b-checkbox
      v-if="scene.selectedState.isSelectingObj()"
      v-model="scene.selectedState.selectedObj.isFixed">
      Fix
    </b-checkbox><br>

    <circle-controller v-if="selectedObjName === 'Circle'"
                       :circle="scene.selectedState.selectedObj"
                       :scene="scene"/>
    <half-plane-controller v-if="selectedObjName === 'HalfPlane'"
                           :half-plane="scene.selectedState.selectedObj"
                           :scene="scene"/>
    <texture-seed-controller v-if="selectedObjName === 'TextureSeed'"
                             :textureSeed="scene.selectedState.selectedObj"
                             :scene="scene"
                             :canvas="canvas2d"
                             :textureManager="textureManager"/>
    <video-seed-controller v-if="selectedObjName === 'VideoSeed'"
                           :videoSeed="scene.selectedState.selectedObj"
                           :scene="scene"/>
    <loxodromic-controller v-if="selectedObjName === 'Loxodromic'"
                            :loxodromic="scene.selectedState.selectedObj"
                            :scene="scene"/>
    <parallel-translation-controller v-if="selectedObjName === 'ParallelTranslation'"
                                     :parallelTranslation="scene.selectedState.selectedObj"
                                     :scene="scene"/>
    <parallel-inversions-controller v-if="selectedObjName === 'ParallelInversions'"
                                    :parallelInversions="scene.selectedState.selectedObj"
                                    :scene="scene"/>
    <glide-reflection-controller v-if="selectedObjName === 'GlideReflection'"
                                 :glideReflection="scene.selectedState.selectedObj"
                                 :scene="scene"/>
    <crossing-inversions-controller v-if="selectedObjName === 'CrossingInversions'"
                                    :crossingInversions="scene.selectedState.selectedObj"
                                    :scene="scene"/>
    <rotation-controller v-if="selectedObjName === 'Rotation'"
                         :rotation="scene.selectedState.selectedObj"
                         :scene="scene"/>
    <two-circles-controller v-if="selectedObjName === 'TwoCircles'"
                            :twoCircles="scene.selectedState.selectedObj"
                            :scene="scene"/>
    <scaling-controller v-if="selectedObjName === 'Scaling'"
                        :scaling="scene.selectedState.selectedObj"
                        :scene="scene"/>
    <canvas-seed-controller v-if="selectedObjName === 'CanvasSeed'"
                            :canvasSeed="scene.selectedState.selectedObj"
                            :scene="scene"
                            :canvas="canvas2d"
                            :textureManager="textureManager"/>
  </div>
</template>

<script>
import SelectionState from '../generator2d/selectionState.js';
import RemoveGeneratorCommand from '../command/removeGeneratorCommand.js';
import CircleController from './controller2d/circleController.vue';
import HalfPlaneController from './controller2d/halfPlaneController.vue';
import TextureSeedController from './controller2d/textureSeedController.vue';
import VideoSeedController from './controller2d/videoSeedController.vue';
import LoxodromicController from './controller2d/loxodromicController.vue';
import ParallelTranslationController from './controller2d/parallelTranslationController.vue';
import ParallelInversionsController from './controller2d/parallelInversionsController.vue';
import GlideReflectionController from './controller2d/glideReflectionController.vue';
import CrossingInversionsController from './controller2d/crossingInversionsController.vue';
import RotationController from './controller2d/rotationController.vue';
import TwoCirclesController from './controller2d/twoCirclesController.vue';
import ScalingController from './controller2d/scalingController.vue';
import CanvasSeedController from './controller2d/canvasSeedController.vue';

export default {
    props: ['scene', 'canvas2d', 'textureManager'],
    components: {
        CircleController,
        HalfPlaneController,
        TextureSeedController,
        VideoSeedController,
        LoxodromicController,
        ParallelTranslationController,
        ParallelInversionsController,
        GlideReflectionController,
        CrossingInversionsController,
        RotationController,
        TwoCirclesController,
        ScalingController,
        CanvasSeedController
    },
    computed: {
        selectedObjName: function() {
            if (this.scene.selectedState.isSelectingObj() === false) return '';
            return this.scene.selectedState.selectedObj.name;
        }
    },
    methods: {
        updateSelection: function() {
            this.scene.unselectAll();
            if(this.scene.selectedState.isSelectingObj() === false) return;
            this.scene.selectedState.selectedObj.selected = true;
            this.canvas2d.render();
        },
        deleteSelectedObj: function() {
            if (this.scene.selectedState.isSelectingObj() === false) return;
            const name = this.scene.selectedState.selectedObj.name;
            const index = this.scene.objects[name].findIndex((elem) => {
                return elem.id === this.scene.selectedState.selectedObj.id;
            });
            this.scene.addCommand(new RemoveGeneratorCommand(this.scene,
                                                             this.scene.selectedState.selectedObj,
                                                             index));
            this.scene.selectedState = new SelectionState();
        },
        deselectObj: function() {
            if (this.scene.selectedState.isSelectingObj() === false) return;
            this.scene.selectedState.selectedObj.selected = false;
            this.scene.selectedState = new SelectionState();
            this.canvas2d.render();
        }
    }
}
</script>

<style>
#sceneObjPanel {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}
  
.objList {
    padding-left: 0;
    width: 200px;
    height: 100px;
}
#deleteButton {
    margin: 5px;
}

#removeDeselectPanel {
    margin: 10px;
}

</style>
