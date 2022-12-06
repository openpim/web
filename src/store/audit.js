import { provide, inject, ref } from 'vue'
import { serverFetch, objectToGraphgl, generateSorting } from './utils'

const auditEnabled = ref(null)

const actions = {
  loadItemHistory: async (id, options) => {
    const offset = (options.page - 1) * options.itemsPerPage
    const order = generateSorting(options)
    const data = await serverFetch('query { getItemHistory(id: ' + id + ', offset: ' + offset + ', limit: ' + options.itemsPerPage + ', order: ' + objectToGraphgl(order) + `) {
      count, rows {id, operation, user, changedAt, data {added, changed, old, deleted} } } }`)
    return data.getItemHistory
  },
  loadItemRelationHistory: async (id, options) => {
    const offset = (options.page - 1) * options.itemsPerPage
    const order = generateSorting(options)
    const data = await serverFetch('query { getItemRelationHistory(id: ' + id + ', offset: ' + offset + ', limit: ' + options.itemsPerPage + ', order: ' + objectToGraphgl(order) + `) {
      count, rows {id, operation, user, changedAt, data {added, changed, old, deleted} } } }`)
    return data.getItemRelationHistory
  },
  checkAuditEnabled: async () => {
    if (auditEnabled.value === null) {
      const data = await serverFetch('query { isAuditEnabled }')
      auditEnabled.value = data.isAuditEnabled
    }
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  auditEnabled: auditEnabled,
  ...actions
}

export { store }

const StoreSymbol = Symbol('AuditStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject AuditStore')
  }
  return tst
}
