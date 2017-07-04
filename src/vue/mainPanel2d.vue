<template>
  <div class="contentPanel">
    <div class="canvasPanel">
      <div class="canvasParent">
        <canvas id="canvas"></canvas>
      </div>
      <div class="renderPropertyPanel"></div>
    </div>
    <div class="controlPanel"></div>
  </div>
</template>

<script>
    export default {
        props: ['scene'],
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

.controlPanel {
      border-style: ridge;
      border-color: gray;
      background-color: Gainsboro;
      flex-basis: 300px;
      display: flex;
}  
</style>
