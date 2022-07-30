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
  Normal Degree
  <b-input 
    v-model.number="crossingInversions.normalAngleDeg"
    @input="computeNormal"
    placeholder="Number"
    type="number"
    step="1">
  </b-input>
  Plane Distance
  <b-input 
    v-model.number="crossingInversions.planeDist"
    @input="updateTranslation"
    placeholder="Number"
    type="number"
    step="0.01">
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
            updateTranslation: function(event) {
                this.crossingInversions.update();
                this.scene.reRender();
            },
            computeNormal: function(event) {
                const rad = Radians.DegToRad(this.crossingInversions.normalAngleDeg);
                this.crossingInversions.normal = new Vec2(Math.cos(rad), Math.sin(rad));
                this.crossingInversions.updateFromNormal();
                this.scene.reRender();
            }
        }
    }
</script>
