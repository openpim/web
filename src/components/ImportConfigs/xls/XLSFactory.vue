<template>
  <div>
    <v-file-input v-model="fileUploadRef" :label="$t('DataTable.ExcelImport.FileUpload')"></v-file-input>
    <v-select v-model="excelSelectedTabRef" @change="excelSelectedTabChanged" :items="excelAvailableTabsRef" :label="$t('Config.ImportConfigs.Available.Excel.Tabs')"></v-select>
    <v-row>
      <v-col cols="6">
        <v-text-field v-model="headersLineNum" @input="headersLineNumChanged" :disabled="noHeadersCheckBox" :rules="lineNumRules" label="Headers line number" type="number" :hint="headersHint" persistent-hint/>
      </v-col>
      <v-col cols="6">
        <v-checkbox v-model="noHeadersCheckBox" label="No headers"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" class="py-0">
        <v-text-field v-model="dataLineNum" @input="dataLineNumChanged" label="Data line number" type="number" :hint="dataHint" persistent-hint/>
      </v-col>
      <v-col cols="6" class="py-0">
        <v-text-field v-model="limitRef" label="Limit" type="number" hint="Maximum number of lines to upload. 0 - upload all lines" persistent-hint/>
      </v-col>
    </v-row>
    <v-simple-table dense class="py-4 my-6">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">{{$t('ImportConfig.OptionsTable.Attribute')}}</th>
            <th class="text-left">{{$t('ImportConfig.OptionsTable.Column')}}</th>
            <th class="text-left">{{$t('ImportConfig.OptionsTable.Expession')}}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(elem, j) in defaultMappingRef" :key="j">
            <td class="pa-1 pr-10" style="width:220px;">
              <v-autocomplete v-model="elem.attribute" :items="allAttributesRef" item-text="name" item-value="identifier" label="xxxx" clearable></v-autocomplete>
            </td>
            <td class="pa-1 pr-10" style="width:220px;">
              <!--input v-model="elem.column" :placeholder="$t('ImportConfig.OptionsTable.Column')" /-->
              <v-autocomplete v-model="elem.column" :items="selectedHeadersRef" item-text="name" item-value="name" :label="$t('MappingConfigComponent.Category')" clearable></v-autocomplete>
            </td>
            <td class="pa-1 pr-10" style="width:220px;">
              <v-text-field v-model="elem.expression" dense class="ml-3 mr-3" append-outer-icon="mdi-message-outline" @click:append-outer="showExpression(elem)" />
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
                <v-row>
                  <v-col cols="12">
                    <v-textarea :rows="15" v-model="exprAttrRef.expression"></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="exprDialogRef = false">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
  </div>
</template>
<script>

import { ref, watch, onMounted, computed } from '@vue/composition-api'
import * as attrStore from '@/store/attributes'
import i18n from '@/i18n'
import XLSX from 'xlsx'

export default {
  props: {
  },
  setup (props, { root }) {
    const fileUploadRef = ref(null)
    const excelAvailableTabsRef = ref([])
    const excelSelectedTabRef = ref(null)
    const empty = { id: -1, type: 1 }
    const selectedHeadersRef = ref(null)
    const selectedDataRef = ref(null)
    const headersLineNum = ref(1)
    const dataLineNum = ref(2)
    const excelSheetData = ref([])
    const noHeadersCheckBox = ref(false)
    const exprDialogRef = ref(false)
    const exprAttrRef = ref(null)
    const limitRef = ref(0)

    const {
      loadAllAttributes,
      groups
    } = attrStore.useStore()

    const extraAttributes = [
      {
        identifier: 'identifier',
        name: 'Идентификатор'
      },
      {
        identifier: 'type',
        name: 'Тип'
      },
      {
        identifier: 'parent',
        name: 'Родитель'
      }
    ]

    const defaultMappingRef = ref([
      {
        attribute: 'identifier',
        column: '',
        expression: ''
      },
      {
        attribute: 'type',
        column: '',
        expression: ''
      },
      {
        attribute: 'parent',
        column: '',
        expression: ''
      }
    ])

    const lineNumRules = [
      val => val >= 1 || 'Значение должно быть больше ли равно 1!',
      val => {
        const indx = excelAvailableTabsRef.value.indexOf(excelSelectedTabRef.value)
        const maxLength = excelSheetData.value[indx] ? excelSheetData.value[indx].length : 1
        if (val < maxLength + 1) {
          return true
        } else {
          return 'Значение не может быть больше количества строк во вкладке!'
        }
      }
    ]

    const headersHint = computed(() => {
      return selectedHeadersRef.value ? selectedHeadersRef.value.map(el => el.name).toString() + '' : ''
    })

    const dataHint = computed(() => {
      return selectedDataRef.value ? selectedDataRef.value.map(el => el.name).toString() + '' : ''
    })

    const allAttributesRef = ref([])
    onMounted(() => {
      loadAllAttributes().then(() => {
        const arr = []
        for (var i = 0; i < groups.length; i++) {
          const group = groups[i]
          for (var j = 0; j < group.attributes.length; j++) {
            const attr = group.attributes[j]
            attr.name = attr.identifier + ' (' + attr.name.ru + ')'
            arr.push(attr)
          }
        }
        allAttributesRef.value = extraAttributes.concat(arr)
      })
    })

    function showExpression (attr) {
      exprAttrRef.value = attr
      exprDialogRef.value = true
    }

    watch(fileUploadRef, async (selected, previous) => {
      if (selected == null) {
        fileUploadRef.value = empty
        return
      }
      await readFile()
    })

    /* watch(headersLineNum, async (selected, previous) => {
      const selected2 = selected !== '' ? selected : 1
      const tabIndex = excelAvailableTabsRef.value.indexOf(excelSelectedTabRef.value)
      selectedHeadersRef.value = excelSheetData.value[tabIndex] && excelSheetData.value[tabIndex].length ? excelSheetData.value[tabIndex][selected2 - 1].filter(el => el).map((el, ind) => ({ name: el, id: ind })) : []
    }) */

    function dataLineNumChanged (input) {
      const selected = input !== '' ? input : 1
      const tabIndex = excelAvailableTabsRef.value.indexOf(excelSelectedTabRef.value)
      selectedDataRef.value = excelSheetData.value[tabIndex] && excelSheetData.value[tabIndex].length ? excelSheetData.value[tabIndex][selected - 1].filter(el => el).map((el, ind) => ({ name: el, id: ind })) : []
    }

    function headersLineNumChanged (input) {
      const selected = input !== '' ? input : 1
      const tabIndex = excelAvailableTabsRef.value.indexOf(excelSelectedTabRef.value)
      selectedHeadersRef.value = excelSheetData.value[tabIndex] && excelSheetData.value[tabIndex].length ? excelSheetData.value[tabIndex][selected - 1].filter(el => el).map((el, ind) => ({ name: el, id: ind })) : []
    }

    function excelSelectedTabChanged (selected) {
      if (selected) {
        const tabIndex = excelAvailableTabsRef.value.indexOf(selected)
        selectedHeadersRef.value = excelSheetData.value[tabIndex] && excelSheetData.value[tabIndex].length ? excelSheetData.value[tabIndex][headersLineNum.value - 1].filter(el => el).map((el, ind) => ({ name: el, id: ind })) : []
        selectedDataRef.value = excelSheetData.value[tabIndex] && excelSheetData.value[tabIndex].length ? excelSheetData.value[tabIndex][dataLineNum.value - 1].filter(el => el).map((el, ind) => ({ name: el, id: ind })) : []
      }
    }

    /* watch(excelSelectedTabRef, (selected, previous) => {
      if (selected) {
        const tabIndex = excelAvailableTabsRef.value.indexOf(selected)
        selectedHeadersRef.value = excelSheetData.value[tabIndex] && excelSheetData.value[tabIndex].length ? excelSheetData.value[tabIndex][headersLineNum.value - 1].filter(el => el).map((el, ind) => ({ name: el, id: ind })) : []
      }
    }) */

    async function readFile () {
      return new Promise((resolve, reject) => {
        const file = fileUploadRef.value
        if (!file) reject(new Error('No file uploaded'))

        var reader = new FileReader()
        reader.onload = async function (evt) {
          const data = evt.target.result
          try {
            const wb = XLSX.read(data, { type: 'binary' })
            excelAvailableTabsRef.value = wb.SheetNames
            for (let i = 0; i < wb.SheetNames.length; i++) {
              const ws = wb.Sheets[wb.SheetNames[i]]
              if (!ws || !ws['!ref']) continue
              const options = { header: 1 }
              excelSheetData.value[i] = XLSX.utils.sheet_to_json(ws, options)
              resolve()
            }
          } catch (err) {
            console.error('Error opening file', err)
            reject(err)
          }
        }
        reader.readAsBinaryString(file)
      })
    }

    return {
      allAttributesRef,
      defaultMappingRef,
      fileUploadRef,
      excelAvailableTabsRef,
      excelSelectedTabRef,
      selectedHeadersRef,
      headersLineNum,
      i18n,
      lineNumRules,
      noHeadersCheckBox,
      dataLineNum,
      showExpression,
      exprDialogRef,
      exprAttrRef,
      headersHint,
      dataHint,
      headersLineNumChanged,
      excelSelectedTabChanged,
      selectedDataRef,
      dataLineNumChanged,
      limitRef
    }
  }
}
</script>
