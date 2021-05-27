import { reactive, provide, inject } from '@vue/composition-api'
import i18n from '../i18n'
import { serverFetch, objectToGraphgl } from './utils'
import { currentLanguage } from './languages'
import * as userStore from './users'

const channels = reactive([])

const actions = {
  loadAllChannels: async () => {
    if (channels.length > 0) return channels
    const data = await serverFetch('query { getChannels {id identifier name active type config mappings createdAt createdBy updatedAt updatedBy} }')
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
    const newChan = { id: Date.now(), internalId: 0, name: name, active: false, type: 0, config: {}, mappings: {} }
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
  getAwailableChannels (fullAccessOnly) {
    const res = []
    for (var i = 0; i < channels.length; i++) {
      const channel = channels[i]

      const roles = userStore.store.currentRoles
      let access = 2
      for (let i = 0; i < roles.length; i++) {
        const role = roles[i]
        const tst = role.channelAccess.find(data => data.channelId === channel.internalId)
        if (tst && tst.access < access) access = tst.access
      }
      console.log(channel, access)
      if (fullAccessOnly) {
        if (access === 2) res.push(channel)
      } else {
        if (access >= 1) res.push(channel)
      }
    }
    return res
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
