import { reactive, provide, inject } from 'vue'
import i18n from '../i18n'
import { serverFetch, objectToGraphgl, generateSorting } from './utils'
import { currentLanguage } from './languages'

const collections = reactive([])
const channels = reactive([])

const actions = {
  loadAllCollections: async () => {
    if (collections.length > 0) return collections
    const data = await serverFetch('query { getCollections {id identifier name public user createdAt createdBy updatedAt updatedBy} }')
    if (collections.length > 0) return collections
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
  addChannel: () => {
    const name = {}
    name[currentLanguage.value.identifier] = i18n.t('Config.Channels.NewName')
    const newChan = { id: Date.now(), language: currentLanguage.value.identifier, internalId: 0, name: name, active: false, type: 0, valid: [], visible: [], config: { start: 1 }, mappings: {}, runtime: {} }
    channels.push(newChan)
    return newChan
  },
  saveChannel: async (channel) => {
    if (channel.internalId === 0) {
      const query = `
        mutation { createChannel(identifier: "` + channel.identifier + '", name: ' + objectToGraphgl(channel.name) +
        ', active: ' + channel.active +
        ', type: ' + channel.type +
        ', valid: [' + (channel.valid || []) +
        '], visible: [' + (channel.visible || []) +
        '], config: ' + objectToGraphgl(channel.config) +
        ', mappings: ' + objectToGraphgl(channel.mappings) +
        `)
      }`
      const data = await serverFetch(query)
      const newId = parseInt(data.createLanguage)
      channel.internalId = newId
    } else {
      const query = `
        mutation { updateChannel(id: "` + channel.internalId + '", name: ' + (channel.name ? '' + objectToGraphgl(channel.name) : '') +
        ', active: ' + channel.active +
        ', type: ' + channel.type +
        ', valid: [' + (channel.valid || []) +
        '], visible: [' + (channel.visible || []) +
        '], config: ' + objectToGraphgl(channel.config) +
        ', mappings: ' + objectToGraphgl(channel.mappings) +
        `)
      }`
      await serverFetch(query)
    }
  },
  removeChannel: async (id) => {
    const idx = channels.findIndex((elem) => elem.id === id)

    if (channels[idx].internalId !== 0) {
      const query = `
        mutation { removeChannel(id: "` + channels[idx].internalId + `")
      }`
      await serverFetch(query)
    }
    channels.splice(idx, 1)
  },
  getChannelStatus: async (channelId) => {
    const data = await serverFetch('query { getChannelStatus(id: "' + channelId + '") {status count} }')
    return data.getChannelStatus
  },
  getChannelStatusByCategories: async (channelId) => {
    const data = await serverFetch('query { getChannelStatusByCategories(id: "' + channelId + '") { id name statuses {status count} } }')
    return data.getChannelStatusByCategories
  },
  updateItemChannels: async (item, channels) => {
    const query = `
        mutation { updateItem(id: "` + item.id +
      '",   channels: ' + objectToGraphgl(channels) +
      `) { channels }
      }`
    const data = await serverFetch(query)
    if (item) {
      const itemData = data.updateItem
      item.channels = itemData.channels
    }
  },
  submitItem: async (itemId, itemTypeId, itemPath, channelIds, item) => {
    if (channelIds.length === 0) return
    const channelsData = {}
    let wasData = false
    const pathArr = itemPath.split('.')

    channels.forEach(channel => {
      if (channelIds.includes(channel.internalId)) {
        const tst = channel.valid.includes(itemTypeId) && channel.visible.find(elem => pathArr.includes(elem))
        if (tst) {
          channelsData[channel.identifier] = { status: 1 }
          wasData = true
        }
      }
    })
    if (wasData) {
      const query = `
        mutation { updateItem(id: "` + itemId +
        '",   channels: ' + objectToGraphgl(channelsData) +
        `) { channels }
      }`
      const data = await serverFetch(query)
      if (item) {
        const itemData = data.updateItem
        item.channels = itemData.channels
      }
    }
  },
  loadExecutions: async (channelId, options) => {
    const offset = (options.page - 1) * options.itemsPerPage
    const order = generateSorting(options)
    const data = await serverFetch('query { getExecutions(channelId: "' + channelId + '", offset: ' + offset + ', limit: ' + options.itemsPerPage + ', order: ' + objectToGraphgl(order) + `) {
      count, rows {id, status, startTime, finishTime, storagePath, log }}}`)
    return data.getExecutions
  },
  getChannelCategories: async (channelId) => {
    const data = await serverFetch('query { getChannelCategories(id: "' + channelId + '") { list {id name} tree } }')
    return data.getChannelCategories
  },
  getChannelAttributes: async (channelId, categoryId) => {
    const data = await serverFetch('query { getChannelAttributes(channelId: "' + channelId + '", categoryId: "' + categoryId + '") {id name category required dictionary description dictionaryLink dictionaryLinkPost} }')
    return data.getChannelAttributes
  },
  getChannelAttributeValues: async (channelId, categoryId, attributeId) => {
    const data = await serverFetch('query { getChannelAttributeValues(channelId: "' + channelId + '", categoryId: "' + categoryId + '", attributeId: "' + attributeId + '") }')
    return data.getChannelAttributeValues
  }
}

const store = {
  collections,
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
