<template>
  <v-autocomplete
    @keydown.enter.prevent="searchEnterPressed"
    :filter="searchFilter"
    v-if="currentUserRef.tenantId !== '0' && !isExportSearch"
    @select="searchSelected"
    @focus="searchResultsRef=[]"
    item-value="identifier"
    v-model="searchTextRef"
    v-model:search="searchRef"
    :loading="searchLoadingRef"
    :items="searchResultsRef"
    class="mr-2 hidden-sm-and-down"
    flat
    solo-inverted
    hide-no-data
    hide-details
    prepend-inner-icon="mdi-magnify"
    :label="$t('Search')"
    variant="underlined"
    >
    <template v-slot:item="{ item }">
      <v-list-item>
        <v-list-item-title><router-link :to="'/item/'+item.raw.identifier">{{item.raw.identifier + ' (' +item.raw.type.identifier+')'}}</router-link></v-list-item-title>
        <v-list-item-subtitle>{{ item.raw.name[currentLanguage.identifier] || '[' + item.raw.name[defaultLanguageIdentifier] + ']' }}</v-list-item-subtitle>
        <v-list-item-subtitle v-for="(attr, idx) in searchAttributesRef" :key="idx">
          {{ attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']' }}: {{item.raw.values[attr.identifier]}}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import * as langStore from '../store/languages'
import * as itemStore from '../store/item'
import * as attrStore from '../store/attributes'
import * as userStore from '../store/users'
import * as rolesStore from '../store/roles'
import * as errorStore from '../store/error'
import * as typesStore from '../store/types'
import router from '../router'

export default {
  props: {
    export: {
      type: Boolean,
      required: true
    }
  },

  setup (props) {
    const {
      searchItem
    } = itemStore.useStore()

    const {
      loadAllAttributes,
      getAttributesForSearch
    } = attrStore.useStore()

    const {
      currentUserRef
    } = userStore.useStore()

    const {
      currentLanguage,
      loadAllLanguages,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadAllRoles
    } = rolesStore.useStore()

    const {
      showError
    } = errorStore.useStore()

    const {
      typesTree,
      loadAllTypes
    } = typesStore.useStore()

    const searchTextRef = ref('')
    const searchResultsRef = ref([])
    const searchRef = ref('')
    const searchLoadingRef = ref(false)
    const searchAttributesRef = ref([])
    let awaitingSearch = null

    watch(searchRef, (val) => {
      if (val && val.length > 1) {
        if (awaitingSearch) {
          clearTimeout(awaitingSearch)
          awaitingSearch = null
        }
        if (!awaitingSearch) {
          awaitingSearch = setTimeout(() => {
            performSearch(val)
          }, 1000)
        }
      }
    })

    const searchTypesFilter = []
    function processTypeFilter (type) {
      if (type.options && type.options.some(option => option.name === 'search' && option.value === 'false')) {
        searchTypesFilter.push(type.id)
      }
      if (type.children) {
        type.children.forEach(child => {
          processTypeFilter(child)
        })
      }
    }
    onMounted(() => {
      loadAllTypes().then(() => {
        typesTree.forEach(type => {
          processTypeFilter(type)
        })
      })
      loadAllRoles().then(() => {
        if (currentUserRef.value.tenantId !== '0') {
          loadAllAttributes().then(() => {
            searchAttributesRef.value = getAttributesForSearch()
          })
          loadAllLanguages()
        }
      })
    })

    async function performSearch (val) {
      searchLoadingRef.value = true
      const typesExpr = searchTypesFilter.length > 0 ? '{typeId: {OP_notIn: ' + JSON.stringify(searchTypesFilter) + '}}' : null
      try {
        const data = await searchItem(val, typesExpr)

        data.rows.forEach(elem => {
          elem.text = elem.identifier + ' (' + elem.name[currentLanguage.value.identifier].replaceAll('\\', '\\\\') + ')'
          searchAttributesRef.value.forEach(attr => {
            elem.text += ' ' + elem.values[attr.identifier]
          })
        })
        searchResultsRef.value = data.rows
      } catch (e) {
        showError(e)
      } finally {
        awaitingSearch = null
        searchLoadingRef.value = false
      }
    }

    function searchSelected () {
      awaitingSearch = true
      setTimeout(() => {
        awaitingSearch = false
        searchTextRef.value = null
      }, 500)
      const identifier = searchTextRef.value
      searchTextRef.value = null
      if (identifier) {
        router.push('/item/' + identifier)
      }
    }

    function searchEnterPressed () {
      if (awaitingSearch) {
        clearTimeout(awaitingSearch)
      }
      performSearch(searchRef.value)
    }

    function searchFilter () {
      return true
    }

    return {
      currentLanguage,
      searchRef,
      searchTextRef,
      searchResultsRef,
      searchLoadingRef,
      searchAttributesRef,
      searchEnterPressed,
      searchSelected,
      searchFilter,
      currentUserRef,
      isExportSearch: props.export,
      defaultLanguageIdentifier
    }
  }
}
</script>
