<template>
  <div>
    <DataTable
      v-if="hasAccess('search') && item"
      ref="itemsDataTableRef"
      :loadData="loadItemChildren"
      :headersStorageName="'item_headers'"
      :defaultHeadersArr="defaultHeadersArray"
      :export="isExportSearch"
      :availableColumns="getAvailableColumns"
      :importEntities="importItems"
      :updateEntity="updateItem"
      :searchHeader="'Search.Title.Items'"
      :attrGroupsBtnVisible="true"
      :sendToChannelBtnVisible="true"
      :exportXLSEnabled="hasAccess('exportXLS')"
      :importXLSEnabled="hasAccess('importXLS')"
      :item="item"
      :marginTop="marginTop"
      @dataLoaded="childrenLoaded"
    />
    <DataTable
      ref="itemsDataTableRef"
      :loadData="loadDataFunction"
      :headersStorageName="'item_headers'"
      :defaultHeadersArr="defaultHeadersArray"
      :export="isExportSearch"
      :availableColumns="getAvailableColumns"
      :importEntities="importItems"
      :updateEntity="updateItem"
      :searchHeader="'Search.Title.Items'"
      :attrGroupsBtnVisible="true"
      :sendToChannelBtnVisible="true"
      :exportXLSEnabled="hasAccess('exportXLS')"
      :importXLSEnabled="hasAccess('importXLS')"
      :marginTop="marginTop"
      v-if="hasAccess('search') && !item"
    />
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import * as attrStore from '../store/attributes'
import * as channelsStore from '../store/channels'
import * as errorStore from '../store/error'
import * as itemStore from '../store/item'
import * as langStore from '../store/languages'
import * as searchStore from '../store/search'
import * as userStore from '../store/users'
import DataTable from '../components/DataTable'
import AttributeType from '../constants/attributeTypes'

export default {
  components: { DataTable },
  props: {
    export: {
      type: Boolean,
      required: true
    },
    item: {
      required: false
    },
    loadItemChildren: {
      type: Function,
      required: false
    },
    marginTop: {
      required: false
    }
  },
  setup (props, { emit, root }) {
    const itemsDataTableRef = ref(null)

    const { hasAccess } = userStore.useStore()
    const { searchItems, importItems, updateItem } = itemStore.useStore()
    const { currentWhereRef } = searchStore.useStore()
    const { showError } = errorStore.useStore()
    const { getAvailableChannels } = channelsStore.useStore()
    const { getAllItemsAttributes } = attrStore.useStore()
    const { languages, currentLanguage, defaultLanguageIdentifier } = langStore.useStore()
    const { t } = useI18n()

    watch(currentWhereRef, () => {
      if (itemsDataTableRef.value) itemsDataTableRef.value.DataChanged()
    })

    function DataChanged () {
      if (itemsDataTableRef.value) itemsDataTableRef.value.DataChanged()
    }

    function childrenLoaded (rows, total) {
      emit('dataLoaded', rows, total)
    }

    function loadDataFunction (options) {
      return new Promise((resolve, reject) => {
        if (!currentWhereRef.value) {
          resolve({ count: 0, rows: [] })
        } else {
          searchItems(currentWhereRef.value, options)
            .then((data) => resolve(data))
            .catch((error) => showError(error))
        }
      })
    }

    const defaultHeadersArray = [
      { identifier: '#thumbnail#', text: t('Item.thumbnail'), align: 'start', sortable: false, filterable: false, value: '#thumbnail#' },
      { identifier: 'identifier', text: t('Item.identifier'), align: 'start', sortable: true, filterable: false, value: 'identifier' },
      { identifier: 'name_en', text: 'Name (English)', align: 'start', sortable: true, filterable: false, value: { path: ['name', 'en'] } }
    ]

    function getAvailableColumns (onlyAttributes) {
      const arr = [
        { identifier: 'identifier', text: t('Item.identifier'), align: 'start', sortable: true, filterable: false, value: 'identifier' },
        { identifier: 'parentIdentifier', text: t('Item.parentIdentifier'), align: 'start', sortable: true, filterable: false, value: 'parentIdentifier' },
        { identifier: 'typeIdentifier', text: t('Item.typeIdentifier'), align: 'start', sortable: true, filterable: false, value: 'typeIdentifier' },
        { identifier: '#parentName#', text: t('Item.parentName'), align: 'start', sortable: false, filterable: false, value: '#parentName#' },
        { identifier: '#thumbnail#', text: t('Item.thumbnail'), align: 'start', sortable: false, filterable: false, value: '#thumbnail#' },
        { identifier: 'createdBy', text: t('CreatedBy'), align: 'start', sortable: true, filterable: false, value: 'createdBy' },
        { identifier: 'createdAt', text: t('CreatedAt'), align: 'start', sortable: true, filterable: false, value: 'createdAt' },
        { identifier: 'updatedBy', text: t('UpdatedBy'), align: 'start', sortable: true, filterable: false, value: 'updatedBy' },
        { identifier: 'updatedAt', text: t('UpdatedAt'), align: 'start', sortable: true, filterable: false, value: 'updatedAt' },
        { identifier: 'fileOrigName', text: t('Item.fileOrigName'), align: 'start', sortable: true, filterable: false, value: 'fileOrigName' },
        { identifier: 'mimeType', text: t('Item.mimeType'), align: 'start', sortable: true, filterable: false, value: 'mimeType' }
      ]
      const channels = getAvailableChannels()
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i]
        arr.push({
          identifier: '#channel_' + channel.identifier + '_status',
          text: t('ColumnsSelection.ChannelStatus') + ' (' + t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')',
          align: 'start',
          sortable: true,
          filterable: false,
          value: { path: ['channels', channel.identifier, 'status'] }
        })
        arr.push({
          identifier: '#channel_' + channel.identifier + '_submittedAt',
          text: t('ColumnsSelection.SubmittedAt') + ' (' + t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')',
          align: 'start',
          sortable: true,
          filterable: false,
          value: { path: ['channels', channel.identifier, 'submittedAt'] }
        })
        arr.push({
          identifier: '#channel_' + channel.identifier + '_submittedBy',
          text: t('ColumnsSelection.SubmittedBy') + ' (' + t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')',
          align: 'start',
          sortable: true,
          filterable: false,
          value: { path: ['channels', channel.identifier, 'submittedBy'] }
        })
        arr.push({
          identifier: '#channel_' + channel.identifier + '_syncedAt',
          text: t('ColumnsSelection.SyncedAt') + ' (' + t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')',
          align: 'start',
          sortable: true,
          filterable: false,
          value: { path: ['channels', channel.identifier, 'syncedAt'] }
        })
        arr.push({
          identifier: '#channel_' + channel.identifier + '_message',
          text: t('ColumnsSelection.ChannelMessage') + ' (' + t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')',
          align: 'start',
          sortable: true,
          filterable: false,
          value: { path: ['channels', channel.identifier, 'message'] }
        })
      }
      for (let i = 0; i < languages.length; i++) {
        const lang = languages[i]
        const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
        arr.push({
          identifier: 'name_' + lang.identifier,
          text: t('Item.name') + langText,
          align: 'start',
          sortable: true,
          filterable: false,
          value: { path: ['name', lang.identifier] }
        })
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

        const nameText = (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']') + ' [' + (attr.linkToGroup.name[currentLanguage.value.identifier] || attr.linkToGroup.name[defaultLanguageIdentifier.value]) + ']' + ' - ' + attr.identifier
        const nameShort = (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']')
        if (attr.languageDependent) {
          for (let i = 0; i < languages.length; i++) {
            const lang = languages[i]
            const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
            const data = {
              identifier: 'attr_' + attr.identifier + '_' + lang.identifier,
              text: nameText + langText,
              textLong: nameText + langText,
              textShort: nameShort + langText,
              align: 'start',
              sortable: true,
              filterable: false,
              value: { path: ['values', attr.identifier, lang.identifier] }
            }
            if (attr.type === AttributeType.LOV && attr.lov) data.lov = attr.lov
            arr.push(data)
          }
        } else {
          const data = {
            identifier: 'attr_' + attr.identifier,
            text: nameText,
            textLong: nameText,
            textShort: nameShort,
            align: 'start',
            sortable: true,
            filterable: false,
            value: { path: ['values', attr.identifier] }
          }
          if (attr.type === AttributeType.LOV && attr.lov) data.lov = attr.lov
          arr.push(data)
        }
      }
      return arr
    }

    return {
      defaultHeadersArray,
      getAvailableColumns,
      hasAccess,
      importItems,
      isExportSearch: props.export,
      itemsDataTableRef,
      loadDataFunction,
      updateItem,
      DataChanged,
      childrenLoaded
    }
  }
}
</script>
