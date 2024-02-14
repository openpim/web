<template>
  <v-row v-if="hasAccess('search') || hasAccess('searchRelations')">
    <v-col cols="12">
      <v-select v-model="searchEntityRef" :items="items" @change="onSearchEntityChange" dense hide-details class="mx-4 mb-0 py-0" />
      <SearchItem v-if="searchEntityRef === 'ITEM'" />
      <SearchItemRelation v-if="searchEntityRef === 'ITEM_RELATION'" />
      <template v-if="searchEntityRef !== 'ITEM' && searchEntityRef !== 'ITEM_RELATION'">
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

export default {
  components: { SearchItem, SearchItemRelation, CustomSearchComponent },
  setup (props, context) {
    const { currentWhereRef, searchEntityRef, selectedRef } = searchStore.useStore()
    const { hasAccess } = userStore.useStore()
    const { currentLanguage } = langStore.useStore()

    function onSearchEntityChange (val) {
      const name = {}
      name[currentLanguage.value.identifier] = i18n.t('SearchSaveDialog.NameNew')
      currentWhereRef.value = null
      selectedRef.value = { identifier: '', entity: val, name: name, filters: [], whereClause: {}, extended: false, public: false, orAnd: 1 }
    }

    return {
      hasAccess,
      searchEntityRef,
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
