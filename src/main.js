import { createApp } from 'vue'
import './composition-plugin'
import App from './App.vue'
import router from './router'

import vuetify from './plugins/vuetify'
import i18n from './i18n'

const vue = createApp(App)
vue.use(router)
vue.use(vuetify)
vue.use(i18n)
vue.mount('#app')

export default vue
