<template>
  <v-dialog v-model="selectionDialogRef" persistent width="70%">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('Items.SelectionDialog.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container class="pa-0">
          <v-row>
            <v-col cols="12" class="pa-0 overflow-y-auto" style="max-height: 70vh">
              <v-tabs v-model="tabRef">
                <v-tab v-text="$t('Items.SelectionDialog.Selection')"></v-tab>
                <v-tab v-text="$t('Items.SelectionDialog.Search')"></v-tab>
              </v-tabs>
              <v-tabs-items v-model="tabRef">
                <v-tab-item> <!-- select -->
                  <v-treeview v-if="selectionDialogRef" dense selectable selection-type="independent" hoverable :items="itemsTree" :load-children="loadChildren" v-model="selectedItemsRef" @input="onSelect">
                    <template v-slot:prepend="{ item }">
                      <v-icon v-if="item.typeIcon" :color="item.typeIconColor">mdi-{{ item.typeIcon }}</v-icon>
                    </template>
                    <template v-slot:label="{ item }">
                      {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}
                    </template>
                  </v-treeview>
                </v-tab-item>
                <v-tab-item> <!-- search -->
                  <v-text-field @keydown.enter.prevent="searchEnterPressed" v-model="searchTextRef" @input="searchChanged" :label="$t('Search')" append-icon="mdi-magnify" class="ml-5 mr-5"></v-text-field>
                  <v-list dense v-if="searchResultsRef.length > 0">
                    <v-list-item-group v-model="searchSelectedRef" color="primary">
                      <v-list-item v-for="(elem, i) in searchResultsRef" :key="i" dense>
                        <v-list-item-content>
                          <v-list-item-title><a @click="selectItem(i)">{{elem.identifier + ' (' +elem.type.identifier+')'}}</a></v-list-item-title>
                          <v-list-item-subtitle>{{ elem.name[currentLanguage.identifier] || '[' + elem.name[defaultLanguageIdentifier] + ']' }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </v-tab-item>
              </v-tabs-items>
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
import * as itemStore from '../store/item'
import * as langStore from '../store/languages'
import { ref } from '@vue/composition-api'

export default {
  name: 'ItemSelection',
  setup (props, { emit }) {
    const {
      itemsTree,
      loadItems,
      searchItem,
      findItem
    } = itemStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const tabRef = ref(null)
    const selectedItemsRef = ref([])
    const selectionDialogRef = ref(false)
    const searchTextRef = ref('')
    const searchSelectedRef = ref(null)
    const searchResultsRef = ref([])
    let awaitingSearch = null
    let typesFilter = null

    let initiator

    function searchChanged () {
      if (searchTextRef.value.length > 1) {
        if (awaitingSearch) {
          clearTimeout(awaitingSearch)
          awaitingSearch = null
        }
        if (!awaitingSearch) {
          awaitingSearch = setTimeout(() => {
            performSearch()
          }, 1000)
        }
      }
    }
    function searchEnterPressed () {
      if (awaitingSearch) {
        clearTimeout(awaitingSearch)
      }
      performSearch()
    }
    function performSearch () {
      const typesExpr = typesFilter && typesFilter.length > 0 ? '{typeId: {OP_in: ' + JSON.stringify(typesFilter) + '}}' : ''
      searchItem(searchTextRef.value, typesExpr).then(data => {
        searchResultsRef.value = data.rows
      })
    }

    function selectItem (idx) {
      searchSelectedRef.value = idx
      selected()
    }

    function selected () {
      if (selectedItemsRef.value[0]) {
        const id = selectedItemsRef.value[0]
        const node = findItem(id).node
        emit('selected', node.internalId, initiator)
      } else if (searchSelectedRef.value != null) {
        emit('selected', searchResultsRef.value[searchSelectedRef.value].id, initiator)
      }
    }

    function showDialog (init, typesToFilter) {
      typesFilter = typesToFilter
      selectedItemsRef.value = []
      initiator = init
      if (itemsTree.length === 0) {
        loadItems().then(() => {
          selectionDialogRef.value = true
        })
      } else {
        selectionDialogRef.value = true
      }
    }

    function closeDialog () {
      selectionDialogRef.value = false
    }

    function onSelect (arr) {
      if (arr && arr.length > 1) {
        const val = arr[arr.length - 1]
        selectedItemsRef.value = [val]
      }
    }

    async function loadChildren (item) {
      return loadItems(item.id, item.internalId, item.typeId)
    }

    return {
      itemsTree,
      loadChildren,
      selectionDialogRef,
      selected,
      selectItem,
      selectedItemsRef,
      onSelect,
      showDialog,
      closeDialog,
      currentLanguage,
      defaultLanguageIdentifier,
      tabRef,
      searchTextRef,
      searchSelectedRef,
      searchResultsRef,
      searchChanged,
      searchEnterPressed
    }
  }
}
</script>
