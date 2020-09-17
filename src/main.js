import Vue from 'vue'
import './composition-plugin'
import App from './App.vue'
import router from './router'

import vuetify from './plugins/vuetify'
import i18n from './i18n'

import CKEditor from '@ckeditor/ckeditor5-vue'

Vue.config.productionTip = false

Vue.use(CKEditor)

const vue = new Vue({
  router,
  vuetify,
  i18n,
  render: h => h(App)
}).$mount('#app')

export default vue
