<template>
  <div>
    <v-row v-if="(importConfig && importConfig.filedata && importConfig.filedata.info && !importConfig.filedata.info.fileName) || importConfig.internalId === 0">
      <v-col cols="10">
        <v-file-input v-model="fileUploadRef" @click:clear="resetFile" clearable @change="fileChanged" :label="$t('ImportConfig.SelectFile')" truncate-length="100"></v-file-input>
      </v-col>
      <v-col cols="2">
        <v-btn color="primary" class="mt-6" :disabled="!fileUploadRef" text @click="uploadTemplate">{{ $t('ImportConfig.UploadFile') }}</v-btn>
      </v-col>
    </v-row>
    <v-row v-if="importConfig && importConfig.filedata && importConfig.filedata.info && importConfig.filedata.info.fileName && importConfig.internalId !== 0" class="mt-1 mb-0">
      <v-col>
        <a :href="damUrl + 'import-config-template/' + importConfig.id + '?token=' + token">{{ importConfig.filedata.info.fileName ? importConfig.filedata.info.fileName : 'file.xls' }}</a>
        <v-btn class="ml-3" color="primary" text @click="selectAnotherFile">{{ $t('ImportConfig.SelectAnotherFile') }}</v-btn>
      </v-col>
    </v-row>
    <v-row v-if="importConfig && importConfig.filedata && importConfig.filedata.info && importConfig.filedata.info.fileName" class="mt-2">
      <v-col cols="10">
        <v-autocomplete v-model="selectedSheetIdRef" :items="sheetOptions" item-text="text" item-value="value" :label="$t('ImportConfig.AvailableTabs')" clearable></v-autocomplete>
      </v-col>
      <v-col cols="2" class="text-right">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" class="pa-0 mr-2" icon color="primary" @click="addSheetMapping"><v-icon dark>mdi-plus</v-icon></v-btn>
          </template>
          <span>{{ $t('Add') }}</span>
        </v-tooltip>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" class="pa-0" icon @click="removeSelectedSheetMapping" :disabled="!selectedSheetRef"><v-icon dark>mdi-delete-outline</v-icon></v-btn>
          </template>
          <span>{{ $t('Remove') }}</span>
        </v-tooltip>
      </v-col>
    </v-row>
    <template v-if="selectedSheetRef">
      <v-row>
        <v-col cols="12">
          <v-select v-model="selectedSheetRef.selectedTab" @change="selectedTabChanged(selectedSheetRef)" :items="availableTabs" :label="$t('ImportConfig.SelectedTab')"></v-select>
        </v-col>
      </v-row>
      <v-row v-if="selectedSheetRef.selectedTab">
        <v-col cols="6">
          <v-text-field v-model="selectedSheetRef.headerLineNumber" @input="headersLineNumChanged(selectedSheetRef)" :disabled="selectedSheetRef.noHeadersChecked" :rules="headersNumRules(selectedSheetRef)" :label="$t('ImportConfig.HeadersLineNumber')" type="number" :hint="headersHint(selectedSheetRef)" persistent-hint />
        </v-col>
        <v-col cols="6">
          <v-checkbox v-model="selectedSheetRef.noHeadersChecked" @change="noHeadersChanged(selectedSheetRef)" :label="$t('ImportConfig.NoHeader')" />
        </v-col>
      </v-row>
      <v-row v-if="selectedSheetRef.selectedTab">
        <v-col cols="6" class="py-0">
          <v-text-field v-model="selectedSheetRef.dataLineNumber" @input="dataLineNumChanged(selectedSheetRef)" :rules="dataNumRules" :label="$t('ImportConfig.DataLineNumber')" type="number" :hint="dataHint(selectedSheetRef)" persistent-hint />
        </v-col>
        <v-col cols="6" class="py-0">
          <v-text-field v-model="selectedSheetRef.limit" @input="limitChanged(selectedSheetRef)" :rules="limitRules" :label="$t('ImportConfig.Limit')" type="number" :hint="$t('ImportConfig.LimitHint')" persistent-hint />
        </v-col>
      </v-row>
      <v-simple-table dense class="py-4 my-6" v-if="selectedSheetRef.selectedTab">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left grey lighten-3 py-4">{{ $t('ImportConfig.OptionsTable.Attribute') }}</th>
              <th class="text-left grey lighten-3 py-4">{{ $t('ImportConfig.OptionsTable.Column') }}
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" color="primary" class="pa-0 mx-6" icon @click="showUnmappedColumns(selectedSheetRef)"><v-icon dark>mdi-format-list-bulleted</v-icon></v-btn>
                  </template>
                  <span>{{ $t('ImportConfig.ShowUnmappedColumns') }}</span>
                </v-tooltip>
              </th>
              <th class="text-left grey lighten-3 py-4">
                {{ $t('ImportConfig.OptionsTable.Expression') }}
                <v-tooltip bottom>
                  <template #activator="{ on: onTooltip }">
                    <v-btn v-on="{ ...onTooltip }" icon><v-icon>mdi-help-circle-outline</v-icon></v-btn>
                  </template>
                  <span>{{ $t('ImportConfig.ExpessionsHelpText') }}</span>
                </v-tooltip>
              </th>
              <th class="text-left grey lighten-3 py-4 px-0" style="width: 50px;">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" class="pa-0" icon color="primary" @click="addRow(selectedSheetRef)"><v-icon dark>mdi-plus</v-icon></v-btn>
                  </template>
                  <span>{{ $t('Add') }}</span>
                </v-tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(elem, j) in selectedSheetRef.mappings" :key="j">
              <td class="pa-1 pr-10">
                <v-autocomplete v-model="elem.attribute" @change="updateMappings" @click:clear="updateMappings" :items="getFilteredAttributes(selectedSheetRef, elem)" item-text="name" item-value="identifier" :label="$t('ImportConfig.MappingsTable.SelectAttribute')" clearable></v-autocomplete>
              </td>
              <td class="pa-1 pr-10">
                <v-autocomplete v-model="elem.column" @change="updateMappings" @click:clear="updateMappings" :items="selectedSheetRef.selectedHeaders" item-text="name" item-value="name" :label="$t('ImportConfig.MappingsTable.SelectColumn')" clearable></v-autocomplete>
              </td>
              <td class="pa-1 pr-10">
                <v-text-field v-model="elem.expression" @input="updateMappings" dense class="ml-3 mr-3" append-outer-icon="mdi-message-outline" @click:append-outer="showExpression(elem)" />
              </td>
              <td class="pa-0">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" class="pa-0" icon @click="deleteRow(selectedSheetRef, j)"><v-icon dark>mdi-delete-outline</v-icon></v-btn>
                  </template>
                  <span>{{ $t('Remove') }}</span>
                </v-tooltip>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </template>
    <template>
      <v-row justify="center" v-if="exprAttrRef">
        <v-dialog v-model="exprDialogRef" persistent max-width="90%">
          <v-card>
            <v-card-text>
              <v-container>
                <v-alert border="bottom" colored-border type="info" elevation="2" class="mt-6">{{ $t('ImportConfig.ExpessionsHelpText') }}</v-alert>
                <v-row>
                  <v-col cols="12">
                    <v-textarea :rows="15" v-model="exprAttrRef.expression"></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeExpressionDialog">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
    <template>
      <v-dialog v-model="unmappedColumnsDialogRef" persistent max-width="40%">
        <v-card>
          <v-card-title>{{ $t('ImportConfig.UnmappedColumns') }}</v-card-title>
          <v-card-text>
            <v-container>
              <v-list dense class="pt-0 pb-0">
                <v-list-item v-for="(item, i) in unmappedColumnsRef" :key="i" dense class="pt-0 pb-0">
                  <v-list-item-content class="pt-0 pb-0" style="display: inline">{{ item.name }}</v-list-item-content>
                </v-list-item>
              </v-list>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="unmappedColumnsDialogRef = false">{{ $t('Close') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
    <template>
      <v-dialog v-model="alertMaxSizeExceededRef" max-width="400">
        <div>
          <v-card>
            <v-toolbar dark color="primary">
              <v-toolbar-title>{{ $t("ImportConfig.Error.title") }}</v-toolbar-title>
            </v-toolbar>
            <v-card-text>{{ $t("ImportConfig.MaxFileSizeNotification") }}</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="alertMaxSizeExceededRef = false">{{ $t("Close") }}</v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-dialog>
    </template>
    <template>
      <v-dialog v-model="alertFileExtensionIncorrectRef" max-width="400">
        <div>
          <v-card>
            <v-toolbar dark color="primary">
              <v-toolbar-title>{{ $t("ImportConfig.Error.title") }}</v-toolbar-title>
            </v-toolbar>
            <v-card-text>{{ $t("ImportConfig.ExcelExtensionNotification") }}</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="alertFileExtensionIncorrectRef = false">{{ $t("Close") }}</v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-dialog>
    </template>
  </div>
</template>
<script>

import { ref, onMounted, computed, watch } from '@vue/composition-api'
import * as importConfigStore from '@/store/importConfigs'
import * as attrStore from '@/store/attributes'
import * as langStore from '@/store/languages'
// import eventBus from '@/eventBus'
import i18n from '@/i18n'

export default {
  props: {
    importConfig: {
      type: Object
    }
  },
  setup (props) {
    const fileUploadRef = ref(null)
    const sheetData = ref([])
    const exprDialogRef = ref(false)
    const exprAttrRef = ref(null)
    const unmappedColumnsDialogRef = ref(false)
    const unmappedColumnsRef = ref([])
    const sheetMappingsRef = ref([])
    const selectedSheetIdRef = ref(null)
    const isNew = ref(false)

    const alertFileExtensionIncorrectRef = ref(false)
    const alertMaxSizeExceededRef = ref(false)

    const {
      uploadImportConfigTemplate
    } = importConfigStore.useStore()

    const {
      loadAllAttributes,
      groups
    } = attrStore.useStore()

    const {
      languages,
      loadAllLanguages,
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const extraAttributes = [
      {
        identifier: 'identifier',
        name: i18n.t('ImportConfig.Attribute.identifier')
      },
      {
        identifier: 'typeIdentifier',
        name: i18n.t('ImportConfig.Attribute.typeIdentifier')
      },
      {
        identifier: 'parentIdentifier',
        name: i18n.t('ImportConfig.Attribute.parentIdentifier')
      }
    ]

    const defaultMapping = [
      {
        attribute: 'identifier',
        column: null,
        expression: null
      },
      {
        attribute: 'typeIdentifier',
        column: null,
        expression: null
      },
      {
        attribute: 'parentIdentifier',
        column: null,
        expression: null
      }
    ]

    function createDefaultMapping () {
      return defaultMapping.map((item) => ({ ...item }))
    }

    function createSheetMapping (config = {}) {
      return {
        id: Date.now() + Math.random(),
        selectedTab: config.selectedTab || null,
        noHeadersChecked: config.noHeadersChecked || false,
        headerLineNumber: config.headerLineNumber || 1,
        dataLineNumber: config.dataLineNumber || 2,
        limit: config.limit || 0,
        mappings: Array.isArray(config.mappings) && config.mappings.length ? config.mappings : createDefaultMapping(),
        selectedHeaders: [],
        selectedData: []
      }
    }

    function headersNumRules (sheet) {
      return [
        val => val >= 1 || i18n.t('ImportConfig.ValueMustBeGreaterOrEqual1'),
        val => {
          const maxLength = sheetData.value[sheet.selectedTab] ? sheetData.value[sheet.selectedTab].length : 1
          if (val < maxLength + 1) {
            return true
          } else {
            return i18n.t('ImportConfig.ValueCannotBeGreaterThanTotalAmount')
          }
        }
      ]
    }

    const dataNumRules = [
      val => val >= 1 || i18n.t('ImportConfig.ValueMustBeGreaterOrEqual1')
      /* val => {
        const maxLength = sheetData.value[selectedTabRef.value] ? sheetData.value[selectedTabRef.value].length : 1
        if (val < maxLength + 1) {
          return true
        } else {
          return i18n.t('ImportConfig.ValueCannotBeGreaterThanTotalAmount')
        }
      } */
    ]

    const limitRules = [
      val => val >= 0 || i18n.t('ImportConfig.ValueMustBeGreaterOrEqual0')
    ]

    watch(() => props.importConfig, async (newValue, previousValue) => {
      isNew.value = newValue.isNew ? newValue.isNew : false

      sheetData.value = newValue.filedata.data

      const legacyConfig = {
        selectedTab: newValue.config?.selectedTab || null,
        noHeadersChecked: newValue.config?.noHeadersChecked || false,
        headerLineNumber: newValue.config?.headerLineNumber || 1,
        dataLineNumber: newValue.config?.dataLineNumber || 2,
        limit: newValue.config?.limit || 0,
        mappings: Array.isArray(newValue.mappings) && newValue.mappings.length ? newValue.mappings : createDefaultMapping()
      }

      if (newValue.config && Array.isArray(newValue.config.sheets) && newValue.config.sheets.length) {
        sheetMappingsRef.value = newValue.config.sheets.map((sheet, index) => {
          const mappings = Array.isArray(sheet.mappings) && sheet.mappings.length
            ? sheet.mappings
            : (index === 0 ? legacyConfig.mappings : createDefaultMapping())
          return createSheetMapping({ ...sheet, mappings })
        })
      } else {
        sheetMappingsRef.value = [createSheetMapping(legacyConfig)]
      }

      sheetMappingsRef.value.forEach((sheet) => {
        selectedTabChanged(sheet)
      })

      selectedSheetIdRef.value = sheetMappingsRef.value[0] ? sheetMappingsRef.value[0].id : null
      syncImportConfig()
    })

    const getFilteredAttributes = (sheet, fieldMapping) => {
      const res = []
      const name = allAttributesRef.value.find(el => el.identifier === fieldMapping.attribute) ? allAttributesRef.value.find(el => el.identifier === fieldMapping.attribute).name : null
      if (fieldMapping && fieldMapping.attribute && name) {
        const currentObj = {
          identifier: fieldMapping.attribute,
          name: allAttributesRef.value.find(el => el.identifier === fieldMapping.attribute).name
        }
        res.push(currentObj)
      }
      allAttributesRef.value.forEach((el) => {
        if (!sheet.mappings.some(mapping => mapping.attribute === el.identifier)) {
          res.push(el)
        }
      })
      return res
    }

    function headersHint (sheet) {
      return sheet.selectedHeaders ? sheet.selectedHeaders.map(el => el.name).toString() + '' : ''
    }

    function dataHint (sheet) {
      return sheet.selectedData ? sheet.selectedData.map(el => el.name).toString() + '' : ''
    }

    const availableTabs = computed(() => {
      return Object.keys(sheetData.value)
    })

    const sheetOptions = computed(() => {
      return sheetMappingsRef.value.map((sheet, index) => {
        return {
          value: sheet.id,
          text: sheet.selectedTab ? sheet.selectedTab : i18n.t('ImportConfig.SelectedTab') + ' ' + (index + 1)
        }
      })
    })

    const selectedSheetRef = computed(() => {
      return sheetMappingsRef.value.find(sheet => sheet.id === selectedSheetIdRef.value) || null
    })

    const allAttributesRef = ref([])
    onMounted(async () => {
      await loadAllAttributes()
      await loadAllLanguages()
      const arr = []
      for (var i = 0; i < groups.length; i++) {
        const group = groups[i]
        for (var j = 0; j < group.attributes.length; j++) {
          const attr = group.attributes[j]
          attr.name = attr.identifier + ' (' + (attr.name[currentLanguage.value.identifier] || attr.name[defaultLanguageIdentifier.value]) + ')'
          arr.push(attr)
        }
      }
      for (let i = 0; i < languages.length; i++) {
        const lang = languages[i]
        const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
        extraAttributes.push({ identifier: '$name#' + lang.identifier, name: 'Наименование объекта' + langText })
      }
      allAttributesRef.value = extraAttributes.concat(arr)
    })

    async function uploadTemplate () {
      const resp = await uploadImportConfigTemplate(fileUploadRef.value)
      sheetData.value = resp.data
      props.importConfig.filedata = resp
      // eventBus.emit('file_updated', resp)
    }

    function selectAnotherFile () {
      if (props.importConfig.filedata && props.importConfig.filedata.info) {
        props.importConfig.filedata.info.fileName = null
      }
      resetFile()
    }

    function resetFile () {
      sheetData.value = []
      sheetMappingsRef.value = [createSheetMapping()]
      syncImportConfig()
    }

    function showExpression (attr) {
      exprAttrRef.value = attr
      exprDialogRef.value = true
    }

    async function fileChanged (selected) {
      if (selected == null) {
        fileUploadRef.value = null
        return
      }

      if (selected) {
        const extension = selected.name.split('.').pop().toUpperCase()
        if (!(extension === 'XLS' || extension === 'XLSX' || extension === 'XLSM')) {
          alertFileExtensionIncorrectRef.value = true
          fileUploadRef.value = null
          return
        }
        const size = selected.size
        if (size > 1000000) {
          alertMaxSizeExceededRef.value = true
          fileUploadRef.value = null
          return
        }
      }

      resetFile()
    }

    function updateHeadersAndData (sheet) {
      if (!sheet.selectedTab) {
        sheet.selectedHeaders = []
        sheet.selectedData = []
        return
      }

      if (!sheet.noHeadersChecked) {
        sheet.selectedHeaders = sheetData.value[sheet.selectedTab] && sheetData.value[sheet.selectedTab].length && sheetData.value[sheet.selectedTab][sheet.headerLineNumber - 1]
          ? sheetData.value[sheet.selectedTab][sheet.headerLineNumber - 1].filter(el => el).map((el, ind) => ({ name: el, id: ind }))
          : []
      } else {
        sheet.selectedHeaders = sheetData.value[sheet.selectedTab] && sheetData.value[sheet.selectedTab].length && sheetData.value[sheet.selectedTab][0]
          ? sheetData.value[sheet.selectedTab][0].filter(el => el).map((el, ind) => ({ name: 'Column ' + (ind + 1), id: ind }))
          : []
      }

      sheet.selectedData = sheetData.value[sheet.selectedTab] && sheetData.value[sheet.selectedTab].length && sheetData.value[sheet.selectedTab][sheet.dataLineNumber - 1]
        ? sheetData.value[sheet.selectedTab][sheet.dataLineNumber - 1].filter(el => el).map((el, ind) => ({ name: el, id: ind }))
        : []
    }

    function noHeadersChanged (sheet) {
      updateHeadersAndData(sheet)
      sheet.mappings = sheet.mappings.map(el => ({ attribute: el.attribute, column: null, expression: el.expression }))
      syncImportConfig()
    }

    function dataLineNumChanged (sheet) {
      updateHeadersAndData(sheet)
      syncImportConfig()
    }

    function headersLineNumChanged (sheet) {
      updateHeadersAndData(sheet)
      syncImportConfig()
    }

    function limitChanged (sheet) {
      syncImportConfig()
    }

    function selectedTabChanged (sheet) {
      updateHeadersAndData(sheet)
      syncImportConfig()
    }

    function getConfigObject () {
      const baseConfig = props.importConfig.config || {}
      const firstSheet = sheetMappingsRef.value[0] || createSheetMapping()
      return {
        selectedTab: firstSheet.selectedTab,
        noHeadersChecked: firstSheet.noHeadersChecked,
        headerLineNumber: firstSheet.headerLineNumber,
        dataLineNumber: firstSheet.dataLineNumber,
        limit: firstSheet.limit,
        beforeStartAction: baseConfig.beforeStartAction,
        beforeEachRow: baseConfig.beforeEachRow,
        afterEachRow: baseConfig.afterEachRow,
        afterEndAction: baseConfig.afterEndAction,
        sheets: sheetMappingsRef.value.map(sheet => ({
          selectedTab: sheet.selectedTab,
          noHeadersChecked: sheet.noHeadersChecked,
          headerLineNumber: sheet.headerLineNumber,
          dataLineNumber: sheet.dataLineNumber,
          limit: sheet.limit,
          mappings: sheet.mappings
        }))
      }
    }

    function addRow (sheet) {
      sheet.mappings.push({
        attribute: null,
        column: null,
        expression: null
      })
      syncImportConfig()
    }

    function deleteRow (sheet, indx) {
      if (confirm(i18n.t('ImportConfig.AreYouSure'))) {
        sheet.mappings.splice(indx, 1)
        syncImportConfig()
      }
    }

    function showUnmappedColumns (sheet) {
      const res = []
      sheet.selectedHeaders.forEach((el) => {
        if (!sheet.mappings.some(mapping => mapping.column === el.name)) {
          res.push(el)
        }
      })
      unmappedColumnsRef.value = res
      unmappedColumnsDialogRef.value = true
    }

    function closeExpressionDialog () {
      exprDialogRef.value = false
      updateMappings()
    }

    function updateMappings () {
      // eventBus.emit('mappings_updated', mappingRef.value)
      syncImportConfig()
    }

    function addSheetMapping () {
      const sheet = createSheetMapping()
      sheetMappingsRef.value.push(sheet)
      selectedSheetIdRef.value = sheet.id
      syncImportConfig()
    }

    function removeSelectedSheetMapping () {
      const index = sheetMappingsRef.value.findIndex(sheet => sheet.id === selectedSheetIdRef.value)
      if (index === -1) {
        return
      }
      if (sheetMappingsRef.value.length === 1) {
        const replacement = createSheetMapping()
        sheetMappingsRef.value.splice(0, 1, replacement)
        selectedSheetIdRef.value = replacement.id
      } else if (confirm(i18n.t('ImportConfig.AreYouSure'))) {
        sheetMappingsRef.value.splice(index, 1)
        selectedSheetIdRef.value = sheetMappingsRef.value[0] ? sheetMappingsRef.value[0].id : null
      }
      syncImportConfig()
    }

    function syncImportConfig () {
      props.importConfig.config = getConfigObject()
      props.importConfig.mappings = sheetMappingsRef.value[0] ? sheetMappingsRef.value[0].mappings : createDefaultMapping()
    }

    return {
      allAttributesRef,
      sheetMappingsRef,
      selectedSheetIdRef,
      selectedSheetRef,
      sheetOptions,
      fileUploadRef,
      i18n,
      headersNumRules,
      dataNumRules,
      limitRules,
      showExpression,
      exprDialogRef,
      exprAttrRef,
      headersHint,
      dataHint,
      headersLineNumChanged,
      selectedTabChanged,
      dataLineNumChanged,
      fileChanged,
      noHeadersChanged,
      addRow,
      deleteRow,
      showUnmappedColumns,
      unmappedColumnsDialogRef,
      unmappedColumnsRef,
      resetFile,
      getFilteredAttributes,
      limitChanged,
      updateMappings,
      closeExpressionDialog,
      uploadTemplate,
      addSheetMapping,
      removeSelectedSheetMapping,
      selectAnotherFile,
      availableTabs,
      damUrl: window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/',
      token: localStorage.getItem('token'),
      isNew,
      alertFileExtensionIncorrectRef,
      alertMaxSizeExceededRef
    }
  }
}
</script>
