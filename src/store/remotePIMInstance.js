import { provide, inject, ref } from '@vue/composition-api'
import { serverFetchCustomUrl, objectToGraphgl } from './utils'

const token = ref('')
const server = ref('')

const actions = {
  loginRemotePIMInstance: async (url, user, password) => {
    server.value = url + '/graphql'
    const query = 'mutation {signIn(login: "' + user + '", password: "' + password + '") { token }}'
    const data = await serverFetchCustomUrl(server.value, null, query)
    token.value = data.signIn.token
  },
  seacrhAttributesRemotePIMInstance: async (valid, visible) => {
    let query = `
      query { search(
        requests: [
          {
            entity: ATTRIBUTE, 
            offset: 0, 
            limit: 100000,
            where: {OP_and: [
              {OP_or: [`
    valid.forEach(row => {
      query += '{ valid: {OP_contains: ' + row + ' }},'
    })
    query += `]},
      {OP_or: [`
    visible.forEach(row => {
      query += '{ visible: {OP_contains: ' + row + ' }},'
    })
    query += `]},
          ]}
        }
    ]) { responses {... on AttributesResponse { count rows {id identifier name valid visible languageDependent options } } }}}`
    const data = await serverFetchCustomUrl(server.value, token.value, query)
    return data.search.responses[0]
  },
  seacrhTypesRemotePIMInstance: async () => {
    const query = '{ search( requests: [ { entity: TYPE, offset: 0, limit: 1000, where: {} }]) { responses {... on TypesResponse { count rows {id identifier } } }}}'
    const data = await serverFetchCustomUrl(server.value, token.value, query)
    return data.search.responses[0]
  },
  searchItemsRemotePIMInstance: async (where) => {
    const query = `query { search(
      requests: [
          {
              entity: ITEM, 
              offset: 0, 
              limit: 10000,
              where: ` + objectToGraphgl(where) + `,
              order: [["\\"typeId\\"", "ASC"],["id", "ASC"]]
          }]
      ) {
      responses {
          ... on ItemsSearchResponse {
              rows {
                  id
                  identifier
                  path
                  name
                  typeId
                  values
              }
          }
      }}}       
    `
    const data = await serverFetchCustomUrl(server.value, token.value, query)
    return data.search.responses[0]
  }
}

const store = {
  ...actions
}

export { store }

const StoreSymbol = Symbol('RemotePIMStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject RemotePIMStore')
  }
  return tst
}
