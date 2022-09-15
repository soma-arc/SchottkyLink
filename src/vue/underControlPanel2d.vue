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
      step="0.01">
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
import { ToastProgrammatic as Toast } from 'buefy'
import SelectionState from '../generator2d/selectionState.js';

export default {
    props: ['scene2d', 'canvasManager'],
    methods: {
        fetchUpload(url, body, successCallback, errorCallback) {
            fetch(url, {
                method: 'POST',
                body: body,
                mode: 'cors',
                redirect: 'follow',
            }).then(r => r.json())
                .then(j => {
                    if (successCallback) {
                        successCallback(j);
                    }
                }).catch(e => {
                    if (errorCallback) {
                        errorCallback(e);
                    } else {
                        console.error(e);
                    }
                });
        },
        tweet: function(event) {
            const UPLOAD_URL = 'https://script.google.com/a/tessellation.jp/macros/s/AKfycbxvOHV4YIuHy8mzDx0cCNnxG_g24I1WaL11aV-0nEAgkO_WDjGS2iN5nf_HWl3DxxNOHQ/exec';
            const formData = new FormData();
            const canvasDataURL = this.canvasManager.canvas2d.renderAndGetCanvasURL();
            formData.append('filename', (new Date()).getTime()+'.png');
            formData.append('type', 'image/png');
            formData.append('content', canvasDataURL.replace(/^data:image\/png;base64,/,''));
            Toast.open({message: 'Uploading image ...',
                        position: 'is-bottom'});
            this.fetchUpload(UPLOAD_URL, formData,
                             (json) => {
                                 const fileURL = 'https://drive.google.com/file/d/' + json.id + '/view';
                                 const array = [fileURL, '#SchottkyLink'];
                                 const tweet = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(array.join('\n'));
                                 window.open(tweet);
                             },
                             (error) => {
                                 alert('Error: '+ error);
                             });
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
        resetGenerators: function() {
            this.canvasManager.canvas2d.reloadParameter();
            this.scene2d.reloadParameter();
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
