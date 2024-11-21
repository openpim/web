import { provide, inject } from '@vue/composition-api'
import { serverFetch, objectToGraphgl } from './utils'

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
  loadActiveProcesses: async (options) => {
    if (options.itemsPerPage === -1) options.itemsPerPage = 15
    const offset = (options.page - 1) * options.itemsPerPage
    const order = generateSorting(options)
    const data = await serverFetch('query { getProcesses(where: {active:true}, order: ' + objectToGraphgl(order) + ', offset: ' + offset + ', limit:' + options.itemsPerPage + ') { count rows { id identifier title active status finishTime storagePath mimeType fileName createdAt updatedAt } } }')
    return data.getProcesses
  },
  loadFinishedProcesses: async (options) => {
    if (options.itemsPerPage === -1) options.itemsPerPage = 15
    const offset = (options.page - 1) * options.itemsPerPage
    const order = generateSorting(options)
    const data = await serverFetch('query { getProcesses(where: {active:false}, order: ' + objectToGraphgl(order) + ', offset: ' + offset + ', limit:' + options.itemsPerPage + ') { count rows { id identifier title active status finishTime storagePath mimeType fileName createdAt updatedAt } } }')
    return data.getProcesses
  },
  loadProcessesByFilter: async (options, where) => {
    if (options.itemsPerPage === -1) options.itemsPerPage = 15
    const offset = (options.page - 1) * options.itemsPerPage
    const order = generateSorting(options)
    const data = await serverFetch('query { getProcesses(where: ' + objectToGraphgl(where) + ', order: ' + objectToGraphgl(order) + ', offset: ' + offset + ', limit:' + options.itemsPerPage + ') { count rows { id identifier title active status finishTime storagePath mimeType fileName log createdAt updatedAt } } }')
    return data.getProcesses
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  ...actions
}

export { store }

const StoreSymbol = Symbol('ProcessesStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject ProcessesStore')
  }
  return tst
}
