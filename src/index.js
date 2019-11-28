import Vue from 'vue'
import VueRouter from 'vue-router'
import VeeValidate from 'vee-validate'
import App from './App.vue'
import getRouter from './router'
import store from './store'
import VueQrcode from '@chenfengyuan/vue-qrcode'
import './assets/css/tailwind.css'
import VueChatScroll from 'vue-chat-scroll'
import VueI18n from 'vue-i18n'

Vue.component(VueQrcode.name, VueQrcode)

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(VeeValidate)
Vue.use(VueChatScroll)
Vue.use(VueI18n)

// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: 'en', // set locale
  messages: store.state.i18nTexts // set locale messages
})

store.dispatch('initAe')
new Vue({
  i18n,
  router: getRouter(store),
  store,
  render: h => h(App)
}).$mount('#app')
