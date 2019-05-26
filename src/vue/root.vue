<template>
  <div id="root">
    <header-panel :canvasHandler="canvasHandler"/>
    <middle-panel :scene2d="scene2d" :scene3d="scene3d" :canvasManager="canvasManager" :currentRoute="currentRoute" />
    <footer-panel/>
  </div>
</template>

<script>
import HeaderPanel from './headerPanel.vue';
import MiddlePanel from './middlePanel.vue';
import FooterPanel from './footerPanel.vue';

export default {
    props: ['scene2d', 'scene3d', 'canvasManager', 'currentRoute'],
    components: {
        HeaderPanel, MiddlePanel, FooterPanel
    }
}
</script>

<style>
div {
   -ms-user-select: none; /* IE 10+ */
   -moz-user-select: -moz-none;
   -khtml-user-select: none;
   -webkit-user-select: none;
   user-select: none;
}

#root {
    margin: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
</style>
