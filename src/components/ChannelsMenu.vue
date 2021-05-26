<template>
        <v-list nav dense>
          <v-list-item-group v-model="itemRef" color="primary">
            <v-list-item v-for="(item, i) in channels" :key="i">
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

export default {
  setup () {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      channels,
      loadAllChannels
    } = channelsStore.useStore()

    const itemRef = ref(null)

    watch(itemRef, (selected, previous) => {
      if (selected == null) {
        return
      }
      if (selected < channels.length) {
        const selectedChannel = channels[selected]
        if (selectedChannel.internalId !== 0 && selectedChannel.identifier) {
          router.push('/channels/' + selectedChannel.identifier)
        } else {
          router.push('/channels')
        }
      }
    })

    onMounted(() => {
      loadAllChannels()
    })

    return {
      itemRef,
      currentLanguage,
      defaultLanguageIdentifier,
      channels
    }
  }
}
</script>
