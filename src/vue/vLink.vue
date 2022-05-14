<template>
  <a
    v-bind:href="href"
    v-bind:class="{ active: isActive }"
    v-on:click="go"
    class="link"
    v-bind:style="textColor"
  >
    <slot></slot>
  </a>
</template>

<script>
import routes from './routes.js'
export default {
    props: {
        href: {
            type: String,
            required: true
        }
    },
    computed: {
        isActive () {
            return this.href === this.$root.currentRoute
        },
        textColor () {
            if (this.isActive) {
                 return {
                     color: 'black',
                     opacity: 1
                 };
            }
        }
    },
    methods: {
        go (event) {
            event.preventDefault()
            this.$root.currentRoute = this.href
            window.history.pushState(
                null,
                routes[this.href],
                this.href
            )
        }
    }
}
</script>

<style>
.link {
    color: black;
    text-decoration: none;
    
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default;

    padding-left: 5px;
    padding-right: 5px;
    
}

.link:hover {
    cursor:pointer;
}

.link:visited {
    color: black;
}


</style>
