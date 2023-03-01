<template>
  <div>
    <v-row class="ml-5 mr-5 mt-0">
      <v-text-field v-model="searchRef" @input="clearSelection" :label="$t('Filter')" flat hide-details clearable
        clear-icon="mdi-close-circle-outline">'+'</v-text-field>
      <span class="pt-3 mt-1"><v-btn icon @click="add()"><v-icon>mdi-plus</v-icon></v-btn></span>
    </v-row>
    <v-list nav dense expand class="pt-5 pb-5">
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
    </v-list>
    <CollectionCreationDialog ref="collectionCreationDialogRef" @created="collectionCreated"/>
  </div>
</template>
<script>
import * as langStore from '../store/languages'
import * as CollectionsStore from '../store/collections'
import router from '../router'
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from '../router/useRouter'
import * as userStore from '../store/users'
import CollectionCreationDialog from '../components/CollectionCreationDialog'
// import i18n from '../i18n'

export default {
  components: { CollectionCreationDialog },
  setup () {
    const { route } = useRouter()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadAllCollections,
      getCollections,
      collections
    } = CollectionsStore.useStore()

    const {
      currentUserRef
    } = userStore.useStore()

    const collectionCreationDialogRef = ref(null)

    const collectionRefMain = ref(null)
    const collectionRefOther = ref(null)

    const collectionsRef = ref(null)

    const searchRef = ref('')
    const colFiltered = computed(() => {
      let arr = collectionsRef.value
      if (!arr) return []
      if (searchRef.value) {
        const s = searchRef.value.toLowerCase()
        arr = collectionsRef.value.filter(item => item.identifier.toLowerCase().indexOf(s) > -1 || (item.name && Object.values(item.name).find(val => val.toLowerCase().indexOf(s) > -1)))
      }
      return arr
    })

    function clearSelection () {
      collectionRefMain.value = null
      collectionRefOther.value = null
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
      router.push('/collections/' + newCollection.identifier)
      collectionRefMain.value = colFilteredMain.value.length
    }

    const colFilteredMain = ref([])
    const colFilteredOther = ref([])

    watch(colFiltered, (newValues, prevValues) => {
      colFilteredMain.value = newValues.filter(item => item.user === currentUserRef.value.login)
      colFilteredOther.value = newValues.filter(item => item.public && item.user !== currentUserRef.value.login)
      const indexMain = colFilteredMain.value.findIndex(index => index.identifier === route.value.params.id)
      const indexOther = colFilteredOther.value.findIndex(index => index.identifier === route.value.params.id)
      if (indexMain !== -1) {
        collectionRefMain.value = indexMain
      }
      if (indexOther !== -1) {
        collectionRefOther.value = indexOther
      }
    })

    watch(collectionRefMain, (selected, previous) => {
      console.log(selected)
      if (selected == null) {
        if (previous != null && collectionRefOther.value == null) router.push('/collections')
        return
      }
      collectionRefOther.value = null
      const selectedColl = colFilteredMain.value.concat(colFilteredOther.value)
      if (selected < selectedColl.length) {
        const selectedCollection = selectedColl[selected]
        if (selectedCollection.internalId !== 0 && selectedCollection.identifier) {
          router.push('/collections/' + selectedCollection.identifier)
        } else {
          if (selectedCollection.internalId === 0 && selectedCollection.identifier) {
            router.push('/collections/' + selectedCollection.identifier)
          } else {
            router.push('/collections')
          }
        }
      }
    })

    watch(collectionRefOther, (selected, previous) => {
      console.log(selected)
      const selected_ = collectionRefOther.value + colFilteredMain.value.length
      if (selected == null) {
        if (previous != null && collectionRefMain.value == null) router.push('/collections')
        return
      }
      collectionRefMain.value = null
      const selectedColl = colFilteredMain.value.concat(colFilteredOther.value)
      if (selected_ < selectedColl.length) {
        const selectedCollection = selectedColl[selected_]
        if (selectedCollection.internalId !== 0 && selectedCollection.identifier) {
          router.push('/collections/' + selectedCollection.identifier)
        } else {
          router.push('/collections')
        }
      }
    })

    watch(route, () => {
      if (route.value.path === '/collections') collectionsRef.value = getCollections()
    })

    onMounted(() => {
      loadAllCollections().then(() => {
        clearSelection()
        collectionsRef.value = getCollections()
      })
    })

    return {
      add,
      collectionRefMain,
      collectionRefOther,
      currentLanguage,
      defaultLanguageIdentifier,
      collectionsRef,
      colFiltered,
      colFilteredMain,
      colFilteredOther,
      clearSelection,
      searchRef,
      currentUserRef,
      collectionCreated,
      collectionCreationDialogRef
    }
  }
}
</script>
