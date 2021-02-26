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

    function exportExcel () {
    }

    function importExcel () {
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
      talendExportSelection: props.export
    }
  }
}
</script>
