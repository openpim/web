<template>
  <v-dialog v-model="selectionDialogRef" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('Config.Actions.Triggers.Type.Attribute') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" class="pa-0 overflow-y-auto" style="max-height: 70vh">
              <v-text-field @input="searchChanged" @clear="searchChanged" v-model="searchRef" :label="$t('Filter')" flat hide-details clearable clear-icon="mdi-close-circle-outline" class="ml-5 mr-5 mt-2 pt-0"></v-text-field>
              <v-treeview dense activatable hoverable :items="groupsFiltered" @update:active="activeChanged" :active="activeRef">
                <template v-slot:prepend="{ item }">
                  <v-icon>{{ item.group ? 'mdi-format-list-bulleted-type' : 'mdi-alpha-a-box-outline' }}</v-icon>
                </template>
                <template v-slot:label="{ item }">
                  {{ (item.group ? '' : item.identifier + ' - ') + (item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' ) }}
              </template>
              </v-treeview>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="closeDialog">{{ $t('Cancel') }}</v-btn>
        <v-btn color="blue darken-1" text @click="selected" :disabled="!selectedAttrRef" >{{ $t('Select') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { ref } from '@vue/composition-api'
import * as attrStore from '../store/attributes'
import * as langStore from '../store/languages'

export default {
  name: 'AttributeSelection',
  setup (props, { emit }) {
    const {
      groups,
      loadAllAttributes,
      findById
    } = attrStore.useStore()

    const {
      currentLanguage
    } = langStore.useStore()

    const selectedAttrRef = ref(null)
    const selectionDialogRef = ref(false)
    let initiator

    const searchRef = ref('')
    const groupsFiltered = ref([])
    const maxChiidrenNumber = 100
    const activeRef = ref([])

    function selected () {
      const attr = findById(selectedAttrRef.value)
      emit('selected', attr.item, initiator)
    }

    function showDialog (init) {
      initiator = init
      selectedAttrRef.value = null
      activeRef.value = []
      searchRef.value = ''
      if (groups.length === 0) {
        loadAllAttributes().then(() => {
          groupsFiltered.value = groups.map(group => ({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: group.attributes.slice(0, maxChiidrenNumber) }))
          selectionDialogRef.value = true
        })
      } else {
        groupsFiltered.value = groups.map(group => ({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: group.attributes.slice(0, maxChiidrenNumber) }))
        selectionDialogRef.value = true
      }
    }

    function closeDialog () {
      selectionDialogRef.value = false
    }

    let awaitingSearch = null
    function searchChanged () {
      if (searchRef.value && searchRef.value.length > 2) {
        if (awaitingSearch) {
          clearTimeout(awaitingSearch)
          awaitingSearch = null
        }
        if (!awaitingSearch) {
          awaitingSearch = setTimeout(() => {
            performSearch()
          }, 1000)
        }
      } else {
        groupsFiltered.value = groups.map(group => ({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: group.attributes.slice(0, maxChiidrenNumber) }))
      }
    }

    function performSearch () {
      selectedAttrRef.value = null
      groupsFiltered.value = []
      const groupsToUse = groups
      for (let k = 0; k < groupsToUse.length; k++) {
        const group = groupsToUse[k]
        if (group.name[currentLanguage.value.identifier].toLowerCase().includes(searchRef.value.toLowerCase())) {
          groupsFiltered.value.push({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: group.attributes.slice(0, maxChiidrenNumber) })
          continue
        }
        const foundAttr = []
        const attr = group.attributes
        for (let i = 0; i < attr.length; i++) {
          if (attr[i].name[currentLanguage.value.identifier].toLowerCase().includes(searchRef.value.toLowerCase()) || attr[i].identifier.toLowerCase().includes(searchRef.value.toLowerCase())) {
            foundAttr.push(attr[i])
          }
        }
        if (foundAttr.length) {
          groupsFiltered.value.push({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: foundAttr.slice(0, maxChiidrenNumber) })
        }
      }
    }

    function activeChanged (active) {
      if (active.length === 0) {
        selectedAttrRef.value = null
      } else {
        const selected = active[0]
        if (!groupsFiltered.value.some(elem => elem.id === selected)) {
          selectedAttrRef.value = selected
        }
      }
    }

    return {
      groupsFiltered,
      selectionDialogRef,
      selected,
      selectedAttrRef,
      currentLanguage,
      searchRef,
      searchChanged,
      showDialog,
      activeChanged,
      activeRef,
      closeDialog
    }
  }
}
</script>
