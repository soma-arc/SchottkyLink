<template>
  <div>
    <select size="5" v-model="scene.selectedObj">
      <template v-for="objs in scene.objects" v-bind:objs="objs">
        <option v-for="obj in objs" v-bind:value="obj">
          {{ obj.name }} - {{ obj.id }}
        </option>
      </template>
    </select>
    <div v-if="selectedObjName === 'Circle'">
      {{ scene.selectedObj.center.x }}, {{ scene.selectedObj.center.y }}, {{ scene.selectedObj.r }}
    </div>
  </div>
</template>

<script>
  export default {
      props: ['scene'],
      computed: {
          selectedObjName: function() {
              if (typeof this.scene.selectedObj === 'undefined') return '';
              return this.scene.selectedObj.name;
          }
      }
  }
</script>
