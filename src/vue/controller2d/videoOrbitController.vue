<template>
  <div>
    Origin X
    <b-input
      v-model.number="videoOrbit.corner.x"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Origin Y
    <b-input
      v-model.number="videoOrbit.corner.y"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Width
    <b-input
      v-model.number="videoOrbit.size.x"
      @input="changeWidth"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Height
    <b-input
      v-model.number="videoOrbit.size.y"
      @input="changeHeight"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
  </div>
</template>

<script>
export default {
    props: ['videoOrbit', 'scene'],
    data() {
        return {}
    },
    methods: {
        valueChanged: function(event) {
            this.scene.reRender();
        },
        changeWidth: function() {
            this.videoOrbit.size.y = this.videoOrbit.aspect * this.videoOrbit.size.x;
            this.scene.reRender();
        },
        changeHeight: function(){
            this.videoOrbit.size.x = this.videoOrbit.size.y / this.videoOrbit.aspect;
            this.scene.reRender();
        }
    }
}
</script>
