<template>
  <div id="body">
    <header class="header">
      <ul class="headerLeft">
        <li class="myBtn"><a class="btnLink" href="/">SchottkyLink</a></li>
        <li class="myBtn"><a class="btnLink" href="/2d">2D</a></li>
        <li class="myBtn"><a class="btnLink" href="/3d">3D</a></li>
      </ul>
      <header-menu-2d :scene="canvasManager.scene2d"
                      :canvas2d="canvasManager.canvas2d"/>
    </header>
    <main-panel-2d :scene="canvasManager.scene2d"
                   :canvas2d="canvasManager.canvas2d"/>
    <footer class="footer">
      <a id="ghLink" href="https://github.com/soma-arc/SchottkyLink"
         target="_blank">
        <img src="../img/GitHub-Mark-32px.png" class="imgLink"/>
      </a>
      <div>
        Created by soma_arc
      </div>
    </footer>
  </div>
</template>

<script>
    import MainPanel2D from './mainPanel2d.vue';
import HeaderMenu2D from './headerMenu2d.vue';

export default {
    props: ['canvasManager'],
    data: function() {
        return {
            currentRoute: window.location.pathname
        }
    },
    components: { 'main-panel-2d': MainPanel2D,
                  'header-menu-2d': HeaderMenu2D }
}

</script>

<style>

html {
    height: 100%;
    font-family: "Times New Roman";
}

#body {
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
    height: 100%;
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

</style>
