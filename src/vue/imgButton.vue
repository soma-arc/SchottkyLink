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
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default;
}

.imgBtn:hover { background-color:silver; }

#btnImg {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default;
}

#imgBtnLabel {
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
