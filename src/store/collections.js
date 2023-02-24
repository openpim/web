import { reactive, provide, inject } from '@vue/composition-api'
import i18n from '../i18n'
import * as userStore from './users'
import { serverFetch, objectToGraphgl } from './utils'
import { currentLanguage } from './languages'

const collections = reactive([])

const actions = {
  loadAllCollections: async () => {
    const data = await serverFetch('query { getCollections {id identifier name public user createdAt createdBy updatedAt updatedBy} }')
    collections.splice(0, collections.length)
    if (data.getCollections) {
      data.getCollections.forEach(element => {
        element.internalId = element.id
        collections.push(element)
      })
    }

    return collections
  },
  getCollections: () => {
    const res = []
    for (let i = 0; i < collections.length; i++) {
      const collection = collections[i]
      res.push(collection)
    }
    return res
  },
  addCollection: () => {
    const name = {}
    name[currentLanguage.value.identifier] = i18n.t('Collections.NewName')
    const newCol = { id: '' + Date.now(), internalId: 0, name: name, public: false, user: userStore.store.currentUserRef.value.login }
    collections.push(newCol)
    return newCol
  },
  saveCollection: async (collection) => {
    const query = `
      mutation { saveCollections(identifier: "` + collection.identifier + '", name: ' + objectToGraphgl(collection.name) +
      ', publicCollection: ' + collection.public +
      `)
    }`
    await serverFetch(query)
  },
  removeCollection: async (identifier) => {
    const idx = collections.findIndex((elem) => elem.identifier === identifier)
    if (collections[idx].internalId !== 0) {
      const query = `
        mutation { removeCollection(identifier: "` + collections[idx].identifier + `")
      }`
      await serverFetch(query)
    }
    collections.splice(idx, 1)
  },
  checkIdentifier: async (identifier) => {
    const data = await serverFetch('query { getCollectionByIdentifier(identifier: "' + identifier + `") { 
      id 
    } }`)
    if (data.getCollectionByIdentifier) {
      return true
    } else {
      return false
    }
  },
  submitItemToCollection: async (itemId, collectionId) => {
    console.log(itemId, collectionId)
    const query = `mutation {
      addToCollection(
          collectionId: ${collectionId},
          items: [${itemId}]
      )
    }`
    await serverFetch(query)
  },
  getCollectionByIdentifier: async (identifier) => {
    const data = await serverFetch('query { getCollectionByIdentifier(identifier: "' + identifier + `") { 
      id 
    } }`)
    if (data.getCollectionByIdentifier) {
      return data.getCollectionByIdentifier.id
    }
  },
  removeFromCollection: async (itemIds, collectionId) => {
    console.log(itemIds, collectionId)
    const data = await serverFetch(`mutation { 
      removeFromCollection(
          collectionId: ${collectionId},
          items: [${itemIds}]
      )
    }`)
    if (data.removeFromCollection) {
      return data.removeFromCollection.id
    }
  }
}

const store = {
  collections: collections,
  ...actions
}

const StoreSymbol = Symbol('CollectionsStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject CollectionsStore')
  }
  return tst
}
