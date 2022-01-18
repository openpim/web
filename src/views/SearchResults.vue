<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <ItemsDataTable
          ref="itemsDataTableRef"
          :loadData="loadDataFunction"
          :export="isExportSearch"
        ></ItemsDataTable>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, watch } from '@vue/composition-api'
import * as itemStore from '../store/item'
import * as itemRelationStore from '../store/itemRelations'
import * as searchStore from '../store/search'
import * as errorStore from '../store/error'
import ItemsDataTable from '../components/ItemsDataTable'

export default {
  components: { ItemsDataTable },
  props: {
    export: {
      type: Boolean,
      required: true
    }
  },
  setup (props) {
    const { searchItems } = itemStore.useStore()

    const { searchItemRelations } = itemRelationStore.useStore()

    const { currentWhereRef, searchEntity } = searchStore.useStore()

    const { showError } = errorStore.useStore()

    const itemsDataTableRef = ref(null)

    watch(currentWhereRef, () => {
      if (itemsDataTableRef.value) itemsDataTableRef.value.DataChanged()
    })

    function loadDataFunction (options) {
      return new Promise((resolve, reject) => {
        if (!currentWhereRef.value) {
          resolve({ count: 0, rows: [] })
        } else {
          console.log(JSON.stringify(searchEntity.value))
          if (searchEntity.value === 'ITEM_RELATION') {
            searchItemRelations(currentWhereRef.value, options)
              .then((data) => resolve(data))
              .catch((error) => showError(error))
          } else {
            searchItems(currentWhereRef.value, options)
              .then((data) => resolve(data))
              .catch((error) => showError(error))
          }
        }
      })
    }

    return {
      itemsDataTableRef,
      loadDataFunction,
      isExportSearch: props.export
    }
  }
}
</script>
