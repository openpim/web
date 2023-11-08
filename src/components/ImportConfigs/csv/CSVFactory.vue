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
        <v-btn class="ml-3" color="primary" text @click="importConfig.filedata.info.fileName = null; selectedTabRef = null">{{ $t('ImportConfig.SelectAnotherFile') }}</v-btn>
      </v-col>
    </v-row>
    <v-row v-if="selectedTabRef" class="mt-0 pt-0">
      <v-col cols="6">
        <v-text-field v-model="headersLineNum" @input="headersLineNumChanged" :disabled="noHeadersRef" :rules="headersNumRules" :label="$t('ImportConfig.HeadersLineNumber')" type="number" :hint="headersHint" persistent-hint/>
      </v-col>
      <v-col cols="6">
        <v-checkbox v-model="noHeadersRef" @change="noHeadersChanged" :label="$t('ImportConfig.NoHeader')"/>
      </v-col>
    </v-row>
    <v-row v-if="selectedTabRef">
      <v-col cols="6" class="py-0">
        <v-text-field v-model="dataLineNum" @input="dataLineNumChanged" :rules="dataNumRules" :label="$t('ImportConfig.DataLineNumber')" type="number" :hint="dataHint" persistent-hint/>
      </v-col>
      <v-col cols="6" class="py-0">
        <v-text-field v-model="limitRef" @input="limitChanged" :rules="limitRules" :label="$t('ImportConfig.Limit')" type="number" :hint="$t('ImportConfig.LimitHint')" persistent-hint/>
      </v-col>
    </v-row>
    <v-simple-table dense class="py-4 my-6" v-if="selectedTabRef">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left grey lighten-3 py-4">{{$t('ImportConfig.OptionsTable.Attribute')}}</th>
            <th class="text-left grey lighten-3 py-4">{{$t('ImportConfig.OptionsTable.Column')}}
                <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" color="primary" class="pa-0 mx-6" icon @click="showUnmappedColumns"><v-icon dark>mdi-format-list-bulleted</v-icon></v-btn>
                    </template>
                    <span>{{ $t('ImportConfig.ShowUnmappedColumns') }}</span>
                </v-tooltip>
            </th>
            <th class="text-left grey lighten-3 py-4">
              {{$t('ImportConfig.OptionsTable.Expression')}}
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
                    <v-btn v-on="on" class="pa-0" icon color="primary" @click="addRow"><v-icon dark>mdi-plus</v-icon></v-btn>
                  </template>
                  <span>{{ $t('Add') }}</span>
              </v-tooltip>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(elem, j) in mappingRef" :key="j">
            <td class="pa-1 pr-10">
              <v-autocomplete v-model="elem.attribute" @change="updateMappings" @click:clear="updateMappings" :items="getFilteredAttributes(elem)" item-text="name" item-value="identifier" :label="$t('ImportConfig.MappingsTable.SelectAttribute')" clearable></v-autocomplete>
            </td>
            <td class="pa-1 pr-10">
              <v-autocomplete v-model="elem.column" @change="updateMappings" @click:clear="updateMappings" :items="selectedHeadersRef" item-text="name" item-value="name" :label="$t('ImportConfig.MappingsTable.SelectColumn')" clearable></v-autocomplete>
            </td>
            <td class="pa-1 pr-10">
              <v-text-field v-model="elem.expression" @input="updateMappings" dense class="ml-3 mr-3" append-outer-icon="mdi-message-outline" @click:append-outer="showExpression(elem)" />
            </td>
            <td class="pa-0">
              <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" class="pa-0" icon @click="deleteRow(j)"><v-icon dark>mdi-delete-outline</v-icon></v-btn>
                  </template>
                  <span>{{ $t('Remove') }}</span>
              </v-tooltip>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
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
            <v-card-title>{{$t('ImportConfig.UnmappedColumns')}}</v-card-title>
            <v-card-text>
              <v-container>
                <v-list dense class="pt-0 pb-0">
                  <v-list-item v-for="(item, i) in unmappedColumns" :key="i" dense class="pt-0 pb-0">
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
            <v-card-text>{{ $t("ImportConfig.CSVExtensionNotification") }}</v-card-text>
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
  setup (props, { root }) {
    const fileUploadRef = ref(null)
    const selectedTabRef = ref(null)
    const selectedHeadersRef = ref([])
    const selectedDataRef = ref(null)
    const headersLineNum = ref(1)
    const dataLineNum = ref(2)
    const sheetData = ref([])
    const noHeadersRef = ref(false)
    const exprDialogRef = ref(false)
    const exprAttrRef = ref(null)
    const limitRef = ref(0)
    const unmappedColumnsDialogRef = ref(false)
    const info = ref(null)
    const mappingRef = ref([])
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

    const headersNumRules = [
      val => val >= 1 || i18n.t('ImportConfig.ValueMustBeGreaterOrEqual1'),
      val => {
        const maxLength = sheetData.value[selectedTabRef.value] ? sheetData.value[selectedTabRef.value].length : 1
        if (val < maxLength + 1) {
          return true
        } else {
          return i18n.t('ImportConfig.ValueCannotBeGreaterThanTotalAmount')
        }
      }
    ]

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
      info.value = newValue.filedata.info
      sheetData.value = newValue.filedata.data
      selectedTabRef.value = newValue.config.selectedTab
      noHeadersRef.value = newValue.config.noHeadersChecked
      headersLineNum.value = newValue.config.headerLineNumber
      dataLineNum.value = newValue.config.dataLineNumber
      limitRef.value = newValue.config.limit
      mappingRef.value = newValue.mappings
      selectedTabChanged(selectedTabRef.value)
    })

    const getFilteredAttributes = (fieldMapping) => {
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
        if (!mappingRef.value.some(mapping => mapping.attribute === el.identifier)) {
          res.push(el)
        }
      })
      return res
    }

    const headersHint = computed(() => {
      return selectedHeadersRef.value ? selectedHeadersRef.value.map(el => el.name).toString() + '' : ''
    })

    const dataHint = computed(() => {
      return selectedDataRef.value ? selectedDataRef.value.map(el => el.name).toString() + '' : ''
    })

    const unmappedColumns = computed(() => {
      const res = []
      selectedHeadersRef.value.forEach((el) => {
        if (!mappingRef.value.some(mapping => mapping.column === el.name)) {
          res.push(el)
        }
      })
      return res
    })

    const availableTabs = computed(() => {
      return Object.keys(sheetData.value)
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
      info.value = resp.info
      sheetData.value = resp.data
      selectedTabRef.value = 'Sheet1'
      selectedTabChanged(selectedTabRef.value)
      props.importConfig.filedata = resp
      // eventBus.emit('file_updated', resp)
    }

    function resetFile () {
      selectedTabRef.value = null
      limitRef.value = 0
      headersLineNum.value = 1
      dataLineNum.value = 2
      noHeadersRef.value = false
      selectedHeadersRef.value = []
      sheetData.value = []
      mappingRef.value = [...defaultMapping]
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
        if (!(extension === 'CSV')) {
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

    function noHeadersChanged (selected) {
      if (!selected) {
        selectedHeadersRef.value = sheetData.value[selectedTabRef.value] && sheetData.value[selectedTabRef.value].length && sheetData.value[selectedTabRef.value][headersLineNum.value - 1] ? sheetData.value[selectedTabRef.value][headersLineNum.value - 1].filter(el => el).map((el, ind) => ({ name: el, id: ind })) : []
      } else {
        selectedHeadersRef.value = sheetData.value[selectedTabRef.value] && sheetData.value[selectedTabRef.value].length && sheetData.value[selectedTabRef.value][0] ? sheetData.value[selectedTabRef.value][0].filter(el => el).map((el, ind) => ({ name: 'Column ' + (ind + 1), id: ind })) : []
      }
      mappingRef.value = mappingRef.value.map(el => ({ attribute: el.attribute, mapping: null, expression: el.expression }))
      // eventBus.emit('config_updated', getConfigObject())
      props.importConfig.config = getConfigObject()
      updateMappings()
    }

    function dataLineNumChanged (input) {
      const selected = input !== '' ? input : 1
      selectedDataRef.value = sheetData.value[selectedTabRef.value] && sheetData.value[selectedTabRef.value].length && sheetData.value[selectedTabRef.value][selected - 1] ? sheetData.value[selectedTabRef.value][selected - 1].filter(el => el).map((el, ind) => ({ name: el, id: ind })) : []
      props.importConfig.config = getConfigObject()
      // eventBus.emit('config_updated', getConfigObject())
    }

    function headersLineNumChanged (input) {
      const selected = input !== '' ? input : 1
      selectedHeadersRef.value = sheetData.value[selectedTabRef.value] && sheetData.value[selectedTabRef.value].length && sheetData.value[selectedTabRef.value][selected - 1] ? sheetData.value[selectedTabRef.value][selected - 1].filter(el => el).map((el, ind) => ({ name: el, id: ind })) : []
      // eventBus.emit('config_updated', getConfigObject())
      props.importConfig.config = getConfigObject()
    }

    function limitChanged (input) {
      props.importConfig.config = getConfigObject()
      // eventBus.emit('config_updated', getConfigObject())
    }

    function selectedTabChanged (selected) {
      if (selected) {
        if (!noHeadersRef.value) {
          selectedHeadersRef.value = sheetData.value[selectedTabRef.value] && sheetData.value[selectedTabRef.value].length && sheetData.value[selectedTabRef.value][headersLineNum.value - 1] ? sheetData.value[selectedTabRef.value][headersLineNum.value - 1].filter(el => el).map((el, ind) => ({ name: el, id: ind })) : []
        } else {
          selectedHeadersRef.value = sheetData.value[selectedTabRef.value] && sheetData.value[selectedTabRef.value].length && sheetData.value[selectedTabRef.value][0] ? sheetData.value[selectedTabRef.value][0].filter(el => el).map((el, ind) => ({ name: 'Column ' + (ind + 1), id: ind })) : []
        }
        selectedDataRef.value = sheetData.value[selectedTabRef.value] && sheetData.value[selectedTabRef.value].length && sheetData.value[selectedTabRef.value][dataLineNum.value - 1] ? sheetData.value[selectedTabRef.value][dataLineNum.value - 1].filter(el => el).map((el, ind) => ({ name: el, id: ind })) : []
      }
      // eventBus.emit('config_updated', getConfigObject())
      props.importConfig.config = getConfigObject()
      updateMappings()
    }

    function getConfigObject () {
      return {
        selectedTab: selectedTabRef.value,
        noHeadersChecked: noHeadersRef.value,
        headerLineNumber: headersLineNum.value,
        dataLineNumber: dataLineNum.value,
        limit: limitRef.value,
        beforeStartAction: props.importConfig.config.beforeStartAction,
        beforeEachRow: props.importConfig.config.beforeEachRow,
        afterEndAction: props.importConfig.config.afterEndAction
      }
    }

    function addRow () {
      mappingRef.value.push({
        attribute: null,
        column: null,
        expression: null
      })
    }

    function deleteRow (indx) {
      if (confirm(i18n.t('ImportConfig.AreYouSure'))) {
        mappingRef.value.splice(indx, 1)
      }
    }

    function showUnmappedColumns () {
      unmappedColumnsDialogRef.value = true
    }

    function closeExpressionDialog () {
      exprDialogRef.value = false
      updateMappings()
    }

    function updateMappings () {
      // eventBus.emit('mappings_updated', mappingRef.value)
      props.importConfig.mappings = mappingRef.value
    }

    return {
      allAttributesRef,
      mappingRef,
      fileUploadRef,
      selectedTabRef,
      selectedHeadersRef,
      headersLineNum,
      i18n,
      headersNumRules,
      dataNumRules,
      limitRules,
      noHeadersRef,
      dataLineNum,
      showExpression,
      exprDialogRef,
      exprAttrRef,
      headersHint,
      dataHint,
      headersLineNumChanged,
      selectedTabChanged,
      selectedDataRef,
      dataLineNumChanged,
      limitRef,
      fileChanged,
      noHeadersChanged,
      addRow,
      deleteRow,
      showUnmappedColumns,
      unmappedColumnsDialogRef,
      unmappedColumns,
      resetFile,
      getFilteredAttributes,
      limitChanged,
      updateMappings,
      closeExpressionDialog,
      uploadTemplate,
      availableTabs,
      damUrl: window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/',
      info,
      token: localStorage.getItem('token'),
      isNew,
      alertFileExtensionIncorrectRef,
      alertMaxSizeExceededRef
    }
  }
}
</script>
