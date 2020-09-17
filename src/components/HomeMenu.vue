<template>
    <v-row no-gutters>
    <v-col cols="12">
      <v-toolbar dense flat>
        <v-toolbar-title class="subtitle-2">{{ $t('Home.Menu.Title') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-tooltip bottom v-if="canEditSelected">
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="add"><v-icon>mdi-plus</v-icon></v-btn>
          </template>
          <span>{{ $t('Add') }}</span>
        </v-tooltip>
      </v-toolbar>
      <v-treeview dense activatable hoverable transition :items="itemsTree" :load-children="loadChildren" @update:active="activeChanged" :active.sync="activeRef" :open.sync="openRef">
        <template v-slot:prepend="{ item }">
          <v-icon v-if="item.typeIcon" :color="item.typeIconColor">mdi-{{ item.typeIcon }}</v-icon>
        </template>
        <template v-slot:label="{ item }">
          <div :class="item.link ? 'font-italic font-weight-light': ''">{{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</div>
        </template>
      </v-treeview>
  </v-col>
  <ItemCreationDialog ref="itemCreationDialogRef" @created="itemCreated"/>
  </v-row>
</template>
<script>
import { ref, onMounted, computed } from '@vue/composition-api'
import * as itemStore from '../store/item'
import * as typesStore from '../store/types'
import * as langStore from '../store/languages'
import * as userStore from '../store/users'
import { useRouter } from '../router/useRouter'

import ItemCreationDialog from '../components/ItemCreationDialog'

export default {
  components: { ItemCreationDialog },
  setup (props, context) {
    const { router } = useRouter()

    const { canEditItem } = userStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      itemsTree,
      createItem,
      findItem,
      loadItems,
      loadItemRelationsChildren
    } = itemStore.useStore()

    const {
      loadAllTypes
    } = typesStore.useStore()

    const empty = { id: -1 }
    const selectedRef = ref(empty)
    const activeRef = ref([])
    const openRef = ref([])
    const itemCreationDialogRef = ref(null)

    const canEditSelected = computed(() => {
      if (selectedRef.value.id !== -1) {
        return canEditItem(selectedRef.value.typeId, selectedRef.value.path)
      } else {
        return true
      }
    })

    function activeChanged (active) {
      if (active.length !== 0) {
        if (active[0] !== selectedRef.value.id) {
          activeRef.value[0] = active[0]
          selectedRef.value = findItem(active[0]).node
          router.push((selectedRef.value.identifier ? '/item/' + selectedRef.value.identifier : ''))
        }
      } else {
        selectedRef.value = { id: -1 }
        router.push('/')
      }
    }

    async function loadChildren (item) {
      loadItems(item.id, item.internalId)
      loadItemRelationsChildren(item.id, item.internalId)
    }

    function add () {
      itemCreationDialogRef.value.showDialog(selectedRef.value)
    }

    function itemCreated (item) {
      itemCreationDialogRef.value.closeDialog()
      createItem(item, selectedRef.value)
      openRef.value.push(selectedRef.value.id)
      activeRef.value = [item.id]
      router.push('/item/' + item.identifier)
    }

    onMounted(() => {
      loadAllTypes().then(() => {
        if (itemsTree.length === 0) loadItems()
      })
    })

    return {
      itemsTree,
      selectedRef,
      activeRef,
      openRef,
      add,
      activeChanged,
      itemCreationDialogRef,
      itemCreated,
      loadChildren,
      currentLanguage,
      defaultLanguageIdentifier,
      canEditSelected
    }
  }
}
</script>
