<template>
      <div>
        <v-text-field v-model="searchRef" @input="clearSelection" :label="$t('Filter')" flat hide-details clearable clear-icon="mdi-close-circle-outline" class="ml-5 mr-5"></v-text-field>
        <v-list nav dense>
          <v-list-item-group v-model="itemRef" color="primary">
            <v-list-item v-for="(item, i) in chanFiltered" :key="i">
              <v-list-item-icon><v-icon>mdi-access-point</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>
</template>
<script>
import * as langStore from '../store/languages'
import * as channelsStore from '../store/channels'
import router from '../router'
import { ref, watch, onMounted, computed } from 'vue'
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
      getAvailableChannels
    } = channelsStore.useStore()

    const itemRef = ref(null)
    const channelsRef = ref(null)

    const searchRef = ref('')
    const chanFiltered = computed(() => {
      let arr = channelsRef.value
      if (!arr) return []
      if (searchRef.value) {
        const s = searchRef.value.toLowerCase()
        arr = channelsRef.value.filter(item => item.identifier.toLowerCase().indexOf(s) > -1 || (item.name && Object.values(item.name).find(val => val.toLowerCase().indexOf(s) > -1)))
      }
      return arr.sort((a, b) => {
        if (a.name[defaultLanguageIdentifier.value] && b.name[defaultLanguageIdentifier.value]) {
          return a.name[defaultLanguageIdentifier.value].localeCompare(b.name[defaultLanguageIdentifier.value])
        } else {
          return 0
        }
      })
    })
    function clearSelection () {
      itemRef.value = null
    }

    watch(itemRef, (selected, previous) => {
      if (selected == null) {
        if (previous != null) router.push('/channels')
        return
      }
      if (selected < chanFiltered.value.length) {
        const selectedChannel = chanFiltered.value[selected]
        if (selectedChannel.internalId !== 0 && selectedChannel.identifier) {
          router.push('/channels/' + selectedChannel.identifier)
        } else {
          router.push('/channels')
        }
      }
    })

    onMounted(() => {
      loadAllChannels().then(() => {
        clearSelection()
        channelsRef.value = getAvailableChannels()
        if (route.value && route.value.params && route.value.params.id) {
          itemRef.value = channelsRef.value.findIndex(elem => elem.identifier === route.value.params.id)
        }
      })
    })

    return {
      itemRef,
      currentLanguage,
      defaultLanguageIdentifier,
      channelsRef,
      chanFiltered,
      clearSelection,
      searchRef
    }
  }
}
</script>
