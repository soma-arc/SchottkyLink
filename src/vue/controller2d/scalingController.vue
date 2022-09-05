<template>
  <div>
    Center X
    <b-input
      v-model.number="scaling.center.x"
      @input="centerChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Center Y
    <b-input
      v-model.number="scaling.center.y"
      @input="centerChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    C1 Radius
    <b-input
      v-model.number="scaling.c1.r"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    C2 Radius
    <b-input
      v-model.number="scaling.c2.r"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Rotation Angle
    <b-input
      v-model.number="scaling.rotationAngleDeg"
      @input="angleChanged"
      placeholder="Number"
      type="number"
      step="1">
    </b-input>
  </div>
</template>

<script>
    export default {
        props: ['scaling', 'scene'],
        components: {
        },
        methods: {
            angleChanged: function() {
                this.scaling.updateFromRotationAngle();
                this.scene.reRender();
            },
            centerChanged: function() {
                this.scaling.updateFromCenter();
                this.scene.reRender();
            },
            valueChanged: function(event) {
                this.scaling.update();
                this.scene.reRender();
            },
        }
    }
</script>
