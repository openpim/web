import { provide, inject } from '@vue/composition-api'
import * as err from './error'

const authList = {
  authOpenID: async (id, uri) => {
    let data = null
    try {
      const serverUrl = window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_SERVER_URL : window.OPENPIM_SERVER_URL + '/graphql'
      const resp = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ query: 'query { auth(id: "' + id + '", uri: "' + uri + '") }' })
      })
      if (resp.ok) {
        data = await resp.json()
      }
    } catch (e) {
      console.error(e)
      err.store.showError('' + e)
    }
    return data
  },
  callback: async (id, uri, rederectURI) => {
    let data = null
    try {
      const serverUrl = window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_SERVER_URL : window.OPENPIM_SERVER_URL + '/graphql'
      const resp = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ query: 'query { callback(id: "' + id + '", uri: "' + uri + '", rederectURI: "' + rederectURI + '") }' })
      })
      if (resp.ok) {
        data = (await resp.json())
      }
    } catch (e) {
      console.error(e)
      err.store.showError('' + e)
    }
    return data
  }
}

const store = {
  ...authList
}

const StoreSymbol = Symbol('AuthStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject AuthStore')
  }
  return tst
}
