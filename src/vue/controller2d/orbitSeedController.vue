<template>
  <div>
    posX
    <b-input
      v-model.number="orbitSeed.corner.x"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    posY
    <b-input
      v-model.number="orbitSeed.corner.y"
      @input="valueChanged"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    width
    <b-input
      v-model.number="orbitSeed.size.x"
      @input="changeWidth"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    height
    <b-input
      v-model.number="orbitSeed.size.y"
      @input="changeHeight"
      placeholder="Number"
      type="number"
      step="0.01">
    </b-input>
    Texture
    <select size="3" v-model="orbitSeed.textureIndex" id="texturePanel"
             @change="updateSelection" >
      <option v-for="(texture, index) in textureManager.textures" :value="index">
        {{ texture.filename }}
      </option>
    </select>
    <b-button type="is-primary" @click="loadTexture">
      Load Texture
    </b-button>
    <img
         :src="orbitTexture"
         width="256px" height="256px"></img>
  </div>
</template>

<script>
export default {
    props: ['orbitSeed', 'scene', 'canvas', 'textureManager'],
    data() {
        return {}
    },
    methods: {
        valueChanged: function(event) {
            this.scene.reRender();
        },
        updateSelection: function(event) {
            const tex = this.textureManager.textures[this.orbitSeed.textureIndex];
            this.orbitSeed.originalSize.x = tex.width;
            this.orbitSeed.originalSize.y = tex.height;
            this.orbitSeed.update();
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
                                                        this.orbitSeed);
        },
        changeWidth: function() {
            this.orbitSeed.renderWidth = this.orbitSeed.size.x;
            this.orbitSeed.update();
            this.scene.reRender();
        },
        changeHeight: function(){
            this.orbitSeed.renderWidth = this.orbitSeed.size.y / this.orbitSeed.aspect;
            this.orbitSeed.update();
            this.scene.reRender();
        }
    },
    computed: {
        orbitTexture: function() {
            return this.textureManager.textures[this.orbitSeed.textureIndex].imgUrl;
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
