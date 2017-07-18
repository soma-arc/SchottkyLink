<template>
  <div id="generatorPanel3d">
    <img-button label="Base Sphere" :src="baseSphereUrl"
                width="128px" height="128px" @click.native="addBaseSphere"/>
    <img-button label="Inversion Sphere" :src="inversionSphereUrl"
                width="128px" height="128px" @click.native="addInversionSphere"/>
    <img-button label="Hyper Plane" :src="hyperPlaneUrl"
                width="128px" height="128px" @click.native="addHyperPlane"/>
    <img-button label="Parallel Planes" :src="parallelPlanesUrl"
                width="128px" height="128px" @click.native="addParallelPlanes"/>
  </div>
</template>

<script>
import ImgButton from './imgButton.vue';

const BASE_SPHERE_IMG = require('../img/3dGenerator/baseSphere.png');
const INVERSION_SPHERE_IMG = require('../img/3dGenerator/inversionSphere.png');
const HYPER_PALNE_IMG = require('../img/3dGenerator/hyperPlane.png');
const PARALLEL_PLANES_IMG = require('../img/3dGenerator/translation.png');

export default {
    props: ['canvasManager'],
    components: { ImgButton },
    data: function() {
        return { 'baseSphereUrl': BASE_SPHERE_IMG,
                 'inversionSphereUrl': INVERSION_SPHERE_IMG,
                 'hyperPlaneUrl': HYPER_PALNE_IMG,
                 'parallelPlanesUrl': PARALLEL_PLANES_IMG }
    },
    methods: {
        addBaseSphere: function() {
            this.canvasManager.scene3d.addBaseSphere();
            this.canvasManager.compile3dCanvases();
        },
        addInversionSphere: function() {
            this.canvasManager.scene3d.addInversionSphere();
            this.canvasManager.compile3dCanvases();
        },
        addHyperPlane: function() {
            this.canvasManager.scene3d.addHyperPlane();
            this.canvasManager.compile3dCanvases();
        },
        addParallelPlanes: function() {
            this.canvasManager.scene3d.addParallelPlanes();
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
