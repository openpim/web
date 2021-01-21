<template>
  <v-dialog v-model="selectionDialogRef" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('Relations.SelectionDialog.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
            <v-list nav dense>
              <v-list-item-group v-model="selectedRelationsRef" color="primary" :multiple="multiselect">
                <v-list-item v-for="(item, i) in relations" :key="i">
                  <v-list-item-icon><v-icon>mdi-vector-line</v-icon></v-list-item-icon>
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
import { ref } from '@vue/composition-api'
import * as relStore from '../store/relations'
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
      relations,
      loadAllRelations
    } = relStore.useStore()

    const selectedRelationsRef = ref([])
    const selectionDialogRef = ref(false)
    let initiator

    function selected () {
      let arr
      if (props.multiselect) {
        arr = selectedRelationsRef.value.map(idx => relations[idx].internalId)
      } else {
        arr = [relations[selectedRelationsRef.value].internalId]
      }
      emit('selected', arr, initiator)
    }

    function showDialog (init, selected) {
      initiator = init
      if (relations.length === 0) {
        loadAllRelations().then(() => {
          selectionDialogRef.value = true
          const arr = selected ? selected.map(id => relations.findIndex(rel => rel.id === id || rel.internalId === id)) : []
          selectedRelationsRef.value = arr
        })
      } else {
        selectionDialogRef.value = true
        const arr = selected ? selected.map(id => relations.findIndex(rel => rel.id === id || rel.internalId === id)) : []
        selectedRelationsRef.value = arr
      }
    }

    function closeDialog () {
      selectionDialogRef.value = false
    }

    return {
      relations,
      selectionDialogRef,
      selected,
      selectedRelationsRef,
      showDialog,
      closeDialog,
      currentLanguage,
      defaultLanguageIdentifier
    }
  }
}
</script>
