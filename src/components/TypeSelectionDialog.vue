<template>
  <v-dialog v-model="typeSelectionDialogRef" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('Types.SelectionDialog.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <!-- v-if here to force typesTree refresh, without this we have issues -->
              <v-treeview v-if="typeSelectionDialogRef" dense selectable selection-type="independent" v-model="selectedItemsRef" @input="onSelect" hoverable :items="filteredTree">
                <template v-slot:prepend="{ item }">
                    <v-icon v-if="item.icon" :color="item.iconColor">mdi-{{ item.icon }}</v-icon>
                </template>
                <template v-slot:label="{ item }">
                  {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}
                </template>
              </v-treeview>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="typeSelectionDialogRef = false">{{ $t('Cancel') }}</v-btn>
        <v-btn color="blue darken-1" text @click="selected">{{ $t('Select') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { ref } from '@vue/composition-api'
import * as typesStore from '../store/types'
import * as langStore from '../store/languages'

export default {
  name: 'TypeSelection',
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
      typesTree,
      loadAllTypes
    } = typesStore.useStore()

    const selectedItemsRef = ref([])
    const typeSelectionDialogRef = ref(false)
    const filteredTree = ref([])
    let initiator

    function filterData (arr) {
      var r = []
      arr.forEach((item) => {
        if (item.link !== 0) {
          return
        }
        const clone = {}
        Object.assign(clone, item)
        if (clone.children) clone.children = filterData(clone.children)
        r.push(clone)
      })
      return r
    }

    function selected () {
      emit('selected', selectedItemsRef.value, initiator)
    }

    function showDialog (init, itemsSelected) {
      initiator = init
      if (typesTree.length === 0) {
        loadAllTypes().then(() => {
          filteredTree.value = filterData(typesTree)
          typeSelectionDialogRef.value = true
          selectedItemsRef.value = itemsSelected || []
        })
      } else {
        filteredTree.value = filterData(typesTree)
        typeSelectionDialogRef.value = true
        selectedItemsRef.value = itemsSelected || []
      }
    }

    function closeDialog () {
      typeSelectionDialogRef.value = false
    }

    function onSelect (arr) {
      if (!props.multiselect && arr.length > 1) {
        selectedItemsRef.value = [arr[arr.length - 1]]
      }
    }

    return {
      filteredTree,
      typeSelectionDialogRef,
      selected,
      selectedItemsRef,
      onSelect,
      showDialog,
      closeDialog,
      currentLanguage,
      defaultLanguageIdentifier
    }
  }
}
</script>
