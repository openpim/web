<template>
  <div>
    <v-text-field v-if="channel" v-model="channel.config.extCmd" :readonly=readonly :label="$t('Channels.Ext.cmd')" required></v-text-field>
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
    })

    return {
    }
  }
}
</script>
