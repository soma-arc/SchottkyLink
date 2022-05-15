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
  </div>
</template>

<script>
import RemoveGeneratorCommand from '../command/removeGeneratorCommand.js';
export default {
    props: ['scene', 'canvas2d'],
    components: {
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
                                                             this.scene.selectedObj.name,
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
