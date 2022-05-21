<template>
  <div>
    posX
    <b-input 
      v-model.number="halfPlane.p.x"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    posY
    <b-input 
      v-model.number="halfPlane.p.y"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Degree
    <b-input 
      v-model.number="halfPlane.normalAngleDeg"
      @input="computeNormal"
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
        props: ['halfPlane', 'scene'],
        components: {
        },
        methods: {
            valueChanged: function(event) {
                this.scene.reRender();
            },
            computeNormal: function(event) {
                const rad = Radians.DegToRad(this.halfPlane.normalAngleDeg);
                this.halfPlane.normal = new Vec2(Math.cos(rad), Math.sin(rad));
                this.halfPlane.boundaryDir = new Vec2(-this.halfPlane.normal.y,
                                                      this.halfPlane.normal.x);
                this.scene.reRender();
            }
        }
    }
</script>
