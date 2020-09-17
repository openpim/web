<template>
  <v-dialog v-model="dialogRef" persistent max-width="700px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('SearchLoadDialog.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="7">
              <v-text-field v-model="searchRef" :label="$t('Main.Search')" flat hide-details clearable clear-icon="mdi-close-circle-outline"></v-text-field>
              <v-treeview dense activatable :items="itemsRef" :open="openItemsRef" :search="searchRef" @update:active="activeChanged" style="max-height: 300px" class="overflow-y-auto">
                <template v-slot:prepend="{ item }">
                  <v-icon>mdi-{{ item.search ? 'magnify' : 'account' }}</v-icon>
                </template>
              </v-treeview>
            </v-col>
            <v-col cols="5">
              <v-form ref="formRef" lazy-validation class="ml-7"  v-if="selectedRef">
                <v-text-field readonly v-model="selectedRef.identifier" :disabled="selectedRef.id !== 0" :label="$t('SearchSaveDialog.Identifier')" required></v-text-field>

                <LanguageDependentField readonly :values="selectedRef.name" v-model="selectedRef.name[currentLanguage.identifier]" :label="$t('SearchSaveDialog.Name')"></LanguageDependentField>
                <v-checkbox readonly v-model="selectedRef.public" :label="$t('SearchSaveDialog.Public')" required></v-checkbox>
              </v-form>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" :disabled="!selectedRef || selectedRef.user !== currentUserRef.login" text @click="removeSearch">{{ $t('Remove') }}</v-btn>
        <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
        <v-btn color="blue darken-1" :disabled="!selectedRef" text @click="selected">{{ $t('Select') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { ref } from '@vue/composition-api'
import * as langStore from '../store/languages'
import * as searchStore from '../store/search'
import * as userStore from '../store/users'
import LanguageDependentField from './LanguageDependentField'
import i18n from '../i18n'

export default {
  name: 'SaveLoadDialog',
  components: { LanguageDependentField },
  setup (props, { emit }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadSearches,
      remove
    } = searchStore.useStore()

    const {
      currentUserRef
    } = userStore.useStore()

    const formRef = ref(null)
    const selectedRef = ref(null)
    const dialogRef = ref(false)
    const itemsRef = ref([])
    const openItemsRef = ref([])
    const searchRef = ref(null)
    let loadedSearches = []

    function showDialog () {
      dialogRef.value = true
      loadSearches(false).then(arr => {
        loadedSearches = arr
        const tree = []
        arr.forEach(elem => {
          const user = elem.user

          let parent = tree.find(tst => tst.id === 'u_' + user)
          if (!parent) {
            if (user === currentUserRef.value.login) {
              parent = { id: 'u_' + user, name: i18n.t('SearchLoadDialog.MySearches'), children: [], search: false }
              tree.unshift(parent)
            } else {
              parent = { id: 'u_' + user, name: user, children: [], search: false }
              tree.push(parent)
            }
          }
          const item = { id: elem.identifier, name: elem.name[currentLanguage.value.identifier] || '[' + elem.name[defaultLanguageIdentifier.value] + ']', children: [], search: true }
          parent.children.push(item)
        })

        itemsRef.value = tree
        openItemsRef.value = tree.map(elem => elem.id)
      })
    }

    function activeChanged (arr) {
      if (arr.length > 0 && arr[0].search) {
        const identifier = arr[0]
        selectedRef.value = loadedSearches.find(elem => elem.identifier === identifier)
      } else {
        selectedRef.value = null
      }
    }

    function closeDialog () {
      dialogRef.value = false
    }

    function selected () {
      emit('selected', selectedRef.value)
    }

    function removeSearch () {
      if (confirm(i18n.t('SearchLoadDialog.Confirm.Remove'))) {
        remove(selectedRef.value.identifier).then(() => {
          const children = itemsRef.value[0].children
          const idx = children.findIndex(elem => selectedRef.value.identifier === elem.identifier)
          children.splice(idx, 1)
          selectedRef.value = null
        })
      }
    }

    return {
      itemsRef,
      openItemsRef,
      searchRef,
      formRef,
      dialogRef,
      selectedRef,
      showDialog,
      closeDialog,
      activeChanged,
      selected,
      removeSearch,
      currentLanguage,
      defaultLanguageIdentifier,
      currentUserRef
    }
  }
}
</script>
