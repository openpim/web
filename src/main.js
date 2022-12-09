import { createApp } from 'vue'
import './composition-plugin'
import App from './App.vue'
import router from './router'

import vuetify from './plugins/vuetify'
import i18n, { loadLocaleMessages } from './i18n'

async function init () {
  await loadLocaleMessages(i18n, process.env.VUE_APP_I18N_LOCALE || 'en')

  vue.mount('#app')
}

const vue = createApp(App)
vue.use(router)
vue.use(vuetify)
vue.use(i18n)

init()

export default vue
