<template>
  <v-dialog v-model="selectionDialogRef" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('Templates.SelectionDialog.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="searchRef" @input="clearSelection" :label="$t('Filter')" flat hide-details
                clearable clear-icon="mdi-close-circle-outline" class="ml-5 mr-5"></v-text-field>
              <v-list :expand="true" nav dense>
                <v-list-item v-for="temp in filteredTemplates" :key="temp.id" @click="toggleSelection(temp.id)"
                  :class="{ 'v-item--active': isSelected(temp.id), 'v-list-item--active': isSelected(temp.id), 'primary--text': isSelected(temp.id) }"
                  :multiple="multiselect">
                  <v-list-item-icon>
                    <v-icon>mdi-file-edit-outline</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ temp.name[currentLanguage.identifier] || `[${temp.name[defaultLanguage]}]` }}
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
        <v-btn color="blue darken-1" text @click="closeDialog">{{ $t('Cancel') }}</v-btn>
        <v-btn color="blue darken-1" text @click="selected">{{ $t('Select') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed } from '@vue/composition-api'
import * as tempStore from '../store/templates'
import * as langStore from '../store/languages'

export default {
  name: 'TemplatesSelectionDialog',
  props: {
    multiselect: {
      type: Boolean,
      required: true
    },
    editAccessOnly: {
      type: Boolean,
      required: false
    },
    dataTable: {
      type: Boolean,
      required: true
    }
  },
  setup (props, { emit }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      templates,
      loadAllTemplates
    } = tempStore.useStore()

    const selectedTemplateRef = ref([])
    const selectionDialogRef = ref(false)
    const templatesListRef = ref([])
    let initiator

    function selected () {
      const arr = selectedTemplateRef.value.map(id => templatesListRef.value.find(temp => temp.id === id).internalId)
      emit('selected', arr, initiator)
    }

    const searchRef = ref('')
    const filteredTemplates = computed(() => {
      if (!templatesListRef.value) return []
      const arr = templatesListRef.value
      const filteredByTableView = props.dataTable
        ? arr.filter(temp =>
          temp.options?.some(option => option.name === 'tableView' && option.value === 'true')
        )
        : arr

      if (searchRef.value) {
        const searchTerm = searchRef.value.toLowerCase()
        const filteredResult = []

        filteredByTableView.forEach(temp => {
          const identifierMatch = temp.identifier.toLowerCase().includes(searchTerm)
          const nameMatch = temp.name && Object.values(temp.name).some(val => val.toLowerCase().includes(searchTerm))

          if (identifierMatch || nameMatch) {
            filteredResult.push(temp)
          }
        })

        return filteredResult
      }

      return filteredByTableView
    })

    function clearSelection () {
      selectedTemplateRef.value = []
    }

    function showDialog (init, selected) {
      initiator = init
      clearSelection()
      if (templates.length === 0) {
        loadAllTemplates().then(() => {
          selectionDialogRef.value = true
          templatesListRef.value = templates
          const arr = selected ? selected.map(id => templatesListRef.value.findIndex(temp => temp.id === id || temp.internalId === id)) : []
          selectedTemplateRef.value = arr
        })
      } else {
        selectionDialogRef.value = true
        templatesListRef.value = templates
        const arr = selected ? selected.map(id => templatesListRef.value.findIndex(temp => temp.id === id || temp.internalId === id)) : []
        selectedTemplateRef.value = arr
      }
    }

    function closeDialog () {
      selectionDialogRef.value = false
    }

    function toggleSelection (id) {
      if (props.multiselect) {
        const index = selectedTemplateRef.value.indexOf(id)
        if (index === -1) {
          selectedTemplateRef.value.push(id)
        } else {
          selectedTemplateRef.value.splice(index, 1)
        }
      } else {
        selectedTemplateRef.value = [id]
      }
    }

    function isSelected (id) {
      return selectedTemplateRef.value.includes(id)
    }

    return {
      filteredTemplates,
      templatesListRef,
      selectionDialogRef,
      selected,
      selectedTemplateRef,
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
