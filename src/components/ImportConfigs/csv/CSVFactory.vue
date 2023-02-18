<template>
  <div>
    <v-file-input v-model="fileUploadRef" :label="$t('DataTable.ExcelImport.FileUpload')"></v-file-input>
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
              <td class="pa-1 pr-10" style="width:220px;">{{ elem.name }}</td>
              <td class="pa-1 pr-10" style="width:220px;">
                <input v-model="elem.targetName" @change="updateMappings" :placeholder="$t('ImportConfig.OptionsTable.Attribute')" />
                <!--v-autocomplete item-text="text" item-value='identifier' v-model="elem.targetName" :items="allAttributes" :label="$t('OptionsTable.TargetName')" clearable/-->
              </td>
            </tr>
          </tbody>
        </template>
    </v-simple-table>
  </div>
</template>
<script>

import { computed, onMounted, ref, watch } from '@vue/composition-api'
// import * as attrStore from '@/store/attributes'
import eventBus from '@/eventBus'

export default {
  props: {
    availableFields: {
      type: Array
    },
    mappings: {
      type: Array
    }
  },
  setup (props, { root, emit }) {
    const fileUploadRef = ref(null)
    const empty = { id: -1, type: 1 }
    const allAttributes = ref([])

    const selectedMappingRef = computed(() => {
      if (props.mappings) {
        return props.mappings.map((el, ind) => ({ name: el.name, id: ind, targetName: el.targetName }))
      }
      return []
    })

    /* const {
      loadAllAttributes,
      groups
    } = attrStore.useStore() */

    watch(fileUploadRef, (selected, previous) => {
      if (selected == null) {
        fileUploadRef.value = empty
        return
      }
      importCSV()
    })
    onMounted(() => {
      /* loadAllAttributes().then(() => {
        const arr = []
        for (var i = 0; i < groups.length; i++) {
          const group = groups[i]
          for (var j = 0; j < group.attributes.length; j++) {
            const attr = group.attributes[j]
            attr.text = attr.identifier + ' (' + attr.name.ru + ')'
            arr.push(attr)
          }
        }
        allAttributes.value = arr
      }) */
    })
    function updateMappings () {
      eventBus.emit('mappings_updated', selectedMappingRef.value.map(el => { return { name: el.name, targetName: el.targetName } }))
    }
    function importCSV (event) {
      const file = fileUploadRef.value
      if (!file) return
      var reader = new FileReader()
      reader.onloadend = async function (evt) {
        const data = evt.target.result
        try {
          // Grab our byte length
          const byteLength = data.byteLength
          // Convert to conventional array, so we can iterate though it
          const ui8a = new Uint8Array(data, 0)
          // Used to store each character that makes up CSV header
          let headerString = ''
          // Iterate through each character in our Array
          for (var i = 0; i < byteLength; i++) {
            // Get the character for the current iteration
            const char = String.fromCharCode(ui8a[i])
            // Check if the char is a new line
            if (char.match(/[^\r\n]+/g) !== null) {
              // Not a new line so lets append it to our header string and keep processing
              headerString += char
            } else {
              // We found a new line character, stop processing
              break
            }
          }
          // Split our header string into an array
          props.mappings = headerString.split(',').map((el, ind) => ({ name: el, targetName: '' }))
          updateMappings()
        } catch (e) {
        }
      }
      reader.readAsArrayBuffer(file)
      fileUploadRef.value.value = ''
    }
    return {
      allAttributes,
      fileUploadRef,
      selectedMappingRef,
      updateMappings
    }
  }
}
</script>
