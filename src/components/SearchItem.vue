<template>
    <v-row no-gutters v-if="hasAccess('search')">
    <v-col cols="12">
      <v-toolbar dense flat>
        <v-toolbar-title class="subtitle-2">{{ selectedRef && selectedRef.extended ? $t('Home.Search.TitleExtended') : null }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon v-if="selectedRef && !selectedRef.extended" @click="add(1)"><v-icon>mdi-plus</v-icon></v-btn>
        <v-btn icon v-if="selectedRef && !selectedRef.extended" @click="remove" :disabled="selectedFilterRef == null"><v-icon>mdi-minus</v-icon></v-btn>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon @click="save"><v-icon>mdi-content-save</v-icon></v-btn>
          </template>
          <span>{{ $t('SearchSaveDialog.SaveTooltip') }}</span>
        </v-tooltip>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon @click="load"><v-icon>mdi-download</v-icon></v-btn>
          </template>
          <span>{{ $t('SearchSaveDialog.LoadTooltip') }}</span>
        </v-tooltip>
      </v-toolbar>
      <v-list nav dense class="ma-0" v-if="selectedRef && !selectedRef.extended">
        <v-list-item-group v-model="selectedFilterRef" color="primary">
          <v-list-item v-for="(filter, i) in selectedRef.filters" :key="i" :value="i" :three-line="filter.type === 'attr'">
            <v-list-item-icon><v-icon>{{filter.type === 'attr' ? 'mdi-alpha-a-box-outline' : ''}}</v-icon></v-list-item-icon>
            <v-list-item-content>
              <v-container class="pa-0">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-autocomplete dense v-model="filter.attr" :items="fieldsSelection" :label="$t('Search.Filter.Attribute.Attr')"></v-autocomplete>
                  </v-col>
                </v-row>

                <v-row no-gutters v-if="filter.attr !== '#level#' && filter.attr !== 'collectionId'">
                  <v-col cols="12">
                    <v-select dense v-model="filter.operation" :items="operationSelection" :label="$t('Search.Filter.Attribute.Operation')"></v-select>
                  </v-col>
                </v-row>
                <v-row no-gutters v-if="filter.attr && (!filter.attr.endsWith('#status') || filter.attr === 'attr#status')">
                  <v-col cols="12">
                    <template v-if="filter.attr === '#level#'">
                      <v-text-field dense readonly v-model="filter.value" :label="$t('Search.Filter.Attribute.Value')" required append-outer-icon="mdi-form-select" @click:append-outer="itemSelectionDialogRef.showDialog(filter)"></v-text-field>
                    </template>
                    <template v-if="filter.attr === 'collectionId'">
                      <v-text-field dense readonly v-model="filter.value" :label="$t('Search.Filter.Attribute.Value')" required append-outer-icon="mdi-form-select" @click:append-outer="collSelectionDialogRef.showDialog(false, filter)"></v-text-field>
                    </template>
                    <v-autocomplete v-if="filter.attr && filter.attr !== '#level#' && filter.attr !== 'collectionId' && lovsMapRef[filter.attr]" dense v-model="filter.value" :items="getLovItems(filter)" :label="$t('Search.Filter.Attribute.Value')"></v-autocomplete>
                    <v-text-field v-if="(filter.operation !== 10 && filter.operation !== 16 && filter.operation !== 17) && filter.attr && filter.attr !== '#level#' && filter.attr !== 'collectionId' && filter.attr !== 'typeIdentifier' && !getDateType(filter) && !lovsMapRef[filter.attr]" dense v-model="filter.value" :label="$t('Search.Filter.Attribute.Value')" required></v-text-field>
                    <v-text-field v-if="(filter.operation !== 10 && filter.operation !== 16 && filter.operation !== 17) && filter.attr && filter.attr === 'typeIdentifier' && !lovsMapRef[filter.attr]" dense v-model="filter.value" :label="$t('Search.Filter.Attribute.Value')" required append-outer-icon="mdi-file-document-edit-outline" @click:append-outer="typeSelectionDialogRef.showDialog(filter)"></v-text-field>
                    <v-text-field v-if="(filter.operation !== 10 && filter.operation !== 16 && filter.operation !== 17) && filter.attr && filter.attr !== '#level#' && filter.attr !== 'collectionId' && getDateType(filter) && !lovsMapRef[filter.attr]" dense v-model="filter.value" :label="$t('Search.Filter.Attribute.Value')" required readonly append-outer-icon="mdi-calendar" @click:append-outer="datePickerDialogRef.showDialog(getDateType(filter), filter)"></v-text-field>
                    <v-textarea v-if="filter.operation === 10 && filter.attr && filter.attr !== '#level#' && filter.attr !== 'collectionId' && !lovsMapRef[filter.attr]" dense v-model="filter.value" :label="$t('Search.Filter.Attribute.Value')" required></v-textarea>
                  </v-col>
                </v-row>
                <v-row no-gutters v-if="filter.attr && filter.attr.endsWith('#status') && filter.attr !== 'attr#status'">
                  <v-col cols="12">
                    <v-select dense v-model="filter.value" :items="statusSelection" :label="$t('ColumnsSelection.ChannelStatus')"></v-select>
                  </v-col>
                </v-row>

              </v-container>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <v-textarea v-if="selectedRef && selectedRef.extended" class="ml-3 mr-3" v-model="extendedSearchRef" :label="$t('Search.Extended.Label')"></v-textarea>
  </v-col>
  <v-col cols="4" class="d-inline-flex justify-end align-center">
    <v-select v-if="selectedRef && !selectedRef.extended && selectedRef.filters && selectedRef.filters.length > 1" class="ml-5" dense v-model="selectedRef.orAnd" :items="orAndSelection"></v-select>
  </v-col>
  <v-col cols="8" class="d-inline-flex justify-end align-center">
    <v-switch class="mt-0" dense hide-details v-if="selectedRef" v-model="selectedRef.extended"></v-switch>
    <v-btn text @click="search" v-text="$t('Search.Find')" class="mr-2"></v-btn>
  </v-col>
  <SearchSaveDialog ref="searchSaveDialogRef" ></SearchSaveDialog>
  <SearchLoadDialog ref="searchLoadDialogRef" @selected="searchSelected"></SearchLoadDialog>
  <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemSelected"/>
  <CollectionsSelectionDialog ref="collSelectionDialogRef" :editAccessOnly="true" @selected="collectionSelected"/>
  <DatePickerDialog ref="datePickerDialogRef" @selected="datePicker"/>
  <TypeSelectionDialog ref="typeSelectionDialogRef" :multiselect="false" @selected="typesSelected"/>
  </v-row>
</template>
<script>
import { ref, onMounted, onUnmounted } from '@vue/composition-api'
import i18n from '../i18n'
import * as typesStore from '../store/types'
import * as itemStore from '../store/item'
import * as attrStore from '../store/attributes'
import * as langStore from '../store/languages'
import * as errorStore from '../store/error'
import * as userStore from '../store/users'
import * as searchStore from '../store/search'
import * as lovsStore from '../store/lovs'
import * as channelsStore from '../store/channels'
import SearchSaveDialog from '../components/SearchSaveDialog'
import SearchLoadDialog from '../components/SearchLoadDialog'
import ItemsSelectionDialog from '../components/ItemsSelectionDialog'
import CollectionsSelectionDialog from '../components/CollectionsSelectionDialog'
import TypeSelectionDialog from '../components/TypeSelectionDialog'
import DatePickerDialog from '../components/DatePickerDialog'
import AttributeType from '../constants/attributeTypes'
import router from '../router'

export default {
  components: { SearchSaveDialog, SearchLoadDialog, ItemsSelectionDialog, CollectionsSelectionDialog, TypeSelectionDialog, DatePickerDialog },
  setup (props, { root }) {
    const { showError } = errorStore.useStore()

    const {
      loadAllTypes,
      findType
    } = typesStore.useStore()

    const {
      loadItemsByIds
    } = itemStore.useStore()

    const {
      loadByIdentifier,
      currentWhereRef,
      currentFilterRef,
      searchEntityRef,
      searchToOpenRef,
      selectedRef,
      lovsMapRef
    } = searchStore.useStore()

    const {
      languages,
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages
    } = langStore.useStore()

    const {
      loadAllAttributes,
      getAllItemsAttributes,
      findByIdentifier
    } = attrStore.useStore()

    const {
      currentUserRef,
      hasAccess
    } = userStore.useStore()

    const {
      getLOVData
    } = lovsStore.useStore()

    const { loadAllChannels, getAvailableChannels } = channelsStore.useStore()

    const itemSelectionDialogRef = ref(null)
    const collSelectionDialogRef = ref(null)
    const typeSelectionDialogRef = ref(null)
    const searchSaveDialogRef = ref(null)
    const searchLoadDialogRef = ref(null)
    const datePickerDialogRef = ref(null)
    const selectedFilterRef = ref(null)
    // const selectedRef = ref(null)
    const fieldsSelection = ref([])
    const extendedSearchRef = ref('{ "identifier": "???", ... }')

    async function searchSelected (selected) {
      if (!selected.extended && selected.whereClause && selected.whereClause.orAnd) selected.orAnd = selected.whereClause.orAnd
      if (!selected.orAnd) selected.orAnd = 1
      if (selected.filters) await updateFiltersLOVs(selected.filters)
      if (selected.user === currentUserRef.value.login) {
        selectedRef.value = selected
        router.push('/search/' + selected.identifier)
      } else {
        const name = {}
        name[currentLanguage.value.identifier] = i18n.t('SearchSaveDialog.NameNew')
        selectedRef.value = { identifier: '', name: name, filters: selected.filters, whereClause: selected.whereClause, extended: selected.extended, public: false, orAnd: selected.orAnd || 1 }
      }
      if (selected.extended) extendedSearchRef.value = JSON.stringify(selected.whereClause)
      searchEntityRef.value = selected.entity ? selected.entity : 'ITEM'
      searchLoadDialogRef.value.closeDialog()
    }

    function getLovItems (filter) {
      if (lovsMapRef.value[filter.attr] && Array.isArray(lovsMapRef.value[filter.attr])) {
        return lovsMapRef.value[filter.attr]
      } else if (lovsMapRef.value[filter.attr]) {
        getLOVData(lovsMapRef.value[filter.attr]).then(values => {
          lovsMapRef.value[filter.attr] = values.map(elem => {
            return { value: elem.id, text: elem.value[currentLanguage.value.identifier] || '[' + elem.value[defaultLanguageIdentifier.value] + ']' }
          })
          return lovsMapRef.value[filter.attr]
        })
      } else {
        return []
      }
    }

    function save () {
      searchSaveDialogRef.value.showDialog(selectedRef.value)
    }

    function load () {
      searchLoadDialogRef.value.showDialog()
    }

    function add (num) {
      if (num === 1) {
        if (!selectedRef.value.filters) root.$set(selectedRef.value, 'filters', [])
        selectedRef.value.filters.push({ type: 'attr', attr: null, operation: 1, value: '' })
      }
    }

    function remove () {
      selectedRef.value.filters.splice(selectedFilterRef.value, 1)
    }

    function search () {
      if (selectedRef.value.extended) {
        try {
          selectedRef.value.whereClause = JSON.parse(extendedSearchRef.value)
          searchEntityRef.value = 'ITEM'
          selectedRef.value.entity = searchEntityRef.value
          currentWhereRef.value = selectedRef.value.whereClause
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
        currentFilterRef.value = selectedRef.value.filters
        selectedRef.value.filters.forEach(filter => {
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
              data.channels[channelIdentifier][field][operation] = parseValue(null, filter.attr, filter.value, filter)
            } else if (filter.attr === '#level#') {
              data.path = {}
              data.path.OP_regexp = filter.path + '.*'
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
                data.values[attr][operation] = parseValue(attrObj ? attrObj.item : null, filter.attr, filter.value, filter)
              } else {
                const attr = filter.attr.substring(5, idx)
                const lang = filter.attr.substring(idx + 1)
                const attrObj = findByIdentifier(attr)
                data.values = {}
                data.values[attr] = {}
                data.values[attr][lang] = {}
                data.values[attr][lang][operation] = parseValue(attrObj ? attrObj.item : null, filter.attr, filter.value, filter)
              }
            } else {
              data[filter.attr] = {}
              data[filter.attr][operation] = parseValue(null, filter.attr, filter.value, filter, filter.date)
            }
            where[orAndOperation].push(data)
          }
        })
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

    function parseValue (attrObj, attr, value, filter) {
      if (filter.operation === 16) return [{ OP_eq: '' }, { OP_eq: null }]
      if (filter.operation === 17) return [{ OP_ne: '' }, { OP_ne: null }]
      if (filter.operation === 12 || filter.operation === 13 || filter.operation === 15) return '%' + parseSimpleValue(attrObj, attr, value) + '%'
      else if (filter.operation === 10) {
        const arr = []
        const split = ('' + value).split(/\r\n|\n|\r/)
        split.forEach(str => {
          arr.push(parseSimpleValue(attrObj, attr, str))
        })
        return arr
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

    /* function checkLOV (attr, val) {
      if (attr.lov) {
        getLOVData(attr.lov).then(values => {
          lovsMap[val] = values.map(elem => {
            return { value: elem.id, text: elem.value[currentLanguage.value.identifier] || '[' + elem.value[defaultLanguageIdentifier.value] + ']' }
          })
        })
      }
    } */

    function itemSelected (id, filter) {
      itemSelectionDialogRef.value.closeDialog()
      loadItemsByIds([id], false).then(items => {
        const item = items[0]
        filter.value = item.name[currentLanguage.value.identifier] || '[' + item.name[defaultLanguageIdentifier.value] + ']'
        filter.path = item.path
      })
    }

    function collectionSelected (collection, filter) {
      collSelectionDialogRef.value.closeDialog()
      filter.value = collection.id
      filter.path = collection.id
    }

    function typesSelected (id, filter) {
      typeSelectionDialogRef.value.closeDialog()
      filter.value = findType(parseInt(id)).node.identifier
    }

    function enterKeyListener (e) {
      if (e.ctrlKey && e.key === 'Enter') {
        search()
      }
    }

    function getDateType (filter) {
      const arrattr = fieldsSelection.value.find(elem => elem.value === filter.attr)
      return arrattr ? arrattr.type : null
    }

    function datePicker (id, filter) {
      datePickerDialogRef.value.closeDialog()
      filter.value = id
    }

    async function updateFiltersLOVs (filters) {
      for (let i = 0; i < filters.length; i++) {
        const filter = filters[i]
        if (lovsMapRef.value[filter.attr] && !Array.isArray(lovsMapRef.value[filter.attr])) {
          const values = await getLOVData(lovsMapRef.value[filter.attr])
          lovsMapRef.value[filter.attr] = values.map(elem => {
            return { value: elem.id, text: elem.value[currentLanguage.value.identifier] || '[' + elem.value[defaultLanguageIdentifier.value] + ']' }
          })
        }
      }
    }

    onMounted(() => {
      document.addEventListener('keypress', enterKeyListener)
      Promise.all([loadAllTypes(), loadAllLanguages(), loadAllAttributes(), loadAllChannels()]).then(async () => {
        const name = {}
        name[currentLanguage.value.identifier] = i18n.t('SearchSaveDialog.NameNew')
        if (!selectedRef.value) {
          selectedRef.value = { identifier: '', entity: 'ITEM', name: name, filters: [], whereClause: {}, extended: false, public: false, orAnd: 1 }
        }

        const arr = [
          { value: 'id', text: i18n.t('Item.id') },
          { value: 'identifier', text: i18n.t('Item.identifier') },
          { value: 'parentIdentifier', text: i18n.t('Item.parentIdentifier') },
          { value: 'typeIdentifier', text: i18n.t('Item.typeIdentifier') },
          { value: '#level#', text: i18n.t('Item.level') },
          { value: 'collectionId', text: i18n.t('Collections.Collection') },
          { value: 'createdBy', text: i18n.t('CreatedBy') },
          { value: 'createdAt', text: i18n.t('CreatedAt'), type: 'datetime' },
          { value: 'updatedBy', text: i18n.t('UpdatedBy') },
          { value: 'updatedAt', text: i18n.t('UpdatedAt'), type: 'datetime' },
          { value: 'fileOrigName', text: i18n.t('Item.fileOrigName') },
          { value: 'mimeType', text: i18n.t('Item.mimeType') }
        ]
        const channels = getAvailableChannels()
        for (let i = 0; i < channels.length; i++) {
          const channel = channels[i]
          arr.push({
            value: 'channel#' + channel.identifier + '#status',
            text: i18n.t('ColumnsSelection.ChannelStatus') + ' (' + i18n.t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')'
          })
          arr.push({
            value: 'channel#' + channel.identifier + '#submittedAt',
            text: i18n.t('ColumnsSelection.SubmittedAt') + ' (' + i18n.t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')',
            type: 'datetime'
          })
          arr.push({
            value: 'channel#' + channel.identifier + '#submittedBy',
            text: i18n.t('ColumnsSelection.SubmittedBy') + ' (' + i18n.t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')'
          })
          arr.push({
            value: 'channel#' + channel.identifier + '#syncedAt',
            text: i18n.t('ColumnsSelection.SyncedAt') + ' (' + i18n.t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')',
            type: 'datetime'
          })
          arr.push({
            value: 'channel#' + channel.identifier + '#message',
            text: i18n.t('ColumnsSelection.ChannelMessage') + ' (' + i18n.t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')'
          })
        }
        for (let i = 0; i < languages.length; i++) {
          const lang = languages[i]
          const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
          arr.push({ value: 'name#' + lang.identifier, text: i18n.t('Item.name') + langText })
        }
        const attrs = getAllItemsAttributes()
        for (let i = 0; i < attrs.length; i++) {
          const attr = attrs[i]
          const nameText = (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']')
          if (attr.languageDependent) {
            for (let i = 0; i < languages.length; i++) {
              const lang = languages[i]
              const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
              const val = 'attr#' + attr.identifier + '#' + lang.identifier
              arr.push({ value: val, text: attr.identifier + ' - ' + nameText + langText, lov: attr.lov })
              // checkLOV(attr, val)
            }
          } else {
            const val = 'attr#' + attr.identifier
            const data = { value: val, text: attr.identifier + ' - ' + nameText, lov: attr.lov }
            if (attr.type === AttributeType.Date) {
              data.type = 'date'
            } else if (attr.type === AttributeType.Time) {
              data.type = 'time'
            }
            arr.push(data)
            if (attr.lov && !lovsMapRef.value[val]) lovsMapRef.value[val] = attr.lov
          }
        }

        fieldsSelection.value = arr

        // process current route
        const id = router.currentRoute.params.id
        if (id) {
          loadByIdentifier(id).then(async data => {
            searchSelected(data)
          })
        } else {
          const tst = localStorage.getItem('search_to_open')
          if (tst) {
            localStorage.removeItem('search_to_open')
            searchToOpenRef.value = JSON.parse(tst)
          }
          if (searchToOpenRef.value) {
            searchToOpenRef.value.user = ''
            await searchSelected(searchToOpenRef.value)
            searchToOpenRef.value = null
            search()
          } else {
            const tst2 = localStorage.getItem('last_item_search')
            if (tst2) searchSelected(JSON.parse(tst2))
          }
        }
      })
    })

    onUnmounted(() => {
      document.removeEventListener('keypress', enterKeyListener)
    })

    return {
      getLovItems,
      getDateType,
      datePicker,
      typeSelectionDialogRef,
      typesSelected,
      searchSaveDialogRef,
      searchLoadDialogRef,
      selectedRef,
      selectedFilterRef,
      searchSelected,
      itemSelectionDialogRef,
      collSelectionDialogRef,
      datePickerDialogRef,
      itemSelected,
      collectionSelected,
      searchForKey,
      add,
      remove,
      save,
      load,
      search,
      extendedSearchRef,
      fieldsSelection,
      lovsMapRef,
      hasAccess,
      orAndSelection: [
        { text: i18n.t('Search.And'), value: 1 },
        { text: i18n.t('Search.Or'), value: 2 }
      ],
      statusSelection: [
        { text: i18n.t('ItemView.Channels.Submitted'), value: 1 },
        { text: i18n.t('ItemView.Channels.Synced'), value: 2 },
        { text: i18n.t('ItemView.Channels.Error'), value: 3 },
        { text: i18n.t('ItemView.Channels.Waiting'), value: 4 }
      ],
      operationSelection: [
        { text: i18n.t('Search.Filter.Operation.Eq'), value: 1 },
        { text: i18n.t('Search.Filter.Operation.Ne'), value: 2 },
        { text: i18n.t('Search.Filter.Operation.Gt'), value: 3 },
        { text: i18n.t('Search.Filter.Operation.Gte'), value: 4 },
        { text: i18n.t('Search.Filter.Operation.Lt'), value: 5 },
        { text: i18n.t('Search.Filter.Operation.Lte'), value: 6 },
        { text: i18n.t('Search.Filter.Operation.StartWith'), value: 7 },
        { text: i18n.t('Search.Filter.Operation.EndWith'), value: 8 },
        { text: i18n.t('Search.Filter.Operation.Substring'), value: 9 },
        { text: i18n.t('Search.Filter.Operation.NotSubstring'), value: 13 },
        { text: i18n.t('Search.Filter.Operation.List'), value: 10 },
        { text: i18n.t('Search.Filter.Operation.EqICase'), value: 11 },
        { text: i18n.t('Search.Filter.Operation.NotEqICase'), value: 14 },
        { text: i18n.t('Search.Filter.Operation.SubstringICase'), value: 12 },
        { text: i18n.t('Search.Filter.Operation.NotSubstringICase'), value: 15 },
        { text: i18n.t('Search.Filter.Operation.Empty'), value: 16 },
        { text: i18n.t('Search.Filter.Operation.NotEmpty'), value: 17 },
        { text: i18n.t('Search.Filter.Operation.Contains'), value: 18 }
      ]

    }
  }
}
</script>
