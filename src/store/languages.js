import { reactive, ref, provide, inject } from 'vue'
import i18n from '../i18n'
import { serverFetch, objectToGraphgl } from './utils'

const languages = reactive([])
const currentLanguage = ref({ identifier: '' })
const defaultLanguageIdentifier = ref('')

const actions = {
  loadAllLanguages: async () => {
    if (languages.length > 0) return
    const data = await serverFetch('query { getLanguages {id identifier name createdAt createdBy updatedAt updatedBy} }')
    if (languages.length > 0) return
    if (data.getLanguages) {
      currentLanguage.value = data.getLanguages[0]
      defaultLanguageIdentifier.value = data.getLanguages[0].identifier
      data.getLanguages.forEach(element => {
        element.internalId = element.id
        languages.push(element)
      })
    }
  },
  addLanguage: () => {
    const name = {}
    name[currentLanguage.value.identifier] = i18n.t('Config.Languages.NewName')
    const newLang = { id: Date.now(), internalId: 0, name: name, sources: [], targets: [] }
    languages.push(newLang)
    return newLang
  },
  saveLanguage: async (lang) => {
    if (lang.internalId === 0) {
      const query = `
        mutation { createLanguage(identifier: "` + lang.identifier + '", name: ' + objectToGraphgl(lang.name) +
        `)
      }`
      const data = await serverFetch(query)
      const newId = parseInt(data.createLanguage)
      lang.internalId = newId
    } else {
      const query = `
        mutation { updateLanguage(id: "` + lang.internalId + '", name: ' + (lang.name ? '' + objectToGraphgl(lang.name) : '') +
        `)
      }`
      await serverFetch(query)
    }
  },
  removeLanguage: async (id) => {
    const idx = languages.findIndex((elem) => elem.id === id)

    if (languages[idx].internalId !== 0) {
      const query = `
        mutation { removeLanguage(id: "` + languages[idx].internalId + `")
      }`
      await serverFetch(query)
    }
    languages.splice(idx, 1)
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  languages: languages,
  currentLanguage: currentLanguage,
  defaultLanguageIdentifier: defaultLanguageIdentifier,
  ...actions
}

export { store, currentLanguage }

const StoreSymbol = Symbol('LanguagesStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject LanguagesStore')
  }
  return tst
}
