<template>
  <div>
    C1 Center X
    <b-input
      v-model.number="twoCircles.c1.center.x"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    C1 Center Y
    <b-input
      v-model.number="twoCircles.c1.center.y"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    C1 Radius
    <b-input
      v-model.number="twoCircles.c1.r"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    C2 Center X
    <b-input
      v-model.number="twoCircles.c2.center.x"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    C2 Center Y
    <b-input
      v-model.number="twoCircles.c2.center.y"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    C2 Radius
    <b-input
      v-model.number="twoCircles.c2.r"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
  </div>
</template>

<script>
    export default {
        props: ['twoCircles', 'scene'],
        components: {
        },
        methods: {
            valueChanged: function(event) {
                this.twoCircles.update();
                this.scene.reRender();
            },
        }
    }
</script>
