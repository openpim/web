<template>
<div>
  <v-toolbar dense elevation="1" class="mt-2">
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }" v-if="!talendExportSelection">
          <v-btn icon :disabled="!totalItemsRef" v-on="on" @click="exportExcel"><v-icon>mdi-application-export</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.ExportExcel') }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }" v-if="!talendExportSelection">
          <v-btn icon :disabled="!totalItemsRef" v-on="on" @click="importExcel"><v-icon>mdi-application-import</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.ImportExcel') }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon :disabled="!totalItemsRef" v-on="on" @click="exportData"><v-icon>mdi-export</v-icon></v-btn>
        </template>
        <span>{{  talendExportSelection ? $t('DataTable.TalendExportSelection') : $t('DataTable.ExportCSV') }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="editHeaders"><v-icon>mdi-table-settings</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.SelectColumns') }}</span>
      </v-tooltip>
    </v-toolbar>
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
          <router-link v-if="header.identifier === 'identifier'" :to="'/item/' + item.identifier">{{ item.identifier }}</router-link>

          <v-img v-if="header.identifier === '#thumbnail#' && getThumbnail(item.id)" :src="damUrl + 'asset/' + getThumbnail(item.id).id + '/thumb?token=' + token" contain max-width="50" max-height="50"></v-img>

          <span v-if="header.identifier !== 'identifier' &&  header.identifier !== '#thumbnail#'">{{ getValue(item, header) }}</span>
        </td>
      </tr>
    </template>
  </v-data-table>
  <ColumnsSelectionDialog ref="columnsSelectionDialogRef" @selected="columnsSelected"/>
    <template>
      <v-row justify="center">
        <v-dialog v-model="excelDialogRef" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ excelDialogModeRef === 'import' ? $t('DataTable.ExcelDialog.TitleImport') : $t('DataTable.ExcelDialog.TitleExport') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-progress-linear v-model="excelDialogProgressRef" color="primary" height="25">
                      <template v-slot:default="{ value }">
                        <strong>{{ Math.ceil(value) }}%</strong>
                      </template>
                    </v-progress-linear>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="excelDialogClose">{{ $t('Cancel') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>

</div>
</template>
<script>
import { saveAs } from 'file-saver'
import * as langStore from '../store/languages'
import * as itemStore from '../store/item'
import * as lovsStore from '../store/lovs'
import i18n from '../i18n'
import { ref, onMounted } from '@vue/composition-api'
import ColumnsSelectionDialog from './ColumnsSelectionDialog'
import XLSX from 'xlsx'

export default {
  components: { ColumnsSelectionDialog },
  props: {
    loadData: {
      required: true
    },
    export: {
      type: Boolean,
      required: true
    }
  },
  setup (props, { emit, root }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadThumbnails
    } = itemStore.useStore()

    const {
      getLOVData
    } = lovsStore.useStore()

    const columnsSelectionDialogRef = ref(null)

    const excelDialogRef = ref(false)
    const excelDialogProgressRef = ref(0)
    const excelDialogModeRef = ref('import')
    const itemsRef = ref([])
    const totalItemsRef = ref(0)
    const optionsRef = ref({ page: 1, itemsPerPage: 10, sortBy: [], sortDesc: [] })
    const loadingRef = ref(false)
    const headersRef = ref([{ identifier: '#thumbnail#', text: 'Thumbnail', align: 'start', sortable: false, filterable: false, value: '#thumbnail#' },
      { identifier: 'identifier', text: 'Identifier', align: 'start', sortable: false, filterable: false, value: 'identifier' },
      { identifier: 'name_en', text: 'Name (English)', align: 'start', sortable: false, filterable: false, value: ['name', 'en'] }])
    const thumbnailsRef = ref([])
    const lovsMap = {}

    function editHeaders () {
      columnsSelectionDialogRef.value.showDialog([...headersRef.value])
    }

    function columnsSelected (arr) {
      columnsSelectionDialogRef.value.closeDialog()
      headersRef.value = arr
      loadLOVs()
      localStorage.setItem('item_headers', JSON.stringify(arr))
    }

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
      totalItemsRef.value = 0
      props.loadData(options).then(data => {
        itemsRef.value = data.rows
        totalItemsRef.value = data.count
        loadingRef.value = false

        const ids = data.rows.map(elem => elem.id)
        loadThumbnails(ids).then(arr => { thumbnailsRef.value = arr })
      })
    }

    async function exportExcel () {
      excelDialogModeRef.value = 'export'
      excelDialogRef.value = true
      const itemsPerPage = 1000
      let total = 0
      let page = 0
      excelDialogProgressRef.value = 0

      const columns = ['parent', 'type', 'Identifier']
      headersRef.value.forEach(header => {
        if (header.identifier !== '#thumbnail#' && header.identifier !== 'identifier') {
          columns.push(header.text)
        }
      })
      const ws = XLSX.utils.aoa_to_sheet([columns])
      ws['!cols'] = []
      ws['!cols'][0] = { hidden: true }
      ws['!cols'][1] = { hidden: true }

      let cell = ws[XLSX.utils.encode_cell({ c: 0, r: 0 })]
      cell.c = []
      cell.c.hidden = true
      cell.c.push({ a: 'OpenPIM', t: 'parent' })

      cell = ws[XLSX.utils.encode_cell({ c: 1, r: 0 })]
      cell.c = []
      cell.c.hidden = true
      cell.c.push({ a: 'OpenPIM', t: 'type' })

      cell = ws[XLSX.utils.encode_cell({ c: 2, r: 0 })]
      cell.c = []
      cell.c.hidden = true
      cell.c.push({ a: 'OpenPIM', t: 'identifier' })

      let idx = 3
      headersRef.value.forEach(header => {
        if (header.identifier !== '#thumbnail#' && header.identifier !== 'identifier') {
          cell = ws[XLSX.utils.encode_cell({ c: idx, r: 0 })]
          cell.c = []
          cell.c.hidden = true
          cell.c.push({ a: 'OpenPIM', t: header.identifier })
          idx++
        }
      })

      do {
        page++
        const data = await props.loadData({ page: page, itemsPerPage: itemsPerPage, sortBy: [], sortDesc: [] })
        total = data.count
        if (!excelDialogRef.value) return // exit if process was canceled
        data.rows.forEach(row => {
          const rowData = []
          rowData.push(row.parentIdentifier)
          rowData.push(row.typeIdentifier)
          rowData.push(row.identifier)
          headersRef.value.forEach(header => {
            if (header.identifier !== '#thumbnail#' && header.identifier !== 'identifier') {
              const value = getValue(row, header)
              rowData.push(value)
            }
          })
          XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: -1 })
        })
        const tst = page * itemsPerPage * 100 / total
        excelDialogProgressRef.value = tst > 100 ? 100 : tst
      } while (page * itemsPerPage < total)

      if (!excelDialogRef.value) return // exit if process was canceled

      var wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data')
      var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
      saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'results.xlsx')

      excelDialogRef.value = false
    }
    /* generate a download */
    function s2ab (s) {
      var buf = new ArrayBuffer(s.length)
      var view = new Uint8Array(buf)
      for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
      return buf
    }

    async function importExcel () {
      excelDialogModeRef.value = 'import'
      excelDialogRef.value = true
      const itemsPerPage = 1000
      let total = 0
      let page = 0
      excelDialogProgressRef.value = 0
      do {
        page++
        const data = await props.loadData({ page: page, itemsPerPage: itemsPerPage, sortBy: [], sortDesc: [] })
        total = data.count
        data.rows.forEach(row => {
        })
        const tst = page * itemsPerPage * 100 / total
        excelDialogProgressRef.value = tst > 100 ? 100 : tst
      } while (page * itemsPerPage < total)
      excelDialogRef.value = false
    }

    function excelDialogClose () {
      excelDialogRef.value = false
    }

    function exportData () {
      const maxRows = 10000
      if (totalItemsRef.value > maxRows && confirm(i18n.t('DataTable.Export.Limit', { number: totalItemsRef.value, max: maxRows }))) {
        performExport(maxRows)
      } else {
        performExport(maxRows)
      }
    }
    function performExport (maxRows) {
      loadingRef.value = true
      props.loadData({ page: 1, itemsPerPage: maxRows, sortBy: [], sortDesc: [] }).then(data => {
        if (props.export) {
          console.log('#@SELECTED_ITEMS@#')
          const identHeader = { value: 'identifier' }
          data.rows.forEach(row => {
            console.log(getValue(row, identHeader))
          })
          console.log('#@END@#')

          loadingRef.value = false
        } else {
          let csv = ''
          headersRef.value.forEach(header => {
            if (header.identifier !== '#thumbnail#') {
              csv += '"' + header.text.replaceAll('"', '""') + '",'
            }
          })
          csv += '\n'

          data.rows.forEach(row => {
            headersRef.value.forEach(header => {
              if (header.identifier !== '#thumbnail#') {
                const value = '' + getValue(row, header)
                csv += '"' + value.replaceAll('"', '""') + '",'
              }
            })
            csv += '\n'
          })

          loadingRef.value = false

          // set BOM at the begining so that Excel can open UTF-8 right
          const blob = new Blob([String.fromCharCode(0xFEFF), csv], { type: 'application/vnd.ms-excel;charset=utf-8' })
          saveAs(blob, 'export.csv')
        }
      })
    }

    function DataChanged () {
      optionsRef.value.page = 1
      loadingRef.value = true
      totalItemsRef.value = 0
      props.loadData(optionsRef.value).then(data => {
        itemsRef.value = data.rows
        totalItemsRef.value = data.count
        loadingRef.value = false

        emit('dataLoaded', itemsRef.value)

        const ids = data.rows.map(elem => elem.id)
        loadThumbnails(ids).then(arr => { thumbnailsRef.value = arr })
      })
    }

    function getThumbnail (id) {
      return thumbnailsRef.value.find(elem => elem.itemId === ('' + id))
    }

    function getValue (item, header) {
      if (Array.isArray(header.value)) {
        let val = getDeepValue(header.value, item)
        if (header.lov) {
          const lovValues = lovsMap[header.lov]
          if (lovValues) {
            const tst = lovValues.find(elem => elem.id === val)
            if (tst) val = tst.value[currentLanguage.value.identifier] || '[' + tst.value[defaultLanguageIdentifier.value] + ']'
          }
        }
        return val
      } else {
        return item[header.value]
      }
    }
    // https://medium.com/javascript-inside/safely-accessing-deeply-nested-values-in-javascript-99bf72a0855a
    const getDeepValue = (path, obj) => path.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, obj)

    onMounted(() => {
      const tst = localStorage.getItem('item_headers')
      if (tst) headersRef.value = JSON.parse(tst)
      loadLOVs()
      DataChanged()
    })

    return {
      columnsSelectionDialogRef,
      itemsRef,
      totalItemsRef,
      headersRef,
      currentLanguage,
      defaultLanguageIdentifier,
      DataChanged,
      getValue,
      optionsUpdate,
      optionsRef,
      loadingRef,
      editHeaders,
      columnsSelected,
      damUrl: window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : '/',
      token: localStorage.getItem('token'),
      getThumbnail,
      exportData,
      exportExcel,
      importExcel,
      excelDialogRef,
      excelDialogProgressRef,
      excelDialogModeRef,
      excelDialogClose,
      talendExportSelection: props.export
    }
  }
}
</script>
