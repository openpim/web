<template>
    <v-row no-gutters v-if="hasAccess('search')">
    <v-col cols="12">
      <v-toolbar dense flat>
        <v-toolbar-title class="subtitle-2">{{ selectedRef && selectedRef.extended ? $t('Home.Search.TitleExtended') : $t('Home.Search.Title') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <!-- v-menu offset-y v-if="!selectedRef.extended">
          <template v-slot:activator="{ on }"><v-btn icon v-on="on" ><v-icon>mdi-plus</v-icon></v-btn></template>
          <v-list>
            <v-list-item @click="add(1)">
              <v-list-item-title>{{$t('Search.Filter.Attribute')}}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu -->
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
          <v-list-item v-for="(filter, i) in selectedRef.filters" :key="i" :three-line="filter.type === 'attr'">
            <v-list-item-icon><v-icon>{{filter.type === 'attr' ? 'mdi-alpha-a-box-outline' : ''}}</v-icon></v-list-item-icon>
            <v-list-item-content>
              <v-container class="pa-0">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-autocomplete dense v-model="filter.attr" :items="fieldsSelection" :label="$t('Search.Filter.Attribute.Attr')"></v-autocomplete>
                  </v-col>
                </v-row>

                <v-row no-gutters v-if="filter.attr !== '#level#'">
                  <v-col cols="12">
                    <v-select dense v-model="filter.operation" :items="operationSelection" :label="$t('Search.Filter.Attribute.Operation')"></v-select>
                  </v-col>
                </v-row>

                <v-row no-gutters v-if="filter.attr && !filter.attr.endsWith('#status')">
                  <v-col cols="12">
                    <template v-if="filter.attr === '#level#'">
                      <v-text-field dense readonly v-model="filter.value" :label="$t('Search.Filter.Attribute.Value')" required append-outer-icon="mdi-form-select" @click:append-outer="itemSelectionDialogRef.showDialog(filter)"></v-text-field>
                    </template>
                    <v-select v-if="filter.attr && filter.attr !== '#level#' && lovsMap[filter.attr]" dense v-model="filter.value" :items="lovsMap[filter.attr]" :label="$t('Search.Filter.Attribute.Value')"></v-select>
                    <v-text-field v-if="filter.operation !== 10 && filter.attr && filter.attr !== '#level#' && !lovsMap[filter.attr]" dense v-model="filter.value" :label="$t('Search.Filter.Attribute.Value')" required></v-text-field>
                    <v-textarea v-if="filter.operation === 10 && filter.attr && filter.attr !== '#level#' && !lovsMap[filter.attr]" dense v-model="filter.value" :label="$t('Search.Filter.Attribute.Value')" required></v-textarea>
                  </v-col>
                </v-row>

                <v-row no-gutters v-if="filter.attr && filter.attr.endsWith('#status')">
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
  <v-col cols="2" class="d-inline-flex justify-end align-center">
    <v-switch class="mt-0" dense hide-details v-if="selectedRef" v-model="selectedRef.extended"></v-switch>
  </v-col>
  <v-col cols="10" class="d-inline-flex justify-end align-center">
    <v-btn text @click="search" v-text="$t('Search.Find')" class="mr-2"></v-btn>
  </v-col>
  <SearchSaveDialog ref="searchSaveDialogRef" ></SearchSaveDialog>
  <SearchLoadDialog ref="searchLoadDialogRef" @selected="searchSelected"></SearchLoadDialog>
  <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemSelected"/>
  </v-row>
</template>
<script>
import { ref, onMounted } from '@vue/composition-api'
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
import router from '../router'

export default {
  components: { SearchSaveDialog, SearchLoadDialog, ItemsSelectionDialog },
  setup (props, context) {
    const { showError } = errorStore.useStore()

    const {
      loadAllTypes
    } = typesStore.useStore()

    const {
      currentWhereRef,
      loadItemsByIds
    } = itemStore.useStore()

    const {
      loadByIdentifier,
      searchToOpenRef
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

    const { loadAllChannels, getAwailableChannels } = channelsStore.useStore()

    const itemSelectionDialogRef = ref(null)
    const searchSaveDialogRef = ref(null)
    const searchLoadDialogRef = ref(null)
    const selectedFilterRef = ref(null)
    const selectedRef = ref(null)
    const fieldsSelection = ref([])
    const extendedSearchRef = ref('{ "identifier": "???", ... }')
    const lovsMap = {}

    function searchSelected (selected) {
      if (selected.user === currentUserRef.value.login) {
        selectedRef.value = selected
        router.push('/search/' + selected.identifier)
      } else {
        const name = {}
        name[currentLanguage.value.identifier] = i18n.t('SearchSaveDialog.NameNew')
        selectedRef.value = { identifier: '', name: name, filters: selected.filters, whereClause: selected.whereClause, extended: selected.extended, public: false }
      }
      if (selected.extended) extendedSearchRef.value = JSON.stringify(selected.whereClause)
      searchLoadDialogRef.value.closeDialog()
    }

    function save () {
      searchSaveDialogRef.value.showDialog(selectedRef.value)
    }

    function load () {
      searchLoadDialogRef.value.showDialog()
    }

    function add (num) {
      if (num === 1) {
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
          currentWhereRef.value = selectedRef.value.whereClause
        } catch (err) {
          console.error(err)
          showError(i18n.t('Search.Extended.Error') + err.message)
        }
      } else {
        const where = { OP_and: [] }

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
              data.name[lang][operation] = filter.value
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
              data[filter.attr][operation] = parseValue(null, filter.attr, filter.value, filter)
            }
            where.OP_and.push(data)
          }
        })
        currentWhereRef.value = where
      }
    }

    function parseValue (attrObj, attr, value, filter) {
      if (filter.operation === 12) return '%' + parseSimpleValue(attrObj, attr, value) + '%'
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
      if (lovsMap[attr]) return '' + value

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
        return isNaN(value) ? value : parseFloat(value)
      }
    }

    function checkLOV (attr, val) {
      if (attr.lov) {
        getLOVData(attr.lov).then(values => {
          lovsMap[val] = values.map(elem => {
            return { value: elem.id, text: elem.value[currentLanguage.value.identifier] || '[' + elem.value[defaultLanguageIdentifier.value] + ']' }
          })
        })
      }
    }

    function itemSelected (id, filter) {
      itemSelectionDialogRef.value.closeDialog()
      loadItemsByIds([id], false).then(items => {
        const item = items[0]
        filter.value = item.name[currentLanguage.value.identifier] || '[' + item.name[defaultLanguageIdentifier.value] + ']'
        filter.path = item.path
      })
    }

    onMounted(() => {
      Promise.all([loadAllTypes(), loadAllLanguages(), loadAllAttributes(), loadAllChannels()]).then(() => {
        const name = {}
        name[currentLanguage.value.identifier] = i18n.t('SearchSaveDialog.NameNew')
        selectedRef.value = { identifier: '', name: name, filters: [], whereClause: {}, extended: false, public: false }

        const arr = [
          { value: 'id', text: i18n.t('Item.id') },
          { value: 'identifier', text: i18n.t('Item.identifier') },
          { value: 'parentIdentifier', text: i18n.t('Item.parentIdentifier') },
          { value: 'typeIdentifier', text: i18n.t('Item.typeIdentifier') },
          { value: '#level#', text: i18n.t('Item.level') },
          { value: 'createdBy', text: i18n.t('CreatedBy') },
          { value: 'createdAt', text: i18n.t('CreatedAt') },
          { value: 'updatedBy', text: i18n.t('UpdatedBy') },
          { value: 'updatedAt', text: i18n.t('UpdatedAt') },
          { value: 'fileOrigName', text: i18n.t('Item.fileOrigName') },
          { value: 'mimeType', text: i18n.t('Item.mimeType') }
        ]
        const channels = getAwailableChannels()
        for (let i = 0; i < channels.length; i++) {
          const channel = channels[i]
          arr.push({
            value: 'channel#' + channel.identifier + '#status',
            text: i18n.t('ColumnsSelection.ChannelStatus') + ' (' + i18n.t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')'
          })
          arr.push({
            value: 'channel#' + channel.identifier + '#submittedAt',
            text: i18n.t('ColumnsSelection.SubmittedAt') + ' (' + i18n.t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')'
          })
          arr.push({
            value: 'channel#' + channel.identifier + '#submittedBy',
            text: i18n.t('ColumnsSelection.SubmittedBy') + ' (' + i18n.t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')'
          })
          arr.push({
            value: 'channel#' + channel.identifier + '#syncedAt',
            text: i18n.t('ColumnsSelection.SyncedAt') + ' (' + i18n.t('ColumnsSelection.Channel') + (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']') + ')'
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
              arr.push({ value: val, text: nameText + langText, lov: attr.lov })
              checkLOV(attr, val)
            }
          } else {
            const val = 'attr#' + attr.identifier
            arr.push({ value: val, text: nameText, lov: attr.lov })
            if (attr.lov) lovsMap[val] = attr.lov
            checkLOV(attr, val)
          }
        }

        fieldsSelection.value = arr

        // process current route
        const id = router.currentRoute.params.id
        if (id) {
          loadByIdentifier(id).then(data => searchSelected(data))
        } else {
          const tst = localStorage.getItem('search_to_open')
          if (tst) {
            localStorage.removeItem('search_to_open')
            searchToOpenRef.value = JSON.parse(tst)
          }
          if (searchToOpenRef.value) {
            searchToOpenRef.value.user = ''
            searchSelected(searchToOpenRef.value)
            searchToOpenRef.value = null
            search()
          }
        }
      })
    })

    return {
      searchSaveDialogRef,
      searchLoadDialogRef,
      selectedRef,
      selectedFilterRef,
      searchSelected,
      itemSelectionDialogRef,
      itemSelected,
      add,
      remove,
      save,
      load,
      search,
      extendedSearchRef,
      fieldsSelection,
      lovsMap,
      hasAccess,
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
        { text: i18n.t('Search.Filter.Operation.List'), value: 10 },
        { text: i18n.t('Search.Filter.Operation.EqICase'), value: 11 },
        { text: i18n.t('Search.Filter.Operation.SubstringICase'), value: 12 }
      ]

    }
  }
}
</script>
