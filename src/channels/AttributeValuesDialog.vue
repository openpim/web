<template>
  <v-row justify="center">
    <v-dialog v-model="dialogRef" persistent width="80%">
      <v-card>
        <v-card-title>{{ $t('AttributeValuesDialog.UsedValues') }}</v-card-title>
        <v-card-text>
          <v-container>
            <v-alert v-if="loadingRef" border="bottom" colored-border type="info">{{ $t('AttributeValuesDialog.Loading') }}</v-alert>
            <v-alert v-if="totalRef > limitRef" border="bottom" colored-border type="warning" elevation="2">{{$t('AttributeValuesDialog.LimitWarning', { limit: limitRef, total: totalRef })}}</v-alert>
            <v-data-table :headers="headers" :items="filteredValues" dense fixed-header height="50vh" :page.sync="currentPage" :items-per-page="itemsPerPage">
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
          <v-btn color="blue darken-1" text :loading="exportInProgress" @click="exportData">{{ $t('Export') }}</v-btn>
          <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { ref, onMounted, computed } from '@vue/composition-api'
import * as langStore from '../store/languages'
import * as attrStore from '../store/attributes'
import XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { s2ab } from '../store/utils.js'

export default {
  components: { },
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
    const itemsPerPage = ref(-1)
    const currentPage = ref(1)
    const search = ref('')
    const loadingRef = ref(false)
    const limitRef = ref(500)
    const exportInProgress = ref(false)
    let categoryRef

    async function showDialog (identifier, category) {
      categoryRef = category
      attrIdentifier.value = identifier
      attrValues.value = []
      dialogRef.value = true
      loadingRef.value = true
      search.value = null
      totalRef.value = 0

      const data = await getAttributeValues(identifier, limitRef.value, 0)
      totalRef.value = data.total

      let mappingData = {}
      if (category && category.attributes) {
        const attribute = category.attributes.find(elem => elem.value === identifier)
        console.log(attribute)
        if (attribute && attribute.mapping) {
          mappingData = attribute.mapping
        }
      }

      attrValues.value = data.rows.map(value => ({
        value,
        mapping: mappingData[value] || ''
      }))

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

    onMounted(() => {
      loadAllLanguages()
    })

    const filteredValues = computed(() => {
      if (!search.value) return attrValues.value

      const searchTerm = search.value.toLowerCase()
      return attrValues.value.filter(item => item.value.toLowerCase().includes(searchTerm))
    })

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

    return {
      updateMapping,
      attrValues,
      headers: [{ text: 'Value', value: 'value' }, { text: 'Mapping', value: 'mapping' }],
      filteredValues,
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
      currentLanguage
    }
  }
}
</script>
