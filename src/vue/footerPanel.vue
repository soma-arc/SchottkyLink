<template>
  <footer>
    <div id="left">
      <a id="ghLink" href="https://github.com/soma-arc/SchottkyLink"
         target="_blank">
          <img src="../img/GitHub-Mark-32px.png" class="imgLink"/>
      </a>
      <a id="prevLink" target="_blank" href="https://youtu.be/s1rtGw-WM_8">Introductory video on YouTube</a>
      <div id="version">Version 3.6.0 </div>
    </div>
    <div>
      Created by soma_arc
    </div>
  </footer>
</template>

<script>
</script>

<style>
footer {
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


#prevLink {
    align-items: center;
    padding-top: 25px;
    padding-right: 0px;
    padding-left: 10px;
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
    padding-top: 25px;
    padding-right: 5px;
    padding-left: 5px;
    padding-bottom: 10px;
    border-right-style: ridge;

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

#left {
    height: 50px;
    display: flex;
}

.imgLink{
    padding: 5px;
}
</style>
