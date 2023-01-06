import { provide, inject } from '@vue/composition-api'
import { serverFetch } from './utils'

const actions = {
  loadActiveProcesses: async (offset) => {
    const data = await serverFetch('query { getProcesses(where: {active:true}, order: [["id","ASC"]], offset: ' + offset + ', limit:10) { count rows { id identifier title active status finishTime storagePath mimeType fileName log createdAt updatedAt } } }')
    return data.getProcesses
  },
  loadFinishedProcesses: async (offset) => {
    const data = await serverFetch('query { getProcesses(where: {active:false}, order: [["id","ASC"]], offset: ' + offset + ', limit:10) { count rows { id identifier title active status finishTime storagePath mimeType fileName log createdAt updatedAt } } }')
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
