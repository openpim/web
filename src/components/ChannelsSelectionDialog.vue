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
              <v-text-field v-model="searchRef" @input="clearSelection" :label="$t('Filter')" flat hide-details
                clearable clear-icon="mdi-close-circle-outline" class="ml-5 mr-5"></v-text-field>
              <v-list :expand="true" nav dense>
                <v-list-group v-for="group in groupedChannels" :key="group.id" prepend-icon="mdi-folder"
                  :value="!!searchRef">
                  <template v-slot:activator>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ group.name[currentLanguage.identifier] || `[${group.name[defaultLanguage]}]` }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </template>
                  <v-row>
                    <v-col cols="1"></v-col>
                    <v-col>
                      <v-list-item v-for="child in group.children" :key="child.id" @click="toggleSelection(child.id)"
                        :class="{ 'v-item--active': isSelected(child.id), 'v-list-item--active': isSelected(child.id) }"
                        :multiple="multiselect">
                        <v-list-item-icon>
                          <v-icon>mdi-access-point</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ child.name[currentLanguage.identifier] || `[${child.name[defaultLanguage]}]` }}
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-col>
                  </v-row>
                </v-list-group>

                <v-list-item v-for="chan in singleChannels" :key="chan.id" @click="toggleSelection(chan.id)"
                  :class="{ 'v-item--active': isSelected(chan.id), 'v-list-item--active': isSelected(chan.id), 'primary--text': isSelected(chan.id) }"
                  :multiple="multiselect">
                  <v-list-item-icon>
                    <v-icon>mdi-access-point</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ chan.name[currentLanguage.identifier] || `[${chan.name[defaultLanguage]}]` }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
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
      const arr = selectedChannelsRef.value.map(id => channelsListRef.value.find(chan => chan.id === id).internalId)
      emit('selected', arr, initiator)
    }

    const searchRef = ref('')
    function filteredChannels () {
      let arr = channelsListRef.value
      const result = []
      const chanMap = {}

      if (searchRef.value) {
        const searchTerm = searchRef.value.toLowerCase()
        arr = arr.filter(chan => {
          const identifierMatch = chan.identifier.toLowerCase().includes(searchTerm)
          const nameMatch = chan.name && Object.values(chan.name).some(val => val.toLowerCase().includes(searchTerm))
          return identifierMatch || nameMatch || chan.group
        })
        arr = arr.filter(chan => {
          if (chan.group) {
            const hasParent = arr.some(item => item.parentId === parseInt(chan.id))
            const identifierMatch = chan.identifier.toLowerCase().includes(searchTerm)
            const nameMatch = chan.name && Object.values(chan.name).some(val => val.toLowerCase().includes(searchTerm))
            return identifierMatch || nameMatch || hasParent
          }
          return true
        })
      }

      arr.forEach(chan => {
        chanMap[chan.id] = { ...chan, children: [] }
      })

      arr.forEach(chan => {
        if (chan.parentId) {
          const parent = chanMap[chan.parentId]
          if (parent) {
            parent.children.push(chanMap[chan.id])
          }
        } else if (chan.group || (chan.parentId === 0 && !chan.group)) {
          result.push(chanMap[chan.id])
        }
      })

      result.forEach(group => {
        if (group.children.length > 0) {
          group.children.sort((a, b) => a.order - b.order)
        }
      })
      return result
    }

    const groupedChannels = computed(() => {
      return filteredChannels().filter(item => item.group).sort((a, b) => a.order - b.order)
    })

    const singleChannels = computed(() => {
      return filteredChannels().filter(item => !item.group).sort((a, b) => a.order - b.order)
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

    function toggleSelection (id) {
      const index = selectedChannelsRef.value.indexOf(id)
      if (index === -1) {
        selectedChannelsRef.value.push(id)
      } else {
        selectedChannelsRef.value.splice(index, 1)
      }
    }

    function isSelected (id) {
      return selectedChannelsRef.value.includes(id)
    }

    return {
      singleChannels,
      groupedChannels,
      filteredChannels,
      channelsListRef,
      selectionDialogRef,
      selected,
      selectedChannelsRef,
      showDialog,
      closeDialog,
      searchRef,
      clearSelection,
      toggleSelection,
      isSelected,
      currentLanguage,
      defaultLanguageIdentifier
    }
  }
}
</script>
