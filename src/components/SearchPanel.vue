<template>
  <v-row v-if="hasAccess('search') || hasAccess('searchRelations')">
    <v-col cols="12">
      <v-select v-model="searchVal" :items="items" @change="onSearchEntityChange" dense hide-details class="mx-4 mb-0 py-0" />
      <v-input
          v-if="selectedRef && selectedRef.identifier && selectedRef.identifier.length"
          class="mx-4 mb-0 py-0"
          append-icon="mdi-close"
          @click:append="clearSelectedRef"
        >
        {{ selectedRef.name[currentLanguage.identifier] || selectedRef.name[defaultLanguageIdentifier.identifier] }}
      </v-input>
      <SearchItem v-if="searchVal === 'ITEM'" />
      <SearchItemRelation v-if="searchVal === 'ITEM_RELATION'" />
      <template v-if="searchVal !== 'ITEM' && searchVal !== 'ITEM_RELATION'">
        <CustomSearchComponent  v-for="(elem, i) in customSearch()" :key="i" searchEntity="searchEntityRef"/>
      </template>
    </v-col>
  </v-row>
</template>

<script>
import * as langStore from '../store/languages'
import * as searchStore from '../store/search'
import * as userStore from '../store/users'
import i18n from '../i18n'
import SearchItem from './SearchItem.vue'
import SearchItemRelation from './SearchItemRelation.vue'
import customSearch from '../_customizations/search/customSearch.js'
import CustomSearchComponent from '../_customizations/search/customSearchComponent.vue'
import router from '../router'
import { ref } from '@vue/composition-api'

export default {
  components: { SearchItem, SearchItemRelation, CustomSearchComponent },
  setup (props, context) {
    const { currentWhereRef, searchEntityRef, selectedRef } = searchStore.useStore()
    const { hasAccess } = userStore.useStore()
    const { currentLanguage, defaultLanguageIdentifier } = langStore.useStore()
    const searchVal = ref('ITEM')

    function onSearchEntityChange (val) {
      localStorage.setItem('last_search_entity', val)
      const name = {}
      name[currentLanguage.value.identifier] = i18n.t('SearchSaveDialog.NameNew')
      currentWhereRef.value = null
      selectedRef.value = { identifier: '', entity: val, name: name, filters: [], whereClause: {}, extended: false, public: false, orAnd: 1 }
      router.push('/search')
      searchEntityRef.value = val
    }

    function clearSelectedRef () {
      const name = {}
      name[currentLanguage.value.identifier] = i18n.t('SearchSaveDialog.NameNew')
      currentWhereRef.value = null
      selectedRef.value = { identifier: '', entity: searchEntityRef.value.valuel, name: {}, filters: [], whereClause: {}, extended: false, public: false, orAnd: 1 }
      router.push('/search')
    }

    return {
      hasAccess,
      searchVal,
      selectedRef,
      currentLanguage,
      defaultLanguageIdentifier,
      clearSelectedRef,
      currentWhereRef,
      onSearchEntityChange,
      customSearch,
      CustomSearchComponent,
      items: [
        { text: i18n.t('Search.Title.Items'), value: 'ITEM', disabled: !hasAccess('search') },
        { text: i18n.t('Search.Title.ItemRelations'), value: 'ITEM_RELATION', disabled: !hasAccess('searchRelations') },
        ...customSearch()
      ]
    }
  }
}
</script>
