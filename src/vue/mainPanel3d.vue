<template>
  <div class="contentPanel">
    <div class="canvasPanel">
      <div class="canvasParent">
        <canvas id="canvas2"></canvas>
      </div>
      <div class="renderPropertyPanel"></div>
    </div>
    <div class="canvasPanel">
      <div class="canvasParent">
        <canvas id="canvas3"></canvas>
      </div>
      <div class="renderPropertyPanel"></div>
    </div>
    <control-panel3d/>
  </div>
</template>

<script>
    import ControlPanel3d from './controlPanel3d.vue';

export default {
    props: ['canvasManager'],
    components: { ControlPanel3d }
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
