<template>
  <div id="generatorPanel2d">
    <img-button label="Circle" :src="circleUrl"
                width="128px" height="128px" @click.native="addCircle"/>
    <img-button label="Half Plane" :src="halfPlaneUrl"
                width="128px" height="128px" @click.native="addHalfPlane"/>
    <img-button label="Two Circles" :src="twoCirclesUrl"
                width="128px" height="128px" @click.native="addTwoCircles"/>
    <img-button label="Loxodromic" :src="loxodromicUrl"
                width="128px" height="128px"/>
  </div>
</template>

<script>
import ImgButton from './imgButton.vue';
import Vec2 from '../vector2d.js';

const CIRCLE_IMG = require('../img/2dGenerators/circle.png');
const HALF_PLANE_IMG = require('../img/2dGenerators/halfPlane.png');
const TWO_CIRCLES_IMG = require('../img/2dGenerators/twoCircles.png');
const LOXODROMIC_IMG = require('../img/2dGenerators/loxodromic.png');

export default {
    props: ['scene', 'canvas2d'],
    components: { ImgButton },
    data: function() {
        return { 'circleUrl': CIRCLE_IMG,
                 'halfPlaneUrl': HALF_PLANE_IMG,
                 'twoCirclesUrl': TWO_CIRCLES_IMG,
                 'loxodromicUrl': LOXODROMIC_IMG }
    },
    methods: {
        addCircle: function() {
            this.scene.addCircle(new Vec2(0, 0), this.canvas2d.scale);
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        },
        addHalfPlane: function() {
            this.scene.addHalfPlane(new Vec2(0, 0), this.canvas2d.scale);
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        },
        addTwoCircles: function() {
            this.scene.addTwoCircles(new Vec2(0, 0), this.canvas2d.scale);
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
        }
    }
}
</script>

<style>
#generatorPanel2d {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.imgBtn {
    padding: 5px;
}

</style>
