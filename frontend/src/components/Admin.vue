<template>
  <div>
    <div @click="goHome()" class="header-container">
      <div class="header-progress"></div>
      <div class="header-text">ADMIN PAGE</div>
    </div>

    <div class="tab-container-upper">
      <div class="left"></div>
      <div class="center"></div>
      <div class="right"></div>
    </div>

    <div class="main-container">
      <div class="file-container">

        <div v-if="!isAdmin" class="sub-group-header red">You're not the admin of this site</div>
        <div v-if="isAdmin" class="sub-group-header">Users</div>
        <div v-if="users">
          <div class="list-item" v-for="user in users" @click="toggleUserRoles(user)">
            <div class="file-name">
              <div class="name">{{ user.walletAddress }}</div>
              <div class="subname">{{ user.roles }}</div>
            </div>
          </div>
        </div>
        <div v-if="isAdmin" class="sub-group-header">Settings</div>
        <div class="list-item" v-if="settings && settings.newUserDefaultRoles" @click="toggleNewUserDefaultRoles()">
          <div class="file-name">
            <div class="name">New user default roles</div>
            <div class="subname">{{ settings.newUserDefaultRoles }}</div>
          </div>
        </div>

      </div>
    </div>

    <div class="tab-container-lower">
      <div class="left edit">
      </div>
      <div class="center">
      </div>
      <div class="right page-selector">
      </div>
    </div>

  </div>
</template>

<script>
  import store from '@/data/store'
  export default {
    name: "Uploader",
    data: function(){
      return {
        settings: {},
        users: [],
        roleTemplates: [
          [],
          ['read'],
          ['read', 'write']
        ]
      }
    },
    mounted: function () {
      this.getUsers()
      this.getSettings()
    },
    methods: {
      goHome(){
        this.$router.push('/')
      },
      async getUsers() {
        let res = await this.$axios.get('/api/admin/users')
        this.users = res.data
      },
      async toggleUserRoles(user) {
        let newRoles = []
        if(!user.roles.includes('read')) newRoles = ['read']
        else if(!user.roles.includes('write')) newRoles = ['read', 'write']
        else if(user.roles.includes('write')) newRoles = []
        if(user.roles.includes('admin')) newRoles.push('admin')
        user.roles = newRoles
        await this.$axios.put('/api/admin/users/roles', {walletAddress: user.walletAddress, roles: user.roles})
      },
      async getSettings() {
        let res = await this.$axios.get('/api/admin/settings')
        this.settings = res.data
      },
      async toggleNewUserDefaultRoles() {
        let newRoles = []
        if(!this.settings.newUserDefaultRoles.includes('read')) newRoles = ['read']
        else if(!this.settings.newUserDefaultRoles.includes('write')) newRoles = ['read', 'write']
        else if(this.settings.newUserDefaultRoles.includes('write')) newRoles = []
        this.settings.newUserDefaultRoles = newRoles
        await this.$axios.put('/api/admin/settings/newUserDefaultRoles', {newUserDefaultRoles: this.settings.newUserDefaultRoles})
      },
    },
    computed : {
      isAdmin(){
        if(!store.state.user || !store.state.user.roles) return false
        return store.state.user.roles.some(x => x === 'admin')
      },
    }
  }
</script>

<style scoped>
  .header-container{
    width: 100%;
    height: 100px;
    position: relative;
    cursor: pointer;
  }
  .header-text{
    color: #f1f3f4;
    text-align: center;
    position: relative;
    bottom:5px;
    font-size: 80px;
  }
  .header-progress{
    position: absolute;
    height: 120px;
    z-index: -1;
    bottom: 0;
  }
  .tab-container-upper{
    background-color: #f1f3f4;
    width: 100%;
    text-decoration: none;
    padding: 0;
    height: 30px;
    color: rgba(0,0,0,.87);
    display: flex;
    align-items: center;
    justify-content: center;
    border-color: rgb(241, 243, 244);
    position: sticky;
    top:0;
    z-index: 10;
    box-shadow: 0 4px 2px -2px rgba(0,0,0,0.4);
  }
  .tab-container-upper .center{
    width: 50%;
    text-align: center;
  }
  .tab-container-lower{
    background-color: #f1f3f4;
    width: 100%;
    text-decoration: none;
    padding: 0;
    height: 30px;
    color: rgba(0,0,0,.87);
    display: flex;
    align-items: center;
    justify-content: center;
    border-color: rgb(241, 243, 244);
    box-shadow: 0px -6px 6px -8px rgba(0,0,0,0.75);
  }
  .tab-container-lower .center{
    width: 50%;
    text-align: center;
    cursor: pointer;
  }
  .tab-container-lower .center img{
    height: 20px;
    vertical-align: bottom;
    cursor: pointer;
  }
  .tab-container-lower .center  span{
    margin-left: 10px;
    margin-right: 10px;
    margin-bottom: 5px;
  }
  .upload-box{
    background-color: #fafafa;
    width: 98%;
    margin: auto;
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .file-name-edit{
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .file-container{
    padding: 0 5px;
  }
  .file-container .subtext{
    font-size: 12px;
  }
  .file-container input{
    margin-right: 5px;
    border-radius: 4px;
    border: 1px solid #bfbfbf;
    padding: 3px;
  }
  .list-item{
    background-color: #ffffff;
    border-bottom: 1px solid #dfdfdf;
    position: relative;
  }
  .list-item.uploaded{
    background-color: #2db8a2;
  }
  .list-item:hover{
    background-color: #bfbfbf;
    cursor: pointer;
  }
  .list-item .delete{
    position: absolute;
    right: 0;
    bottom: 0;
    cursor: pointer;
  }
  .list-item .delete img {
    height: 20px;
  }
  .name{
    font-size: 16px;
    color: #505050;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-style: normal;
    font-weight: 600;
  }
  .sub-group-header{
    font-size: 16px;
    color: #505050;
    background-color: #2db8a2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-style: normal;
    font-weight: 600;
  }
  .sub-group-header.red{
    background-color: #ff5e8e;
  }

  .subname{
    font-size: 14px;
    color: #868686;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 300;
  }
  .dashed{
    height: 300px;
    width: 80%;
    margin: auto;
    border: dashed 10px #9a9a9a;
    position: relative;
    cursor: pointer;
  }
  .upload-image{
    margin: 20% auto auto;
    height: 70px;
    display: flex;
  }
  .icon-text{
    width: 100%;
    text-align: center;
  }
  .upload-input{
    visibility: hidden;
  }
  .page-selector img{
    height: 20px;
    vertical-align: bottom;
    cursor: pointer;
  }
  .page-selector span{
    margin-left: 10px;
    margin-right: 10px;
    margin-bottom: 5px;
  }
  .edit img{
    height: 20px;
    vertical-align: bottom;
    cursor: pointer;
  }
  .edit{
    cursor: pointer;
  }
  .edit.active{
    color: #0e88ff;
  }

  @media only screen and (max-width: 750px) {
    .header-text{
      font-size: 50px;
      bottom: -30px;
    }
    .tab-container-upper .center {
      width: 40%;
    }
    .tab-container-lower .center {
      width: 40%;
    }
  }

  @media only screen and (max-width: 500px) {
    .header-text{
      font-size: 30px;
      bottom: -30px;
    }
    .tab-container-upper .center {
      width: 40%;
    }
    .tab-container-lower .center {
      width: 40%;
    }
  }

</style>
