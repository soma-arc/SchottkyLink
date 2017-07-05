<template>
  <div class="imgBtn" >
    <img id="btnImg" :src="src" :width="width" :height="height">
    <a id="imgBtnLabel">{{ label }}</a>
  </div>
</template>

<script>
export default {
    props: ['label', 'src', 'width', 'height']
}
</script>

<style>
.imgBtn {
    flex:1;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 200px;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default;
}

.imgBtn:hover { background-color:silver; }

#btnImg {
    flex:1;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default;
}

#imgBtnLabel {
    flex:1;
    padding-top: 5px;
    align-items: center;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default;
}

</style>
