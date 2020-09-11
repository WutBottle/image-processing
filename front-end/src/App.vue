<style lang="scss">
  html {
    overflow: hidden;

    body {
      overflow: hidden;
      background: #555555;
    }
  }
</style>

<template>
  <div id="app">
    <Home></Home>
  </div>
</template>

<script>
  import Home from '@pages/Home.vue'

  export default {
    name: 'App',
    components: {
      Home,
    },
  }
</script>
