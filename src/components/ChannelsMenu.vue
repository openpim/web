<template>
        <v-list nav dense>
          <v-list-item-group v-model="itemRef" color="primary">
            <v-list-item v-for="(item, i) in channelsRef" :key="i">
              <v-list-item-icon><v-icon>mdi-access-point</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
</template>
<script>
import * as langStore from '../store/languages'
import * as channelsStore from '../store/channels'
import router from '../router'
import { ref, watch, onMounted } from '@vue/composition-api'
import { useRouter } from '../router/useRouter'

export default {
  setup () {
    const { route } = useRouter()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadAllChannels,
      getAwailableChannels
    } = channelsStore.useStore()

    const itemRef = ref(null)
    const channelsRef = ref(null)

    watch(itemRef, (selected, previous) => {
      if (selected == null) {
        if (previous != null) router.push('/channels')
        return
      }
      if (selected < channelsRef.value.length) {
        const selectedChannel = channelsRef.value[selected]
        if (selectedChannel.internalId !== 0 && selectedChannel.identifier) {
          router.push('/channels/' + selectedChannel.identifier)
        } else {
          router.push('/channels')
        }
      }
    })

    onMounted(() => {
      loadAllChannels().then(() => {
        channelsRef.value = getAwailableChannels()
        if (route.value && route.value.params && route.value.params.id) {
          itemRef.value = channelsRef.value.findIndex(elem => elem.identifier === route.value.params.id)
        }
      })
    })

    return {
      itemRef,
      currentLanguage,
      defaultLanguageIdentifier,
      channelsRef
    }
  }
}
</script>
