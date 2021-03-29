import { ref, provide, inject, reactive } from '@vue/composition-api'
import { serverFetch, objectToGraphgl } from './utils'

const searchToOpenRef = ref(null)

const savedColumns = reactive([])

const actions = {
  loadAllSavedColumns: async () => {
    if (savedColumns.length > 0) return
    const data = await serverFetch('query { getColumns(onlyMy: false) {id identifier name public columns user} }')
    if (savedColumns.length > 0) return
    if (data.getColumns) {
      data.getColumns.forEach(element => {
        element.internalId = element.id
        savedColumns.push(element)
      })
    }
  },
  loadSearches: async (onlyMy) => {
    const data = await serverFetch('query { getSearches(onlyMy: ' + onlyMy + ') {identifier name extended filters whereClause public user} }')
    return data.getSearches
  },
  identifierExists: async (identifier) => {
    const data = await serverFetch('query { getSearchByIdentifier(identifier: "' + identifier + `") { 
      id 
    } }`)
    if (data.getSearchByIdentifier) {
      return true
    } else {
      return false
    }
  },
  loadByIdentifier: async (identifier) => {
    const data = await serverFetch('query { getSearchByIdentifier(identifier: "' + identifier + `") { 
      identifier name extended filters whereClause public user
    } }`)
    return data.getSearchByIdentifier
  },
  save: async (search) => {
    const query = `
      mutation { saveSearch(identifier: "` + search.identifier + '", name: ' + (search.name ? objectToGraphgl(search.name) : '') +
      ', publicSearch: ' + search.public +
      ', extended: ' + search.extended +
      ', filters: ' + (search.filters ? objectToGraphgl(search.filters) : '') +
      ', whereClause: ' + (search.whereClause ? objectToGraphgl(search.whereClause) : '') +
      `)
    }`
    await serverFetch(query)
  },
  remove: async (identifier) => {
    const query = 'mutation { removeSearch(identifier: "' + identifier + '") }'
    await serverFetch(query)
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  savedColumns: savedColumns,
  searchToOpenRef: searchToOpenRef,
  ...actions
}

export { store }

const StoreSymbol = Symbol('SearchStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject SearchStore')
  }
  return tst
}
