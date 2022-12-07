<template>
  <v-dialog v-model="selectionDialogRef" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('AttrGroups.SelectionDialog.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
            <v-list nav dense>
              <v-list-item-group v-model="selectedGroupsRef" color="primary" :multiple="multiselect">
                <v-list-item v-for="(item, i) in groupsToShow" :key="i">
                  <v-list-item-icon><v-icon>mdi-format-list-bulleted-type</v-icon></v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'}}</v-list-item-title>
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
import { ref, computed } from 'vue'
import * as attrStore from '../store/attributes'
import * as langStore from '../store/languages'

export default {
  name: 'RelationsSelection',
  props: {
    multiselect: {
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
      groups,
      loadAllAttributes
    } = attrStore.useStore()

    const selectedGroupsRef = ref([])
    const selectionDialogRef = ref(false)
    const filterRef = ref(null)
    let initiator

    function selected () {
      let arr = selectedGroupsRef.value.map(idx => groupsToShow.value[idx]?.internalId)
      arr = arr.filter(elem => elem)
      emit('selected', arr, initiator)
    }

    const groupsToShow = computed(() => {
      return filterRef.value ? groups.filter(elem => filterRef.value.includes(elem.id)) : groups
    })

    function showDialog (init, selected, filter) {
      initiator = init
      if (filter) filterRef.value = filter
      if (groups.length === 0) {
        loadAllAttributes().then(() => {
          selectionDialogRef.value = true
          const arr = selected ? selected.map(id => groupsToShow.value.findIndex(rel => rel.id === id)) : []
          selectedGroupsRef.value = arr
        })
      } else {
        selectionDialogRef.value = true
        const arr = selected ? selected.map(id => groupsToShow.value.findIndex(rel => rel.id === id)) : []
        selectedGroupsRef.value = arr
      }
    }

    function closeDialog () {
      selectionDialogRef.value = false
    }

    return {
      groupsToShow,
      selectionDialogRef,
      selected,
      selectedGroupsRef,
      showDialog,
      closeDialog,
      currentLanguage,
      defaultLanguageIdentifier
    }
  }
}
</script>
