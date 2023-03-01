<template>
  <v-dialog v-model="selectionDialogRef" persistent max-width="800px">
    <CollectionCreationDialog ref="collectionCreationDialogRef" @created="collectionCreated" />
    <v-list nav dense expand class="pa-5 ma-0">
      <v-card-title class="pl-0">
        <span class="headline">{{ $t('Collections.SelectionDialog.Title') }}</span>
      </v-card-title>
      <v-row class="pt-0 pb-2 ma-0">
        <v-text-field v-model="searchRef" @input="clearSelection" :label="$t('Filter')" flat hide-details clearable
          clear-icon="mdi-close-circle-outline"></v-text-field>
        <span v-if="!searchCollRef" class="pt-3 mt-1"><v-btn icon @click="add()"><v-icon>mdi-plus</v-icon></v-btn></span>
      </v-row>
      <v-list-group :value="true" no-action>
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title> {{ $t('Collections.MainCollections') }} </v-list-item-title>
          </v-list-item-content>
        </template>
        <v-list-item-group v-model="collectionRefMain" color="primary">
          <v-list-item v-for="(item, i) in colFilteredMain" :key="i">
            <v-list-item-icon><v-icon>mdi-bookmark-outline</v-icon></v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title
                v-text="item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list-group>
      <v-list-group>
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title> {{ $t('Collections.OtherCollections') }} </v-list-item-title>
          </v-list-item-content>
        </template>
        <v-list-item-group v-model="collectionRefOther" color="primary">
          <v-list-item v-for="(item, i) in colFilteredOther" :key="i">
            <v-list-item-icon><v-icon>mdi-bookmark-outline</v-icon></v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title
                v-text="item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list-group>
      <v-spacer></v-spacer>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="selectionDialogRef = false">{{ $t('Cancel') }}</v-btn>
        <v-btn color="blue darken-1" v-if="!deleteRef && !searchCollRef" :disabled="disableButton()" text @click="submit">{{ $t('Submit') }}</v-btn>
        <v-btn color="blue darken-1" v-if="deleteRef && !searchCollRef" :disabled="disableButton()" text @click="delFromColl">{{ $t('Collections.DeleteFromCollection') }}</v-btn>
        <v-btn color="blue darken-1" v-if="searchCollRef" :disabled="disableButton()" text @click="selectedColl">{{ $t('Select') }}</v-btn>
        </v-card-actions>
    </v-list>
  </v-dialog>
</template>
<script>
import { ref, computed, watch, onMounted } from '@vue/composition-api'
import * as collectionsStore from '../store/collections'
import * as langStore from '../store/languages'
import * as userStore from '../store/users'
import CollectionCreationDialog from './CollectionCreationDialog.vue'

export default {
  components: { CollectionCreationDialog },
  name: 'CollectionsSelection',
  props: {
    editAccessOnly: {
      type: Boolean,
      required: false
    }
  },
  setup (props, { emit }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      collections,
      loadAllCollections,
      getCollections,
      getCollectionByIdentifier
    } = collectionsStore.useStore()

    const {
      currentUserRef
    } = userStore.useStore()

    const collectionCreationDialogRef = ref(null)
    const collectionRefMain = ref(null)
    const collectionRefOther = ref(null)

    const selectedCollectionsRef = ref([])
    const selectionDialogRef = ref(false)
    const collectionsRef = ref([])
    const deleteRef = ref(false)
    const searchCollRef = ref(false)

    const newCollection = ref(false)

    async function submit () {
      if (colFilteredMain.value[collectionRefMain.value]) {
        if (colFilteredMain.value[collectionRefMain.value].internalId === 0) {
          const collectionId = await getCollectionByIdentifier(colFilteredMain.value[collectionRefMain.value].id)
          emit('selected', collectionId)
        } else {
          emit('selected', colFilteredMain.value[collectionRefMain.value].id)
        }
      }
      if (colFilteredOther.value[collectionRefOther.value]) {
        emit('selected', colFilteredOther.value[collectionRefOther.value].id)
      }
    }

    async function delFromColl () {
      if (colFilteredMain.value[collectionRefMain.value]) {
        if (colFilteredMain.value[collectionRefMain.value].internalId === 0) {
          const collectionId = await getCollectionByIdentifier(colFilteredMain.value[collectionRefMain.value].id)
          emit('delete', collectionId)
        } else {
          emit('delete', colFilteredMain.value[collectionRefMain.value].id)
        }
      }
      if (colFilteredOther.value[collectionRefOther.value]) {
        emit('delete', colFilteredOther.value[collectionRefOther.value].id)
      }
    }

    let initiator

    function selectedColl () {
      if (colFilteredMain.value[collectionRefMain.value]) {
        emit('selected', colFilteredMain.value[collectionRefMain.value], initiator)
      }
      if (colFilteredOther.value[collectionRefOther.value]) {
        emit('selected', colFilteredOther.value[collectionRefOther.value], initiator)
      }
    }

    const searchRef = ref('')
    const collFiltered = computed(() => {
      let arr = collectionsRef.value
      if (!arr) return []
      if (searchRef.value) {
        const s = searchRef.value.toLowerCase()
        arr = collectionsRef.value.filter(item => item.identifier.toLowerCase().indexOf(s) > -1 || (item.name && Object.values(item.name).find(val => val.toLowerCase().indexOf(s) > -1)))
      }
      return arr
    })

    const colFilteredMain = ref([])
    const colFilteredOther = ref([])

    watch(collFiltered, (newValues, prevValues) => {
      colFilteredMain.value = newValues.filter(item => item.user === currentUserRef.value.login)
      colFilteredOther.value = newValues.filter(item => item.public && item.user !== currentUserRef.value.login)
    })

    function clearSelection () {
      selectedCollectionsRef.value = []
    }

    function showDialog (del, init) {
      initiator = init
      deleteRef.value = del
      if (initiator && initiator.attr && initiator.attr === 'collectionId') {
        searchCollRef.value = true
      }
      if (collections.length === 0) {
        loadAllCollections().then(() => {
          selectionDialogRef.value = true
          collectionsRef.value = getCollections().filter(item => item.public === true || item.user === currentUserRef.value.login || item.internalId === 0)
        })
      } else {
        selectionDialogRef.value = true
        collectionsRef.value = getCollections().filter(item => item.public === true || item.user === currentUserRef.value.login || item.internalId === 0)
      }
    }

    function closeDialog () {
      selectionDialogRef.value = false
    }

    function add () {
      collectionCreationDialogRef.value.showDialog()
    }

    function collectionCreated (collection) {
      collectionCreationDialogRef.value.closeDialog()
      const newCollection = collection
      newCollection.user = currentUserRef.value.login
      collections.push(newCollection)
      collectionsRef.value = collections
      collectionRefMain.value = colFilteredMain.value.length
    }

    watch(collectionRefMain, (newValues, prevValues) => {
      if (newValues == null) return
      collectionRefOther.value = null
    })

    watch(collectionRefOther, (newValues, prevValues) => {
      if (newValues == null) return
      collectionRefMain.value = null
    })

    function disableButton () {
      if (typeof collectionRefMain.value === 'number') {
        return false
      }
      if (typeof collectionRefOther.value === 'number') {
        return false
      }
      return true
    }

    onMounted(() => {
      loadAllCollections().then(() => {
        clearSelection()
        collectionsRef.value = getCollections()
      })
    })

    return {
      add,
      newCollection,
      collectionsRef,
      selectionDialogRef,
      submit,
      deleteRef,
      searchCollRef,
      delFromColl,
      selectedColl,
      selectedCollectionsRef,
      showDialog,
      closeDialog,
      searchRef,
      clearSelection,
      collFiltered,
      currentLanguage,
      defaultLanguageIdentifier,
      collectionCreated,
      collectionCreationDialogRef,
      colFilteredMain,
      colFilteredOther,
      collectionRefMain,
      collectionRefOther,
      disableButton
    }
  }
}
</script>
