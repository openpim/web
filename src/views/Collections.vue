<template>
  <v-container v-if="collectionRef" class="pa-0">
    <v-row no-gutters>
      <v-col cols="12">
        <v-card outlined>
          <v-card-title>
            <v-row dense>
              <v-col cols="3" class="pl-3 mt-2">
                <v-text-field v-if="loadedRef" v-model="collectionNameRef" :readonly="!readonlyUser()" :label="$t('Collections.Name')"></v-text-field>
              </v-col>
                <v-col cols='1' class="pl-3 mt-5">
                  <SystemInformation :data="collectionRef"></SystemInformation>
                </v-col>
                <v-col cols='4' class="pl-3 mt-2">
                  <template>
                    <v-checkbox v-model="collectionPublic" :disabled="!readonlyUser()" :label="$t('Collections.collectionPublic')"></v-checkbox>
                  </template>
                </v-col>
            </v-row>
          </v-card-title>
          <v-card-actions>
            <v-btn v-if="readonlyUser()" :color="itemChangedRef ? 'primary' : ''" depressed :text="!itemChangedRef" @click="save" v-text="$t('Save')"></v-btn>
            <v-btn v-if="readonlyUser()" text @click="remove" v-text="$t('Remove')"></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <ItemsDataTable :export="false" :collection="true"/>
  </v-container>
</template>

<script>
import { ref, onMounted, watch } from '@vue/composition-api'
import * as collectionsStore from '../store/collections'
import * as langStore from '../store/languages'
import * as errorStore from '../store/error'
import * as userStore from '../store/users'
import { useRouter } from '../router/useRouter'
import router from '../router'
import SystemInformation from '../components/SystemInformation'
import ItemsDataTable from '../components/ItemsDataTable'
import * as searchStore from '../store/search'
import i18n from '../i18n'

export default {
  components: { SystemInformation, ItemsDataTable },
  setup () {
    const { route } = useRouter()

    const { showInfo } = errorStore.useStore()

    const {
      loadAllCollections,
      saveCollection,
      removeCollection,
      getCollections,
      collections
    } = collectionsStore.useStore()

    const { currentWhereRef } = searchStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      currentUserRef
    } = userStore.useStore()

    const collectionRef = ref(null)
    const loadedRef = ref(false)
    const itemChangedRef = ref(false)
    const collectionsRef = ref(null)

    const collectionNameRef = ref(null)
    const collectionPublic = ref(null)
    const collectionIdentifier = ref(null)

    function readonlyUser () {
      return currentUserRef.value.login === collectionRef.value.user
    }

    function newCollection () {
      return collectionRef.value.internalId === 0
    }

    function collectionSelected (selected) {
      if (selected) {
        currentWhereRef.value = { collectionId: selected.id }
        collectionRef.value = selected
      } else {
        currentWhereRef.value = null
        collectionRef.value = collections.find(elem => elem.identifier === route.value.params.id)
      }
      if (typeof collectionRef.value === 'undefined') return
      collectionNameRef.value = collectionRef.value.name[currentLanguage.value.identifier] || collectionRef.value.name[defaultLanguageIdentifier.value]
      collectionPublic.value = collectionRef.value.public
      collectionIdentifier.value = collectionRef.value.identifier
      loadedRef.value = true
    }

    function save () {
      collectionRef.value.name[currentLanguage.value.identifier] = collectionNameRef.value
      collectionRef.value.public = collectionPublic.value
      collectionRef.value.identifier = collectionIdentifier.value
      saveCollection(collectionRef.value).then(() => {
        itemChangedRef.value = false
        showInfo(i18n.t('Saved'))
      })
    }

    function remove () {
      if (confirm(i18n.t('Collections.RemoveCollection'))) {
        removeCollection(collectionRef.value.identifier).then(() => {
          router.push('/collections')
          itemChangedRef.value = false
        })
      }
    }

    watch(route, (current, previous) => {
      if (current && current.params && current.params.id && collectionsRef.value) {
        collectionSelected(collectionsRef.value.find(elem => elem.identifier === current.params.id))
      } else {
        collectionRef.value = null
      }
    })

    onMounted(() => {
      loadAllCollections().then(() => {
        collectionsRef.value = getCollections()
        if (route.value && route.value.params && route.value.params.id && collectionsRef.value) {
          collectionSelected(collectionsRef.value.find(elem => elem.identifier === route.value.params.id))
          if (typeof collectionRef.value === 'undefined') {
            router.push('/collections')
          } else {
            setTimeout(() => { collectionNameRef.value = collectionRef.value.name[defaultLanguageIdentifier.value] }, 0)
          }
        }
      })
    })

    return {
      save,
      remove,
      saveCollection,
      collectionNameRef,
      collectionPublic,
      collectionIdentifier,
      collectionRef,
      collectionsRef,
      currentLanguage,
      defaultLanguageIdentifier,
      loadedRef,
      itemChangedRef,
      collectionSelected,
      currentWhereRef,
      currentUserRef,
      readonlyUser,
      newCollection
    }
  }
}
</script>
