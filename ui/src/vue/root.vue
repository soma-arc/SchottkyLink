<template>
<div id="root">
  <div width="512" height="512">
    <canvas id="canvas" width="512" height="512"></canvas>
  </div>
</div>
</template>

<script>
export default {
    props: ['canvas', 'scene', 'renderer'],
}
</script>

<style>
</style>
