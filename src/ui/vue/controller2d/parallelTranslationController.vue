<template>
<div>
  Origin X
  <b-input 
    v-model.number="parallelTranslation.p.x"
    @input="valueChanged"
    placeholder="Number"
    type="number"
    step="0.01">
  </b-input>
  Origin Y
  <b-input 
    v-model.number="parallelTranslation.p.y"
    @input="valueChanged"
    placeholder="Number"
    type="number"
    step="0.01">
  </b-input>
  Normal Angle
  <b-input 
    v-model.number="parallelTranslation.normalAngleDeg"
    @input="computeNormal"
    placeholder="Number"
    type="number"
    step="1">
  </b-input>
  Distance
  <b-input 
    v-model.number="parallelTranslation.planeDist"
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
        props: ['parallelTranslation', 'scene'],
        components: {
        },
        methods: {
            valueChanged: function(event) {
                this.scene.reRender();
            },
            updateTranslation: function(event) {
                this.parallelTranslation.update();
                this.scene.reRender();
            },
            computeNormal: function(event) {
                const rad = Radians.DegToRad(this.parallelTranslation.normalAngleDeg);
                this.parallelTranslation.normal = new Vec2(Math.cos(rad), Math.sin(rad));
                this.parallelTranslation.updateFromNormal();
                this.scene.reRender();
            }
        }
    }
</script>
