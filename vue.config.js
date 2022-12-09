const { VuetifyPlugin } = require('webpack-plugin-vuetify')

module.exports = {
  devServer: {
    allowedHosts: "*"
  },
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true
    }
  },
  configureWebpack: {
    plugins: [
      new VuetifyPlugin({ autoImport: true })
    ]
  }
}
