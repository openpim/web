import { ref, provide, inject } from '@vue/composition-api'
import { serverFetch, objectToGraphgl } from './utils'

const currentWhereRef = ref(null)
const currentFilterRef = ref(null)
const searchEntityRef = ref('ITEM')
const searchToOpenRef = ref(null)
const savedColumnsRef = ref(null)
const selectedRef = ref(null)
const lovsMapRef = ref({})

let promise
const actions = {
  loadAllSavedColumns: async (force) => {
    if (!promise || force) promise = serverFetch('query { getColumns(onlyMy: false) {id identifier name public columns user} }')
    const data = await promise
    if (savedColumnsRef.value && !force) return
    if (data.getColumns) {
      savedColumnsRef.value = data.getColumns.reduce((acc, col) => {
        // Group initialization
        if (!acc[col.user]) {
          acc[col.user] = []
        }
        // Grouping
        acc[col.user].push(col)
        return acc
      }, {})
    }
  },
  loadSearches: async (onlyMy) => {
    const data = await serverFetch('query { getSearches(onlyMy: ' + onlyMy + ') {identifier entity name extended filters whereClause public user} }')
    return data.getSearches
  },
  loadColumns: async (onlyMy) => {
    const data = await serverFetch('query { getColumns(onlyMy: ' + onlyMy + ') {id identifier name public columns user} }')
    return data.getColumns
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
  columnsIdentifierExists: async (identifier) => {
    const data = await serverFetch('query { getColumnsByIdentifier(identifier: "' + identifier + `") { 
      id 
    } }`)
    if (data.getColumnsByIdentifier) {
      return true
    } else {
      return false
    }
  },
  loadByIdentifier: async (identifier) => {
    const data = await serverFetch('query { getSearchByIdentifier(identifier: "' + identifier + `") { 
      identifier entity name extended filters whereClause public user
    } }`)
    return data.getSearchByIdentifier
  },
  save: async (search) => {
    if (!search.extended) search.whereClause = { orAnd: search.orAnd }
    const query = `
      mutation { saveSearch(identifier: "` + search.identifier + '", name: ' + (search.name ? objectToGraphgl(search.name) : '') +
      ', entity: "' + search.entity + '"' +
      ', publicSearch: ' + search.public +
      ', extended: ' + search.extended +
      ', filters: ' + (search.filters ? objectToGraphgl(search.filters) : '') +
      ', whereClause: ' + (search.whereClause ? objectToGraphgl(search.whereClause) : '') +
      `)
    }`
    await serverFetch(query)
  },
  saveColumns: async (config) => {
    const query = `
      mutation { saveColumns(identifier: "` + config.identifier + '", name: ' + (config.name ? objectToGraphgl(config.name) : '') +
      ', publicAccess: ' + config.public +
      ', columns: ' + (config.columns ? objectToGraphgl(config.columns) : '') +
      `)
    }`
    await serverFetch(query)
  },
  remove: async (identifier) => {
    const query = 'mutation { removeSearch(identifier: "' + identifier + '") }'
    await serverFetch(query)
  },
  removeColumns: async (identifier) => {
    const query = 'mutation { removeColumns(identifier: "' + identifier + '") }'
    await serverFetch(query)
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  currentWhereRef,
  currentFilterRef,
  searchEntityRef,
  selectedRef,
  lovsMapRef,
  savedColumnsRef: savedColumnsRef,
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
