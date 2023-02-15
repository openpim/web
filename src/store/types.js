import { reactive, provide, inject } from 'vue'
import i18n from '../i18n'
import { serverFetch, findNode, findNodeByComparator, removeNode, objectToGraphgl } from './utils'
import { currentLanguage } from './languages'

const typesTree = reactive([])

let promise
const actions = {
  loadAllTypes: async () => {
    if (!promise) promise = serverFetch('query { getTypes }')
    const data = await promise
    if (typesTree.length > 0) return
    if (data.getTypes) {
      data.getTypes.forEach(element => {
        typesTree.push(element)
      })
    }
  },
  saveType: async (item) => {
    const path = []
    const node = findNode(item.id, typesTree, path)
    const parentId = path.length === 0 ? null : path[path.length - 1]
    const parent = parentId ? findNode(parentId, typesTree, path) : null

    if (item.internalId === 0) {
      const query = `
        mutation { createType(identifier: "` + item.identifier + '", name: ' + objectToGraphgl(item.name) +
        ', parentId: "' + (parent ? '' + parent.internalId : '') +
        '", icon: "' + (item.icon ? '' + item.icon : '') +
        '", iconColor: "' + (item.iconColor ? '' + item.iconColor : '') +
        '", file: ' + item.file +
        ', mainImage: ' + item.mainImage +
        ', images: [' + (item.images || []) +
        '], options: ' + objectToGraphgl(item.options) + ` )
      }`
      const data = await serverFetch(query)
      if (!node.children) {
        node.children = []
      }
      const newId = parseInt(data.createType)
      node.internalId = newId
    } else {
      const query = `
        mutation { updateType(id: "` + item.internalId + '", name: ' + (item.name ? objectToGraphgl(item.name) : '') +
        ', icon: "' + (item.icon ? '' + item.icon : '') +
        '", iconColor: "' + (item.iconColor ? '' + item.iconColor : '') +
        '", file: ' + item.file +
        ', mainImage: ' + item.mainImage +
        ', images: [' + (item.images || []) +
        '], options: ' + objectToGraphgl(item.options) + ` )
      }`
      await serverFetch(query)
    }
  },
  findType: (id) => {
    if (typeof id === 'string' || id instanceof String) {
      id = parseInt(id)
    }
    const path = []
    const node = findNode(id, typesTree, path)
    return { node, path }
  },
  findTypeByIdentifier: (identifier) => {
    const path = []
    const node = findNodeByComparator(identifier, typesTree, path, (identifier, item) => item.identifier === identifier)
    return { node, path }
  },
  addType: (parentId) => {
    const name = {}
    name[currentLanguage.value.identifier] = i18n.t('Config.Types.ObjectType.NewName')
    const newType = { id: Date.now(), internalId: 0, name, link: 0, file: false, mainImage: 0, images: [], children: [], options: [] }
    if (parentId !== -1) {
      const parent = findNode(parentId, typesTree)
      parent.children.push(newType)
    } else {
      typesTree.push(newType)
    }
    return newType
  },
  linkType: async (parentId, id, internalId) => {
    const typeNode = actions.findType(id)
    const newType = { id: Date.now(), internalId: Date.now(), name: typeNode.node.name, link: id, icon: typeNode.node.icon, iconColor: typeNode.node.iconColor }
    const parent = findNode(parentId, typesTree)
    parent.children.push(newType)

    const query = `
    mutation { linkType(id: "` + internalId + '", parentId: "' + parentId + `")
    }`
    const data = await serverFetch(query)
    newType.internalId = parseInt(data.linkType)
    return newType
  },
  removeType: async (id) => {
    const node = actions.findType(id).node

    if (node.internalId !== 0) {
      const query = `
        mutation { removeType(id: "` + node.internalId + `")
      }`
      await serverFetch(query).then(() => {
        removeNode(id, typesTree)
      })
    } else {
      removeNode(id, typesTree)
    }
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  typesTree,
  ...actions
}

export { store }

const StoreSymbol = Symbol('TypesStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject TypesStore')
  }
  return tst
}
