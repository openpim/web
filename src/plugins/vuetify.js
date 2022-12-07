import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import ru from 'vuetify/lib/locale/ru'

import theme from '../_customizations/_theme/theme'

export default createVuetify({
  lang: {
    locales: { ru },
    current: 'en'
  },
  theme: {
    ...theme
  }
})
