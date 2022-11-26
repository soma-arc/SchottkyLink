<template>
<div>
  Origin X
  <b-input 
    v-model.number="parallelInversions.p.x"
    @input="valueChanged"
    placeholder="Number"
    type="number"
    step="0.01">
  </b-input>
  Origin Y
  <b-input 
    v-model.number="parallelInversions.p.y"
    @input="valueChanged"
    placeholder="Number"
    type="number"
    step="0.01">
  </b-input>
  Normal Angle
  <b-input 
    v-model.number="parallelInversions.normalAngleDeg"
    @input="computeNormal"
    placeholder="Number"
    type="number"
    step="1">
  </b-input>
  Distance
  <b-input 
    v-model.number="parallelInversions.planeDist"
    @input="updateTranslation"
    placeholder="Number"
    type="number"
    step="0.01">
    </b-input>
  </div>
</template>

<script>
import Radians from '../../../core/radians.js';
import Vec2 from '../../../core/vector2d.js';
export default {
        props: ['parallelInversions', 'scene'],
        components: {
        },
        methods: {
            valueChanged: function(event) {
                this.scene.reRender();
            },
            updateTranslation: function(event) {
                this.parallelInversions.update();
                this.scene.reRender();
            },
            computeNormal: function(event) {
                const rad = Radians.DegToRad(this.parallelInversions.normalAngleDeg);
                this.parallelInversions.normal = new Vec2(Math.cos(rad), Math.sin(rad));
                this.parallelInversions.updateFromNormal();
                this.scene.reRender();
            }
        }
    }
</script>
