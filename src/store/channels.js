import { reactive, provide, inject } from '@vue/composition-api'
import i18n from '../i18n'
import { serverFetch, objectToGraphgl } from './utils'
import { currentLanguage } from './languages'
import * as userStore from './users'

const channels = reactive([])

function hasChannelAccess (channel, fullAccess) {
  const roles = userStore.store.currentRoles
  let access = 2
  for (let i = 0; i < roles.length; i++) {
    const role = roles[i]
    const tst = role.channelAccess.find(data => data.channelId === channel.internalId)
    if (tst && tst.access < access) access = tst.access
  }
  if (fullAccess) {
    if (access === 2) return true
  } else {
    if (access >= 1) return true
  }
  return false
}

const actions = {
  loadAllChannels: async () => {
    if (channels.length > 0) return channels
    const data = await serverFetch('query { getChannels {id identifier name active type valid visible config mappings runtime createdAt createdBy updatedAt updatedBy} }')
    if (channels.length > 0) return channels
    if (data.getChannels) {
      data.getChannels.forEach(element => {
        element.internalId = element.id
        channels.push(element)
      })
    }

    return channels
  },
  addChannel: () => {
    const name = {}
    name[currentLanguage.value.identifier] = i18n.t('Config.Channels.NewName')
    const newChan = { id: Date.now(), internalId: 0, name: name, active: false, type: 0, valid: [], visible: [], config: { start: 1 }, mappings: {}, runtime: {} }
    channels.push(newChan)
    return newChan
  },
  saveChannel: async (channel) => {
    if (channel.internalId === 0) {
      const query = `
        mutation { createChannel(identifier: "` + channel.identifier + '", name: ' + objectToGraphgl(channel.name) +
        ', active: ' + channel.active +
        ', type: ' + channel.type +
        ', config: ' + objectToGraphgl(channel.config) +
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
        ', config: ' + objectToGraphgl(channel.config) +
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
  hasChannelAccess: hasChannelAccess,
  getAwailableChannels: (fullAccessOnly) => {
    const res = []
    for (var i = 0; i < channels.length; i++) {
      const channel = channels[i]
      if (hasChannelAccess(channel, fullAccessOnly)) res.push(channel)
    }
    return res
  },
  submitItem: async (itemId, channelIds) => {
    if (channelIds.length === 0) return
    const channelsData = {}
    channels.forEach(channel => {
      if (channelIds.includes(channel.internalId)) {
        channelsData[channel.identifier] = { status: 1 }
      }
    })
    const query = `
      mutation { updateItem(id: "` + itemId +
      '", channels: ' + objectToGraphgl(channelsData) +
      `)
    }`
    await serverFetch(query)
  },
  triggerChannel: async (id) => {
    const query = `
        mutation { triggerChannel(id: "` + id + `")
      }`
    await serverFetch(query)
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  channels: channels,
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
