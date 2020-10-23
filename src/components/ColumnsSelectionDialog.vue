<template>
  <v-dialog v-model="selectionDialogRef" persistent max-width="800px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('ColumnsSelection.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container class="pt-0">
          <v-row>
            <v-col cols="5"  class="pt-0">
              <v-text-field v-model="leftFilterRef" :label="$t('Filter')" required></v-text-field>
              <div>{{$t('ColumnsSelection.AvailableColumns')}}</div>
              <v-list nav dense style="max-height: 300px" class="overflow-y-auto">
                <v-list-item-group v-model="selectedLeftRef" color="primary">
                  <v-list-item v-for="(elem, i) in availableColumnsComputed" :key="i">
                    <v-list-item-content>
                      <v-list-item-title v-text="elem.text"></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-col>
            <v-col cols="2" align="center">
              <v-btn class="mt-10" @click="moveFromLeft" :disabled="selectedLeftRef == null"><v-icon>mdi-arrow-right-bold-circle-outline</v-icon></v-btn>
              <v-btn class="mt-3" @click="moveFromRight" :disabled="selectedRightRef == null"><v-icon>mdi-arrow-left-bold-circle-outline</v-icon></v-btn>
            </v-col>
            <v-col cols="5" class="pt-0">
              <v-text-field v-model="rightFilterRef" :label="$t('Filter')" required></v-text-field>
              <div>{{$t('ColumnsSelection.SelectedColumns')}}</div>
              <v-list nav dense style="max-height: 300px" class="overflow-y-auto">
                <v-list-item-group v-model="selectedRightRef" color="primary">
                  <v-list-item v-for="(elem, i) in selectedColumnsComputed" :key="i">
                    <v-list-item-content>
                      <v-list-item-title v-text="elem.text"></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="selectionDialogRef = false">{{ $t('Cancel') }}</v-btn>
        <v-btn color="blue darken-1" text @click="selected">{{ $t('Select') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { ref, computed } from '@vue/composition-api'
import * as attrStore from '../store/attributes'
import * as langStore from '../store/languages'
import i18n from '../i18n'

export default {
  name: 'ColumnsSelection',
  setup (props, { emit }) {
    const {
      languages,
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      getAllItemsAttributes
    } = attrStore.useStore()

    const leftFilterRef = ref('')
    const rightFilterRef = ref('')
    const selectedLeftRef = ref(null)
    const selectedRightRef = ref(null)
    const availableColumnsRef = ref([])
    const selectedColumnsRef = ref([])
    const selectionDialogRef = ref(false)

    const availableColumnsComputed = computed(() => {
      if (leftFilterRef.value) {
        return availableColumnsRef.value.filter(elem => elem.text.toLowerCase().indexOf(leftFilterRef.value.toLowerCase()) !== -1)
      } else {
        return availableColumnsRef.value
      }
    })

    const selectedColumnsComputed = computed(() => {
      if (rightFilterRef.value) {
        return selectedColumnsRef.value.filter(elem => elem.text.toLowerCase().indexOf(rightFilterRef.value.toLowerCase()) !== -1)
      } else {
        return selectedColumnsRef.value
      }
    })

    function moveFromLeft () {
      const save = availableColumnsComputed.value[selectedLeftRef.value]
      const idx = availableColumnsRef.value.findIndex(elem => elem.identifier === save.identifier)
      availableColumnsRef.value.splice(idx, 1)
      selectedColumnsRef.value.push(save)
      selectedLeftRef.value = null
    }

    function moveFromRight () {
      const save = selectedColumnsComputed.value[selectedRightRef.value]
      const idx = selectedColumnsRef.value.findIndex(elem => elem.identifier === save.identifier)
      selectedColumnsRef.value.splice(idx, 1)
      availableColumnsRef.value.push(save)
      selectedRightRef.value = null
    }

    function selected () {
      emit('selected', selectedColumnsRef.value)
    }

    function showDialog (selected) {
      selectedColumnsRef.value = selected
      const arr = [
        { identifier: 'identifier', text: i18n.t('Item.identifier'), align: 'start', sortable: false, filterable: false, value: 'identifier' },
        { identifier: '#thumbnail#', text: i18n.t('Item.thumbnail'), align: 'start', sortable: false, filterable: false, value: '#thumbnail#' },
        { identifier: 'createdBy', text: i18n.t('CreatedBy'), align: 'start', sortable: false, filterable: false, value: 'createdBy' },
        { identifier: 'createdAt', text: i18n.t('CreatedAt'), align: 'start', sortable: false, filterable: false, value: 'createdAt' },
        { identifier: 'updatedBy', text: i18n.t('UpdatedBy'), align: 'start', sortable: false, filterable: false, value: 'updatedBy' },
        { identifier: 'updatedAt', text: i18n.t('UpdatedAt'), align: 'start', sortable: false, filterable: false, value: 'updatedAt' },
        { identifier: 'fileOrigName', text: i18n.t('Item.fileOrigName'), align: 'start', sortable: false, filterable: false, value: 'fileOrigName' },
        { identifier: 'mimeType', text: i18n.t('Item.mimeType'), align: 'start', sortable: false, filterable: false, value: 'mimeType' }
      ]
      for (let i = 0; i < languages.length; i++) {
        const lang = languages[i]
        const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
        arr.push({ identifier: 'name_' + lang.identifier, text: i18n.t('Item.name') + langText, align: 'start', sortable: false, filterable: false, value: ['name', lang.identifier] })
      }
      const attrs = getAllItemsAttributes()
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i]
        const nameText = (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']')
        if (attr.languageDependent) {
          for (let i = 0; i < languages.length; i++) {
            const lang = languages[i]
            const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
            const data = { identifier: 'attr_' + attr.identifier + '_' + lang.identifier, text: nameText + langText, align: 'start', sortable: false, filterable: false, value: ['values', attr.identifier, lang.identifier] }
            if (attr.lov) data.lov = attr.lov
            arr.push(data)
          }
        } else {
          const data = { identifier: 'attr_' + attr.identifier, text: nameText, align: 'start', sortable: false, filterable: false, value: ['values', attr.identifier] }
          if (attr.lov) data.lov = attr.lov
          arr.push(data)
        }
      }
      availableColumnsRef.value = arr.filter(elem => !selected.find(elem2 => elem2.identifier === elem.identifier))
      selectionDialogRef.value = true
    }

    function closeDialog () {
      selectionDialogRef.value = false
    }

    return {
      selectedLeftRef,
      selectedRightRef,
      selectionDialogRef,
      selected,
      showDialog,
      closeDialog,
      moveFromLeft,
      moveFromRight,
      leftFilterRef,
      rightFilterRef,
      availableColumnsComputed,
      selectedColumnsComputed
    }
  }
}
</script>
