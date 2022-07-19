<template>
  <v-dialog v-model="selectionDialogRef" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('Channels.SelectionDialog.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
            <v-text-field v-model="searchRef" @input="clearSelection" :label="$t('Filter')" flat hide-details clearable clear-icon="mdi-close-circle-outline" class="ml-5 mr-5"></v-text-field>
            <v-list nav dense>
              <v-list-item-group v-model="selectedChannelsRef" color="primary" :multiple="multiselect">
                <v-list-item v-for="(item, i) in chanFiltered" :key="i">
                  <v-list-item-icon><v-icon>mdi-access-point</v-icon></v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title v-text="item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'"></v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="selectionDialogRef = false">{{ $t('Cancel') }}</v-btn>
        <v-btn color="blue darken-1" text @click="selected">{{ $t('Select') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { ref, computed } from '@vue/composition-api'
import * as channelsStore from '../store/channels'
import * as langStore from '../store/languages'

export default {
  name: 'RelationsSelection',
  props: {
    multiselect: {
      type: Boolean,
      required: true
    },
    editAccessOnly: {
      type: Boolean,
      required: false
    }
  },
  setup (props, { emit }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      channels,
      getAvailableChannels,
      loadAllChannels
    } = channelsStore.useStore()

    const selectedChannelsRef = ref([])
    const selectionDialogRef = ref(false)
    const channelsListRef = ref([])
    let initiator

    function selected () {
      let arr
      if (props.multiselect) {
        arr = selectedChannelsRef.value.filter(idx => idx !== -1).map(idx => chanFiltered.value[idx].internalId)
      } else {
        arr = [chanFiltered.value[selectedChannelsRef.value].internalId]
      }
      emit('selected', arr, initiator)
    }

    const searchRef = ref('')
    const chanFiltered = computed(() => {
      let arr = channelsListRef.value
      if (!arr) return []
      if (searchRef.value) {
        const s = searchRef.value.toLowerCase()
        arr = channelsListRef.value.filter(item => item.identifier.toLowerCase().indexOf(s) > -1 || (item.name && Object.values(item.name).find(val => val.toLowerCase().indexOf(s) > -1)))
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
      selectedChannelsRef.value = []
    }

    function showDialog (init, selected) {
      initiator = init
      clearSelection()
      if (channels.length === 0) {
        loadAllChannels().then(() => {
          selectionDialogRef.value = true
          channelsListRef.value = getAvailableChannels(props.editAccessOnly)
          const arr = selected ? selected.map(id => channelsListRef.value.findIndex(rel => rel.id === id || rel.internalId === id)) : []
          selectedChannelsRef.value = arr
        })
      } else {
        selectionDialogRef.value = true
        channelsListRef.value = getAvailableChannels(props.editAccessOnly)
        const arr = selected ? selected.map(id => channelsListRef.value.findIndex(rel => rel.id === id || rel.internalId === id)) : []
        selectedChannelsRef.value = arr
      }
    }

    function closeDialog () {
      selectionDialogRef.value = false
    }

    return {
      channelsListRef,
      selectionDialogRef,
      selected,
      selectedChannelsRef,
      showDialog,
      closeDialog,
      searchRef,
      clearSelection,
      chanFiltered,
      currentLanguage,
      defaultLanguageIdentifier
    }
  }
}
</script>
