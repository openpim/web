<template>
  <div>
    <v-text-field v-if="channel" v-model="channel.config.wbToken" :readonly=readonly :label="$t('Channels.WB.token')" required></v-text-field>
    <MappingConfigCompoment v-if="channel" :channel="channel" :readonly=readonly ></MappingConfigCompoment>
  </div>
</template>
<script>
import { watch } from '@vue/composition-api'
import MappingConfigCompoment from '../MappingConfigCompoment'

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
  components: { MappingConfigCompoment },
  setup (props, { root }) {
    watch(() => props.channel, (chan, previousValue) => {
      if (chan && !chan.config.wbToken) {
        root.$set(chan.wbToken, 'wbToken', '')
      }
    })

    return {
    }
  }
}
</script>
