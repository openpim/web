<template>
  <v-row justify="center">
    <v-dialog v-model="dialogRef" persistent width="80%">
      <v-card>
        <v-card-title>{{ $t('AttributeValuesDialog.UsedValues') }}</v-card-title>
        <v-card-text>
          <v-container>
            <v-alert v-if="loadingRef" border="bottom" colored-border type="info">{{ $t('AttributeValuesDialog.Loading') }}</v-alert>
            <v-alert v-if="totalRef > attrValues.length" border="bottom" colored-border type="warning" elevation="2">{{ $t('AttributeValuesDialog.LimitWarning', { limit: attrValues.length, total: totalRef }) }}</v-alert>
            <v-data-table :headers="headers" :items="currentItems" dense fixed-header height="50vh" :page.sync="currentPage" :items-per-page="itemsPerPage" :server-items-length="totalRef" :footer-props="{ itemsPerPageOptions: [500] }">
              <template v-slot:top>
                <div class="d-flex align-items-center justify-content-between pa-0 ma-0">
                  <v-text-field dense type="text" class="pa-0 ma-0" v-model="search" append-icon="mdi-magnify" :label="$t('Search')" single-line></v-text-field>
                </div>
              </template>
              <template v-slot:item="{ item }">
                <tr>
                  <td class="pa-1">{{ item.value }}</td>
                  <td class="pa-1"><v-text-field v-model="item.mapping" @input="updateMapping(item)"/></td>
                </tr>
              </template>
            </v-data-table>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-if="!allDataLoaded" color="blue darken-1" text @click="loadAllData" :disabled="allDataLoaded">{{ $t('MappingConfigComponent.LoadAllData') }}</v-btn>
          <v-btn color="blue darken-1" text :loading="exportInProgress" @click="exportData">{{ $t('Export') }}</v-btn>
          <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { ref, onMounted, computed, watch } from '@vue/composition-api'
import * as langStore from '../store/languages'
import * as attrStore from '../store/attributes'
import XLSX from 'sheetjs-style'
import { saveAs } from 'file-saver'
import { s2ab } from '../store/utils.js'

export default {
  setup (props, { emit }) {
    const {
      currentLanguage,
      loadAllLanguages
    } = langStore.useStore()
    const {
      getAttributeValues
    } = attrStore.useStore()

    const dialogRef = ref(false)
    const attrValues = ref([])
    const totalRef = ref(0)
    const attrIdentifier = ref(null)
    const itemsPerPage = ref(500)
    const currentPage = ref(1)
    const search = ref('')
    const loadingRef = ref(false)
    const limitRef = ref(500)
    const exportInProgress = ref(false)
    let categoryRef
    const mappingData = ref({})

    async function showDialog (identifier, category) {
      categoryRef = category
      attrIdentifier.value = identifier
      attrValues.value = []
      currentPage.value = 1
      dialogRef.value = true
      loadingRef.value = true
      search.value = ''
      totalRef.value = 0

      const data = await getAttributeValues(identifier, limitRef.value, 0)
      totalRef.value = data.total

      if (category && category.attributes) {
        const attribute = category.attributes.find(elem => elem.value === identifier)
        if (attribute && attribute.mapping) {
          mappingData.value = attribute.mapping
        }
      }

      attrValues.value = data.rows.map(value => ({
        value,
        mapping: mappingData.value[value] || ''
      }))

      loadingRef.value = false
    }

    watch(search, () => {
      currentPage.value = 1
    })

    watch(currentPage, async (newPage) => {
      const itemsLoaded = attrValues.value.length
      const itemsNeeded = newPage * itemsPerPage.value

      if (itemsNeeded > itemsLoaded && itemsLoaded < totalRef.value) {
        loadingRef.value = true
        const data = await getAttributeValues(attrIdentifier.value, limitRef.value, itemsLoaded)
        const newRows = data.rows.map(value => ({
          value,
          mapping: mappingData.value[value] || ''
        }))
        attrValues.value = attrValues.value.concat(newRows)
        loadingRef.value = false
      }
    })

    const filteredValues = computed(() => {
      if (!search.value) return attrValues.value
      const searchTerm = search.value.toLowerCase()
      return attrValues.value.filter(item =>
        item.value.toLowerCase().includes(searchTerm)
      )
    })

    const currentItems = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      return filteredValues.value.slice(start, start + itemsPerPage.value)
    })

    const allDataLoaded = computed(() => attrValues.value.length >= totalRef.value)

    async function loadAllData () {
      if (allDataLoaded.value) return
      loadingRef.value = true
      let offset = attrValues.value.length
      while (offset < totalRef.value) {
        const data = await getAttributeValues(attrIdentifier.value, limitRef.value, offset)
        const newRows = data.rows.map(value => ({
          value,
          mapping: mappingData.value[value] || ''
        }))
        attrValues.value = attrValues.value.concat(newRows)
        offset = attrValues.value.length
      }
      loadingRef.value = false
    }

    async function exportData () {
      exportInProgress.value = true
      const cols = ['Value']
      const data = [cols]
      let page = 0
      do {
        const res = await getAttributeValues(attrIdentifier.value, limitRef.value, page * limitRef.value)
        for (let i = 0; i < res.rows.length; i++) {
          const row = res.rows[i]
          data.push([row])
        }
        page++
      } while (limitRef.value * page < totalRef.value)
      const ws = XLSX.utils.aoa_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data')
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
      saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'data.xlsx')
      exportInProgress.value = false
    }

    function updateMapping (item) {
      if (!attrIdentifier.value) return
      if (categoryRef) {
        const attribute = categoryRef.attributes.find(attr => attr.value === attrIdentifier.value)
        if (attribute) {
          if (!attribute.mapping) {
            attribute.mapping = {}
          }
          attribute.mapping[item.value] = item.mapping
        }
      }
    }

    onMounted(() => {
      loadAllLanguages()
    })

    return {
      updateMapping,
      attrValues,
      headers: [{ text: 'Value', value: 'value' }, { text: 'Mapping', value: 'mapping' }],
      filteredValues,
      currentItems,
      itemsPerPage,
      currentPage,
      search,
      limitRef,
      totalRef,
      dialogRef,
      showDialog,
      loadingRef,
      exportData,
      exportInProgress,
      loadAllData,
      allDataLoaded,
      currentLanguage
    }
  }
}
</script>
