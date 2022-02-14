<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <ItemsDataTable v-if="searchEntityRef === 'ITEM'" :export="isExportSearch" />
        <ItemRelationsDataTable v-if="searchEntityRef === 'ITEM_RELATION'" :export="isExportSearch" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as searchStore from '../store/search'
import ItemsDataTable from '../components/ItemsDataTable'
import ItemRelationsDataTable from '../components/ItemRelationsDataTable'

export default {
  components: { ItemsDataTable, ItemRelationsDataTable },
  props: {
    export: {
      type: Boolean,
      required: true
    }
  },
  setup (props) {
    const { searchEntityRef } = searchStore.useStore()

    return {
      isExportSearch: props.export,
      searchEntityRef
    }
  }
}
</script>
