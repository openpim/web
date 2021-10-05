<template>
  <v-dialog v-model="selectionDialogRef" persistent max-width="1000px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('ColumnsSelection.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container class="pt-0">
          <v-row>
            <v-col cols="7"  class="pt-0">
              <v-text-field v-model="leftFilterRef" :label="$t('Filter')" required></v-text-field>
              <div>{{$t('ColumnsSelection.AvailableColumns')}}</div>
              <v-list nav dense style="max-height: 300px" class="overflow-y-auto">
                <v-list-item-group multiple v-model="selectedLeftRef" color="primary">
                  <v-list-item v-for="(elem, i) in availableColumnsComputed" :key="i">
                    <v-list-item-content>
                      <v-list-item-title v-text="elem.text"></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-col>
            <v-col cols="1" align="center">
              <v-btn class="mt-10" @click="moveFromLeft" :disabled="selectedLeftRef.length===0"><v-icon>mdi-arrow-right-bold-circle-outline</v-icon></v-btn>
              <v-btn class="mt-3" @click="moveFromRight" :disabled="selectedRightRef.length===0"><v-icon>mdi-arrow-left-bold-circle-outline</v-icon></v-btn>
              <v-btn class="mt-10" @click="moveUp" :disabled="selectedRightRef.length!==1"><v-icon>mdi-arrow-up-bold-circle-outline</v-icon></v-btn>
              <v-btn class="mt-3" @click="moveDown" :disabled="selectedRightRef.length!==1"><v-icon>mdi-arrow-down-bold-circle-outline</v-icon></v-btn>
              <v-btn class="mt-10" @click="moveFromLeftAll"><v-icon>mdi-arrow-right-bold-circle</v-icon></v-btn>
              <v-btn class="mt-3" @click="moveFromRightAll"><v-icon>mdi-arrow-left-bold-circle</v-icon></v-btn>
            </v-col>
            <v-col cols="4" class="pt-0">
              <v-text-field v-model="rightFilterRef" :label="$t('Filter')" required></v-text-field>
              <div>{{$t('ColumnsSelection.SelectedColumns')}}</div>
              <v-list nav dense style="max-height: 300px" class="overflow-y-auto">
                <v-list-item-group multiple v-model="selectedRightRef" color="primary">
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
import * as channelsStore from '../store/channels'

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

    const { getAwailableChannels } = channelsStore.useStore()

    const leftFilterRef = ref('')
    const rightFilterRef = ref('')
    const selectedLeftRef = ref([])
    const selectedRightRef = ref([])
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
      const arrToMove = selectedLeftRef.value.map(idx => availableColumnsComputed.value[idx].identifier)
      arrToMove.forEach(ident => {
        const save = availableColumnsComputed.value.find(elem => elem.identifier === ident)
        const idx = availableColumnsRef.value.findIndex(elem => elem.identifier === save.identifier)
        availableColumnsRef.value.splice(idx, 1)
        if (save.textShort) save.text = save.textShort
        selectedColumnsRef.value.push(save)
      })
      selectedLeftRef.value = []
    }

    function moveFromRight () {
      const arrToMove = selectedRightRef.value.map(idx => selectedColumnsComputed.value[idx].identifier)
      arrToMove.forEach(ident => {
        const save = selectedColumnsComputed.value.find(elem => elem.identifier === ident)
        const idx = selectedColumnsRef.value.findIndex(elem => elem.identifier === save.identifier)
        selectedColumnsRef.value.splice(idx, 1)
        if (save.textLong) save.text = save.textLong
        availableColumnsRef.value.push(save)
      })
      selectedRightRef.value = []
    }

    function moveUp () {
      const idx = selectedRightRef.value[0]
      if (idx !== 0) {
        const newIdx = idx - 1
        const elem = selectedColumnsRef.value.splice(idx, 1)[0]
        selectedColumnsRef.value.splice(newIdx, 0, elem)
        selectedRightRef.value = [newIdx]
      }
    }

    function moveDown () {
      const idx = selectedRightRef.value[0]
      if (idx !== selectedColumnsRef.value.length - 1) {
        const newIdx = idx + 1
        const elem = selectedColumnsRef.value.splice(idx, 1)[0]
        selectedColumnsRef.value.splice(newIdx, 0, elem)
        selectedRightRef.value = [newIdx]
      }
    }

    function moveFromLeftAll () {
      const arrToMove = availableColumnsComputed.value.map(elem => elem.identifier)
      arrToMove.forEach(ident => {
        const save = availableColumnsComputed.value.find(elem => elem.identifier === ident)
        const idx = availableColumnsRef.value.findIndex(elem => elem.identifier === save.identifier)
        availableColumnsRef.value.splice(idx, 1)
        if (save.textShort) save.text = save.textShort
        selectedColumnsRef.value.push(save)
      })
      selectedLeftRef.value = []
    }

    function moveFromRightAll () {
      const arrToMove = selectedColumnsComputed.value.map(elem => elem.identifier)
      arrToMove.forEach(ident => {
        const save = selectedColumnsComputed.value.find(elem => elem.identifier === ident)
        const idx = selectedColumnsRef.value.findIndex(elem => elem.identifier === save.identifier)
        selectedColumnsRef.value.splice(idx, 1)
        if (save.textLong) save.text = save.textLong
        availableColumnsRef.value.push(save)
      })
      selectedRightRef.value = []
    }

    function selected () {
      emit('selected', selectedColumnsRef.value)
    }

    function showDialog (selected, onlyAttributes) {
      selectedColumnsRef.value = selected
      const arr = [
        { identifier: 'identifier', text: i18n.t('Item.identifier'), align: 'start', sortable: true, filterable: false, value: 'identifier' },
        { identifier: 'parentIdentifier', text: i18n.t('Item.parentIdentifier'), align: 'start', sortable: true, filterable: false, value: 'parentIdentifier' },
        { identifier: '#parentName#', text: i18n.t('Item.parentName'), align: 'start', sortable: false, filterable: false, value: '#parentName#' },
        { identifier: '#thumbnail#', text: i18n.t('Item.thumbnail'), align: 'start', sortable: false, filterable: false, value: '#thumbnail#' },
        { identifier: 'createdBy', text: i18n.t('CreatedBy'), align: 'start', sortable: true, filterable: false, value: 'createdBy' },
        { identifier: 'createdAt', text: i18n.t('CreatedAt'), align: 'start', sortable: true, filterable: false, value: 'createdAt' },
        { identifier: 'updatedBy', text: i18n.t('UpdatedBy'), align: 'start', sortable: true, filterable: false, value: 'updatedBy' },
        { identifier: 'updatedAt', text: i18n.t('UpdatedAt'), align: 'start', sortable: true, filterable: false, value: 'updatedAt' },
        { identifier: 'fileOrigName', text: i18n.t('Item.fileOrigName'), align: 'start', sortable: true, filterable: false, value: 'fileOrigName' },
        { identifier: 'mimeType', text: i18n.t('Item.mimeType'), align: 'start', sortable: true, filterable: false, value: 'mimeType' }
      ]
      const channels = getAwailableChannels()
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i]
        arr.push({
          identifier: '#channel_' + channel.identifier + '_status',
          text: i18n.t('ColumnsSelection.ChannelStatus') + ' (' + i18n.t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')',
          align: 'start',
          sortable: true,
          filterable: false,
          value: { path: ['channels', channel.identifier, 'status'] }
        })
        arr.push({
          identifier: '#channel_' + channel.identifier + '_submittedAt',
          text: i18n.t('ColumnsSelection.SubmittedAt') + ' (' + i18n.t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')',
          align: 'start',
          sortable: true,
          filterable: false,
          value: { path: ['channels', channel.identifier, 'submittedAt'] }
        })
        arr.push({
          identifier: '#channel_' + channel.identifier + '_submittedBy',
          text: i18n.t('ColumnsSelection.SubmittedBy') + ' (' + i18n.t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')',
          align: 'start',
          sortable: true,
          filterable: false,
          value: { path: ['channels', channel.identifier, 'submittedBy'] }
        })
        arr.push({
          identifier: '#channel_' + channel.identifier + '_syncedAt',
          text: i18n.t('ColumnsSelection.SyncedAt') + ' (' + i18n.t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')',
          align: 'start',
          sortable: true,
          filterable: false,
          value: { path: ['channels', channel.identifier, 'syncedAt'] }
        })
        arr.push({
          identifier: '#channel_' + channel.identifier + '_message',
          text: i18n.t('ColumnsSelection.ChannelMessage') + ' (' + i18n.t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')',
          align: 'start',
          sortable: true,
          filterable: false,
          value: { path: ['channels', channel.identifier, 'message'] }
        })
      }
      for (let i = 0; i < languages.length; i++) {
        const lang = languages[i]
        const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
        arr.push({ identifier: 'name_' + lang.identifier, text: i18n.t('Item.name') + langText, align: 'start', sortable: true, filterable: false, value: { path: ['name', lang.identifier] } })
      }
      const attrs = getAllItemsAttributes()
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i]

        if (onlyAttributes) { // filter only attributes that possible to have at this level
          const attrGroup = attr.linkToGroup
          const tstGroup = onlyAttributes.find(elem => elem.id === attrGroup.id)
          if (!tstGroup) continue
          const tstAttr = tstGroup.itemAttributes.find(elem => elem.identifier === attr.identifier)
          if (!tstAttr) continue
        }

        const nameText = attr.identifier + ': ' + (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']') + ' [' + (attr.linkToGroup.name[currentLanguage.value.identifier] || attr.linkToGroup.name[defaultLanguageIdentifier.value]) + ']'
        const nameShort = (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']')
        if (attr.languageDependent) {
          for (let i = 0; i < languages.length; i++) {
            const lang = languages[i]
            const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
            const data = { identifier: 'attr_' + attr.identifier + '_' + lang.identifier, text: nameText + langText, textLong: nameText + langText, textShort: nameShort + langText, align: 'start', sortable: true, filterable: false, value: { path: ['values', attr.identifier, lang.identifier] } }
            if (attr.lov) data.lov = attr.lov
            arr.push(data)
          }
        } else {
          const data = { identifier: 'attr_' + attr.identifier, text: nameText, textLong: nameText, textShort: nameShort, align: 'start', sortable: true, filterable: false, value: { path: ['values', attr.identifier] } }
          if (attr.lov) data.lov = attr.lov
          arr.push(data)
        }
      }
      availableColumnsRef.value = arr.filter(elem => !selected.find(elem2 => elem2.identifier === elem.identifier)) // .sort((a, b) => a.identifier.localeCompare(b.identifier))
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
      moveUp,
      moveDown,
      moveFromLeftAll,
      moveFromRightAll,
      leftFilterRef,
      rightFilterRef,
      availableColumnsComputed,
      selectedColumnsComputed
    }
  }
}
</script>
