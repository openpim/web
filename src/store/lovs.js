import { reactive, provide, inject } from '@vue/composition-api'
import i18n from '../i18n'
import { serverFetch, objectToGraphgl } from './utils'
import { currentLanguage } from './languages'

const lovs = reactive([])
let lovsPromise
const actions = {
  getLOVData: async (id) => {
    const data = await serverFetch('query { getLOV(id: "' + id + '") { values } }')
    if (data.getLOV) {
      return data.getLOV.values
    } else {
      return []
    }
  },
  getLOVsForSelect: async () => {
    const data = await serverFetch('query { getLOVs {id name} }')
    if (data.getLOVs) {
      const tst = data.getLOVs.map(elem => { return { value: parseInt(elem.id), text: elem.name[currentLanguage.value.identifier] } })
      return tst
    } else {
      return []
    }
  },
  loadAllLOVs: async () => {
    if (!lovsPromise) lovsPromise = serverFetch('query { getLOVs {id identifier name values createdBy createdAt updatedBy updatedAt } }')
    const data = await lovsPromise
    if (lovs.length > 0) return
    if (data.getLOVs) {
      data.getLOVs.forEach(element => {
        element.internalId = element.id
        lovs.push(element)
      })
    }
  },
  addLOV: () => {
    const name = {}
    name[currentLanguage.value.identifier] = i18n.t('Config.LOV.NewName')
    const newLOV = { id: Date.now(), internalId: 0, name: name, values: [] }
    lovs.push(newLOV)
    return newLOV
  },
  saveLOV: async (lov) => {
    if (lov.internalId === 0) {
      const query = `
        mutation { createLOV(identifier: "` + lov.identifier + '", name: ' + objectToGraphgl(lov.name) +
        ', values: ' + (lov.values ? '' + objectToGraphgl(lov.values.map(elem => { return { ...elem, id: parseInt(elem.id), filter: elem.filter ? parseInt(elem.filter) : null } })) : '[]') +
        `)
      }`
      const data = await serverFetch(query)
      const newId = parseInt(data.createLOV)
      lov.internalId = newId
    } else {
      const query = `
        mutation { updateLOV(id: "` + lov.internalId + '", name: ' + (lov.name ? '' + objectToGraphgl(lov.name) : '') +
        ', values: ' + (lov.values ? '' + objectToGraphgl(lov.values.map(elem => { return { ...elem, id: parseInt(elem.id), filter: elem.filter ? parseInt(elem.filter) : null } })) : '[]') +
        `)
      }`
      await serverFetch(query)
    }
  },
  removeLOV: async (id) => {
    const idx = lovs.findIndex((elem) => elem.id === id)

    if (lovs[idx].internalId !== 0) {
      const query = `
        mutation { removeLOV(id: "` + lovs[idx].internalId + `")
      }`
      await serverFetch(query)
    }
    lovs.splice(idx, 1)
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  lovs: lovs,
  ...actions
}

export { store }

const StoreSymbol = Symbol('LOVsStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject LOVsStore')
  }
  return tst
}
