<template>
  <div>
    <select size="5" v-model="selected">
      <template v-for="objs in scene.objects" v-bind:objs="objs">
        <option v-for="obj in objs" v-bind:value="obj">
          {{ obj.id }}
        </option>
      </template>
    </select>
  </div>
</template>

<script>
  export default {
      props: ['scene'],
  }
</script>
