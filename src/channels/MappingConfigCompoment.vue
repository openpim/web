<template>
  <div>
    {{categoriesRef}}
  </div>
</template>
<script>
import { ref, watch, onMounted } from '@vue/composition-api'
import * as channelsStore from '../store/channels'

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
    const {
      getChannelCategories
    } = channelsStore.useStore()

    watch(() => props.channel, (chan, previousValue) => {
      // loadCategories(chan)
    })

    const categoriesRef = ref([])

    function loadCategories () {
      if (props.channel) {
        getChannelCategories(props.channel.internalId).then(data => { categoriesRef.value = data })
      }
    }

    onMounted(() => {
      loadCategories()
    })

    return {
      categoriesRef
    }
  }
}
</script>
