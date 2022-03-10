<template>
  <div id="root">
    <header class="header">
      <ul class="headerLeft">
        <li class="myBtn"><a class="btnLink">SchottkyLink</a></li>
        <li class="myBtn" @click="switchTo2d"><a class="btnLink">2D</a></li>
        <li class="myBtn" @click="switchTo3d"><a class="btnLink">3D</a></li>
      </ul>
      <header-menu :canvasManager="canvasManager"/>
    </header>
    <main-panel-2d v-show="canvasManager.isRendering2d"
                   :canvasManager="canvasManager"
                   :cameraManager="cameraManager"/>
    <main-panel-3d v-show="canvasManager.isRendering3d"
                   :canvasManager="canvasManager"/>
    <footer class="footer">
      <div id="left">
        <a id="ghLink" href="https://github.com/soma-arc/SchottkyLink"
           target="_blank">
          <img src="../img/GitHub-Mark-32px.png" class="imgLink"/>
        </a>
        <a id="prevLink" href="./old/index.html"
           target="_blank">
          Previous Version
        </a>
        <a id="prevLink" target="_blank" href="https://youtu.be/s1rtGw-WM_8">Introductory video on YouTube</a>
        <a id="version">Version 2.0.0 </a>
      </div>
      <div>
        Created by soma_arc
      </div>
    </footer>
  </div>
</template>

<script>
     import MainPanel2D from './mainPanel2d.vue';
     import MainPanel3D from './mainPanel3d.vue';
     import HeaderMenu from './headerMenu.vue';

     export default {
         props: ['canvasManager', 'cameraManager'],
         data: function() {
             return {
                 currentRoute: window.location.pathname
             }
         },
         components: { 'main-panel-2d': MainPanel2D,
                       'main-panel-3d': MainPanel3D,
                       HeaderMenu },
         methods: {
             switchTo2d: function() {
                 this.canvasManager.switch2d();
             },
             switchTo3d: function() {
                 this.canvasManager.switch3d();
             }
         }
}

</script>

<style>

#root {
    font-family: "Times New Roman";
    margin: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.headerLeft {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;

    list-style: none;

}

.myBtn {
    display: flex;
    align-items: center;
    height: 100%;
    border-right-style: ridge;
    border-right-color: gray;
}

.btnLink {
    margin-top: 10px;
    padding-left: 10px;
    padding-right: 10px;
    height: 100%;
}

.myBtn:hover{
    background-color: PaleTurquoise;
}

a {
    text-decoration: none;
}
a:link   {color:#000000;}
a:visited{color:#000000;}
a:hover  {color:#000000;}
a:active {color:#000000;}

.mainPanel {
    flex: 1;
    display: flex;
}

.header {
    border-style: ridge;
    border-color: gray;
    
    overflow:hidden;
    font-size: 2rem;

    height: 50px;
    background-color: Azure;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default
}

.footer {
    border-style: ridge;
    border-color: gray;
    height: 50px;
    background-color: Azure;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 0.9rem;

    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default;
}

.imgLink{
    padding: 10px;
}

#ghLink {
    height: 50px;
}

#prevLink {
    align-items: center;
    padding-top: 20px;
    padding-right: 5px;
    padding-left: 5px;
    border-right-style: ridge;
    border-left-style: ridge;
    border-right-color: gray;
    border-left-color: gray;
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default;
}

#version {
    align-items: center;
    padding-top: 20px;
    padding-right: 5px;
    padding-left: 5px;
    border-right-style: ridge;
    border-left-style: ridge;
    border-right-color: gray;
    border-left-color: gray;
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default;
}

#prevLink:hover{
    background-color: PaleTurquoise;
}


#left {
    height: 50px;
    display: flex;
}

main-panel-2d {
   height: 100%;
}

</style>
