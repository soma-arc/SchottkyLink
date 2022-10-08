<template>
<div>
  <b-switch v-model="scene.videoManager.streaming">
    Streaming
  </b-switch><br>
    Origin X
    <b-input
      v-model.number="videoSeed.corner.x"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Origin Y
    <b-input
      v-model.number="videoSeed.corner.y"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Width
    <b-input
      v-model.number="videoSeed.size.x"
      @input="changeWidth"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Height
    <b-input
      v-model.number="videoSeed.size.y"
      @input="changeHeight"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
  </div>
</template>

<script>
export default {
    props: ['videoSeed', 'scene'],
    data() {
        return {}
    },
    methods: {
        valueChanged: function(event) {
            this.scene.reRender();
        },
        changeWidth: function() {
            this.videoSeed.size.y = this.videoSeed.aspect * this.videoSeed.size.x;
            this.scene.reRender();
        },
        changeHeight: function(){
            this.videoSeed.size.x = this.videoSeed.size.y / this.videoSeed.aspect;
            this.scene.reRender();
        }
    }
}
</script>
