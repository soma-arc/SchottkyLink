<template>
  <ul id="headerRight">
    <li class="headerButton">
    </li>
  </ul>
</template>

<script>

export default {
    props: ['canvasManager'],
    methods: {
        clearScene() {
            this.canvasManager.clearCurrentScene();
        },
        presetSelected2d(preset) {
            this.canvasManager.scene2d.load(preset);
            this.canvasManager.canvas2d.compileRenderShader();
            this.canvasManager.canvas2d.render();
        },
        presetSelected3d(preset) {
            this.canvasManager.scene3d.load(preset);
            this.canvasManager.canvas3dGen.compileRenderShader();
            this.canvasManager.canvas3dGen.render();
            this.canvasManager.canvas3dOrb.compileRenderShader();
            this.canvasManager.canvas3dOrb.render();
        },
        saveScene() {
            this.canvasManager.saveScene();
        },
        loadScene() {
            this.canvasManager.loadSceneFromFile();
        }
    }
}
</script>

<style>
#headerRight {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    list-style: none;
    height: 100%;
}
.headerButton {
    display: flex;
    align-items: center;
    height: 100%;
    padding-right: 5px;
}
</style>
