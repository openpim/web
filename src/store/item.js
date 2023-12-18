import { reactive, provide, inject } from '@vue/composition-api'
import { serverFetch, findNode, removeNodeByInternalId, findNodeByComparator, objectToGraphgl } from './utils'
import * as typesStore from './types'
import * as attrStore from './attributes'
import * as err from './error'
import i18n from '../i18n'
import { currentLanguage } from './languages'

const itemsTree = reactive([])

const {
  findType
} = typesStore.store

const {
  getAttributesForSearch
} = attrStore.store

function enrichItem (item) {
  if (item) {
    item.id = parseInt(item.id)
    item.internalId = item.id
    let type = findType(item.typeId).node
    if (type.link !== 0) type = findType(type.link).node
    item.typeIcon = type.icon
    item.typeIdentifier = type.identifier
    item.typeIconColor = type.iconColor
    item.typeFile = type.file
    item.children = []
  }
  return item
}

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
  nextId: async (seqName) => {
    const data = await serverFetch('query { nextId' + (seqName ? '(seqName:"' + seqName + '")' : '') + '}')
    return data.nextId
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
      channels
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
  loadItemChannels: async (identifier) => {
    const item = await serverFetch('query { getItemByIdentifier(identifier: "' + identifier + `") { 
      channels
    } }`)
    return item.getItemByIdentifier.channels
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
  loadItems: async (id, parentId, typeId) => {
    let order = ''
    if (typeId) {
      const type = findType(typeId).node
      const tstFields = type.options.find(elem => elem.name === 'sort')
      if (tstFields) {
        const arr = tstFields.value.split(',')
        const tstOrder = type.options.find(elem => elem.name === 'sortDirection')
        const sort = []
        arr.forEach(field => {
          sort.push([field, tstOrder ? tstOrder.value : 'ASC'])
        })
        order = 'order:' + objectToGraphgl(sort)
      }
    } else {
      const sort = [['values.topOrder', 'ASC'], ['id', 'ASC']]
      order = 'order:' + objectToGraphgl(sort)
    }

    const data = await serverFetch('query { getItems(parentId: "' + (parentId || '') + '", offset: 0, limit: 500, ' + order + `) { 
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
    const order = generateSorting(options)
    const data = await serverFetch('query { getItems(parentId: "' + (parentId || '') + '", offset: ' + offset + ', limit: ' + options.itemsPerPage + ', order: ' + objectToGraphgl(order) + `) { 
      count,
      rows 
      { 
        id 
        identifier
        parentIdentifier
        typeIdentifier
        typeId
        path
        name
        values
        channels
        fileOrigName
        mimeType
        createdBy
        createdAt
        updatedBy
        updatedAt
    } } }`)
    return data.getItems
  },
  hasRelations: async (id) => {
    const data = await serverFetch('query { hasRelations(id: "' + id + '") }')
    return data.hasRelations
  },
  createItem: async (item, parent, findParentForChildren) => {
    const query = `
      mutation { createItem(identifier: "` + item.identifier + '", name: ' + objectToGraphgl(item.name) +
      ', values: ' + (item.values ? objectToGraphgl(item.values) : null) +
      ', parentId: "' + (parent && parent.id !== -1 ? '' + parent.internalId : '') +
      '", typeId: "' + item.typeId +
      `") { id }
    }`
    const data = await serverFetch(query)
    const itemData = data.createItem
    const newId = parseInt(itemData.id)
    item.internalId = newId

    if (findParentForChildren && parent && parent.id !== -1) {
      const path = []
      parent = findNode(parent.internalId, itemsTree, path)
      if (parent) {
        if (parent.children.length > 0) parent.children.push(item)
      }
    } else {
      const children = parent && parent.id !== -1 ? parent.children : itemsTree
      children.push(item)
    }
  },
  createItemInTree: (item, parent) => {
    if (parent && parent.id !== -1) {
      const path = []
      const parentId = parent.internalId ? parent.internalId : parent.id
      const parentNode = findNode(parentId, itemsTree, path)
      if (parentNode && parentNode.children) {
        if (!parentNode.children.some((el) => el.id === item.id)) {
          parentNode.children.push(enrichItem(item))
        }
      }
    }
  },
  updateItem: async (item) => {
    const query = `
      mutation { updateItem(id: "` + item.internalId + '" ' + (item.name ? ', name: ' + objectToGraphgl(item.name) : '') +
      ', values: ' + (item.values ? objectToGraphgl(item.values) : null) +
      `) { name, values, channels }
    }`
    const data = await serverFetch(query)
    const itemData = data.updateItem
    item.name = itemData.name
    item.values = itemData.values
    item.channels = itemData.channels
  },
  reloadItem: async (item) => {
    const data = await serverFetch('query { getItem(id: ' + item.internalId + `) { 
      name, values, channels 
    } }`)
    if (data.getItem) {
      const itemData = data.getItem
      item.name = itemData.name
      item.values = itemData.values
      item.channels = itemData.channels
    }
  },
  moveItem: async (item, parentId) => {
    const query = `
      mutation { moveItem(id: "` + item.internalId + '", parentId: "' + parentId + `") { 
        path
        name
        values
        channels
      }
    }`
    const data = await serverFetch(query)
    item.path = data.moveItem.path
    item.name = data.moveItem.name
    item.values = data.moveItem.values
    item.channels = data.moveItem.channels

    removeNodeByInternalId(item.internalId, itemsTree)

    const path = []
    const parent = findNodeByComparator(parentId, itemsTree, path, (id, item) => item.internalId === id)
    parent.children.push(item)
  },
  removeItem: async (id) => {
    const path = []
    const node = findNodeByComparator(id, itemsTree, path, (id, item) => item.internalId === id)

    const idToRemove = node ? node.internalId : id
    const query = `
      mutation { removeItem(id: "` + idToRemove + `") 
    }`
    const resp = await serverFetch(query)
    if (resp.removeItem) removeNodeByInternalId(id, itemsTree)
  },
  removeItemFromTree: (id) => {
    removeNodeByInternalId(id, itemsTree)
  },
  uploadFile: async (id, file) => {
    const data = new FormData()
    data.append('file', file)
    data.append('id', id)

    const resp = await fetch((window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/') + 'asset-upload', {
      method: 'POST',
      headers: {
        'x-token': localStorage.getItem('token')
      },
      body: data
    })
    if (!resp.ok) {
      err.store.showError(i18n.t('File.UploadFailed') + ' ' + (await resp.text()))
      return false
    } else {
      return await resp.json()
    }
  },
  uploadAndCreateFile: async (itemId, file, fileItemTypeId, parentId, relationId, lang, fileName, fileIdentifier) => {
    const data = new FormData()
    data.append('itemId', itemId)
    data.append('file', file)
    data.append('fileItemTypeId', fileItemTypeId)
    data.append('parentId', parentId)
    data.append('relationId', relationId)
    data.append('lang', lang)
    data.append('fileName', fileName)
    data.append('fileIdentifier', fileIdentifier)

    const resp = await fetch((window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/') + 'asset-create-upload', {
      method: 'POST',
      headers: {
        'x-token': localStorage.getItem('token')
      },
      body: data
    })
    if (!resp.ok) {
      err.store.showError(i18n.t('File.UploadFailed') + ' ' + (await resp.text()))
      return false
    } else {
      return true
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
      typeId
      identifier
      name
      relationName
      relationId
      name
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
  searchItem: async (text, additionFilter) => {
    const txt = text.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
    const attrs = getAttributesForSearch()
    let attrExpr = ''
    attrs.forEach(attr => {
      attrExpr += '{ values: { ' + attr.identifier + ': { OP_iLike:"""%' + txt + '%"""}}},'
    })
    const mainExpr = '{ identifier: { OP_iLike: """%' + txt + '%""" }}, { name: { ' + currentLanguage.value.identifier + ': { OP_iLike:"""%' + txt + '%"""}}}'
    let andExpr = ''
    if (additionFilter) {
      andExpr = '{OP_and: [' + additionFilter + ','
    }
    const data = await serverFetch(
      `query { search(
        requests: [
            {
                entity: ITEM, 
                offset: 0, 
                limit: 100,
                where: ` + andExpr + '{OP_or: [' + attrExpr + mainExpr + '] }' + (andExpr ? ']}' : '') + `,
                order: [["\\"typeId\\"", "ASC"],["id", "ASC"]]
            }]
        ) {
        responses {
            ... on ItemsSearchResponse {
                rows {
                    id
                    identifier
                    name
                    typeId
                    values
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
    const order = generateSorting(options)
    const data = await serverFetch(
      `query { search(
        requests: [
            {
                entity: ITEM, 
                offset: ` + offset + `, 
                limit: ` + options.itemsPerPage + `,
                where: ` + objectToGraphgl(where) + `,
                order: ` + objectToGraphgl(order) + `
            }]
        ) {
        responses {
            ... on ItemsSearchResponse {
                count
                rows {
                  id 
                  identifier
                  parentIdentifier
                  typeIdentifier
                  typeId
                  path
                  name
                  values
                  channels
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
    const res = data.search.responses[0]
    if (res.count <= options.itemsPerPage && res.rows.length !== res.count) {
      // count can be more then real rows because system perform addition filtering after SQL query, while count based on SQL only
      res.count = res.rows.length
    }
    return res
  },
  importItems: async (rows, mode) => {
    let query = `
      mutation { import(
        config: {
            mode: ` + mode + `
            errors: PROCESS_WARN
        },
        items: [`

    rows.forEach(row => {
      query += objectToGraphgl(row)
    })

    query += `]
        ) {
        items {
        identifier
        result
        id
        errors { code message }
        warnings { code message }
      }}}    
    `
    const data = await serverFetch(query)
    return data.import.items
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  itemsTree,
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
