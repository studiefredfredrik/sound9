<template>
    <div class="container max">
      <div class="tab headline fas fa-list" @click="changePlaylist()">
        {{currentPlaylist.name}}
      </div>

      <div v-if="isAdminOrWriteAccess" class="tab fas fa-upload" @click="navigateToUploader()"></div>
      <div v-if="isAdminOrWriteAccess" class="tab fas fa-edit" @click="enterEditMode()"></div>

      <div class="tab download">
        <a :href="currentFile.url" download class="download-link tab">
          <i class="fas fa-download"></i>
        </a>
      </div>
      <div class="tab fas fa-search" @click="searchClick()"></div>
      <div class="tab fas fa-heart" @click="addToFavorites()"></div>
    </div>
</template>

<script>
import axios from 'axios';
import store from '@/data/store'

export default {
  name: "Footer",
  data() {
    return {
      showVisualizer: true,
      stickyFooter: false,
      offset: null,
      scrolled: false,
      editMode: false
    }
  },
  computed:{
    currentPlaylist: function() {
      return store.state.currentPlaylist
    },
    currentFile () {
      return store.state.currentFile
    },
    isAdminOrWriteAccess(){
      if(!store.state.user || !store.state.user.roles) return false
      return store.state.user.roles.some(x => x === 'admin')
    },
  },
  methods: {
    searchClick(){
      this.$emit('search-click')
    },
    addToFavorites(){
      this.$emit('add-to-favorites')
    },
    changePlaylist(){
      this.$emit('playlist-changed')
    },
    enterEditMode(){
      this.$emit('toggle-edit-mode')
    },
    navigateToUploader(){
      this.$router.push('Upload')
    },
  },
}
</script>

<style scoped>
  .max{
    width: 100%;
  }
  .container{
    background-color: #f1f3f4;
    width: 100%;
    text-decoration: none;
    padding: 0;
    height: 30px;
    color: rgba(0,0,0,.87);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-color: rgb(241, 243, 244);
  }
  .headline{
    font-weight: bold;
  }
  .tab{
    width: 30%;
    align-content: flex-end;
    text-align: center;
    cursor:pointer;
    padding: 3px 3px;
    color: black;
  }
  .tab:hover {
    cursor:pointer;
    border-bottom: 2px solid #696969;
  }
  .tab:active{
    color: #ff0077;
  }

</style>
