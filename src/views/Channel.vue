<template>
  <v-container v-if="itemRef" class="pa-0">
    <v-row no-gutters>
      <v-col cols="12">
        {{itemRef}}
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, watch } from '@vue/composition-api'
import * as channelsStore from '../store/channels'
// import * as langStore from '../store/languages'
import { useRouter } from '../router/useRouter'
// import i18n from '../i18n'

export default {
  setup (params, context) {
    const { route } = useRouter()

    const {
      channels,
      loadAllChannels
    } = channelsStore.useStore()

    /*
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore() */

    const itemRef = ref(null)
    watch(route, (current, previous) => {
      if (previous && current && current.params && current.params.id) {
        itemRef.value = channels.find(elem => elem.ientifier === current.params.id)
      } else {
        itemRef.value = null
      }
    })

    onMounted(() => {
      loadAllChannels().then(() => {
        if (route.value && route.value.params && route.value.params.id) {
          itemRef.value = channels.find(elem => elem.ientifier === route.value.params.id)
        }
      })
    })

    return {
      itemRef
    }
  }
}
</script>
