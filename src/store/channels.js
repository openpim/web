import { reactive, provide, inject } from '@vue/composition-api'
import i18n from '../i18n'
import { serverFetch, objectToGraphgl, generateSorting } from './utils'
import { currentLanguage } from './languages'
import * as userStore from './users'
import * as err from './error'

const channels = reactive([])
const channelTypes = reactive([])

function hasChannelAccess (channel, fullAccess) {
  const roles = userStore.store.currentRoles
  let access = -1
  for (let i = 0; i < roles.length; i++) {
    const role = roles[i]
    const tst = role.channelAccess.find(data => data.channelId === channel.internalId)
    if (tst && tst.access > access) access = tst.access
  }
  if (fullAccess) {
    if (access === -1 || access === 2) return true
  } else {
    if (access === -1 || access >= 1) return true
  }
  return false
}

let typePromise
let chanPromise
let chanPromiseAll
let channelsMappingLoaded = false

const actions = {
  loadAllChannelTypes: async () => {
    if (!typePromise) typePromise = serverFetch('query { getChannelTypes }')
    const data = await typePromise
    if (channelTypes.length > 0) return channels
    if (data.getChannelTypes) {
      data.getChannelTypes.forEach(id => {
        channelTypes.push(id)
      })
    }

    return channels
  },
  loadAllChannels: async () => {
    if (!chanPromise) chanPromise = serverFetch('query { getChannels {id identifier name order group active type valid visible config runtime parentId createdAt createdBy updatedAt updatedBy} }')
    const data = await chanPromise
    if (channels.length > 0) return channels
    if (data.getChannels) {
      data.getChannels.forEach(element => {
        element.internalId = element.id
        channels.push(element)
      })
    }

    return channels
  },
  loadAllChannelsWithMapping: async () => {
    if (!chanPromiseAll) {
      chanPromiseAll = serverFetch('query { getChannels {id identifier name order group active type valid visible config mappings runtime parentId createdAt createdBy updatedAt updatedBy} }')
    }
    const data = await chanPromiseAll
    const readingTime = new Date().toISOString()
    if (channelsMappingLoaded) return channels
    if (data.getChannels) {
      channels.splice(0)
      data.getChannels.forEach(element => {
        if (element.mappings) {
          Object.keys(element.mappings).forEach(mapping => {
            if (mapping !== '_default') {
              element.mappings[mapping].readingTime = readingTime
              if (!element.mappings[mapping].key) element.mappings[mapping].key = element.mappings[mapping].id
            }
          })
        }
        element.internalId = element.id
        channels.push(element)
      })
      channelsMappingLoaded = true
    }

    return channels
  },
  addChannel: (group, parentId) => {
    const name = {}
    const id = Date.now()
    name[currentLanguage.value.identifier] = group ? i18n.t('Config.Channels.NewGroupName') : i18n.t('Config.Channels.NewName')
    const newChan = { id, language: currentLanguage.value.identifier, internalId: 0, name, order: 0, group, active: false, type: 0, valid: [], visible: [], config: { start: 1 }, mappings: {}, runtime: {}, parentId }
    channels.push(newChan)
    return newChan
  },
  saveChannel: async (channel) => {
    if (channel.internalId === 0) {
      const query = `
        mutation($config: JSONObject, $mappings: JSONObject) { createChannel(identifier: "` + channel.identifier + '", name: ' + objectToGraphgl(channel.name) +
        ', order: ' + channel.order +
        ', group: ' + channel.group +
        ', parentId: ' + channel.parentId +
        ', active: ' + channel.active +
        ', type: ' + channel.type +
        ', valid: [' + (channel.valid || []) +
        '], visible: [' + (channel.visible || []) +
        '], config: $config, mappings: $mappings' +
        `)
      }`

      const variables = {
        config: channel.config,
        mappings: channel.mappings
      }

      const data = await serverFetch(query, variables)
      const newId = parseInt(data.createChannel)
      channel.internalId = newId
    } else {
      const query = `
        mutation($config: JSONObject, $mappings: JSONObject) { updateChannel(id: "` + channel.internalId + '", name: ' + (channel.name ? '' + objectToGraphgl(channel.name) : '') +
        ', order: ' + channel.order +
        ', group: ' + channel.group +
        ', parentId: ' + channel.parentId +
        ', active: ' + channel.active +
        ', type: ' + channel.type +
        ', valid: [' + (channel.valid || []) +
        '], visible: [' + (channel.visible || []) +
        '], config: $config, mappings: $mappings' +
        `)
      }`

      const variables = {
        config: channel.config,
        mappings: channel.mappings
      }

      await serverFetch(query, variables)
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
  bulkUpdate: async () => {
    const query = `
        mutation { bulkUpdate(id: "")
      }`
    await serverFetch(query)
  },
  getChannelStatus: async (channelId) => {
    const data = await serverFetch('query { getChannelStatus(id: "' + channelId + '") {status count} }')
    return data.getChannelStatus
  },
  getChannelStatusByCategories: async (channelId) => {
    const data = await serverFetch('query { getChannelStatusByCategories(id: "' + channelId + '") { id name statuses {status count} } }')
    return data.getChannelStatusByCategories
  },
  hasChannelAccess: hasChannelAccess,
  getAvailableChannels: (fullAccessOnly) => {
    const res = []
    for (var i = 0; i < channels.length; i++) {
      const channel = channels[i]
      if (hasChannelAccess(channel, fullAccessOnly)) res.push(channel)
    }
    return res
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
  submitItems: async (where, channelIds) => {
    await actions.submitItemsStatus(1, where, channelIds)
  },
  submitItemsStatus: async (status, where, channelIds) => {
    if (channelIds.length === 0) return
    const channelIdentifiers = channels
      .filter((channel) => channelIds.includes(channel.id))
      .map((channel) => channel.identifier)
    const query = `
    mutation { bulkUpdateChannels(
        identifiers: ${JSON.stringify(channelIdentifiers)},
        status:  ${status},
        message: "",
        where: """${JSON.stringify(where)}"""
      )
    }`
    await serverFetch(query)
  },
  triggerChannel: async (id, data) => {
    const query = `
        mutation { triggerChannel(id: "` + id + '", language:"' + currentLanguage.value.identifier + '" ' + (data ? ', data: ' + objectToGraphgl(data) : '') + `)
      }`
    await serverFetch(query)
  },
  loadExecutions: async (channelId, options) => {
    const offset = (options.page - 1) * options.itemsPerPage
    const order = generateSorting(options)
    const includeLog = options.log ? ', log' : ''
    const data = await serverFetch('query { getExecutions(channelId: "' + channelId + '", offset: ' + offset + ', limit: ' + options.itemsPerPage + ', order: ' + objectToGraphgl(order) + `) { 
      count, rows {id, status, startTime, finishTime, storagePath ${includeLog} }}}`)
    return data.getExecutions
  },
  loadExecutionById: async (id) => {
    const data = await serverFetch(`query { getExecutionById(id: "${id}") { id channelId status startTime finishTime storagePath log  createdAt updatedAt } }`)
    return data.getExecutionById
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
  },
  uploadXlsxTemplate: async (id, file) => {
    const data = new FormData()
    data.append('file', file)
    data.append('id', id)

    const resp = await fetch((window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/') + 'xlsx-template-upload', {
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
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  channels: channels,
  channelTypes: channelTypes,
  ...actions
}

const StoreSymbol = Symbol('ChannelsStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject ChannelsStore')
  }
  return tst
}
