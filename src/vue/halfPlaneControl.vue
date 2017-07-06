<template>
  <div>
    <ui-textbox v-model.number="halfPlane.p.x" label="CenterX"
                type="number" key="p-x" @change="canvas2d.renderCallback"/>
    <ui-textbox v-model.number="halfPlane.p.y" label="CenterY"
                type="number" key="p-y" @change="canvas2d.renderCallback"/>
    <a id="hplabel">Angle</a>
    <ui-slider id="angleSlider" v-model.number="halfPlane.normalAngle"
               type="number" key="h-n" @change="update"/>
  </div>
</template>

<script>
    import UiTextbox from 'keen-ui/lib/UiTextbox';
import UiSlider from 'keen-ui/lib/UiSlider';
    import Vec2 from '../vector2d.js';
    export default {
        props: ['halfPlane', 'canvas2d'],
        components: {
            UiTextbox,
            UiSlider
        },
        methods: {
            update: function() {
                let angle = 2 * Math.PI * this.halfPlane.normalAngle / 100;
                angle = Math.max(0, Math.min(angle, 2 * Math.PI));
                this.halfPlane.normal = new Vec2(Math.cos(angle), Math.sin(angle))
                this.halfPlane.update();
                this.canvas2d.renderCallback();
            }
        }
    }
</script>

<style>
#hplabel {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default
}

#angleSlider {
    padding-top: 10px;
}
</style>
