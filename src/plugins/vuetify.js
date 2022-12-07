import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import ru from 'vuetify/lib/locale/ru'
import 'vuetify/styles'

import theme from '../_customizations/_theme/theme'

const vuetify = createVuetify({
  lang: {
    locales: { ru },
    current: 'en'
  },
  theme: {
    ...theme
  }
})

export default vuetify
