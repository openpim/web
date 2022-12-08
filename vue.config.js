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
  chainWebpack: (config) => {
    config.resolve.alias.set('vue', '@vue/compat')

    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        return {
          ...options,
          compilerOptions: {
            compatConfig: {
              MODE: 2
            }
          }
        }
      })
  },
  configureWebpack: {
    plugins: [
      new VuetifyPlugin({ autoImport: true })
    ]
  }
}
