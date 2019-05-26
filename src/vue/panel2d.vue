<template>
  <div class="contentParent">
    <div class="canvasParent">
      <canvas id="canvas2d" tabIndex="1000"/><br>
    </div>
    <controlPanel2d :scene2d="scene2d" :canvasManager="canvasManager"/>
  </div>
</template>

<script>
import ControlPanel2d from './controlPanel2d.vue';

export default {
    props: ['scene2d', 'canvasManager'],
    components: { ControlPanel2d }
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
