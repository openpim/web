<template>
  <v-row justify="center">
    <v-dialog v-model="dialogRef" persistent width="50%">
      <v-card v-if="newItemRef">
        <v-card-title>
          <span class="headline">{{ $t('ItemCreationDialog.Title') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-autocomplete v-model="identifierSelectedRef" label="Категория" :items="selectRef" item-text="text" item-value="id"></v-autocomplete>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
          <v-btn color="blue darken-1" text :disabled="!identifierSelectedRef" @click="create">{{$t('Create')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { ref } from '@vue/composition-api'
import * as itemsStore from '../store/item'
import * as typesStore from '../store/types'
import * as channelsStore from '../store/channels'
import { findNode } from '../store/utils'

export default {
  name: 'ChannelItemCreation',
  setup (props, { emit }) {
    const { findTypeByIdentifier, findType } = typesStore.useStore()
    const { loadChildren } = itemsStore.useStore()

    const {
      getChannelCategories
    } = channelsStore.useStore()

    const dialogRef = ref(false)
    const identifierSelectedRef = ref(null)
    const newItemRef = ref(null)
    const selectRef = ref([])
    const typeRef = ref(null)
    let categories

    function showDialog (itemSelected, channelId, typeIdentifier) {
      const name = {}
      newItemRef.value = { id: Date.now(), internalId: 0, children: [], name: name, identifier: '' }
      getChannelCategories(channelId).then(async (value) => {
        categories = value
        const node = findNode(itemSelected.identifier, value.tree.children)
        let childrens
        if (node) {
          childrens = node.children
        } else {
          childrens = value.tree.children
        }
        if (childrens.length === 0) {
          emit('created', null)
          return
        }
        dialogRef.value = true
        for (const child of childrens) {
          child.text = child.id + ' - ' + child.name
        }
        const itemChildren = await loadChildren(itemSelected.internalId, { page: 1, itemsPerPage: 100000 })
        selectRef.value = childrens.filter(elem => !itemChildren.rows.some(child => child.identifier === elem.id))
      })
      identifierSelectedRef.value = null
      typeRef.value = typeIdentifier
    }

    function closeDialog () {
      dialogRef.value = false
    }

    function create () {
      const node = findNode(identifierSelectedRef.value, categories.tree.children)
      const newItem = newItemRef.value
      newItem.identifier = node.id
      newItem.name.ru = node.name
      newItem.typeIdentifier = typeRef.value
      newItem.children = []
      let type = findTypeByIdentifier(newItem.typeIdentifier).node
      if (type.link && type.link !== 0) type = findType(type.link).node
      newItem.typeIcon = type.icon
      newItem.typeIconColor = type.iconColor
      newItem.typeId = type.internalId
      emit('created', newItem)
      identifierSelectedRef.value = null
    }

    return {
      dialogRef,
      create,
      showDialog,
      closeDialog,
      identifierSelectedRef,
      newItemRef,
      selectRef
    }
  }
}
</script>
