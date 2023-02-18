<template>
  <div>
    <v-file-input v-model="fileUploadRef" :label="$t('DataTable.ExcelImport.FileUpload')"></v-file-input>
    <v-select v-model="excelSelectedTabRef" :items="excelAvailableTabsRef" :label="$t('Config.ImportConfigs.Available.Excel.Tabs')"></v-select>
    <v-simple-table dense class="mb-4">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">{{$t('ImportConfig.OptionsTable.Column')}}</th>
            <th class="text-left">{{$t('ImportConfig.OptionsTable.Attribute')}}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(elem, j) in selectedMappingRef" :key="j">
            <td class="pa-1 pr-10" style="width:220px;">
              <input v-model="elem.name" :placeholder="$t('ImportConfig.OptionsTable.Column')" />
            </td>
            <td class="pa-1 pr-10" style="width:220px;">
              <input v-model="elem.targetName" :placeholder="$t('ImportConfig.OptionsTable.Attribute')" />
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <excelTabSelectionDialog :tabs="excelAvailableTabsRef" ref="excelTabSelectionDialogRef" @selected="tabSelected"/>
  </div>
</template>
<script>

import { ref, watch } from '@vue/composition-api'
import i18n from '@/i18n'
import XLSX from 'xlsx'
import ExcelTabSelectionDialog from '@/components/ImportConfigs/ExcelTabSelectionDialog.vue'

export default {
  components: { ExcelTabSelectionDialog },
  props: {
  },
  setup (props, { root }) {
    const fileUploadRef = ref(null)
    const excelAvailableTabsRef = ref([])
    const excelColumnsRef = ref([])
    const excelSelectedTabRef = ref(null)
    const excelTabSelectionDialogRef = ref(null)
    const empty = { id: -1, type: 1 }
    const selectedMappingRef = ref(null)

    watch(fileUploadRef, (selected, previous) => {
      if (selected == null) {
        fileUploadRef.value = empty
        return
      }
      importExcel()
    })

    watch(excelSelectedTabRef, (selected, previous) => {
      if (selected) {
        const indx = excelAvailableTabsRef.value.indexOf(selected)
        selectedMappingRef.value = excelColumnsRef.value[indx].map((el, ind) => ({ name: el, id: ind }))
      }
    })

    function tabSelected (selected) {
      alert(selected)
    }

    function importExcel (event) {
      const file = fileUploadRef.value
      if (!file) return

      var reader = new FileReader()

      reader.onload = async function (evt) {
        const data = evt.target.result
        try {
          const wb = XLSX.read(data, { type: 'binary' })

          excelAvailableTabsRef.value = wb.SheetNames

          // excelTabSelectionDialogRef.value.showDialog(excelSelectedTabRef.value)

          excelColumnsRef.value = []
          for (let i = 0; i < wb.SheetNames.length; i++) {
            const ws = wb.Sheets[wb.SheetNames[i]]
            if (!ws || !ws['!ref']) continue
            const range = XLSX.utils.decode_range(ws['!ref'])
            if (!range) continue
            const headers = []
            for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
              const cell = ws[XLSX.utils.encode_cell({ r: 0, c: colNum })]
              if (!cell) continue
              if ((!cell.c || cell.c.length === 0) && !cell.v === '#delete#') {
                alert(i18n.t('DataTable.ExcelImport.WrongFormat'))
                // showError(i18n.t('DataTable.ExcelImport.WrongFormat'))
                // excelDialogRef.value = false
                return
              } else {
                headers.push(cell.v)
              }
            }
            excelColumnsRef.value[i] = headers
          }
        } catch (err) {
          console.error('Error opening file', err)
          // showError(err.message)
        }
      }
      reader.readAsBinaryString(file)
      fileUploadRef.value.value = ''
    }

    return {
      fileUploadRef,
      excelAvailableTabsRef,
      excelColumnsRef,
      excelSelectedTabRef,
      excelTabSelectionDialogRef,
      selectedMappingRef,
      tabSelected
    }
  }
}
</script>
