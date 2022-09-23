<template>
<div class="renderPanel">
  <section>
  <b-field label="Backgroud Color">
    <b-colorpicker v-model="selectedColor" :alpha="true" :color-formatter="colorFormatter"
                   @input="colorChanged"/>
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
            this.canvas2d.backgroundColor = [this.selectedColor.red / 255,
                                             this.selectedColor.green / 255,
                                             this.selectedColor.blue / 255,
                                             this.selectedColor.alpha / 255];
            this.canvas2d.render();
        }
    },
    computed: {
        selectedColor: function() {
            const r = this.canvas2d.backgroundColor[0] * 255;
            const g = this.canvas2d.backgroundColor[1] * 255;
            const b = this.canvas2d.backgroundColor[2] * 255;
            const a = this.canvas2d.backgroundColor[3];
            return Color.parse(`rgba(${r},${g},${b},${a})`);
        }
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
