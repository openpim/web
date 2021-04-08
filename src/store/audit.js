import { provide, inject, ref } from '@vue/composition-api'
import { serverFetch, objectToGraphgl } from './utils'

const auditEnabled = ref(null)

function generateSorting (options) {
  const order = []
  if (options.sortBy) {
    for (let i = 0; i < options.sortBy.length; i++) {
      const elem = options.sortBy[i]
      if (typeof elem === 'object') {
        const path = elem.path.reduce((accumulator, currentValue, index, arr) => accumulator + (index !== arr.length ? '.' : '') + currentValue)
        order.push([path, options.sortDesc[i] ? 'DESC' : 'ASC'])
      } else {
        order.push([elem, options.sortDesc[i] ? 'DESC' : 'ASC'])
      }
    }
  }
  return order
}

const actions = {
  loadItemHistory: async (id, options) => {
    const offset = (options.page - 1) * options.itemsPerPage
    const order = generateSorting(options)
    const data = await serverFetch('query { getItemHistory(id: ' + id + ', offset: ' + offset + ', limit: ' + options.itemsPerPage + ', order: ' + objectToGraphgl(order) + `) { 
      count, rows {id, identifier, operation, user, changedAt, data {added, changed, old, deleted} } } }`)
    return data.getItemHistory
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
