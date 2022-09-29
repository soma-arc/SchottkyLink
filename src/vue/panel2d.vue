<template>
<div class="contentParent">
  <div class="canvasPanel">
    <div class="canvasParent" >
      <canvas id="canvas2d" width="200" tabIndex="1000" v-bind:class="[ mode, canvasManager.canvas2d.cursorType ]"/><br>
    </div>
    <underControlPanel2d :scene2d="scene2d" :canvasManager="canvasManager" v-if="display"/>
  </div>
  <controlPanel2d :scene2d="scene2d" :canvasManager="canvasManager" v-if="display"/>
</div>
</template>

<script>
import ControlPanel2d from './controlPanel2d.vue';
import UnderControlPanel2d from './underControlPanel2d.vue';

export default {
    props: ['scene2d', 'canvasManager'],
    components: { ControlPanel2d, UnderControlPanel2d },
    computed: {
        display: function() {
            return this.canvasManager.displayMode !== 'iframe';
        },
        mode: function() {
            return this.display ? 'defaultMode' : 'iframeMode';
        }
    }
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
}

#canvas2d {
    width: 100%;
    height: 100%;
    border-style: ridge;
    border-color: gray;
    outline: none;
}

.defaultMode {
    border-style: ridge;
    border-color: gray
}

.iframeMode {
    border:0;
    border-style: none;
}

.canvasPanel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.crosshair {
    cursor: crosshair;
}

.allScroll {
    cursor: all-scroll;
}

.grab {
    cursor: grab;
}

.grabbing {
    cursor: grabbing;
}

underControlPanel2d {
    flex-basis: 50px;
    display: flex;
    flex-direction: row;
}
</style>
