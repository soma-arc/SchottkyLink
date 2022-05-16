<template>
  <div>
    posX
    <b-input
      v-model.number="circle.center.x"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    posY
    <b-input
      v-model.number="circle.center.y"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    radius
    <b-input
      v-model.number="circle.r"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
  </div>
</template>

<script>
    export default {
        props: ['circle', 'scene'],
        components: {
        },
        methods: {
            valueChanged: function(event) {
                this.scene.reRender();
            },
        }
    }
</script>
