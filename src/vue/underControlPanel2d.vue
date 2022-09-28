<template>
<div class="underControlPanel">
  <span class="parameterLabel">scale</span>
  <div class="inputContainer">
    <b-input
      v-model.number="canvasManager.canvas2d.scale"
      style="width:70px;"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01"
      min="canvasManager.canvas2d.scaleMin"
      max="canvasManager.canavs2d.scaleMax">
    </b-input>
  </div>
  <span class="parameterLabel">translate X</span>
  <div class="inputContainer">
    <b-input
      v-model.number="canvasManager.canvas2d.translate.x"
      style="width:70px;"
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
      style="width:70px;"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
  </div>
  <span class="parameterLabel">Max Iterations</span>
  <div class="inputContainer">
    <b-input
      v-model.number="canvasManager.canvas2d.maxIterations"
      style="width:70px;"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="1"
      min="0">
    </b-input>
  </div>
  <div class="inputContainer">
    <b-button type="is-primary" @click="tweet">
      Tweet
    </b-button>
  </div>
  <div class="inputContainer">
    <b-button type="is-primary" @click="saveImage">
      Save
    </b-button>
  </div>
  <div class="inputContainer">
    <b-button type="is-primary" @click="clearGenerators">
      Clear
    </b-button>
  </div>
    <div class="inputContainer">
    <b-button type="is-primary" @click="resetGenerators">
      Reset
    </b-button>
  </div>
  <div class="inputContainer">
    <b-button type="is-primary" @click="saveSceneAsURL">
      Copy URL
    </b-button>
  </div>
  <div class="inputContainer">
    <b-switch v-model="scene2d.isRenderingGenerator"
              @input="toggleRenderGenerator"
              id="renderGenSwitch">
      Render Generator
    </b-switch>
  </div>
</div>
</template>

<script>
import { ToastProgrammatic as Toast } from 'buefy';
import SelectionState from '../generator2d/selectionState.js';

export default {
    props: ['scene2d', 'canvasManager'],
    methods: {
        tweet: function(event) {
            this.canvasManager.saveImageAndTweet();
        },
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
            navigator.clipboard.writeText(this.canvasManager.canvas2d.exportAsQueryString()).then(() => {
                console.log('Text copied to clipboard...');
                Toast.open({message: 'URL of the scene is copied to clipboard.',
                            position: 'is-bottom'})
            }).catch(err => {
                console.log('Something went wrong', err);
            });
        },
        resetGenerators: async function() {
            this.canvasManager.canvas2d.reloadParameter();
            this.scene2d.reloadParameter();
            this.canvasManager.textureManager.canvasTextures[0].imgUrl = this.canvasManager.textureManager.getDefaultCanvasURL();
            await this.canvasManager.textureManager.canvasTextures[0].load(this.canvasManager.canvas2d.gl);
            this.canvasManager.canvas2d.compileRenderShader();
            this.canvasManager.canvas2d.render();
        },
        toggleRenderGenerator: function() {
            if(this.scene2d.selectedObj !== undefined &&
               this.scene2d.selectedObj.name !== 'OrbitSeed' &&
               this.scene2d.selectedObj.name !== 'VideoOrbit') {
                this.scene2d.selectedObj.selected = false;
                this.scene2d.selectedState = new SelectionState();
                this.scene2d.selectedObj = undefined;
            }
            this.canvasManager.canvas2d.render();
        }
    },
    computed: {
        display: function() {
            return this.canvasManager.displayMode !== 'iframe';
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
}

#renderGenSwitch {
    margin-left: 40px;
}
</style>
