<template>
  <div id="generatorPanel3d">
    <img-button label="Base Sphere" :src="baseSphereUrl"
                width="128px" height="128px" @click.native="addBaseSphere"/>
    <img-button label="Inversion Sphere" :src="inversionSphereUrl"
                width="128px" height="128px" @click.native="addInversionSphere"/>
  </div>
</template>

<script>
import ImgButton from './imgButton.vue';

const BASE_SPHERE_IMG = require('../img/3dGenerator/baseSphere.png');
const INVERSION_SPHERE_IMG = require('../img/3dGenerator/inversionSphere.png');

export default {
    props: ['canvasManager'],
    components: { ImgButton },
    data: function() {
        return { 'baseSphereUrl': BASE_SPHERE_IMG,
                 'inversionSphereUrl': INVERSION_SPHERE_IMG }
    },
    methods: {
        addBaseSphere: function() {
            this.canvasManager.scene3d.addBaseSphere();
            this.canvasManager.compile3dCanvases();
        },
        addInversionSphere: function() {
            this.canvasManager.scene3d.addInversionSphere();
            this.canvasManager.compile3dCanvases();
        }
    }
}
</script>

<style>
#generatorPanel3d {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.imgBtn {
    padding: 5px;
}
</style>
