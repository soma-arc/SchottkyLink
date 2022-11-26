<template>
  <div>
    Origin X
    <b-input
      v-model.number="canvasSeed.corner.x"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Origin Y
    <b-input
      v-model.number="canvasSeed.corner.y"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Width
    <b-input
      v-model.number="canvasSeed.size.x"
      @input="changeWidth"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Height
    <b-input
      v-model.number="canvasSeed.size.y"
      @input="changeHeight"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    <b-checkbox
      v-model="canvasSeed.keepAspect"
      @input="chengeKeepAspectCheck">
       Keep Aspect Ratio
     </b-checkbox><br>
    Texture
    <select size="3" v-model="canvasSeed.textureIndex" id="texturePanel"
             @change="updateSelection" >
      <option v-for="(texture, index) in textureManager.canvasTextures" :value="index">
        {{ texture.filename }}
      </option>
    </select>
    Base 64 URL<br>
    <b-input v-model="textureManager.canvasTextures[canvasSeed.textureIndex].imgUrl"
             type="textarea"
             @input="updateCanvasURL"></b-input>
    <img
      :src="textureManager.canvasTextures[canvasSeed.textureIndex].imgUrl"
      width="256px" height="256px"></img>
  </div>
</template>

<script>
export default {
    props: ['canvasSeed', 'scene', 'canvas', 'textureManager'],
    data() {
        return {}
    },
    methods: {
        valueChanged: function(event) {
            this.scene.reRender();
        },
        updateSelection: function(event) {
            const tex = this.textureManager.textures[this.canvasSeed.textureIndex];
            this.canvasSeed.aspect = tex.height / tex.width;
            this.canvasSeed.update();
            this.scene.updateScene();
            this.scene.reRender();
        },
        changeWidth: function() {
            this.canvasSeed.renderWidth = this.canvasSeed.size.x;
            this.canvasSeed.update();
            this.scene.reRender();
        },
        changeHeight: function(){
            if(this.canvasSeed.keepAspect) {
                this.canvasSeed.renderWidth = this.canvasSeed.size.y / this.canvasSeed.aspect;
            }
            this.canvasSeed.update();
            this.scene.reRender();
        },
        chengeKeepAspectCheck: function() {
            this.canvasSeed.update();
            this.scene.reRender();
        },
        updateCanvasURL: function() {
            console.log('update');
            const promise = this.textureManager.canvasTextures[this.canvasSeed.textureIndex].load(this.canvas.gl);
            promise.then(() => {
                this.canvas.render();
            });
        }
    }
}
</script>

<style>
#texturePanel {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 200px;
    height: 100px;
}
</style>
