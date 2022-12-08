import { createI18n } from 'vue-i18n'
import { nextTick } from 'vue'

export async function loadLocaleMessages (i18n, locale) {
  // load locale messages with dynamic import
  const messages = await import(
    /* webpackChunkName: "locale-[request]" */ `./locales/${locale}.json`
  )

  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages.default)

  return nextTick()
}

export function setI18nLanguage (i18n, locale) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    i18n.global.locale.value = locale
  }
  document.querySelector('html').setAttribute('lang', locale)
}

const i18n = createI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  globalInjection: true,
  allowComposition: true
})

setI18nLanguage(i18n, process.env.VUE_APP_I18N_LOCALE || 'en')
loadLocaleMessages(i18n, process.env.VUE_APP_I18N_LOCALE || 'en')

export default i18n
