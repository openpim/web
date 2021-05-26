<template>
  <div>
    <v-text-field v-if="channel" v-model="channel.config[channel.identifier].extCmd"  :label="$t('Channels.Ext.cmd')" required></v-text-field>
  </div>
</template>
<script>
import { watch } from '@vue/composition-api'

export default {
  props: {
    channel: {
      required: true
    }
  },
  setup (props, { root }) {
    watch(() => props.channel, (chan, previousValue) => {
      if (chan && !chan.config[chan.identifier]) {
        root.$set(chan.config, chan.identifier, { extCmd: '' })
      }
    })

    return {
    }
  }
}
</script>
