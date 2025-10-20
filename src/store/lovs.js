import { reactive, provide, inject } from '@vue/composition-api'
import i18n from '../i18n'
import { serverFetch, objectToGraphgl } from './utils'
import { currentLanguage } from './languages'

const lovs = reactive([])
let lovsPromise
const lovCache = {}
const lovCachePromise = {}
const k = (id) => 'lov' + id

let batchScheduled = false
const batchIds = new Set()
const pendingResolvers = {}

async function runBatchedFetch () {
  const ids = Array.from(batchIds)
  batchIds.clear()
  batchScheduled = false
  if (!ids.length) return

  try {
    const rows = await loadLOVsBatch(ids)
    const byId = new Map(rows.map(r => [parseInt(r.id, 10), Array.isArray(r.values) ? r.values : []]))
    for (const id of ids) {
      const key = k(id)
      const vals = byId.get(id) || []
      lovCache[key] = vals
      const resolvers = pendingResolvers[key] || []
      pendingResolvers[key] = []
      while (resolvers.length) {
        const resolve = resolvers.shift()
        try { resolve(vals) } catch { }
      }
      lovCachePromise[key] = Promise.resolve(vals)
    }
  } catch (e) {
    for (const id of ids) {
      const key = k(id)
      const vals = []
      lovCache[key] = vals
      const resolvers = pendingResolvers[key] || []
      pendingResolvers[key] = []
      while (resolvers.length) {
        const resolve = resolvers.shift()
        try { resolve(vals) } catch { }
      }
      lovCachePromise[key] = Promise.resolve(vals)
    }
    console.error('getLOVsData batch failed', e)
  }
}

function scheduleIdForBatch (rawId) {
  const id = parseInt(rawId, 10)
  const key = k(id)

  if (lovCache[key]) return Promise.resolve(lovCache[key])
  if (lovCachePromise[key]) return lovCachePromise[key]

  return new Promise((resolve) => {
    if (!pendingResolvers[key]) pendingResolvers[key] = []
    pendingResolvers[key].push(resolve)
    batchIds.add(id)

    if (!batchScheduled) {
      batchScheduled = true
      Promise.resolve().then(runBatchedFetch)
    }
  })
}

async function loadLOVsBatch (ids) {
  const idsStr = ids.map(id => `"${id}"`).join(',')
  const query = `query {
    getLOVsData(ids: [${idsStr}]) { id values }
  }`
  const data = await serverFetch(query)
  return (data && data.getLOVsData) ? data.getLOVsData : []
}

const actions = {
  getLOVData: async (id) => {
    const byId = await actions.getLOVsData([id])
    return byId[id] || []
  },
  getLOVsData: async (ids = []) => {
    const uniq = Array.from(new Set(ids.map(n => parseInt(n, 10)).filter(Number.isFinite)))
    if (!uniq.length) return {}

    const result = {}
    const needFetch = []

    for (const id of uniq) {
      const key = k(id)
      if (lovCache[key]) {
        result[id] = lovCache[key]
      } else if (lovCachePromise[key]) {
        result[id] = await lovCachePromise[key]
      } else {
        needFetch.push(id)
      }
    }

    if (needFetch.length) {
      await Promise.all(
        needFetch.map((id) => {
          const key = k(id)
          const p = scheduleIdForBatch(id)
          lovCachePromise[key] = p
          return p.then(vals => { result[id] = vals })
        })
      )
    }

    return result
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
    if (!lovsPromise) lovsPromise = serverFetch('query { getLOVs {id identifier name createdBy createdAt updatedBy updatedAt } }')
    const data = await lovsPromise
    if (lovs.length > 0) return
    if (data.getLOVs) {
      data.getLOVs.forEach(element => {
        element.internalId = element.id
        element.values = [] // we are not  loading values yet to reduce request size, we will load then when necessary
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
