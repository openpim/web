<template>
  <DataTable
    ref="itemsDataTableRef"
    :loadData="loadDataFunction"
    :headersStorageName="'item_relation_headers'"
    :defaultHeadersArr="defaultHeadersArray"
    :export="isExportSearch"
    :availableColumns="getAvailableColumns"
    :importEntities="importItemRelations"
    :updateEntity="updateItemRelation"
    :searchHeader="'Search.Title.ItemRelations'"
    :exportXLSEnabled="hasAccess('exportRelationsXLS')"
    :importXLSEnabled="hasAccess('importRelationsXLS')"
    :marginTop="marginTop"
    v-if="hasAccess('searchRelations')"
  />
</template>

<script>
import { ref, watch } from '@vue/composition-api'
import * as attrStore from '../store/attributes'
import * as errorStore from '../store/error'
import * as itemRelationsStore from '../store/itemRelations'
import * as langStore from '../store/languages'
import * as searchStore from '../store/search'
import * as userStore from '../store/users'
import i18n from '../i18n'
import DataTable from '../components/DataTable'
import AttributeType from '../constants/attributeTypes'

export default {
  components: { DataTable },
  props: {
    export: {
      type: Boolean,
      required: true
    },
    marginTop: {
      required: false
    }
  },
  setup (props) {
    const itemsDataTableRef = ref(null)

    const { hasAccess } = userStore.useStore()
    const { searchItemRelations, importItemRelations, updateItemRelation } = itemRelationsStore.useStore()
    const { currentWhereRef } = searchStore.useStore()
    const { showError } = errorStore.useStore()
    const { getAllItemRelationsAttributes } = attrStore.useStore()
    const { languages, currentLanguage, defaultLanguageIdentifier } = langStore.useStore()

    watch(currentWhereRef, () => {
      if (itemsDataTableRef.value) itemsDataTableRef.value.DataChanged()
    })

    let where = null
    function loadDataFunction (options) {
      const tmp = new Promise((resolve, reject) => {
        if (!options) return
        if (!currentWhereRef.value) {
          resolve({ count: 0, rows: [] })
        } else {
          searchItemRelations(where || currentWhereRef.value, options)
            .then((data) => resolve(data))
            .catch((error) => showError(error))
        }
      })
      tmp.where = {}
      tmp.applyFilter = (newWhere) => {
        where = newWhere
      }
      return tmp
    }

    function getAvailableColumns (onlyAttributes) {
      const arr = [
        { identifier: 'identifier', text: i18n.t('ItemRelation.identifier'), align: 'start', sortable: true, filterable: false, value: 'identifier' },
        { identifier: 'itemIdentifier', text: i18n.t('ItemRelation.itemIdentifier'), align: 'start', sortable: true, filterable: false, value: 'itemIdentifier' },
        { identifier: '#sourceParentName#', text: i18n.t('ItemRelation.itemName'), align: 'start', sortable: false, filterable: false, value: '#sourceParentName#' },
        { identifier: 'relationIdentifier', text: i18n.t('ItemRelation.relationIdentifier'), align: 'start', sortable: true, filterable: false, value: 'relationIdentifier' },
        { identifier: 'targetIdentifier', text: i18n.t('ItemRelation.targetIdentifier'), align: 'start', sortable: true, filterable: false, value: 'targetIdentifier' },
        { identifier: '#targetParentName#', text: i18n.t('ItemRelation.targetName'), align: 'start', sortable: false, filterable: false, value: '#targetParentName#' },
        { identifier: 'createdBy', text: i18n.t('CreatedBy'), align: 'start', sortable: true, filterable: false, value: 'createdBy' },
        { identifier: 'createdAt', text: i18n.t('CreatedAt'), align: 'start', sortable: true, filterable: false, value: 'createdAt' },
        { identifier: 'updatedBy', text: i18n.t('UpdatedBy'), align: 'start', sortable: true, filterable: false, value: 'updatedBy' },
        { identifier: 'updatedAt', text: i18n.t('UpdatedAt'), align: 'start', sortable: true, filterable: false, value: 'updatedAt' }
      ]

      for (let i = 0; i < languages.length; i++) {
        const lang = languages[i]
        const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
        arr.push({ identifier: 'name_' + lang.identifier, text: i18n.t('Item.name') + langText, align: 'start', sortable: true, filterable: false, value: { path: ['name', lang.identifier] } })
      }
      const attrs = getAllItemRelationsAttributes()
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
            const data = { identifier: 'attr_' + attr.identifier + '_' + lang.identifier, text: nameText + langText, textLong: nameText + langText, textShort: nameShort + langText, align: 'start', sortable: true, filterable: false, value: { path: ['values', attr.identifier, lang.identifier] } }
            if (attr.type === AttributeType.LOV && attr.lov) {
              data.lov = attr.lov
              data.multivalue = attr.options.some(option => option.name === 'multivalue' && option.value === 'true')
            }
            arr.push(data)
          }
        } else {
          const data = { identifier: 'attr_' + attr.identifier, text: nameText, textLong: nameText, textShort: nameShort, align: 'start', sortable: true, filterable: false, value: { path: ['values', attr.identifier] } }
          if (attr.type === AttributeType.LOV && attr.lov) {
            data.lov = attr.lov
            data.multivalue = attr.options.some(option => option.name === 'multivalue' && option.value === 'true')
          }
          arr.push(data)
        }
      }
      return arr
    }

    const defaultHeadersArray = [
      { identifier: 'identifier', text: i18n.t('ItemRelation.identifier'), align: 'start', sortable: true, filterable: false, value: 'identifier' },
      { identifier: 'itemIdentifier', text: i18n.t('ItemRelation.itemIdentifier'), align: 'start', sortable: true, filterable: false, value: 'itemIdentifier' },
      { identifier: '#sourceParentName#', text: i18n.t('ItemRelation.itemName'), align: 'start', sortable: false, filterable: false, value: '#sourceParentName#' },
      { identifier: 'relationIdentifier', text: i18n.t('ItemRelation.relationIdentifier'), align: 'start', sortable: true, filterable: false, value: 'relationIdentifier' },
      { identifier: 'targetIdentifier', text: i18n.t('ItemRelation.targetIdentifier'), align: 'start', sortable: true, filterable: false, value: 'targetIdentifier' },
      { identifier: '#targetParentName#', text: i18n.t('ItemRelation.targetName'), align: 'start', sortable: false, filterable: false, value: '#targetParentName#' }
    ]

    return {
      defaultHeadersArray,
      getAvailableColumns,
      hasAccess,
      isExportSearch: props.export,
      itemsDataTableRef,
      importItemRelations,
      loadDataFunction,
      updateItemRelation
    }
  }
}
</script>
