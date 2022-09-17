<template>
  <div id="sceneObjPanel">
    <select size="5" @change="updateSelection"  v-model="scene.selectedObj" class="objList">
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

    <circle-controller v-if="selectedObjName === 'Circle'"
                       :circle="scene.selectedObj"
                       :scene="scene"/>
    <half-plane-controller v-if="selectedObjName === 'HalfPlane'"
                           :half-plane="scene.selectedObj"
                           :scene="scene"/>
    <orbit-seed-controller v-if="selectedObjName === 'OrbitSeed'"
                           :orbitSeed="scene.selectedObj"
                           :scene="scene"
                           :canvas="canvas2d"
                           :textureManager="textureManager"/>
    <video-orbit-controller v-if="selectedObjName === 'VideoOrbit'"
                           :videoOrbit="scene.selectedObj"
                            :scene="scene"/>
    <loxodromic-controller v-if="selectedObjName === 'Loxodromic'"
                            :loxodromic="scene.selectedObj"
                            :scene="scene"/>
    <parallel-translation-controller v-if="selectedObjName === 'ParallelTranslation'"
                                     :parallelTranslation="scene.selectedObj"
                                     :scene="scene"/>
    <parallel-inversions-controller v-if="selectedObjName === 'ParallelInversions'"
                                    :parallelInversions="scene.selectedObj"
                                    :scene="scene"/>
    <glide-reflection-controller v-if="selectedObjName === 'GlideReflection'"
                                 :glideReflection="scene.selectedObj"
                                 :scene="scene"/>
    <crossing-inversions-controller v-if="selectedObjName === 'CrossingInversions'"
                                    :crossingInversions="scene.selectedObj"
                                    :scene="scene"/>
    <rotation-controller v-if="selectedObjName === 'Rotation'"
                         :rotation="scene.selectedObj"
                         :scene="scene"/>
    <two-circles-controller v-if="selectedObjName === 'TwoCircles'"
                            :twoCircles="scene.selectedObj"
                            :scene="scene"/>
    <scaling-controller v-if="selectedObjName === 'Scaling'"
                        :scaling="scene.selectedObj"
                        :scene="scene"/>
  </div>
</template>

<script>
import RemoveGeneratorCommand from '../command/removeGeneratorCommand.js';
import CircleController from './controller2d/circleController.vue';
import HalfPlaneController from './controller2d/halfPlaneController.vue';
import OrbitSeedController from './controller2d/orbitSeedController.vue';
import videoOrbitController from './controller2d/videoOrbitController.vue';
import LoxodromicController from './controller2d/loxodromicController.vue';
import ParallelTranslationController from './controller2d/parallelTranslationController.vue';
import ParallelInversionsController from './controller2d/parallelInversionsController.vue';
import GlideReflectionController from './controller2d/glideReflectionController.vue';
import CrossingInversionsController from './controller2d/crossingInversionsController.vue';
import RotationController from './controller2d/rotationController.vue';
import TwoCirclesController from './controller2d/twoCirclesController.vue';
import ScalingController from './controller2d/scalingController.vue';

export default {
    props: ['scene', 'canvas2d', 'textureManager'],
    components: {
        CircleController,
        HalfPlaneController,
        OrbitSeedController,
        videoOrbitController,
        LoxodromicController,
        ParallelTranslationController,
        ParallelInversionsController,
        GlideReflectionController,
        CrossingInversionsController,
        RotationController,
        TwoCirclesController,
        ScalingController
    },
    computed: {
        selectedObjName: function() {
            if (this.scene.selectedObj === undefined) return '';
            return this.scene.selectedObj.name;
        }
    },
    methods: {
        updateSelection: function() {
            this.scene.unselectAll();
            if (this.scene.selectedObj === undefined) return;
            this.scene.selectedObj.selected = true;
            this.canvas2d.render();
        },
        deleteSelectedObj: function() {
            if (this.scene.selectedObj === undefined) return;
            const name = this.scene.selectedObj.name;
            const index = this.scene.objects[name].findIndex((elem) => {
                return elem.id === this.scene.selectedObj.id;
            });
            this.scene.addCommand(new RemoveGeneratorCommand(this.scene, this.scene.selectedObj,
                                                             index));
            this.scene.selectedObj = undefined;
        },
        deselectObj: function() {
            this.scene.selectedObj.selected = false;
            this.scene.selectedObj = undefined;
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
