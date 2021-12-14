import Vue from 'vue'
import './composition-plugin'
import App from './App.vue'
import router from './router'

import vuetify from './plugins/vuetify'
import i18n from './i18n'

Vue.config.productionTip = false

const vue = new Vue({
  router,
  vuetify,
  i18n,
  render: h => h(App)
}).$mount('#app')

export default vue
