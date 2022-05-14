<template>
  <div class="controlPanel">
    <b-tabs position="is-centered" v-model="activeTab">
      <div id="ccc">
        <b-tab-item label="Component">
          <section id="component">
          </section>
        </b-tab-item>
      </div>
        <b-tab-item label="Scene">
          <section>
          </section>
        </b-tab-item>
        <b-tab-item label="Render">
        </b-tab-item>
      </b-tabs>
  </div>
</template>

<script>
//import Scene from '../scene.js';
export default {
    props: ['scene', 'canvasManager'],
    data: function() {
        return {
        }
    },
    methods: {
        changeMouseMode: function() {
            this.scene.deselectAll();
            this.canvasHandler.render();
        }
    },
    computed: {
        sceneObjectsList: function() {
            return Array.prototype.concat.apply([],
                                                Object.values(this.scene.objects));
        }
    }
}
</script>

<style>
.controlPanel {
    border-style: ridge;
    border-color: gray;

    flex-direction: column;
    width:300px;
    overflow: auto;
}

</style>
