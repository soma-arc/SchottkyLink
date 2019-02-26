<template>
  <div>
    <ui-textbox v-model.number="canvas2d.productRenderResolution.x"
                label="width" type="number"/>
    <ui-textbox v-model.number="canvas2d.productRenderResolution.y"
                label="height" type="number"/>
    <ui-button id="renderButton" type="secondary" raised color="primary"
               @click="renderAndSave">Render</ui-button>
  </div>
</template>

<script>
    import UiTextbox from 'keen-ui/lib/UiTextbox';
import UiButton from 'keen-ui/lib/UiButton';
export default {
    props: ['canvas2d'],
    components: {
        UiTextbox,
        UiButton
    },
    methods: {
        renderAndSave: function() {
            this.canvas2d.renderProductAndSave();
        }
    }
}
</script>

<style>

</style>
