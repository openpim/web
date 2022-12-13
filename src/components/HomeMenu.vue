<template>
    <v-row no-gutters>
      <v-col cols="12">
        <v-toolbar dense flat>
          <v-toolbar-title class="subtitle-2">{{ $t('Home.Menu.Title') }}</v-toolbar-title>
          <!-- v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" @click="add"><v-icon>mdi-plus</v-icon></v-btn>
            </template>
            <span>{{ $t('Add') }}</span>
          </v-tooltip -->
        </v-toolbar>
        <v-btn small icon fab absolute top right @click="add" class="mt-7 mr-1"><v-icon>mdi-plus</v-icon></v-btn>
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
import { ref, onMounted, computed, onUnmounted } from 'vue'
import * as itemStore from '../store/item'
import * as typesStore from '../store/types'
import * as langStore from '../store/languages'
import * as userStore from '../store/users'
import { useRouter } from '../router/useRouter'

import ItemCreationDialog from '../components/ItemCreationDialog'
import eventBus from '../eventBus'

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
      loadItemsByIds,
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
      const save = selectedRef.value
      if (active.length !== 0) {
        if (active[0] !== selectedRef.value.id) {
          const node = findItem(active[0]).node
          router.push((node.identifier ? '/item/' + node.identifier : '')).then(() => {
            selectedRef.value = node
            activeRef.value = [active[0]]
          }).catch((err) => {
            if (err.message === 'NOT_SAVED') activeRef.value = save.identifier ? [save.id] : []
          })
        }
      } else if (activeRef.value.length > 0 && activeRef.value[0] < 1636642098632) {
        // fix for duplicate. Active is also changed during duplicate, but this is new node (with big temporaly ID) and we do not need to go to / route
        router.push('/').then(() => {
          selectedRef.value = { id: -1 }
        }).catch((err) => {
          if (err.message === 'NOT_SAVED') activeRef.value = save.identifier ? [save.id] : []
        })
      }
    }

    async function loadChildren (item) {
      await loadItems(item.id, item.internalId, item.typeId)
      await loadItemRelationsChildren(item.id, item.internalId)
    }

    function add () {
      itemCreationDialogRef.value.showDialog(selectedRef.value)
    }

    function itemCreated (item) {
      itemCreationDialogRef.value.closeDialog()

      if (selectedRef.value.children && selectedRef.value.children.length === 0) {
        loadChildren(selectedRef.value).then(() => {
          itemCreatedInternal(item)
        })
      } else {
        itemCreatedInternal(item)
      }
    }

    function itemCreatedInternal (item) {
      createItem(item, selectedRef.value).then(() => {
        openRef.value.push(selectedRef.value.id)
        activeRef.value = [item.id]
        selectedRef.value = item
        router.push('/item/' + item.identifier)
      })
    }

    onMounted(() => {
      eventBus.on('show_in_navigation_tree', async (item) => {
        const pathArr = item.path.split('.')
        const itemsArr = await loadItemsByIds(pathArr, true)
        openRef.value = []
        activeRef.value = []
        for (let i = 0; i < itemsArr.length - 1; i++) {
          const itemInTree = findItem(itemsArr[i].id).node
          if (!itemInTree.children || !itemInTree.children.length) {
            await loadChildren(itemsArr[i])
          }
          openRef.value.push(itemsArr[i].id)
        }
        activeRef.value = [itemsArr[itemsArr.length - 1].id]
        selectedRef.value = itemsArr[itemsArr.length - 1]
        // scroll to selected component in tree view
        setTimeout(() => {
          const activeNode = document.querySelector('.v-treeview-node--active')
          if (activeNode) activeNode.scrollIntoView({ block: 'center' })
        }, 1000)
      })

      eventBus.on('item_selected', item => {
        activeRef.value = [item.id]
      })

      loadAllTypes().then(() => {
        if (itemsTree.length === 0) loadItems()
      })
    })

    onUnmounted(() => {
      eventBus.off('item_selected')
      eventBus.off('show_in_navigation_tree')
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
