<template>
  <footer>
    <div id="left">
      <a id="ghLink" href="https://github.com/soma-arc/SchottkyLink"
         target="_blank">
          <img src="../img/GitHub-Mark-32px.png" class="imgLink"/>
      </a>
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

#left {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
