import Vue from 'vue'
import Router from 'vue-router'
import Playlist from '@/components/Playlist'
import Login from '@/components/Login'
import Uploader from '@/components/Uploader'
import Admin from '@/components/Admin'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '/',
      name: 'Playlist',
      component: Playlist
    },
    {
      path: '/Login',
      name: 'Login',
      component: Login
    },
    {
      path: '/Upload',
      name: 'Upload',
      component: Uploader
    },
    {
      path: '/Admin',
      name: 'Admin',
      component: Admin
    }
  ]
})

router.beforeEach((to, from, next) => {
  if(!document.cookie && to.name !== 'Login') {
    next({name : 'Login'})
  } else {
    next()
  }
})

export default router
