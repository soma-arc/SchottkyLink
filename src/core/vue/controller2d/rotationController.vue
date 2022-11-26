<template>
<div>
  Origin X
  <b-input
    v-model.number="rotation.p.x"
    @input="valueChanged"
    placeholder="Number"
    type="number"
    step="0.01">
  </b-input>
  Origin Y
  <b-input
    v-model.number="rotation.p.y"
    @input="valueChanged"
    placeholder="Number"
    type="number"
    step="0.01">
  </b-input>
  Boundary Angle
  <b-input
    v-model.number="rotation.boundaryAngleDeg"
    @input="computeBoundary"
    placeholder="Number"
    type="number"
    step="1">
  </b-input>
  Rotation Angle
  <b-input
    v-model.number="rotation.degrees"
    @input="updateRotation"
    placeholder="Number"
    type="number"
    max="180"
    min="0"
    step="1">
  </b-input>
  </div>
</template>

<script>
import Radians from '../../radians.js';
import Vec2 from '../../vector2d.js';
export default {
    props: ['rotation', 'scene'],
    components: {
    },
    methods: {
        valueChanged: function(event) {
            this.scene.reRender();
        },
        computeBoundary: function(event) {
            const rad = Radians.DegToRad(this.rotation.boundaryAngleDeg);
            this.rotation.boundaryDir1 = new Vec2(Math.cos(rad), Math.sin(rad));
            this.rotation.updateFromBoundary();
            this.scene.reRender();
        },
        updateRotation: function(event) {
            this.rotation.radians = Radians.DegToRad(this.rotation.degrees);
            this.rotation.update();
            this.scene.reRender();
        },
    }
}
</script>
