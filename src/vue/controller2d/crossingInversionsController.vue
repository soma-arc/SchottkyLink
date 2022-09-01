<template>
<div>
  posX
  <b-input 
    v-model.number="crossingInversions.p.x"
    @input="valueChanged"
    placeholder="Number"
    type="number"
    step="0.01">
  </b-input>
  posY
  <b-input 
    v-model.number="crossingInversions.p.y"
    @input="valueChanged"
    placeholder="Number"
    type="number"
    step="0.01">
  </b-input>
  Boundary Degrees
  <b-input 
    v-model.number="crossingInversions.boundaryAngleDeg"
    @input="computeBoundary"
    placeholder="Number"
    type="number"
    step="1">
  </b-input>
  Degrees
  <b-input 
    v-model.number="crossingInversions.degrees"
    @input="updateCrossingInversions"
    placeholder="Number"
    type="number"
    step="1">
    </b-input>
  </div>
</template>

<script>
import Radians from '../../radians.js';
import Vec2 from '../../vector2d.js';
export default {
    props: ['crossingInversions', 'scene'],
    components: {
    },
    methods: {
        valueChanged: function(event) {
            this.scene.reRender();
        },
        computeBoundary: function(event) {
            const rad = Radians.DegToRad(this.crossingInversions.boundaryAngleDeg);
            this.crossingInversions.boundaryDir1 = new Vec2(Math.cos(rad), Math.sin(rad));
            this.crossingInversions.updateFromBoundary();
            this.scene.reRender();
        },
        updateCrossingInversions: function(event) {
            this.crossingInversions.radians = Radians.DegToRad(this.crossingInversions.degrees);
            this.crossingInversions.update();
            this.scene.reRender();
        },
    }
}
</script>
