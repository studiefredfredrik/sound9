<template>
  <div id="app" class="app">
    <LogoutButton></LogoutButton>
    <div>
      <div class="main-container">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/data/store'
import LogoutButton from '@/components/LogoutButton'

export default {
    name: 'App',
    components: {LogoutButton},
    mounted() {
      store.commit('setUser')
    }
  }
</script>

<style>
  html{
    /*Avoid scrollbar on x axis when scrollbar on y appear (css fml)*/
    padding: 0px 2px;
    overflow-x: hidden;
    font-family: 'Roboto', sans-serif;
    background-color: #2e6f77;
    background-image: linear-gradient(
      180deg,
      hsl(0, 0%, 0%) 0%,
      hsla(0, 0%, 0%, 0.738) 19%,
      hsla(0, 0%, 0%, 0.541) 34%,
      hsla(0, 0%, 0%, 0.382) 47%,
      hsla(0, 0%, 0%, 0.278) 56.5%,
      hsla(0, 0%, 0%, 0.194) 65%,
      hsla(0, 0%, 0%, 0.126) 73%,
      hsla(0, 0%, 0%, 0.075) 80.2%,
      hsla(0, 0%, 0%, 0.042) 86.1%,
      hsla(0, 0%, 0%, 0.021) 91%,
      hsla(0, 0%, 0%, 0.008) 95.2%,
      hsla(0, 0%, 0%, 0.002) 98.2%,
      hsla(0, 0%, 0%, 0) 100%
    );
    /*background-image: linear-gradient(141deg, #9fb8ad 0%, #1fc8db 51%, #2cb5e8 75%);*/
    height: 100%;
    margin: 0;
    background-repeat: no-repeat;
    background-attachment: fixed;
  }
  .app{
    max-width: 800px;
    margin: auto;
  }

  @media only screen and (min-width: 1000px) {
    html {
      padding: 0px 100px;
      margin: auto;
    }
  }

</style>
