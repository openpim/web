<template>
  <v-dialog v-model="optionsDialogRef" persistent width="70%">
      <v-card>
        <v-card-title class="subtitle-2 font-weight-bold" >
          <div style="width:80%">{{ $t('OptionsTable.ItemSelectionsDialog.Title') }}</div>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" @click="addItem"><v-icon>mdi-plus</v-icon></v-btn>
            </template>
            <span>{{ $t('Add') }}</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" @click="removeItem" :disabled="itemSelectedRef == null"><v-icon>mdi-minus</v-icon></v-btn>
            </template>
            <span>{{ $t('Remove') }}</span>
          </v-tooltip>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <span v-if="!items.length">{{ $t('OptionsTable.ItemSelectionsDialog.NoItemsSelected') }}</span>
          <v-list dense class="pt-0 pb-0">
            <v-list-item-group v-model="itemSelectedRef" color="primary">
              <v-list-item dense class="pt-0 pb-0" v-for="(item, i) in items" :key="i">
                <v-list-item-content class="pt-0 pb-0" style="display: inline">
                <router-link :to="'/item/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">{{ $t('OptionsTable.ItemSelectionsDialog.CloseButton.Text') }}</v-btn>
          <v-btn color="blue darken-1" text @click="confirm">{{ $t('OptionsTable.ItemSelectionsDialog.CofirmButton.Text') }}</v-btn>
        </v-card-actions>
      </v-card>
      <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemsSelected" />
  </v-dialog>
</template>
<script>
import { ref, watch } from 'vue'
import * as langStore from '../store/languages'
import * as itemStore from '../store/item'
import ItemsSelectionDialog from './ItemsSelectionDialog'

export default {
  props: {
    elem: {
      required: true
    }
  },
  components: { ItemsSelectionDialog },
  setup (props, { emit, root }) {
    const optionsDialogRef = ref(false)
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadItemsByIds, searchItems
    } = itemStore.useStore()

    const itemSelectionDialogRef = ref(null)
    const items = ref([])
    const itemSelectedRef = ref(null)

    watch(() => props.elem, (elemNew, elemOld) => {
      items.value = []
      if (elemNew && elemNew.value) {
        const itemsArr = elemNew.value.split(',')
        if (itemsArr && itemsArr.length) {
          if (elemNew.type === 2) {
            loadItemsByIds(itemsArr, false).then(data => {
              items.value = data
            })
          } else {
            searchItems({ identifier: { OP_in: itemsArr } }, { page: 1, itemsPerPage: 10000 }).then((data) => {
              items.value = data.rows
            })
          }
        }
      }
    })

    function showDialog () {
      optionsDialogRef.value = true
    }

    function closeDialog () {
      optionsDialogRef.value = false
    }

    function confirm () {
      emit('confirm', items.value)
      closeDialog()
    }

    function addItem () {
      itemSelectionDialogRef.value.showDialog('visible')
    }

    function itemsSelected (id) {
      itemSelectionDialogRef.value.closeDialog()
      const tst = items.value.find(elem => elem.id === id)
      if (!tst) {
        loadItemsByIds([id], false).then(data => {
          items.value.push(data[0])
        })
      }
    }

    function removeItem () {
      items.value.splice(itemSelectedRef.value, 1)
      itemSelectedRef.value = null
    }

    return {
      addItem,
      closeDialog,
      confirm,
      currentLanguage,
      defaultLanguageIdentifier,
      itemSelectionDialogRef,
      itemsSelected,
      optionsDialogRef,
      removeItem,
      showDialog,
      items,
      itemSelectedRef
    }
  }
}
</script>
