<template>
  <div class="controlPanel">
    <ui-tabs fullwidth id="tabs">
      <ui-tab title="Generator" id="tab-1">
        <generator-panel3d v-bind:canvasManager="canvasManager" />
      </ui-tab>
      <ui-tab title="Scene" id="tab-2">
      </ui-tab>
    </ui-tabs>
  </div>
</template>

<script>
import UiTabs from 'keen-ui/lib/UiTabs';
import UiTab from 'keen-ui/lib/UiTab';
import GeneratorPanel3d from './generatorPanel3d.vue';

export default {
    props: ['canvasManager'],
    components: {
        UiTabs,
        UiTab,
        GeneratorPanel3d
    }
}
</script>

<style>
.controlPanel {
    border-style: ridge;
    border-color: gray;
    background-color: Gainsboro;
    flex-basis: 300px;
    display: flex;
    flex-direction: column;
}

.objList {
    padding-left: 20px;
    width: 200px;
    height: 100px;
}

ui-tabs__header-items {
    margin: 0;
    display: flex;
    flex-direction: column;
    width: 300px;
}

.ui-tabs {
    padding: 0;
    margin:0;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.ui-tabs__body {
    flex:1;
    margin:0;
    padding:0;
    overflow-y: auto;
    align-items: center;
}

.ui-tab {
    padding-top: 20px;
    flex:1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

</style>
