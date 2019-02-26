<template>
  <div class="contentParent">
    <div class="canvasParent">
      <canvas id="canvas2d" tabIndex="1000"/><br>
    </div>
    <controlPanel :scene="scene" :canvasManager="canvasManager"/>
  </div>
</template>

<script>
import ControlPanel from './controlPanel.vue';

export default {
    props: ['scene', 'canvasManager'],
    components: { ControlPanel }
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
