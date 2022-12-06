<template>
  <v-container ref="searchDivRef">
    <v-row no-gutters>
      <v-col cols="12">
        <ItemsDataTable v-if="searchEntityRef === 'ITEM'" :export="isExportSearch" :marginTop="dataTableMarginTop"/>
        <ItemRelationsDataTable v-if="searchEntityRef === 'ITEM_RELATION'" :export="isExportSearch" :marginTop="dataTableMarginTop"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as searchStore from '../store/search'
import ItemsDataTable from '../components/ItemsDataTable'
import ItemRelationsDataTable from '../components/ItemRelationsDataTable'
import { ref, onMounted } from 'vue'

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
    const searchDivRef = ref(null)
    const dataTableMarginTop = ref(200)

    // we calculate margin from the top of the page. it allows us to set fixed table height.
    onMounted(() => {
      dataTableMarginTop.value = searchDivRef.value.getBoundingClientRect().top
    })

    return {
      isExportSearch: props.export,
      searchDivRef,
      dataTableMarginTop,
      searchEntityRef
    }
  }
}
</script>
