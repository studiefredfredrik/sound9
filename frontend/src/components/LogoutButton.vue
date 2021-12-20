<template>
  <div>
    <div class="logout-button-container" v-if="!buttonShouldBeHidden" @click="doAction" >

      <div class="content-holder">
        <div class="top-text">
          <div v-if="isAdmin && !isOnAdminPage">
            <img src="../../public/settings-icon.svg" class="icon"/>
          </div>
          <div v-else>
            <img src="../../public/close-icon.svg" class="icon"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/data/store'

export default {
  name: "BassBooster",
  methods: {
    async doAction() {
      if(this.isAdmin && !this.isOnAdminPage){
        await this.$router.push({name : 'Admin'})
        return
      }
      await this.$axios.delete('/api/login')
      store.commit('setUser')
      await this.$router.push({name : 'Login'})
    },
  },
  computed: {
    isAdmin(){
      if(!store.state.user || !store.state.user.roles) return false
      return store.state.user.roles.some(x => x === 'admin')
    },
    isOnAdminPage(){
      return this.$route.name === 'Admin'
    },
    buttonShouldBeHidden(){
      return this.$route.name === 'Login'
    }
  }
}
</script>

<style scoped>
.logout-button-container{
  padding: 8px;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1500;
  cursor: pointer;
}
.icon{
  height: 35px;
}
.state-holder{
  margin-left: 5px;
  font-size: 16px;
  /*font-weight: bolder;*/
}
.admin{
  color: green;
}
.top-text{
  font-size: 12px;
  font-style: italic;
}

@media only screen and (max-width: 992px) {

}
</style>
