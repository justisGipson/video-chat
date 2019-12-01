import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
import VueResource from 'vue-resource'
import store from './store'
import router from './router'
import App from './App.vue'
import { url } from './utils/config'

Vue.config.productionTip = false

// socket config
Vue.use(new VueSocketIO({
  debug: true,
  connection: `${url}/video-chat`,
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  }
}))

Vue.use(VueResource)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
