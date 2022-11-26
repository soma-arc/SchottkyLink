<template>
  <div>
    Origin X
    <b-input
      v-model.number="textureSeed.corner.x"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Origin Y
    <b-input
      v-model.number="textureSeed.corner.y"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Width
    <b-input
      v-model.number="textureSeed.size.x"
      @input="changeWidth"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Height
    <b-input
      v-model.number="textureSeed.size.y"
      @input="changeHeight"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    <b-checkbox
      v-model="textureSeed.keepAspect"
      @input="chengeKeepAspectCheck">
       Keep Aspect Ratio
     </b-checkbox><br>
    Texture
    <select size="3" v-model="textureSeed.textureIndex" id="texturePanel"
             @change="updateSelection" >
      <option v-for="(texture, index) in textureManager.textures" :value="index">
        {{ texture.filename }}
      </option>
    </select>
    <b-button type="is-primary" @click="loadTexture">
      Load Texture
    </b-button>
    <img
         :src="selectedTexture"
         width="256px" height="256px"></img>
  </div>
</template>

<script>
export default {
    props: ['textureSeed', 'scene', 'canvas', 'textureManager'],
    data() {
        return {}
    },
    methods: {
        valueChanged: function(event) {
            this.scene.reRender();
        },
        updateSelection: function(event) {
            const tex = this.textureManager.textures[this.textureSeed.textureIndex];
            this.textureSeed.aspect = tex.height / tex.width;
            this.textureSeed.update();
            this.scene.updateScene();
            this.scene.reRender();
        },
        loadTexture: function(event) {
            if(this.textureManager.textures.length === this.textureManager.MAX_TEXTURES) {
                alert('読み込めるテクスチャは10個までです.');
                return;
            }

            this.textureManager.loadTextureFromDialogue(this.canvas.gl,
                                                        this.scene,
                                                        this.textureSeed);
        },
        changeWidth: function() {
            this.textureSeed.renderWidth = this.textureSeed.size.x;
            this.textureSeed.update();
            this.scene.reRender();
        },
        changeHeight: function(){
            if(this.textureSeed.keepAspect) {
                this.textureSeed.renderWidth = this.textureSeed.size.y / this.textureSeed.aspect;
            }
            this.textureSeed.update();
            this.scene.reRender();
        },
        chengeKeepAspectCheck: function() {
            this.textureSeed.update();
            this.scene.reRender();
        }
    },
    computed: {
        selectedTexture: function() {
            return this.textureManager.textures[this.textureSeed.textureIndex].imgUrl;
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
