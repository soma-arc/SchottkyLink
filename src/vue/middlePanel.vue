<template>
  <keep-alive>
    <transition name="component-fade" mode="out-in">
      <component v-bind:is="viewComponent"
                 :scene2d="scene2d" :scene3d="scene3d" :canvasManager="canvasManager"></component>
    </transition>
  </keep-alive>
</template>

<script>
import Panel2d from './panel2d.vue';
import Panel3d from './panel3d.vue';
import Routes from './routes.js';

export default {
    props: ['scene2d', 'scene3d', 'canvasManager', 'currentRoute'],
    methods: {
        render: function() {
            this.canvasManager.render();
        },
    },
    components: {
        Panel2d,
        Panel3d
    },
    data: function() {
        return {
        }
    },
    computed: {
        viewComponent: function() {
            return Routes[this.currentRoute];
        }
    }
}
</script>

<style>
.component-fade-enter-active, .component-fade-leave-active {
  transition: opacity .2s ease;
}

.component-fade-enter, .component-fade-leave-to
/* .component-fade-leave-active for below version 2.1.8 */ {
  opacity: 0;
}

Panel2d {
    width: 100%;
}

</style>
