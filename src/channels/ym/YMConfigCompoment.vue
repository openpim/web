<template>
  <div>
    !!!
  </div>
</template>
<script>
import { watch } from '@vue/composition-api'
// import * as channelsStore from '../../store/channels'

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
  components: { },
  setup (props, { root }) {
    watch(() => props.channel, (chan, previousValue) => {
      /* if (chan && !chan.config.wbToken) {
        root.$set(chan.config, 'wbToken', '')
      } */
    })

    return {
    }
  }
}
</script>
