<template>
<div class="renderPanel">
  <section>
    <b-field label="Backgroud Color">
      <b-colorpicker v-model="canvas2d.backgroundColor" :alpha="true" :color-formatter="colorFormatter"
                     @input="colorChanged"/>
    </b-field>
    <b-field label="palette A">
      <b-colorpicker v-model="canvas2d.paletteA" :alpha="true" :color-formatter="colorFormatter"
                     @input="colorChanged"/>
    </b-field>
    <b-field label="palette B">
      <b-colorpicker v-model="canvas2d.paletteB" :alpha="true" :color-formatter="colorFormatter"
                     @input="colorChanged"/>
    </b-field>
    <b-field label="palette C">
      <b-colorpicker v-model="canvas2d.paletteC" :alpha="true" :color-formatter="colorFormatter"
                     @input="colorChanged"/>
    </b-field>
    <b-field label="paletteD">
      <b-colorpicker v-model="canvas2d.paletteD" :alpha="true" :color-formatter="colorFormatter"
                     @input="colorChanged"/>
    </b-field>
    <b-field label="initialValue">
      <b-slider v-model="canvas2d.paletteInitValue"
                @input="colorChanged" :step="0.01" :max="1"/>
    </b-field>
    <b-field label="valueStep">
      <b-slider v-model="canvas2d.paletteStep" @input="colorChanged" :step="0.01" :max="1"/>
</b-field>
</section>
</div>
</template>

<script>
import Color from '../../node_modules/buefy/src/utils/color.js';
export default {
    props: ['scene', 'canvas2d'],
    components: { },
    data: function() {
        return {

            
        }
    },
    methods: {
        colorFormatter (color) {
            return color.toString('rgba');
        },
        colorChanged(event) {
            this.canvas2d.render();
        }
    },
    computed: {
    }
}
</script>

<style>
#renderPanel {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.colorpicker-header {
    display: none;
}
</style>
