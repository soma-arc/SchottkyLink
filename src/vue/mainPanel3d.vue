<template>
  <div class="contentPanel">
    <div class="canvasPanel">
      <div class="canvasParent">
        <canvas id="canvas3dGen" tabIndex="1001"></canvas>
      </div>
      <div class="renderPropertyPanel"></div>
    </div>
    <div class="canvasPanel">
      <div class="canvasParent">
        <canvas id="canvas3dOrb" tabIndex="1002"></canvas>
      </div>
      <div class="renderPropertyPanel">
        <ui-switch label="lowRes"
                   v-model="canvasManager.canvas3dOrb.isRenderingLowRes"/>
      </div>
    </div>
    <control-panel3d v-bind:canvasManager="canvasManager"/>
  </div>
</template>

<script>
    import ControlPanel3d from './controlPanel3d.vue';
import UiSwitch from 'keen-ui/lib/UiSwitch';

export default {
    props: ['canvasManager'],
    components: { ControlPanel3d,
                  UiSwitch }
}
</script>

<style>
.contentPanel {
    flex: 1;
    display: flex;
}

.canvasParent {
    flex: 1;
    display: flex;
}

#canvas3dOrb #canvas3dGen {
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
