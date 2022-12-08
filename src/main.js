import Vue from 'vue'
import './composition-plugin'
import App from './App.vue'
import router from './router'

import vuetify from './plugins/vuetify'
import i18n from './i18n'

const vue = Vue.createApp(App)
  .use(router)
  .use(vuetify)
  .use(i18n)
  .mount('#app')

export default vue
