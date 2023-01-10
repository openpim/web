import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import ru from 'vuetify/lib/locale/ru'
import 'vuetify/styles'
import { VDataTable } from 'vuetify/labs/VDataTable'

import myCustomLightTheme from '../_customizations/_theme/theme'

const vuetify = createVuetify({
  lang: {
    locales: { ru },
    current: 'en'
  },
  theme: {
    defaultTheme: 'myCustomLightTheme',
    themes: {
      myCustomLightTheme
    }
  },
  components: {
    VDataTable
  }
})

export default vuetify
