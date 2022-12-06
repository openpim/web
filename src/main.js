import Vue from 'vue'
import './composition-plugin'
import App from './App.vue'
import router from './router'

import vuetify from './plugins/vuetify'
import i18n from './i18n'

Vue.config.productionTip = false

const vue = Vue.createApp({
  render: h => h(App)
})
  .use(router)
  .use(vuetify)
  .use(i18n)
  .mount('#app')

export default vue
