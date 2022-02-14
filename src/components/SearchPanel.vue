<template>
  <v-row v-if="hasAccess('search')">
    <v-col cols="12">
      <v-select v-model="searchEntityRef" :items="items" @change="onSearchEntityChange" class="mx-4" />
      <SearchItem v-show="searchEntityRef === 'ITEM'" />
      <SearchItemRelation v-show="searchEntityRef === 'ITEM_RELATION'" />
    </v-col>
  </v-row>
    <!-- v-expansion-panels focusable>
    <v-expansion-panel :key="'item'">
      <v-expansion-panel-header>Item</v-expansion-panel-header>
      <v-expansion-panel-content>
        <SearchItem />
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-expansion-panel :key="'itemRelation'">
      <v-expansion-panel-header>Item Relation</v-expansion-panel-header>
      <v-expansion-panel-content>
        <SearchItemRelation />
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels -->
</template>

<script>
import * as langStore from '../store/languages'
import * as searchStore from '../store/search'
import * as userStore from '../store/users'
import i18n from '../i18n'
import SearchItem from './SearchItem.vue'
import SearchItemRelation from './SearchItemRelation.vue'

export default {
  components: { SearchItem, SearchItemRelation },
  setup (props, context) {
    const { currentWhereRef, searchEntityRef, selectedRef } = searchStore.useStore()
    const { hasAccess } = userStore.useStore()
    const { currentLanguage } = langStore.useStore()

    function onSearchEntityChange (val) {
      const name = {}
      name[currentLanguage.value.identifier] = i18n.t('SearchSaveDialog.NameNew')
      selectedRef.value = selectedRef.value = { identifier: '', entity: val, name: name, filters: [], whereClause: {}, extended: false, public: false, orAnd: 1 }
    }

    return {
      hasAccess,
      searchEntityRef,
      currentWhereRef,
      onSearchEntityChange,
      items: [{ text: i18n.t('Search.Title.Items'), value: 'ITEM' }, { text: i18n.t('Search.Title.ItemRelations'), value: 'ITEM_RELATION' }]
    }
  }
}
</script>
