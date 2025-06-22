<template>
  <v-row no-gutters v-if="hasAccess('search')">
    <SearchFilters @updateData="handleUpdate" @performSearch="search" :key="filtersKeyRef"/>
    <v-col cols="12" class="d-inline-flex justify-end align-center">
      <v-btn text @click="search" v-text="$t('Search.Find')" class="mr-2"></v-btn>
    </v-col>
  </v-row>
</template>
<script>
import { ref, onMounted, onUnmounted } from '@vue/composition-api'
import i18n from '../i18n'
import * as itemStore from '../store/item'
import * as attrStore from '../store/attributes'
import * as langStore from '../store/languages'
import * as errorStore from '../store/error'
import * as userStore from '../store/users'
import * as searchStore from '../store/search'
import SearchFilters from '../components/SearchFilters'
import AttributeType from '../constants/attributeTypes'

export default {
  components: { SearchFilters },
  setup () {
    const { showError } = errorStore.useStore()

    const {
      getItemsForRelationAttributeImport
    } = itemStore.useStore()

    const {
      currentWhereRef,
      currentFilterRef,
      searchEntityRef,
      searchToOpenRef,
      selectedRef,
      lovsMapRef
    } = searchStore.useStore()

    const {
      currentLanguage,
      loadAllLanguages
    } = langStore.useStore()

    const {
      loadAllAttributes,
      findByIdentifier
    } = attrStore.useStore()

    const {
      hasAccess
    } = userStore.useStore()

    const fieldsSelection = ref([])
    function handleUpdate (arr) {
      fieldsSelection.value = arr
    }

    const filtersKeyRef = ref(1)

    async function search () {
      if (!selectedRef.value) {
        selectedRef.value = { extended: false, filters: [], orAnd: 1 }
        filtersKeyRef.value++
      }
      if (selectedRef.value.extended) {
        try {
          searchEntityRef.value = 'ITEM'
          selectedRef.value.entity = searchEntityRef.value
          currentWhereRef.value = selectedRef.value.extWhereClause ? JSON.parse(selectedRef.value.extWhereClause) : selectedRef.value.whereClause
          currentFilterRef.value = null
        } catch (err) {
          console.error(err)
          showError(i18n.t('Search.Extended.Error') + err.message)
        }
      } else {
        localStorage.setItem('last_item_search', JSON.stringify(selectedRef.value))
        const orAndOperation = selectedRef.value.orAnd === 1 ? 'OP_and' : 'OP_or'
        const where = {}
        where[orAndOperation] = []
        if (!selectedRef.value.filters) selectedRef.value.filters = []
        currentFilterRef.value = selectedRef.value.filters
        for (let i = 0; i < selectedRef.value.filters.length; i++) {
          const filter = selectedRef.value.filters[i]
          if (filter.attr) {
            const data = {}

            let operation = ''
            switch (filter.operation) {
              case 1:
                operation = 'OP_eq'
                break
              case 2:
                operation = 'OP_ne'
                break
              case 3:
                operation = 'OP_gt'
                break
              case 4:
                operation = 'OP_gte'
                break
              case 5:
                operation = 'OP_lt'
                break
              case 6:
                operation = 'OP_lte'
                break
              case 7:
                operation = 'OP_startsWith'
                break
              case 8:
                operation = 'OP_endsWith'
                break
              case 9:
                operation = 'OP_substring'
                break
              case 10:
                operation = 'OP_in'
                break
              case 11:
              case 12:
                operation = 'OP_iLike'
                break
              case 13:
                operation = 'OP_notLike'
                break
              case 14:
                operation = 'OP_notILike'
                break
              case 15:
                operation = 'OP_notILike'
                break
              case 16:
                operation = 'OP_or'
                break
              case 17:
                operation = 'OP_and'
                break
              case 18:
                operation = 'OP_contains'
                break
            }

            if (filter.attr.startsWith('channel#')) {
              const tmp = filter.attr.substring(8)
              const idx = tmp.indexOf('#')
              const channelIdentifier = tmp.substring(0, idx)
              const field = tmp.substring(idx + 1)
              data.channels = {}
              data.channels[channelIdentifier] = {}
              data.channels[channelIdentifier][field] = {}
              data.channels[channelIdentifier][field][operation] = await parseValue(null, filter.attr, filter.value, filter)
            } else if (filter.attr === '#level#') {
              data.path = {}
              data.path.OP_or = filter?.path.length > 0 ? filter.path.map(id => ({ OP_regexp: `*.${id}.*` })) : []
            } else if (filter.attr.startsWith('name#')) {
              const lang = filter.attr.substring(5)
              data.name = {}
              data.name[lang] = {}
              data.name[lang][operation] = filter.operation === 12 || filter.operation === 13 || filter.operation === 15 ? '%' + filter.value + '%' : filter.value
            } else if (filter.attr.startsWith('attr#')) {
              const idx = filter.attr.indexOf('#', 5)
              if (idx === -1) {
                const attr = filter.attr.substring(5)
                const attrObj = findByIdentifier(attr)
                data.values = {}
                data.values[attr] = {}
                data.values[attr][operation] = await parseValue(attrObj ? attrObj.item : null, filter.attr, filter.value, filter)
              } else {
                const attr = filter.attr.substring(5, idx)
                const lang = filter.attr.substring(idx + 1)
                const attrObj = findByIdentifier(attr)
                data.values = {}
                data.values[attr] = {}
                data.values[attr][lang] = {}
                data.values[attr][lang][operation] = await parseValue(attrObj ? attrObj.item : null, filter.attr, filter.value, filter)
              }
            } else {
              data[filter.attr] = {}
              data[filter.attr][operation] = await parseValue(null, filter.attr, filter.value, filter, filter.date)
            }
            where[orAndOperation].push(data)
          }
        }
        searchEntityRef.value = 'ITEM'
        selectedRef.value.entity = searchEntityRef.value
        if (searchForKey(where, 'collectionId')) {
          const newWhere = {}
          if (where.OP_and) {
            where.OP_and.forEach((value) => {
              newWhere[Object.keys(value)] = value[Object.keys(value)]
            })
          } else {
            where.OP_or.forEach((value) => {
              newWhere[Object.keys(value)] = value[Object.keys(value)]
            })
          }
          currentWhereRef.value = newWhere
        } else {
          currentWhereRef.value = where
        }
      }
    }

    function searchForKey (obj, key) {
      for (const prop in obj) {
        if (prop === key) {
          return true
        } else if (typeof obj[prop] === 'object') {
          const searchResult = searchForKey(obj[prop], key)
          if (searchResult) {
            return true
          }
        }
      }
      return false
    }

    async function parseValue (attrObj, attr, value, filter) {
      if (filter.operation === 16) return [{ OP_eq: '' }, { OP_eq: null }]
      if (filter.operation === 17) return [{ OP_ne: '' }, { OP_ne: null }]
      if (filter.operation === 12 || filter.operation === 13 || filter.operation === 15) return '%' + parseSimpleValue(attrObj, attr, value) + '%'
      else if (filter.operation === 10) {
        const split = ('' + value).split(/\r\n|\n|\r/)
        if (getAttrType(filter) !== AttributeType.Relation) {
          const arr = []
          split.forEach(str => {
            arr.push(parseSimpleValue(attrObj, attr, str))
          })
          return arr
        } else {
          const items = await getItemsForRelationAttributeImport(attrObj, split, currentLanguage.value.identifier, 10000, 0, 'ASC')
          return items.getItemsForRelationAttributeImport.map(el => el.id)
        }
      } else {
        return parseSimpleValue(attrObj, attr, value)
      }
    }

    function parseSimpleValue (attrObj, attr, value) {
      if (lovsMapRef.value[attr]) return '' + value

      if (value === 'null') return null

      if (Object.prototype.toString.call(value) !== '[object String]') return value
      if (attrObj && attrObj.type === 1) return '' + value
      if (attr === 'identifier' ||
        attr === 'parentIdentifier' ||
        attr === 'typeIdentifier' ||
        attr === 'createdBy' ||
        attr === 'updatedBy' ||
        attr === 'fileOrigName' ||
        attr === 'mimeType') return '' + value

      if (value.startsWith('"') && value.endsWith('"')) {
        return value.substring(1, value.length - 1)
      } else {
        return isNaN(value) ? value : (value.length > 0 ? parseFloat(value) : null)
      }
    }

    async function enterKeyListener (e) {
      if (e.ctrlKey && e.code === 'Enter') {
        await search()
      }
    }

    function getAttrType (filter) {
      const arrattr = fieldsSelection.value.find(elem => elem.value === filter.attr)
      return arrattr ? arrattr.typeId : null
    }

    onMounted(() => {
      document.addEventListener('keypress', enterKeyListener)
      Promise.all([loadAllLanguages(), loadAllAttributes()]).then(async () => {
        if (searchToOpenRef.value) {
          await search()
        }
      })
    })

    onUnmounted(() => {
      document.removeEventListener('keypress', enterKeyListener)
    })

    return {
      handleUpdate,
      currentLanguage,
      getAttrType,
      AttributeType,
      selectedRef,
      searchForKey,
      search,
      fieldsSelection,
      lovsMapRef,
      hasAccess,
      filtersKeyRef
    }
  }
}
</script>
