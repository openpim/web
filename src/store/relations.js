import { reactive, provide, inject } from '@vue/composition-api'
import i18n from '../i18n'
import { serverFetch, objectToGraphgl } from './utils'
import { currentLanguage } from './languages'

const relations = reactive([])

const actions = {
  loadAllRelations: async () => {
    if (relations.length > 0) return
    const data = await serverFetch('query { getRelations }')
    if (data.getRelations) {
      data.getRelations.forEach(element => {
        relations.push(element)
      })
    }
  },
  addRelation: () => {
    const name = {}
    name[currentLanguage.value.identifier] = i18n.t('Config.Relations.NewName')
    const newRel = { id: Date.now(), internalId: 0, name: name, sources: [], targets: [], child: false, multi: false, options: [] }
    relations.push(newRel)
    return newRel
  },
  saveRelation: async (rel) => {
    if (rel.internalId === 0) {
      const query = `
        mutation { createRelation(identifier: "` + rel.identifier + '", name: ' + objectToGraphgl(rel.name) +
        ', order: ' + (rel.order ? rel.order : 0) +
        ', sources: [' + rel.sources +
        '], targets: [' + rel.targets +
        '], child: ' + rel.child +
        ', multi: ' + rel.multi +
        ', options: ' + objectToGraphgl(rel.options) + ` )
      }`
      const data = await serverFetch(query)
      const newId = parseInt(data.createRelation)
      rel.internalId = newId
    } else {
      const query = `
        mutation { updateRelation(id: "` + rel.internalId + '", name: ' + (rel.name ? objectToGraphgl(rel.name) : '') +
        ', order: ' + (rel.order ? rel.order : 0) +
        ', sources: [' + rel.sources +
        '], targets: [' + rel.targets +
        '], child: ' + rel.child +
        ', multi: ' + rel.multi +
        ', options: ' + objectToGraphgl(rel.options) + ` )
      }`
      await serverFetch(query)
    }
  },
  removeRelation: async (id) => {
    const idx = relations.findIndex((elem) => elem.id === id)

    if (relations[idx].internalId !== 0) {
      const query = `
        mutation { removeRelation(id: "` + relations[idx].internalId + `")
      }`
      await serverFetch(query)
    }
    relations.splice(idx, 1)
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  relations: relations,
  ...actions
}

export { store }

const StoreSymbol = Symbol('RelatonsStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject RelationsStore')
  }
  return tst
}
