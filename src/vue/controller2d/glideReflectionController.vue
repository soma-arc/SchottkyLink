<template>
<div>
  posX
  <b-input 
    v-model.number="glideReflection.p.x"
    @input="valueChanged"
    placeholder="Number"
    type="number"
    step="0.01">
  </b-input>
  posY
  <b-input 
    v-model.number="glideReflection.p.y"
    @input="valueChanged"
    placeholder="Number"
    type="number"
    step="0.01">
  </b-input>
  Normal Degree
  <b-input 
    v-model.number="glideReflection.normalAngleDeg"
    @input="computeNormal"
    placeholder="Number"
    type="number"
    step="1">
  </b-input>
  Plane Distance
  <b-input 
    v-model.number="glideReflection.planeDist"
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
        props: ['glideReflection', 'scene'],
        components: {
        },
        methods: {
            valueChanged: function(event) {
                this.scene.reRender();
            },
            updateTranslation: function(event) {
                this.glideReflection.update();
                this.scene.reRender();
            },
            computeNormal: function(event) {
                const rad = Radians.DegToRad(this.glideReflection.normalAngleDeg);
                this.glideReflection.normal = new Vec2(Math.cos(rad), Math.sin(rad));
                this.glideReflection.updateFromNormal();
                this.scene.reRender();
            }
        }
    }
</script>
