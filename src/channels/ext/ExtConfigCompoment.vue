<template>
  <div>
    <v-text-field v-if="channel" v-model="channel.config.extCmd" :readonly=readonly :label="$t('Channels.Ext.cmd')" required></v-text-field>
    <v-text-field v-if="channel" v-model="channel.config.extFile" :readonly=readonly :label="$t('Channels.Ext.File')" required></v-text-field>
    <v-text-field v-if="channel" v-model="channel.config.extMime" :readonly=readonly :label="$t('Channels.Ext.Mime')" required></v-text-field>
  </div>
</template>
<script>
import { watch } from '@vue/composition-api'

export default {
  props: {
    channel: {
      required: true
    },
    readonly: {
      type: Boolean,
      required: true
    }
  },
  setup (props, { root }) {
    watch(() => props.channel, (chan, previousValue) => {
      if (chan && !chan.config.extCmd) {
        root.$set(chan.config, 'extCmd', '')
      }
      if (chan && !chan.config.extFile) {
        root.$set(chan.config, 'extFile', '')
      }
      if (chan && !chan.config.extMime) {
        root.$set(chan.config, 'extMime', '')
      }
    })

    return {
    }
  }
}
</script>
