<template>
  <v-expansion-panels focusable>
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
  </v-expansion-panels>
</template>

<script>
import SearchItem from './SearchItem.vue'
import SearchItemRelation from './SearchItemRelation.vue'

export default {
  components: { SearchItem, SearchItemRelation },
  setup (props, context) {
    return {}
  }
}
</script>
