<template>
  <div>
    <ui-textbox v-model.number="circle.center.x" label="CenterX"
                type="number" key="input-x" @change="canvas2d.renderCallback"/>
    <ui-textbox v-model.number="circle.center.y" label="CenterY"
                type="number" key="input-y" @change="canvas2d.renderCallback"/>
    <ui-textbox v-model.number="circle.r" label="Radius"
                type="number" key="input-r" @change="canvas2d.renderCallback"/>
  </div>
</template>

<script>
    import UiTextbox from 'keen-ui/lib/UiTextbox';
    export default {
        props: ['circle', 'canvas2d'],
        components: {
            UiTextbox
        }
    }
</script>
