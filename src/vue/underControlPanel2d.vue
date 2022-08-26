<template>
<div class="underControlPanel">
  <span class="parameterLabel">scale</span>
  <div class="inputContainer">
    <b-input 
      v-model.number="canvasManager.canvas2d.scale"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
  </div>
    <span class="parameterLabel">translate X</span>
  <div class="inputContainer">
    <b-input 
      v-model.number="canvasManager.canvas2d.translate.x"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
  </div>
  <span class="parameterLabel">translate Y</span>
  <div class="inputContainer">
    <b-input 
      v-model.number="canvasManager.canvas2d.translate.y"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
  </div>
  <div class="inputContainer">
    <b-button type="is-primary" @click="saveImage">
      save
    </b-button>
  </div>
  <div class="inputContainer">
    <b-button type="is-primary" @click="clearGenerators">
      Clear
    </b-button>
  </div>
  <div class="inputContainer">
    <b-button type="is-primary" @click="saveSceneAsURL">
      Save URL
    </b-button>
  </div>
</div>
</template>

<script>
import { ToastProgrammatic as Toast } from 'buefy'

export default {
    props: ['scene2d', 'canvasManager'],
    methods: {
        valueChanged: function(event) {
            this.canvasManager.canvas2d.render();
        },
        saveImage: function(event) {
            this.canvasManager.canvas2d.renderProductAndSave();
        },
        clearGenerators: function() {
            this.scene2d.removeAllGenerators();
        },
        saveSceneAsURL: function() {
            this.scene2d.copyToClipboard();
            Toast.open({message: 'URL of the scene is copied to clipboard.',
                        position: 'is-bottom'});
        }
    }
}
</script>

<style>
.underControlPanel {
    flex-basis: 50px;
    border-style: ridge;
    border-color: gray;
    display: flex;
    flex-direction: row;
}

.inputContainer {
    padding-top: 3px;
    margin-right: 5px;
    margin-left: 0px;
    width: 70px;
}
</style>
