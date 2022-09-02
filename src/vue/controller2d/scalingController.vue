<template>
  <div>
    Center X
    <b-input
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Center Y
    <b-input
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    radius
    <b-input
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
  </div>
</template>

<script>
    export default {
        props: ['scaling', 'scene'],
        components: {
        },
        methods: {
            valueChanged: function(event) {
                this.scene.reRender();
            },
        }
    }
</script>
