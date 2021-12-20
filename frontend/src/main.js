// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './data/store'
import axios from 'axios'
import { EventBus } from './EventBus';
Vue.prototype.$bus = EventBus

const axiosConfig = {
  baseURL: '',
  timeout: 30000,
};
Vue.prototype.$axios = axios.create(axiosConfig)

Vue.prototype.$axios.interceptors.response.use(function (response) {
  return response
}, function (error) {
  if (error.response.status === 401) {
    store.commit('setUser')
    router.push({name : 'Login'}).then(_ => _).catch(_ => _)
  }
  return Promise.reject(error)
})

Vue.config.productionTip = false
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
