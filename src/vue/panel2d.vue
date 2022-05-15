<template>
<div class="contentParent">
  <div class="canvasPanel">
    <div class="canvasParent">
      <canvas id="canvas2d" tabIndex="1000"/><br>
    </div>
    <underControlPanel2d :scene2d="scene2d" :canvasManager="canvasManager"/>
  </div>
  <controlPanel2d :scene2d="scene2d" :canvasManager="canvasManager"/>
</div>
</template>

<script>
import ControlPanel2d from './controlPanel2d.vue';
import UnderControlPanel2d from './underControlPanel2d.vue';

export default {
    props: ['scene2d', 'canvasManager'],
    components: { ControlPanel2d, UnderControlPanel2d }
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
    border-style: ridge;
    border-color: gray;
}

#canvas2d {
    width: 100%;
    height: 100%;
    cursor: crosshair;
}

.canvasPanel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

underControlPanel2d {
    flex-basis: 50px;
    display: flex;
    flex-direction: row;
}
</style>
