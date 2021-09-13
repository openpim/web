<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <ItemsDataTable ref="itemsDataTableRef" :loadData="loadDataFunction" :export="isExportSearch"></ItemsDataTable>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, watch } from '@vue/composition-api'
import * as itemStore from '../store/item'
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
    const {
      searchItems,
      currentWhereRef
    } = itemStore.useStore()

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
          searchItems(currentWhereRef.value, options)
            .then(data => resolve(data))
            .catch(error => showError(error))
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
