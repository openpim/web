<template>
<div>
  <v-data-table @update:options="optionsUpdate"
      :options.sync="optionsRef"
      :server-items-length="totalItemsRef"
      :loading="loadingRef"
      :headers="headersRef"
      :items="itemsRef"
      :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50] }"
      class="elevation-1">
    <template v-slot:item="{ item, headers }">
      <tr>
        <td v-for="(header, i) in headers" :key="i">
          <span>{{ getValue(item, header) }}</span>
        </td>
      </tr>
    </template>
  </v-data-table>

</div>
</template>
<script>
import * as langStore from '../store/languages'
import * as lovsStore from '../store/lovs'
// import * as errorStore from '../store/error'
import * as auditStore from '../store/audit'
// import i18n from '../i18n'
import { ref, onMounted, watch } from '@vue/composition-api'

export default {
  props: {
    item: {
      required: true
    },
    componentType: { // item or itemRelation
      required: true
    }
  },
  setup (props, { emit, root }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      getLOVData
    } = lovsStore.useStore()

    const {
      loadItemHistory
    } = auditStore.useStore()

    const itemsRef = ref([])
    const totalItemsRef = ref(0)
    const optionsRef = ref({ page: 1, itemsPerPage: 10, sortBy: [], sortDesc: [] })
    const loadingRef = ref(false)
    const headersRef = ref([{ identifier: '#thumbnail#', text: 'Thumbnail', align: 'start', sortable: false, filterable: false, value: '#thumbnail#' },
      { identifier: 'identifier', text: 'Identifier', align: 'start', sortable: true, filterable: false, value: 'identifier' },
      { identifier: 'name_en', text: 'Name (English)', align: 'start', sortable: true, filterable: false, value: { path: ['name', 'en'] } }])
    const lovsMap = {}

    watch(() => props.item, (newItem, oldItem) => {
      optionsRef.value.page = 1
      totalItemsRef.value = 0
      optionsUpdate(optionsRef.value)
    })

    function loadLOVs () {
      headersRef.value.forEach(elem => {
        if (elem.lov) {
          getLOVData(elem.lov).then(values => {
            lovsMap[elem.lov] = values
          })
        }
      })
    }

    function optionsUpdate (options) {
      loadingRef.value = true
      loadItemHistory(props.item.internalId, optionsRef.value).then(data => {
        itemsRef.value = data.rows
        totalItemsRef.value = data.count
        loadingRef.value = false
      })
    }

    function getValue (item, header) {
      return ''
    }

    onMounted(() => {
      loadLOVs()
      optionsUpdate(optionsRef.value)
    })

    return {
      itemsRef,
      totalItemsRef,
      headersRef,
      currentLanguage,
      defaultLanguageIdentifier,
      optionsUpdate,
      optionsRef,
      loadingRef,
      getValue
    }
  }
}
</script>
