<template>
  <div class="contentPanel">
    <div class="canvasPanel">
      <div class="canvasParent">
        <canvas id="canvas" tabIndex="1000"></canvas>
      </div>
      <div class="renderPropertyPanel">
        <ui-switch label="renderGen"
                   v-model="canvasManager.canvas2d.isRenderingGenerator"
                   @change="renderCanvas"
                   checked="true"/>
      </div>
    </div>
    <control-panel2d v-bind:scene="canvasManager.scene2d"
                     v-bind:canvas2d="canvasManager.canvas2d"/>
  </div>
</template>

<script>
    import ControlPanel2d from './controlPanel2d.vue';
import UiSwitch from 'keen-ui/lib/UiSwitch';

export default {
    props: ['canvasManager'],
    components: { ControlPanel2d,
                  UiSwitch },
    methods: {
        renderCanvas: function() {
            this.canvasManager.canvas2d.render();
        }
    }
}
</script>

<style>
.contentPanel {
    flex: 1;
    display: flex;
    flex-direction: row;
    overflow: hidden;
}

.canvasParent {
    flex: 1;
    display: flex;
}

#canvas {
    width: 100%;
    height: 100%;
    cursor: crosshair;
}

.renderPropertyPanel{
    height: 50px;

    background-color: white;
    border-top: ridge;
    border-color: gray;
    display: flex;
    align-items: center;
    padding-left: 5px;
}

.canvasPanel {
    border-style: ridge;
    border-color: gray;
    background-color: gray;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

</style>
