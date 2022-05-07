<template>
  <div>
    <div class="mt-2">{{ $t('OptionsTable.Title') }}</div>
    <v-simple-table dense class="mb-4">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">{{$t('OptionsTable.Name')}}</th>
              <th class="text-left">{{$t('OptionsTable.Type')}}</th>
              <th class="text-left">{{$t('OptionsTable.Value')}}</th>
              <th class="text-left">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" class="pa-0" icon color="primary" @click="addValue"><v-icon dark>mdi-plus</v-icon></v-btn>
                  </template>
                  <span>{{ $t('Add') }}</span>
                </v-tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(elem, j) in attrOptions" :key="j">
              <td class="pa-1">
                <input v-model="elem.name" :placeholder="$t('OptionsTable.Name')" @change="changed"/>
              </td>
              <td class="pa-1 pr-10" style="width:220px;">
                <v-select v-model="elem.type" :items="typeSelection" :label="$t('OptionsTable.Type')" @change="changeType(elem)" />
              </td>
              <td class="pa-1" colspan="2">
                <textarea rows="1"  cols="50" v-model="elem.value" :placeholder="$t('OptionsTable.Value')" @change="changed" :readonly="elem.type !== 1"/>
                <v-btn class="pa-0" icon color="primary" @click="removeValue(j)"><v-icon dark>mdi-close-circle-outline</v-icon></v-btn>
                <v-btn class="pa-0" icon color="primary" @click="addItems(j)" v-if="elem.type !== 1"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
      <OptionsItemSelectionDialog ref="optionsDialogRef" :elem="selectedOption" @confirm="itemsSelected" />
  </div>
</template>
<script>

import { computed, ref } from '@vue/composition-api'
import i18n from '../i18n'
import OptionsItemSelectionDialog from './OptionsItemSelectionDialog.vue'

export default {
  components: { OptionsItemSelectionDialog },
  props: {
    options: {
      required: true
    }
  },
  setup (props, { emit, root }) {
    const optionsDialogRef = ref(null)
    const selectedOption = ref(null)

    const attrOptions = computed(() => {
      return props.options.map(option => {
        if (!option.type) {
          option.type = 1
        }
        return option
      })
    })

    function addValue () {
      attrOptions.value.push({ name: '', value: '', type: 1 })
      changed()
    }

    function addItems (idx) {
      selectedOption.value = attrOptions.value[idx]
      optionsDialogRef.value.showDialog()
    }

    function removeValue (idx) {
      attrOptions.value.splice(idx, 1)
      changed()
    }

    function changed () {
      emit('changed', attrOptions.value)
    }

    function changeType (elem) {
      selectedOption.value = elem
      selectedOption.value.value = ''
      changed()
    }

    function itemsSelected (dataArr) {
      optionsDialogRef.value.closeDialog()
      const result = (selectedOption.value.type === 2) ? dataArr.map((elem) => elem.id) : dataArr.map((elem) => elem.identifier)
      selectedOption.value.value = result.join(',')
      changed()
    }

    return {
      attrOptions,
      addValue,
      addItems,
      changed,
      itemsSelected,
      removeValue,
      optionsDialogRef,
      selectedOption,
      changeType,
      typeSelection: [
        { text: i18n.t('OptionsTable.Types.String'), value: 1 },
        { text: i18n.t('OptionsTable.Types.Id'), value: 2 },
        { text: i18n.t('OptionsTable.Types.Identifier'), value: 3 }
      ]
    }
  }
}
</script>
