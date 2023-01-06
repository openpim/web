<template>
  <v-autocomplete @keydown.enter.prevent="searchEnterPressed" :filter="searchFilter" v-if="currentUserRef.tenantId !== '0' && !isExportSearch" @input="searchSelected" @focus="searchResultsRef=[]" item-value="identifier" v-model="searchTextRef" :loading="searchLoadingRef" :items="searchResultsRef" :search-input.sync="searchRef" class="mr-2 hidden-sm-and-down" flat solo-inverted hide-no-data hide-details prepend-inner-icon="mdi-magnify" :label="$t('Search')">
    <template v-slot:item="{ item }">
      <v-list-item-content>
        <v-list-item-title><router-link :to="'/item/'+item.identifier">{{item.identifier + ' (' +item.type.identifier+')'}}</router-link></v-list-item-title>
        <v-list-item-subtitle>{{ item.name[currentLanguage.identifier] || '[' + (item.name[defaultLanguageIdentifier] || '') + ']' }}</v-list-item-subtitle>
        <v-list-item-subtitle v-for="(attr, idx) in searchAttributesRef" :key="idx">
          {{ attr.name[currentLanguage.identifier] || '[' + (attr.name[defaultLanguageIdentifier] || '') + ']' }}: {{item.values[attr.identifier]}}
        </v-list-item-subtitle>
      </v-list-item-content>
    </template>
  </v-autocomplete>
</template>

<script>
import { ref, onMounted, watch } from '@vue/composition-api'
import * as langStore from '../store/languages'
import * as itemStore from '../store/item'
import * as attrStore from '../store/attributes'
import * as userStore from '../store/users'
import * as rolesStore from '../store/roles'
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
      loadAllLanguages
    } = langStore.useStore()

    const {
      loadAllRoles
    } = rolesStore.useStore()

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

    function performSearch (val) {
      searchLoadingRef.value = true
      const typesExpr = searchTypesFilter.length > 0 ? '{typeId: {OP_notIn: ' + JSON.stringify(searchTypesFilter) + '}}' : null
      searchItem(val, typesExpr).then(data => {
        searchResultsRef.value = data.rows.map(elem => {
          elem.text = elem.identifier + (elem.name[currentLanguage.value.identifier] ? ' (' + elem.name[currentLanguage.value.identifier].replaceAll('\\', '\\\\') + ')' : '')
          searchAttributesRef.value.forEach(attr => { elem.text += ' ' + elem.values[attr.identifier] })
          return elem
        })
        searchLoadingRef.value = false
      })
      awaitingSearch = null
    }

    function searchSelected () {
      awaitingSearch = true
      setTimeout(() => {
        awaitingSearch = false
        searchTextRef.value = null
      }, 500)
      const identifier = searchTextRef.value
      searchTextRef.value = null
      router.push('/item/' + identifier)
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
      isExportSearch: props.export
    }
  }
}
</script>
