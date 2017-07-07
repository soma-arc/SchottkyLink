<template>
  <ul id="headerRight">
    <li class="headerButton">
      <ui-button type="secondary" raised color="primary"
                 open-dropdown-on="hover" has-dropdown ref="dropdownButton">
        <ui-menu slot="dropdown" :options="scene.presets"
                 @select="presetSelected"
                 @close="$refs.dropdownButton.closeDropdown()"/>
        Load Preset
      </ui-button>
    </li>
  </ul>
</template>

<script>
import UiMenu from 'keen-ui/lib/UiMenu';
import UiButton from 'keen-ui/lib/UiButton';
export default {
    props: ['scene', 'canvas2d'],
    components: {
        UiButton,
        UiMenu
    },
    methods: {
        presetSelected(preset) {
            this.scene.load(preset);
            this.canvas2d.compileRenderShader();
            this.canvas2d.render();
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
