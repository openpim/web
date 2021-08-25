<template>
<div class="mb-10">
  <v-toolbar dense elevation="1" class="mt-2">
      <v-select dense v-if="savedOptionsVisible()" v-model="savedColumnsSelectionRef" :items="savedColumnsOptionsRef"></v-select>
      <v-spacer></v-spacer>
      <v-tooltip top v-if="item">
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="openSearch"><v-icon>mdi-text-search</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.OpenSearch') }}</span>
      </v-tooltip>
      <v-tooltip top v-if="!talendExportSelection && hasAccess('exportXLS')">
        <template v-slot:activator="{ on }">
          <v-btn icon :disabled="!totalItemsRef" v-on="on" @click="exportExcel"><v-icon>mdi-application-export</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.ExportExcel') }}</span>
      </v-tooltip>
      <v-tooltip top v-if="!talendExportSelection && hasAccess('importXLS')">
        <template v-slot:activator="{ on }">
          <input ref="fileUploadRef" style="display: none" type="file" @change="importExcel"/>
          <v-btn icon :disabled="!totalItemsRef" v-on="on" @click="fileUploadRef.click()"><v-icon>mdi-application-import</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.ImportExcel') }}</span>
      </v-tooltip>
      <v-tooltip top  v-if="talendExportSelection || hasAccess('exportCSV')">
        <template v-slot:activator="{ on }">
          <v-btn icon :disabled="!totalItemsRef" v-on="on" @click="exportData"><v-icon>mdi-export</v-icon></v-btn>
        </template>
        <span>{{  talendExportSelection ? $t('DataTable.TalendExportSelection') : $t('DataTable.ExportCSV') }}</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="editHeaders"><v-icon>mdi-table-settings</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.SelectColumns') }}</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="selectAttrGroups"><v-icon>mdi-table-plus</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.SelectGroups') }}</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="DataChanged()"><v-icon>mdi-refresh</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.Refresh') }}</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon @click="columnsSaveDialogRef.showDialog(headersRef)"><v-icon>mdi-content-save</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.SaveColumns') }}</span>
      </v-tooltip>
      <v-tooltip top v-if="hasChannelsRef">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon @click="chanSelectionDialogRef.showDialog()"><v-icon>mdi-access-point-plus</v-icon></v-btn>
        </template>
        <span>{{ $t('Submit') }}</span>
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
        <td v-for="(header, i) in headers" :key="i" @click="cellClicked(item, header)">
          <router-link v-if="header.identifier === 'identifier'" :to="'/item/' + item.identifier">{{ item.identifier }}</router-link>
          <router-link v-if="header.identifier === 'parentIdentifier'" :to="'/item/' + item.parentIdentifier">{{ item.parentIdentifier }}</router-link>

          <v-img v-if="header.identifier === '#thumbnail#' && getThumbnail(item.id)" :src="damUrl + 'asset/' + getThumbnail(item.id).id + '/thumb?token=' + token" contain max-width="50" max-height="50"></v-img>

          <template v-if="!header.identifier.startsWith('#channel_') && header.identifier !== 'identifier' && header.identifier !== 'parentIdentifier' &&  header.identifier !== '#thumbnail#' && (!inplaceItem || (item.identifier != inplaceItem.identifier || header.identifier != inplaceHeader.identifier))">
            <v-icon v-if="getValue(item, header) === true">mdi-check</v-icon>
            <span v-else>{{ getValue(item, header) }}</span>
          </template>

          <template v-if="header.identifier.startsWith('#channel_')">
            <template v-if="!getValue(item, header)"></template>
            <template v-else>
              <template v-if="getValue(item, header) === 1"><v-chip class="ma-2" color="" text-color="black"> {{$t('ItemView.Channels.Submitted')}}</v-chip></template>
              <template v-if="getValue(item, header) === 2"><v-chip class="ma-2" color="green" text-color="white"> {{$t('ItemView.Channels.OK')}}</v-chip></template>
              <template v-if="getValue(item, header) === 3"><v-chip class="ma-2" color="red" text-color="white"> {{$t('ItemView.Channels.Error')}}</v-chip></template>
              <template v-if="getValue(item, header) === 4"><v-chip class="ma-2" color="indigo" text-color="white"> {{$t('ItemView.Channels.Waiting')}}</v-chip></template>

              <span v-if="header.identifier.endsWith('_submittedAt')  || header.identifier.endsWith('_syncedAt')">{{ dateFormat(new Date(getValue(item, header)), DATE_FORMAT) }}</span>

              <span v-if="header.identifier.endsWith('_submittedBy')">{{ getValue(item, header) }}</span>
              <span v-if="header.identifier.endsWith('_message')">{{ getValue(item, header) }}</span>
            </template>
          </template>

          <template v-if="!header.identifier.startsWith('#channel_') && inplaceItem && item.identifier === inplaceItem.identifier && header.identifier === inplaceHeader.identifier">
            <!-- Text, Integer, Float, URL-->
            <v-text-field v-if="!inplaceAttribute || (inplaceAttribute.type===AttributeType.Text || inplaceAttribute.type===AttributeType.Integer || inplaceAttribute.type===AttributeType.Float || inplaceAttribute.type===AttributeType.URL)"
              :type="inplaceAttribute && (inplaceAttribute.type===AttributeType.Integer || inplaceAttribute.type===AttributeType.Float) ? 'number' : 'text'"
              @blur="inplaceBlur" autofocus dense v-model="inplaceValue" required></v-text-field>
            <!-- Boolean-->
            <v-checkbox v-if="inplaceAttribute && inplaceAttribute.type===AttributeType.Boolean" @click.stop="inplaceBlur" autofocus dense v-model="inplaceValue" required></v-checkbox>
            <!-- LOV-->
            <v-autocomplete :chips="inplaceMultivalue" :deletable-chips="inplaceMultivalue" :multiple="inplaceMultivalue" v-if="inplaceAttribute && inplaceAttribute.type===AttributeType.LOV" @blur="inplaceBlur" @click.stop="" autofocus dense v-model="inplaceValue" required :items="inplaceLovSelection"></v-autocomplete>
            <!-- Date-->
            <v-menu v-model="dateMenu" v-if="inplaceAttribute && inplaceAttribute.type===AttributeType.Date" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
              <template v-slot:activator="{ on }">
                <v-text-field v-model="inplaceValue" autofocus prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="inplaceValue" @input="dateMenu = false; inplaceBlur()"></v-date-picker>
            </v-menu>
            <!-- Time-->
            <v-menu ref="timeMenuRef" v-if="inplaceAttribute && inplaceAttribute.type===AttributeType.Time" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
              <template v-slot:activator="{ on }">
                <v-text-field v-model="inplaceValue" autofocus prepend-icon="mdi-clock-outline" readonly v-on="on"></v-text-field>
              </template>
              <v-time-picker v-if="timeMenu" v-model="values[attr.identifier]" format="24hr" full-width @click:minute="timeMenuRef.save(time); inplaceBlur()"></v-time-picker>
            </v-menu>
          </template>
        </td>
      </tr>
    </template>
  </v-data-table>
  <ColumnsSelectionDialog ref="columnsSelectionDialogRef" @selected="columnsSelected"/>
  <ChannelsSelectionDialog ref="chanSelectionDialogRef" :multiselect="true" :editAccessOnly="true" @selected="channelsSelected"/>
  <ColumnsSaveDialog ref="columnsSaveDialogRef" @changed="loadColumns(true)"/>
  <AttrGroupsSelectionDialog ref="attrSelectionDialogRef" :multiselect="true" @selected="attrGroupsSelected"/>
    <template>
      <v-row justify="center">
        <v-dialog v-model="excelDialogRef" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ excelDialogTitleRef }}</span>
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
import * as errorStore from '../store/error'
import * as userStore from '../store/users'
import * as searchStore from '../store/search'
import * as attrStore from '../store/attributes'
import * as channelsStore from '../store/channels'
import * as typesStore from '../store/types'
import i18n from '../i18n'
import { ref, onMounted, watch, computed } from '@vue/composition-api'
import ColumnsSelectionDialog from './ColumnsSelectionDialog'
import ColumnsSaveDialog from './ColumnsSaveDialog'
import ChannelsSelectionDialog from './ChannelsSelectionDialog'
import AttrGroupsSelectionDialog from './AttrGroupsSelectionDialog'
import AttributeType from '../constants/attributeTypes'
import XLSX from 'xlsx'
import dateFormat from 'dateformat'

export default {
  components: { ColumnsSelectionDialog, ColumnsSaveDialog, ChannelsSelectionDialog, AttrGroupsSelectionDialog },
  props: {
    loadData: {
      required: true
    },
    export: {
      type: Boolean,
      required: true
    },
    item: {
      required: false
    }
  },
  setup (props, { emit, root }) {
    const { showError, showInfo } = errorStore.useStore()

    const { currentUserRef, hasAccess, canEditItem, canEditAttrGroup } = userStore.useStore()

    const { savedColumnsRef, loadAllSavedColumns } = searchStore.useStore()

    const { groups, findByIdentifier, getAttributesForItem } = attrStore.useStore()

    const { loadAllChannels, getAwailableChannels, submitItem } = channelsStore.useStore()

    const {
      languages,
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadThumbnails,
      importItems,
      updateItem
    } = itemStore.useStore()

    const {
      getLOVData
    } = lovsStore.useStore()

    const {
      loadAllTypes,
      findTypeByIdentifier
    } = typesStore.useStore()

    const columnsSelectionDialogRef = ref(null)
    const columnsSaveDialogRef = ref(null)
    const attrSelectionDialogRef = ref(null)

    const fileUploadRef = ref(null)
    const excelDialogRef = ref(false)
    const excelDialogProgressRef = ref(0)
    const excelDialogTitleRef = ref('import')
    const itemsRef = ref([])
    const totalItemsRef = ref(0)
    const optionsRef = ref({ page: 1, itemsPerPage: 10, sortBy: [], sortDesc: [] })
    const loadingRef = ref(false)
    const headersRef = ref([{ identifier: '#thumbnail#', text: 'Thumbnail', align: 'start', sortable: false, filterable: false, value: '#thumbnail#' },
      { identifier: 'identifier', text: 'Identifier', align: 'start', sortable: true, filterable: false, value: 'identifier' },
      { identifier: 'name_en', text: 'Name (English)', align: 'start', sortable: true, filterable: false, value: { path: ['name', 'en'] } }])
    const thumbnailsRef = ref([])
    const lovsMap = {}
    const savedColumnsSelectionRef = ref(null)
    const savedColumnsOptionsRef = ref([])
    const chanSelectionDialogRef = ref(null)
    const hasChannelsRef = ref([])

    // dor inplace editing
    const inplaceItem = ref(null)
    const inplaceHeader = ref(null)
    const inplaceValue = ref(null)
    const inplaceMultivalue = ref(false)
    let inplaceValueSave = null
    const inplaceAttribute = ref(null)
    const dateMenu = ref(false)
    const timeMenu = ref(false)
    const timeMenuRef = ref(null)
    const time = ref(null)

    function cellClicked (item, header) {
      if (!canEditItem(item.typeId, item.path)) return

      if (typeof header.value === 'object') { // name or values
        if (header.value.path[0] === 'values') {
          const node = findByIdentifier(header.value.path[1])
          if (!canEditAttrGroup(node.groups[0].id)) return
          inplaceAttribute.value = node.item
        } else {
          inplaceAttribute.value = null
        }
        inplaceItem.value = item
        inplaceHeader.value = header
        inplaceValue.value = getValue(item, header, true)
        inplaceMultivalue.value = inplaceAttribute.value && inplaceAttribute.value.options.some(opt => opt.name === 'multivalue' && opt.value === 'true')
        inplaceValueSave = inplaceValue.value
      }
    }

    function inplaceBlur () {
      if (inplaceValueSave !== inplaceValue.value) {
        const itemToUpdate = { internalId: inplaceItem.value.id }
        const valPath = inplaceHeader.value.value.path
        if (valPath[0] === 'values') {
          itemToUpdate.values = {}
          if (valPath.length === 3) {
            if (!inplaceItem.value.values[valPath[1]]) inplaceItem.value.values[valPath[1]] = {}
            inplaceItem.value.values[valPath[1]][valPath[2]] = inplaceValue.value
            itemToUpdate.values[valPath[1]] = {}
            itemToUpdate.values[valPath[1]][valPath[2]] = inplaceValue.value
          } else {
            inplaceItem.value.values[valPath[1]] = inplaceValue.value
            itemToUpdate.values[valPath[1]] = inplaceValue.value
          }
        } else {
          // name
          inplaceItem.value.name[valPath[1]] = inplaceValue.value
          itemToUpdate.name = {}
          itemToUpdate.name[valPath[1]] = inplaceValue.value
        }
        updateItem(itemToUpdate)
      }
      inplaceAttribute.value = null
      inplaceItem.value = null
      inplaceHeader.value = null
      inplaceValue.value = null
    }

    const inplaceLovSelection = computed(() => {
      if (inplaceAttribute.value && inplaceAttribute.value.lov) {
        const lovValues = lovsMap[inplaceAttribute.value.lov]
        const values = lovValues.filter(elem => !elem.level || elem.level.length === 0 || elem.level.find(path => inplaceItem.value.path.startsWith(path)))
        return values.map(elem => { return { value: elem.id, text: elem.value[currentLanguage.value.identifier] || '[' + elem.value[defaultLanguageIdentifier.value] + ']' } })
      } else {
        return []
      }
    })

    watch(savedColumnsSelectionRef, (val) => {
      if (val) {
        let savedCols = []

        for (const property in savedColumnsRef.value) {
          const tst = savedColumnsRef.value[property].find(elem => elem.id === val)
          if (tst) {
            savedCols = tst.columns
            break
          }
        }

        headersRef.value = savedCols
        loadLOVs()
      }
    })

    function editHeaders () {
      let onlyAttributes = null
      if (itemsRef.value && itemsRef.value.length > 0) {
        const first = itemsRef.value[0]
        onlyAttributes = getAttributesForItem(first.typeId, first.path)
      }

      columnsSelectionDialogRef.value.showDialog([...headersRef.value], onlyAttributes)
    }

    function columnsSelected (arr) {
      savedColumnsSelectionRef.value = null
      columnsSelectionDialogRef.value.closeDialog()
      headersRef.value = arr
      loadLOVs()
      localStorage.setItem('item_headers', JSON.stringify(arr))
    }

    async function loadLOVs () {
      let refresh = false
      for (let i = 0; i < headersRef.value.length; i++) {
        const elem = headersRef.value[i]
        if (elem.lov) {
          const values = await getLOVData(elem.lov)
          lovsMap[elem.lov] = values
          refresh = true
        }
      }
      if (refresh) DataChanged()
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
      excelDialogTitleRef.value = i18n.t('DataTable.ExcelDialog.TitleExport')
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
          cell.c.push({ a: 'OpenPIM', t: header.identifier + (header.lov ? '#' + header.lov : '') })
          idx++
        }
      })

      const sortBy = optionsRef.value.sortBy && optionsRef.value.sortBy.length > 0 ? optionsRef.value.sortBy : ['id']
      const sortDesc = optionsRef.value.sortDesc && optionsRef.value.sortDesc.length > 0 ? optionsRef.value.sortDesc : [false]
      do {
        page++
        const data = await props.loadData({ page: page, itemsPerPage: itemsPerPage, sortBy: sortBy, sortDesc: sortDesc })
        total = data.count
        if (!excelDialogRef.value) return // exit if process was canceled
        data.rows.forEach(row => {
          const rowData = []
          rowData.push(row.parentIdentifier)
          rowData.push(row.typeIdentifier)
          rowData.push(row.identifier)
          headersRef.value.forEach(header => {
            if (header.identifier !== '#thumbnail#' && header.identifier !== 'identifier') {
              rowData.push(getValueWithChannels(header, row, false))
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

    function getValueWithChannels (header, row, formatDate) {
      let value
      if (!header.identifier.startsWith('#channel_')) {
        value = getValue(row, header)
      } else {
        if (getValue(row, header)) {
          if (header.identifier.endsWith('_status')) {
            const status = getValue(row, header)
            if (status === 1) value = i18n.t('ItemView.Channels.Submitted')
            else if (status === 2) value = i18n.t('ItemView.Channels.Synced')
            else if (status === 3) value = i18n.t('ItemView.Channels.Error')
            else if (status === 4) value = i18n.t('ItemView.Channels.Waiting')
          } else if (header.identifier.endsWith('_submittedAt') || header.identifier.endsWith('_syncedAt')) {
            value = formatDate ? dateFormat(new Date(getValue(row, header)), process.env.VUE_APP_DATE_FORMAT) : new Date(getValue(row, header))
          } else {
            value = getValue(row, header)
          }
        } else {
          value = ''
        }
      }
      return value
    }

    /* generate a download */
    function s2ab (s) {
      var buf = new ArrayBuffer(s.length)
      var view = new Uint8Array(buf)
      for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
      return buf
    }

    function importExcel (event) {
      excelDialogTitleRef.value = i18n.t('DataTable.ExcelDialog.TitleImport')
      const pageSize = 100

      const file = event.target.files[0]
      if (!file) return

      excelDialogRef.value = true
      var reader = new FileReader()
      reader.onload = function (evt) {
        const data = evt.target.result

        try {
          const wb = XLSX.read(data, { type: 'binary' })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const availableLangs = languages.map(lang => lang.identifier)

          const range = XLSX.utils.decode_range(ws['!ref'])
          let firstRow = true
          const headers = []
          let rows = []
          const totalRows = range.e.r
          let currentRow = 0
          for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
            if (!excelDialogRef.value) return
            if (firstRow) {
              for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
                const cell = ws[XLSX.utils.encode_cell({ r: rowNum, c: colNum })]
                if (!cell.c || cell.c.length === 0) {
                  showError(i18n.t('DataTable.ExcelImport.WrongFormat'))
                  excelDialogRef.value = false
                  return
                } else {
                  headers.push(cell.c[0].t)
                }
              }
              firstRow = false
            } else {
              const item = {}
              for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
                const cell = ws[XLSX.utils.encode_cell({ r: rowNum, c: colNum })]
                if (!cell) continue
                const header = headers[colNum]
                if (header === 'parent') {
                  item.parentIdentifier = cell.v
                } else if (header === 'type') {
                  item.typeIdentifier = cell.v
                } else if (header === 'identifier') {
                  item.identifier = cell.v
                } else if (header.startsWith('name')) {
                  const arr = ('' + header).split('_')
                  const lang = arr[1]
                  if (!item.name) item.name = {}
                  item.name[lang] = cell.v
                } else if (header.startsWith('attr') && cell.v) {
                  if (!item.values) item.values = {}
                  let attr = header.substring(5)

                  let cellVal = cell.v
                  // check LOV
                  const tst = attr.indexOf('#')
                  if (tst !== -1) {
                    const lov = parseInt(attr.substring(tst + 1))
                    attr = attr.substring(0, tst)

                    const lovValues = lovsMap[lov]
                    if (lovValues) {
                      const val = cell.v
                      if (val.includes(',')) { // multivalue lov
                        cellVal = val.split(',').reduce((accumulator, currentValue) => {
                          const tmp = currentValue.trim()
                          const tst2 = lovValues.find(elem => elem.value[currentLanguage.value.identifier] === tmp)
                          if (tst2) accumulator.push(tst2.id)
                          return accumulator
                        }, [])
                      } else {
                        const tst2 = lovValues.find(elem => elem.value[currentLanguage.value.identifier] === val)
                        if (tst2) cellVal = tst2.id
                      }
                    }
                  }

                  const idx = attr.lastIndexOf('_')
                  if (idx !== -1) {
                    const attrIdent = attr.substring(0, idx)
                    const tst = attr.substring(idx + 1)
                    if (availableLangs.includes(tst)) {
                      if (!item.values[attrIdent]) item.values[attrIdent] = {}
                      item.values[attrIdent][tst] = convertValueIfNecessary(attrIdent, cellVal)
                    } else {
                      item.values[attr] = convertValueIfNecessary(attr, cellVal)
                    }
                  } else {
                    item.values[attr] = convertValueIfNecessary(attr, cellVal)
                  }
                }
              }
              rows.push(item)
              if (rows.length === pageSize) {
                importRows(rows)
                rows = []
              }
              excelDialogProgressRef.value = currentRow++ * 100 / totalRows
            }
          }
          if (rows.length > 0) importRows(rows)
          excelDialogProgressRef.value = 100

          setTimeout(() => {
            DataChanged()
            showInfo(i18n.t('DataTable.ExcelImport.Loaded'))
          }, 500)
        } catch (err) {
          console.error('Error opening file', err)
          showError(err.message)
        }

        excelDialogRef.value = false
      }
      reader.readAsBinaryString(file)
      fileUploadRef.value.value = ''
    }
    function convertValueIfNecessary (attr, cellVal) {
      const attrNode = findByIdentifier(attr)
      return attrNode && attrNode.item.type === AttributeType.Text ? '' + cellVal : cellVal
    }
    function importRows (rows) {
      importItems(rows).then(returnRows => {
        let errors = ''
        returnRows.forEach(row => {
          if (row.errors.length > 0) {
            errors += row.identifier + ': ' + row.errors[0].message
          }
        })
        if (errors.length > 0) {
          showError(errors)
          excelDialogRef.value = false
        }
      })
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
      const sortBy = optionsRef.value.sortBy && optionsRef.value.sortBy.length > 0 ? optionsRef.value.sortBy : ['id']
      const sortDesc = optionsRef.value.sortDesc && optionsRef.value.sortDesc.length > 0 ? optionsRef.value.sortDesc : [false]
      props.loadData({ page: 1, itemsPerPage: maxRows, sortBy: sortBy, sortDesc: sortDesc }).then(data => {
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
                const value = '' + getValueWithChannels(header, row, true)
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

        emit('dataLoaded', itemsRef.value, totalItemsRef.value)

        const ids = data.rows.map(elem => elem.id)
        loadThumbnails(ids).then(arr => { thumbnailsRef.value = arr })
      })
    }

    function getThumbnail (id) {
      return thumbnailsRef.value.find(elem => elem.itemId === ('' + id))
    }

    function getValue (item, header, skipLOV) {
      if (typeof header.value === 'object') {
        let val = getDeepValue(header.value.path, item)
        if (header.lov) {
          if (!skipLOV) {
            const lovValues = lovsMap[header.lov]
            if (lovValues) {
              if (typeof val === 'object' && val) { // multivalue lov
                return Object.values(val).reduce((accumulator, currentValue, currentIndex, array) => {
                  const tst = lovValues.find(elem => elem.id === currentValue)
                  if (tst) accumulator += tst.value[currentLanguage.value.identifier] || '[' + tst.value[defaultLanguageIdentifier.value] + ']'
                  else accumulator += currentValue

                  if (currentIndex !== array.length - 1) accumulator += ', '
                  return accumulator
                }, '')
              } else {
                const tst = lovValues.find(elem => elem.id === val)
                if (tst) val = tst.value[currentLanguage.value.identifier] || '[' + tst.value[defaultLanguageIdentifier.value] + ']'
                return val
              }
            } else {
              return val
            }
          } else {
            return typeof val === 'object' && val ? Object.values(val) : val
          }
        } else {
          return val
        }
      } else {
        return item[header.value]
      }
    }

    // https://medium.com/javascript-inside/safely-accessing-deeply-nested-values-in-javascript-99bf72a0855a
    const getDeepValue = (path, obj) => path.reduce((accumulator, currentValue) => (accumulator && accumulator[currentValue]) ? accumulator[currentValue] : null, obj)

    function savedOptionsVisible () {
      return savedColumnsOptionsRef.value && savedColumnsOptionsRef.value.length > 0
    }

    function loadColumns (force) {
      loadAllSavedColumns(force).then(() => {
        let arr = []
        if (savedColumnsRef.value[currentUserRef.value.login]) {
          arr.push({ header: currentUserRef.value.login + ':' })
          const tmp = savedColumnsRef.value[currentUserRef.value.login].map(col => { return { text: col.name[currentLanguage.value.identifier] || '[' + col.name[defaultLanguageIdentifier.value] + ']', value: col.id } })
          arr = arr.concat(tmp)
          arr.push({ divider: true })
        }

        for (const property in savedColumnsRef.value) {
          if (property !== currentUserRef.value.login) {
            const columns = savedColumnsRef.value[property]
            arr.push({ header: property + ':' })
            const tmp = columns.map(col => { return { text: col.name[currentLanguage.value.identifier] || '[' + col.name[defaultLanguageIdentifier.value] + ']', value: col.id } })
            arr = arr.concat(tmp)
            arr.push({ divider: true })
          }
        }

        savedColumnsOptionsRef.value = arr
      })
    }

    async function channelsSelected (arr) {
      chanSelectionDialogRef.value.closeDialog()
      if (arr.length === 0) return
      excelDialogTitleRef.value = i18n.t('DataTable.ExcelDialog.TitleExport')
      excelDialogRef.value = true
      const itemsPerPage = 1000
      let total = 0
      let page = 0
      excelDialogProgressRef.value = 0

      do {
        page++
        const data = await props.loadData({ page: page, itemsPerPage: itemsPerPage, sortBy: [], sortDesc: [] })
        total = data.count
        if (!excelDialogRef.value) return // exit if process was canceled
        data.rows.forEach(row => {
          submitItem(row.id, row.typeId, row.path, arr)
        })
        const tst = page * itemsPerPage * 100 / total
        excelDialogProgressRef.value = tst > 100 ? 100 : tst
      } while (page * itemsPerPage < total)
      excelDialogRef.value = false
      showInfo(i18n.t('Submitted'))
    }

    function openSearch () {
      const name = props.item.name[currentLanguage.value.identifier] || '[' + props.item.name.name[defaultLanguageIdentifier.value] + ']'
      const search = { user: '', filters: [{ type: 'attr', attr: '#level#', operation: 1, value: name, path: props.item.path }], whereClause: {}, extended: false }

      const type = findTypeByIdentifier(props.item.typeIdentifier).node
      const typesToExclude = []
      collectTypes(type, typesToExclude)
      typesToExclude.forEach(type => {
        search.filters.push({ type: 'attr', attr: 'typeIdentifier', operation: 2, value: type.identifier })
      })

      localStorage.setItem('search_to_open', JSON.stringify(search))
      window.open('/#/search', '_blank')
    }

    function collectTypes (type, array) {
      if (type.children && type.children.length > 0) {
        array.push(type)
        type.children.forEach(childType => {
          collectTypes(childType, array)
        })
      }
    }

    function selectAttrGroups () {
      let filter = null
      if (itemsRef.value && itemsRef.value.length > 0) {
        const first = itemsRef.value[0]
        const onlyAttributes = getAttributesForItem(first.typeId, first.path)
        filter = onlyAttributes.map(elem => elem.id)
      }
      attrSelectionDialogRef.value.showDialog(null, null, filter)
    }

    function attrGroupsSelected (groupIds, initiator) {
      attrSelectionDialogRef.value.closeDialog()

      let onlyAttributes = null
      if (itemsRef.value && itemsRef.value.length > 0) {
        const first = itemsRef.value[0]
        onlyAttributes = getAttributesForItem(first.typeId, first.path)
      }

      groupIds.forEach(groupId => {
        const group = onlyAttributes ? onlyAttributes.find(elem => elem.id === groupId) : groups.find(elem => elem.id === groupId)
        if (group && group.visible) {
          const attrs = onlyAttributes ? group.itemAttributes : group.attributes
          attrs.forEach(attr => {
            const nameText = attr.identifier + ': ' + (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']') + ' [' + (group.name[currentLanguage.value.identifier] || attr.group.name[defaultLanguageIdentifier.value]) + ']'
            const nameShort = (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']')
            if (attr.languageDependent) {
              for (let i = 0; i < languages.length; i++) {
                const lang = languages[i]
                const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
                const data = { identifier: 'attr_' + attr.identifier + '_' + lang.identifier, text: nameShort + langText, textLong: nameText + langText, textShort: nameShort + langText, align: 'start', sortable: true, filterable: false, value: { path: ['values', attr.identifier, lang.identifier] } }
                if (attr.lov) data.lov = attr.lov
                if (!headersRef.value.some(elem => elem.identifier === data.identifier)) headersRef.value.push(data)
              }
            } else {
              const data = { identifier: 'attr_' + attr.identifier, text: nameShort, textLong: nameText, textShort: nameShort, align: 'start', sortable: true, filterable: false, value: { path: ['values', attr.identifier] } }
              if (attr.lov) data.lov = attr.lov
              if (!headersRef.value.some(elem => elem.identifier === data.identifier)) headersRef.value.push(data)
            }
          })
        }
      })
      loadLOVs()
    }

    onMounted(() => {
      loadAllTypes()
      loadAllChannels().then(() => {
        hasChannelsRef.value = getAwailableChannels(true).length > 0
      })
      loadColumns(false)
      let tst = localStorage.getItem('item_headers')
      if (tst) {
        // check for old format of headers list
        let changed = false
        tst = JSON.parse(tst)
        tst = tst.map(header => {
          if (Array.isArray(header.value)) {
            changed = true
            const arr = header.value
            header.value = { path: arr }
          }
          if (header.identifier !== '#thumbnail#') header.sortable = true
          return header
        })
        if (changed) localStorage.setItem('item_headers', JSON.stringify(tst))

        headersRef.value = tst
      }
      loadLOVs()
      DataChanged()
    })

    return {
      columnsSelectionDialogRef,
      columnsSaveDialogRef,
      cellClicked,
      inplaceItem,
      inplaceHeader,
      inplaceAttribute,
      inplaceValue,
      inplaceBlur,
      inplaceLovSelection,
      inplaceMultivalue,
      dateMenu,
      timeMenu,
      timeMenuRef,
      time,
      AttributeType,
      loadColumns,
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
      damUrl: window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/',
      token: localStorage.getItem('token'),
      getThumbnail,
      exportData,
      exportExcel,
      importExcel,
      fileUploadRef,
      excelDialogRef,
      excelDialogProgressRef,
      excelDialogTitleRef,
      excelDialogClose,
      hasAccess,
      savedColumnsOptionsRef,
      savedColumnsSelectionRef,
      savedOptionsVisible,
      talendExportSelection: props.export,
      hasChannelsRef,
      chanSelectionDialogRef,
      channelsSelected,
      openSearch,
      attrSelectionDialogRef,
      attrGroupsSelected,
      selectAttrGroups,
      dateFormat,
      DATE_FORMAT: process.env.VUE_APP_DATE_FORMAT
    }
  }
}
</script>
