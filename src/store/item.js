import { ref, reactive, provide, inject } from '@vue/composition-api'
import { serverFetch, findNode, removeNode, findNodeByComparator, objectToGraphgl } from './utils'
import * as typesStore from './types'
import * as err from './error'
import i18n from '../i18n'
import { currentLanguage } from './languages'

const itemsTree = reactive([])
const currentWhereRef = ref(null)

const {
  findType
} = typesStore.store

function enrichItem (item) {
  if (item) {
    item.id = parseInt(item.id)
    item.internalId = item.id
    let type = findType(item.typeId).node
    if (type.link !== 0) type = findType(type.link).node
    item.typeIcon = type.icon
    item.typeIconColor = type.iconColor
    item.typeFile = type.file
    item.children = []
  }
  return item
}

const actions = {
  findItem: (id) => {
    const path = []
    const node = findNode(id, itemsTree, path)
    return { node, path }
  },
  findItemByInternalId: (id) => {
    const path = []
    const node = findNodeByComparator(id, itemsTree, path, (id, item) => item.internalId === id)
    return { node, path }
  },
  identifierExists: async (identifier) => {
    const data = await serverFetch('query { getItemByIdentifier(identifier: "' + identifier + `") { 
      id 
    } }`)
    if (data.getItemByIdentifier) {
      return true
    } else {
      return false
    }
  },
  loadItemByIdentifier: async (identifier) => {
    const item = await serverFetch('query { getItemByIdentifier(identifier: "' + identifier + `") { 
      id 
      path 
      identifier
      name
      typeId
      values
      mimeType
      fileOrigName
      createdBy
      createdAt
      updatedBy
      updatedAt
    } }`)
    if (!item.getItemByIdentifier) {
      err.store.showError(i18n.t('Item.byIdentifier.NotFound', { identifier: identifier }))
    }
    return enrichItem(item.getItemByIdentifier)
  },
  loadItemsByIds: async (arr, enrich) => {
    const res = await serverFetch('query { getItemsByIds(ids: [' + arr + `]) { 
      id 
      path 
      identifier
      name
      typeId
    } }`)
    const items = res.getItemsByIds
    if (!items) {
      err.store.showError(i18n.t('Item.byIdentifier.NotFound', { identifier: arr }))
    }
    if (!enrich) {
      return items.map(item => {
        item.id = parseInt(item.id)
        return item
      })
    } else {
      return items.map(item => enrichItem(item))
    }
  },
  loadItems: async (id, parentId) => {
    const data = await serverFetch('query { getItems(parentId: "' + (parentId || '') + `", offset: 0, limit: 500) { 
      count,
      rows 
      { 
        id 
        path 
        identifier
        name
        typeId
    } } }`)
    if (data.getItems) {
      const arr = data.getItems.rows.map((item) => {
        return enrichItem(item)
      })
      let children
      if (!parentId) {
        children = itemsTree
      } else {
        const parent = store.findItem(id).node
        children = parent.children
      }
      arr.forEach(element => {
        element.link = false
        children.push(element)
      })
      return arr
    }
  },
  loadItemRelationsChildren: async (id, parentId) => {
    const data = await serverFetch('query { getItemRelationsChildren(itemId: "' + (parentId || '') + `", offset: 0, limit: 500) { 
      count,
      rows 
      { 
        id 
        path 
        identifier
        name
        typeId
      } } }`)
    if (data.getItemRelationsChildren) {
      const arr = data.getItemRelationsChildren.rows.map((item) => {
        return enrichItem(item)
      })
      let children
      if (!parentId) {
        children = itemsTree
      } else {
        const parent = store.findItem(id).node
        children = parent.children
      }
      let tmp = Date.now()
      arr.forEach(element => {
        element.id = tmp++ // we have to change id to something unique
        element.link = true
        children.push(element)
      })
      return arr
    }
  },
  loadChildren: async (parentId, options) => {
    const offset = (options.page - 1) * options.itemsPerPage
    const data = await serverFetch('query { getItems(parentId: "' + (parentId || '') + '", offset: ' + offset + ', limit: ' + options.itemsPerPage + `) { 
      count,
      rows 
      { 
        id 
        identifier
        name
        values
        fileOrigName
        mimeType
        createdBy
        createdAt
        updatedBy
        updatedAt
    } } }`)
    return data.getItems
  },
  createItem: async (item, parent) => {
    const query = `
      mutation { createItem(identifier: "` + item.identifier + '", name: ' + objectToGraphgl(item.name) +
      ', parentId: "' + (parent && parent.id !== -1 ? '' + parent.internalId : '') +
      '", typeId: "' + item.typeId +
      `")
    }`
    const data = await serverFetch(query)
    const newId = parseInt(data.createItem)
    item.internalId = newId

    if (parent && parent.id !== -1) {
      parent.children.push(item)
    } else {
      itemsTree.push(item)
    }
  },
  updateItem: async (item) => {
    const query = `
      mutation { updateItem(id: "` + item.internalId + '", name: ' + (item.name ? objectToGraphgl(item.name) : '') +
      ', values: ' + (item.values ? objectToGraphgl(item.values) : null) +
      `)
    }`
    await serverFetch(query)
  },
  removeItem: async (id) => {
    const node = removeNode(id, itemsTree)
    debugger

    if (node.internalId !== 0) {
      const query = `
        mutation { removeItem(id: "` + node.internalId + `")
      }`
      await serverFetch(query)
    }
  },
  uploadFile: async (id, file) => {
    const data = new FormData()
    data.append('file', file)
    data.append('id', id)

    const resp = await fetch((window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : '/') + 'asset-upload', {
      method: 'POST',
      headers: {
        'x-token': localStorage.getItem('token')
      },
      body: data
    })
    if (resp.ok) {
      // todo: handle errors
    }
  },
  removeItemFile: async (id) => {
    const query = `
      mutation { removeFile(id: "` + id + `")
    }`
    await serverFetch(query)
  },
  loadAssets: async (id) => {
    const data = await serverFetch('query { getAssets(id: "' + id + `") { 
      id
      identifier
      mainImage
      image
      mimeType
      fileOrigName
      }}`)
    return data.getAssets || []
  },
  loadThumbnails: async (ids) => {
    if (!ids || ids.length === 0) return []
    const data = await serverFetch('query { getMainImages(ids: [' + ids + `]) { 
      itemId
      id
      identifier
      }}`)
    return data.getMainImages || []
  },
  searchItem: async (text) => {
    const data = await serverFetch(
      `query { search(
        requests: [
            {
                entity: ITEM, 
                offset: 0, 
                limit: 100,
                where: {OP_or: [{ identifier: { OP_like: "%` + text + '%" }}, { name: { ' + currentLanguage.value.identifier + ': { OP_like:"%' + text + `%"}}}] }
            }]
        ) {
        responses {
            ... on ItemsResponse {
                count
                rows {
                    id
                    identifier
                    name
                    typeId
                }
            }
        }}}       
      `)
    data.search.responses[0].rows = data.search.responses[0].rows.map(row => {
      let type = findType(row.typeId).node
      if (type.link !== 0) type = findType(type.link).node
      row.type = type
      return row
    })
    return data.search.responses[0]
  },
  searchItems: async (where, options) => {
    if (!where) return []

    const offset = (options.page - 1) * options.itemsPerPage
    const data = await serverFetch(
      `query { search(
        requests: [
            {
                entity: ITEM, 
                offset: ` + offset + `, 
                limit: ` + options.itemsPerPage + `,
                where: ` + objectToGraphgl(where) + `
            }]
        ) {
        responses {
            ... on ItemsResponse {
                count
                rows {
                  id 
                  identifier
                  name
                  values
                  fileOrigName
                  mimeType
                  createdBy
                  createdAt
                  updatedBy
                  updatedAt
                }
            }
        }}}       
      `)
    return data.search.responses[0]
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  itemsTree,
  currentWhereRef,
  ...actions
}

export { store }

const StoreSymbol = Symbol('MainStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject MainStore')
  }
  return tst
}
