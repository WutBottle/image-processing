<style lang="scss">
  #app {
    
  }
</style>

<template>
  <div id="app">
    App组件
    <p>{{msg}}</p>
    <img src="@/assets/images/bg.jpg" alt="" style="width: 100px;height: 100px">
    <Home></Home>
  </div>
</template>

<script>
  import Home from './components/Home.vue'
  export default {
    name: 'App',
    components: {
      Home,
    },
    data () {
      return {
        msg: 'vue zero config'
      }
    }
  }
</script>
