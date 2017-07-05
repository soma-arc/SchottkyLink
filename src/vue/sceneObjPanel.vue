<template>
  <div id="sceneObjPanel">
    <select size="5" v-model="scene.selectedObj" class="objList">
      <template v-for="objs in scene.objects" v-bind:objs="objs">
        <option v-for="obj in objs" v-bind:value="obj" key="obj.id">
          {{ obj.name }} - {{ obj.id }}
        </option>
      </template>
    </select>
    <circle-control v-if="selectedObjName === 'Circle'"
                    v-bind:circle="scene.selectedObj"
                    v-bind:canvas2d="canvas2d"/>
  </div>
</template>

<script>
import CircleControl from './circleControl.vue';
export default {
    props: ['scene', 'canvas2d'],
    components: {
        CircleControl
    },
    computed: {
        selectedObjName: function() {
            if (typeof this.scene.selectedObj === 'undefined') return '';
            return this.scene.selectedObj.name;
        }
    },
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
</style>
