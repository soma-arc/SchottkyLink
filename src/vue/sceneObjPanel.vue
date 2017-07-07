<template>
  <div id="sceneObjPanel">
    <select size="5" v-model="scene.selectedObj" class="objList">
      <template v-for="objs in scene.objects" v-bind:objs="objs">
        <option v-for="obj in objs" v-bind:value="obj" key="obj.id">
          {{ obj.name }} - {{ obj.id }}
        </option>
      </template>
    </select>
    <ui-button id="deleteButton" type="secondary" raised color="primary"
               @click="deleteSelectedObj">Delete</ui-button>
    <circle-control v-if="selectedObjName === 'Circle'"
                    v-bind:circle="scene.selectedObj"
                    v-bind:canvas2d="canvas2d"/>
    <half-plane-control v-else-if="selectedObjName === 'HalfPlane'"
                        v-bind:halfPlane="scene.selectedObj"
                        v-bind:canvas2d="canvas2d"/>
  </div>
</template>

<script>
    import CircleControl from './circleControl.vue';
import HalfPlaneControl from './halfPlaneControl.vue'
import UiButton from 'keen-ui/lib/UiButton';

export default {
    props: ['scene', 'canvas2d'],
    components: {
        CircleControl,
        HalfPlaneControl,
        UiButton
    },
    computed: {
        selectedObjName: function() {
            if (this.scene.selectedObj === undefined) return '';
            return this.scene.selectedObj.name;
        }
    },
    methods: {
        deleteSelectedObj: function() {
            if (this.scene.selectedObj === undefined) return;
            const name = this.scene.selectedObj.name;
            const index = this.scene.objects[name].findIndex((elem) => {
                return elem.id === this.scene.selectedObj.id;
            });
            this.scene.objects[name].splice(index, 1);
            this.canvas2d.compileRenderShader();
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
</style>
