<template>
  <header>
    <ul class="headerLeft">
      <div class="header-buttons">
        <li class="button-elem">
          <v-link class="v-link-button" href="/">SchottkyLink</v-link>
        </li>
      </div>
    </ul>
    <header-menu :canvasManager="canvasManager"/>
  </header>
</template>

<script>
import VLink from './vLink.vue'
import HeaderMenu from './headerMenu.vue'

export default {
    props: ['canvasManager'],
    components: {
        VLink,
        HeaderMenu
    }
}
</script>

<style>
header {
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

.header-buttons {
    text-align: center;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.button-elem {
    list-style:none;
    margin: 0px 10px 0px 10px;
}

.v-link-button {
    display: block;
}

</style>
