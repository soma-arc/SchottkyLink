<template>
  <div class="contentParent">
    <div class="canvasParent">
      <canvas id="canvas3dGen" tabIndex="1001"/><br>
    </div>
    <div class="canvasParent">
      <canvas id="canvas3dOrb" tabIndex="1002"/><br>
    </div>
    <controlPanel3d :scene="scene" :canvasManager="canvasManager"/>
  </div>
</template>

<script>
import ControlPanel3d from './controlPanel3d.vue';

export default {
    components: { ControlPanel3d }
}
</script>

<style>
.contentParent {
    flex: 1;
    display: flex;
    flex-direction: row;
    overflow: hidden;
}

.canvasParent {
    flex: 1;
    display: flex;
    width:100%;
    border-style: ridge;
    border-color: gray;
    overflow: hidden;
}
</style>
