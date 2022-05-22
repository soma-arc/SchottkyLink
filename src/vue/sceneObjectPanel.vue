<template>
  <div id="sceneObjPanel">
    <select size="5" @change="updateSelection"  v-model="scene.selectedObj" class="objList">
      <template v-for="objs in scene.objects" v-bind:objs="objs">
        <option v-for="obj in objs" v-bind:value="obj">
          {{ obj.name }} - {{ obj.id }}
        </option>
      </template>
    </select>
    <b-button type="is-primary" @click="deleteSelectedObj">
      Remove
    </b-button>
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
  </div>
</template>

<script>
import RemoveGeneratorCommand from '../command/removeGeneratorCommand.js';
import CircleController from './controller2d/circleController.vue';
import HalfPlaneController from './controller2d/halfPlaneController.vue';
import OrbitSeedController from './controller2d/orbitSeedController.vue';
import videoOrbitController from './controller2d/videoOrbitController.vue';
export default {
    props: ['scene', 'canvas2d', 'textureManager'],
    components: {
        CircleController,
        HalfPlaneController,
        OrbitSeedController,
        videoOrbitController
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
</style>
