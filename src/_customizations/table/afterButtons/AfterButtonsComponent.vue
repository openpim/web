<template>
    <div>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon @click="showAttr('OZONProducts', 'grpAttrOZON', 'ozonCategoryPath')"><v-icon>mdi-alpha-o-circle-outline</v-icon></v-btn>
        </template>
        <span>Показать атрибуты Озон</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon @click="showAttr('WBProducts', 'grpAttrWB', 'characteristicWB')"><v-icon>mdi-fruit-grapes</v-icon></v-btn>
        </template>
        <span>Показать атрибуты WB</span>
      </v-tooltip>
    </div>
</template>
<script>
import { onMounted } from '@vue/composition-api'
import * as itemRelStore from '../../../store/itemRelations'
import * as itemStore from '../../../store/item'
import * as attrStore from '../../../store/attributes'
import * as langStore from '../../../store/languages'
import AttributeType from '../../../constants/attributeTypes'

export default {
  components: {
  },
  props: {
    headers: {
      required: true
    },
    columnsSelected: {
      required: true
    },
    items: {
      required: true
    },
    loadData: {
      required: true
    },
    processButtonAction: {
      required: true
    }
  },
  setup (props) {
    const { searchItemRelations } = itemRelStore.useStore()
    const { searchItems } = itemStore.useStore()
    const { getAttributesForItem } = attrStore.useStore()
    const { languages, currentLanguage, defaultLanguageIdentifier, loadAllLanguages } = langStore.useStore()

    async function showAttr (relIdent, groupIdent, pathAttr) {
      if (!confirm('Выполнить?')) return
      const items = await props.loadData({ page: 1, itemsPerPage: 10000, sortBy: ['id'], sortDesc: [false] })
      const ids = items.rows.filter(elem => elem.typeIdentifier === 'product').map(elem => elem.id)
      if (ids.length > 0) {
        const rels = await searchItemRelations({ relationIdentifier: relIdent, targetId: { OP_in: ids } }, { page: 1, itemsPerPage: 10000, sortBy: ['id'], sortDesc: [false] })
        const uniqueRels = []
        const uniqueItemIds = []
        rels.rows.forEach(elem => {
          if (!uniqueItemIds.includes(elem.itemId)) {
            uniqueItemIds.push(elem.itemId)
            uniqueRels.push(elem.targetId)
          }
        })
        const categories = await searchItems({ id: { OP_in: uniqueRels } }, { page: 1, itemsPerPage: 10000, sortBy: ['id'], sortDesc: [false] })
        const attributes = []
        for (let i = 0; i < categories.rows.length; i++) {
          const item = categories.rows[i]
          const attrs = getAttributesForItem(item)
          attrs.forEach(grp => {
            if (grp.identifier !== groupIdent) return
            for (let j = 0; j < grp.itemAttributes.length; j++) {
              const attr = grp.itemAttributes[j]
              const catPath = item.values[pathAttr]
              if (catPath && attr.visible.some(elem => catPath.includes('.' + elem + '.') || catPath.endsWith('.' + elem)) && !attributes.includes(attr)) attributes.push(attr)
            }
          })
        }
        const newHeaders = [...props.headers]
        for (let i = 0; i < attributes.length; i++) {
          const attr = attributes[i]
          if (!newHeaders.some(header => header.identifier === 'attr_' + attr.identifier)) {
            const nameShort = (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']')
            if (attr.languageDependent) {
              for (let i = 0; i < languages.length; i++) {
                const lang = languages[i]
                const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
                const data = { identifier: 'attr_' + attr.identifier + '_' + lang.identifier, text: nameShort + langText, textLong: nameShort + langText, textShort: nameShort + langText, align: 'start', sortable: true, filterable: false, value: { path: ['values', attr.identifier, lang.identifier] } }
                if (attr.type === AttributeType.LOV && attr.lov) data.lov = attr.lov
                newHeaders.push(data)
              }
            } else {
              const data = { identifier: 'attr_' + attr.identifier, text: nameShort, textLong: nameShort, textShort: nameShort, align: 'start', sortable: true, filterable: false, value: { path: ['values', attr.identifier] } }
              if (attr.type === AttributeType.LOV && attr.lov) data.lov = attr.lov
              if (attr.options && attr.options.some(option => option.name === 'multivalue' && option.value === 'true')) data.multivalue = true
              newHeaders.push(data)
            }
          }
        }
        props.columnsSelected(newHeaders)
      }
    }
    onMounted(() => {
      loadAllLanguages()
    })

    return {
      showAttr
    }
  }
}
</script>
