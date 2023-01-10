import { provide, inject } from 'vue'
import { serverFetch, objectToGraphgl } from './utils'
import i18n from '../i18n'
import * as err from './error'

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
    const data = await serverFetch('query { getProcesses(where: {active:true}, order: ' + objectToGraphgl(order) + ', offset: ' + offset + ', limit:' + options.itemsPerPage + ') { count rows { id identifier title active status finishTime storagePath mimeType fileName log createdAt updatedAt } } }')
    return data.getProcesses
  },
  loadFinishedProcesses: async (options) => {
    if (options.itemsPerPage === -1) options.itemsPerPage = 15
    const offset = (options.page - 1) * options.itemsPerPage
    const order = generateSorting(options)
    const data = await serverFetch('query { getProcesses(where: {active:false}, order: ' + objectToGraphgl(order) + ', offset: ' + offset + ', limit:' + options.itemsPerPage + ') { count rows { id identifier title active status finishTime storagePath mimeType fileName log createdAt updatedAt } } }')
    return data.getProcesses
  },
  init: () => {
    timer = setInterval(checkFinishedProcesses, 60000)
  },
  dispose: () => {
    clearInterval(timer)
  },
  getProcessUrl: id => {
    const baseUrl = window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/'
    const token = localStorage.getItem('token')

    return `${baseUrl}asset-process/${id}?token=${token}`
  }
}

let timer
let lastProcessId
async function checkFinishedProcesses () {
  try {
    const options = { page: 1, itemsPerPage: 1, sortBy: ['id'], sortDesc: [false] }
    const data = await actions.loadFinishedProcesses(options)

    if (!data.count) {
      lastProcessId = 'empty'
      return
    }
    const lastProcess = data.rows[0]
    if (lastProcessId !== lastProcess.id) {
      if (!lastProcessId) {
        // first run
        lastProcessId = lastProcess.id
        return
      }

      // new finished process found
      lastProcessId = lastProcess.id
      const msg = lastProcess.storagePath
        ? i18n.t('Process.Finished2', {
          name: lastProcess.title,
          href: actions.getProcessUrl(lastProcess.id),
          file: lastProcess.fileName || 'file.bin'
        })
        : i18n.t('Process.Finished1', { name: lastProcess.title })
      err.store.showInfo(msg)
    }
  } catch (e) {
    err.store.showError(e)
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
  actions.init()
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject ProcessesStore')
  }
  return tst
}
