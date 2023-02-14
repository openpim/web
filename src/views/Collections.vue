<template>
  <v-container v-if="collectionRef" class="pa-0">
    <v-row no-gutters>
      <v-col cols="12">
        <v-card class="mx-auto mb-1" outlined>
          <v-card-title class="pt-0 pb-0">
              <v-row dense>
                <v-col cols="2" class="pl-3 mt-3">
                  <span class="mr-0">{{ collectionRef.name[currentLanguage.identifier] || '[' + collectionRef.name[defaultLanguageIdentifier] + ']' }}</span>
                  <SystemInformation :data="collectionRef"></SystemInformation>
                </v-col>
                <v-col cols="10">
                  <div class="text-body-2 ml-5 mt-3">

                  </div>
                </v-col>
              </v-row>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, watch } from '@vue/composition-api'
import * as collectionsStore from '../store/collections'
import * as langStore from '../store/languages'
import * as searchStore from '../store/search'
import { useRouter } from '../router/useRouter'
import SystemInformation from '../components/SystemInformation'
import router from '../router'
import dateFormat from 'dateformat'

export default {
  components: { SystemInformation },
  setup (params, context) {
    const { route } = useRouter()

    const {
      collections,
      loadAllCollections
    } = collectionsStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      searchToOpenRef
    } = searchStore.useStore()

    const collectionRef = ref(null)
    const loadedRef = ref(false)

    function collcetionSelected (selected) {
      collectionRef.value = selected
      if (selected) {
        loadedRef.value = false
      }
    }

    function chartClick (event, item) {
      const status = item[0]._index + 1
      const where = { collections: {} }
      where.collections[collectionRef.value.identifier] = { status: status }
      searchToOpenRef.value = { whereClause: where, extended: true }
      router.push('/search/')
    }

    function categoryClick (status, category) {
      const where = { collections: {} }
      where.collections[collectionRef.value.identifier] = { status: status, category: category }
      searchToOpenRef.value = { whereClause: where, extended: true }
      router.push('/search/')
    }

    watch(route, (current, previous) => {
      if (current && current.params && current.params.id) {
        collcetionSelected(collections.find(elem => elem.identifier === current.params.id))
      } else {
        collectionRef.value = null
      }
    })

    onMounted(() => {
      loadAllCollections().then(() => {
        if (route.value && route.value.params && route.value.params.id) {
          collcetionSelected(collections.find(elem => elem.identifier === route.value.params.id))
        }
      })
    })

    return {
      collectionRef,
      currentLanguage,
      defaultLanguageIdentifier,
      loadedRef,
      chartClick,
      categoryClick,
      collcetionSelected,
      dateFormat,
      DATE_FORMAT: process.env.VUE_APP_DATE_FORMAT
    }
  }
}
</script>
