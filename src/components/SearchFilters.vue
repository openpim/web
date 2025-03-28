<template>
  <v-row>
    <v-col cols="12">
      <v-input
          v-if="localSelectedRef && localSelectedRef.identifier && localSelectedRef.identifier.length"
          class="mx-4 mb-0 py-0"
          append-icon="mdi-close"
          @click:append="clearSelectedRef"
        >
        {{ localSelectedRef.name[currentLanguage.identifier] || localSelectedRef.name[defaultLanguageIdentifier.identifier] }}
      </v-input>
      <v-toolbar dense flat>
        <v-toolbar-title class="subtitle-2">{{ localSelectedRef && localSelectedRef.extended ? $t('Home.Search.TitleExtended') : '' }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon v-if="localSelectedRef && !localSelectedRef.extended" @click="add(1)"><v-icon>mdi-plus</v-icon></v-btn>
        <v-btn icon v-if="localSelectedRef && !localSelectedRef.extended" @click="remove" :disabled="selectedFilterRef == null"><v-icon>mdi-minus</v-icon></v-btn>
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
      <v-list nav dense class="ma-0" v-if="localSelectedRef && !localSelectedRef.extended">
        <v-list-item-group v-model="selectedFilterRef" color="primary">
          <v-list-item v-for="(filter, i) in localSelectedRef.filters" :key="i" :value="i" :three-line="filter.type === 'attr'">
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
                      <v-card class="mb-5">
                        <v-card-title class="subtitle-2 font-weight-bold" >
                          <div class="mr-3">{{ $t('Search.Levels') }}</div>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                              <v-btn icon v-on="on" @click="itemSelectionDialogRef.showDialog(filter)"><v-icon>mdi-plus</v-icon></v-btn>
                            </template>
                            <span>{{ $t('Add') }}</span>
                          </v-tooltip>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                              <v-btn icon v-on="on" @click="removeVisible(filter)" :disabled="visibleSelectedRef == null"><v-icon>mdi-minus</v-icon></v-btn>
                            </template>
                            <span>{{ $t('Remove') }}</span>
                          </v-tooltip>
                        </v-card-title>
                        <v-divider></v-divider>
                        <v-list dense class="pt-0 pb-0">
                          <v-list-item-group v-model="visibleSelectedRef" color="primary">
                            <v-list-item dense class="pt-0 pb-0"  v-for="(item, i) in filter.visible" :key="i">
                              <v-list-item-content style="display: inline">
                                <router-link :to="'/item/' + item.identifier">{{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</router-link>
                              </v-list-item-content>
                            </v-list-item>
                          </v-list-item-group>
                        </v-list>
                      </v-card>
                    </template>
                    <template v-if="filter.attr === 'collectionId'">
                      <v-text-field dense readonly v-model="filter.value" :label="$t('Search.Filter.Attribute.Value')" required append-outer-icon="mdi-form-select" @click:append-outer="collSelectionDialogRef.showDialog(false, filter)"></v-text-field>
                    </template>
                    <RelationAttributeSearchComponent v-if="filter.operation !== 10 && filter.attr && filter.attr !== '#level#' && filter.attr !== 'collectionId' && getAttrType(filter) === AttributeType.Relation" :operation="filter.operation" :attrIdentifier="getAttrIdentifier(filter)" v-model="filter.value" />
                    <v-autocomplete v-if="filter.attr && filter.attr !== '#level#' && filter.attr !== 'collectionId' && lovsMapRef[filter.attr]" dense v-model="filter.value" :items="getLovItems(filter)" :label="$t('Search.Filter.Attribute.Value')"></v-autocomplete>
                    <v-text-field v-if="(filter.operation !== 10 && filter.operation !== 16 && filter.operation !== 17) && filter.attr && filter.attr !== '#level#' && filter.attr !== 'collectionId' && filter.attr !== 'typeIdentifier' && !getDateType(filter) && !lovsMapRef[filter.attr] && getAttrType(filter) !== AttributeType.Relation" dense v-model="filter.value" :label="$t('Search.Filter.Attribute.Value')" required></v-text-field>
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
      <v-textarea v-if="localSelectedRef && localSelectedRef.extended" class="ml-3 mr-3" v-model="extendedSearchRef" :label="$t('Search.Extended.Label')"></v-textarea>
    </v-col>
    <v-col cols="4" class="d-inline-flex justify-end align-center">
      <v-select v-if="localSelectedRef && !localSelectedRef.extended && localSelectedRef.filters && localSelectedRef.filters.length > 1" class="ml-5" dense v-model="localSelectedRef.orAnd" :items="orAndSelection"></v-select>
    </v-col>
    <v-col cols="8" class="d-inline-flex justify-end align-center">
      <v-switch class="mt-0 mr-4" dense hide-details v-if="localSelectedRef" v-model="localSelectedRef.extended"></v-switch>
    </v-col>
    <SearchSaveDialog ref="searchSaveDialogRef" :modelValue="modelValue"></SearchSaveDialog>
    <SearchLoadDialog ref="searchLoadDialogRef" @selected="searchSelected"></SearchLoadDialog>
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemsSelected" />
    <CollectionsSelectionDialog ref="collSelectionDialogRef" :editAccessOnly="true" @selected="collectionSelected" />
    <DatePickerDialog ref="datePickerDialogRef" @selected="datePicker" />
    <TypeSelectionDialog ref="typeSelectionDialogRef" :multiselect="false" @selected="typesSelected" />
  </v-row>
</template>

<script>
import { ref, onMounted, watch } from '@vue/composition-api'
import i18n from '../i18n'
import RelationAttributeSearchComponent from '../components/RelationAttributeSearch.vue'
import SearchSaveDialog from '../components/SearchSaveDialog'
import SearchLoadDialog from '../components/SearchLoadDialog'
import ItemsSelectionDialog from '../components/ItemsSelectionDialog'
import CollectionsSelectionDialog from '../components/CollectionsSelectionDialog'
import TypeSelectionDialog from '../components/TypeSelectionDialog'
import DatePickerDialog from '../components/DatePickerDialog'
import AttributeType from '../constants/attributeTypes'
import * as typesStore from '../store/types'
import * as itemStore from '../store/item'
import * as attrStore from '../store/attributes'
import * as langStore from '../store/languages'
import * as userStore from '../store/users'
import * as searchStore from '../store/search'
import * as lovsStore from '../store/lovs'
import * as channelsStore from '../store/channels'
import router from '../router'

export default {
  name: 'SearchFilters',
  components: { SearchSaveDialog, SearchLoadDialog, ItemsSelectionDialog, CollectionsSelectionDialog, TypeSelectionDialog, DatePickerDialog, RelationAttributeSearchComponent },
  props: {
    modelValue: {
      type: Object,
      required: false,
      default: null
    }
  },
  setup (props, { emit, root }) {
    const {
      loadAllTypes,
      findType
    } = typesStore.useStore()

    const {
      loadItemsByIds
    } = itemStore.useStore()

    const {
      loadByIdentifier,
      searchToOpenRef,
      searchEntityRef,
      lovsMapRef,
      currentWhereRef,
      selectedRef
    } = searchStore.useStore()

    const {
      languages,
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages
    } = langStore.useStore()

    const {
      loadAllAttributes,
      getAllItemsAttributes
    } = attrStore.useStore()

    const {
      currentUserRef
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
    const visibleSelectedRef = ref(null)
    const selectedFilterRef = ref(null)
    const fieldsSelection = ref([])
    const extendedSearchRef = ref('{ "identifier": "???", ... }')
    const localSelectedRef = ref({})

    async function searchSelected (selected) {
      if (!selected.extended && selected.whereClause && selected.whereClause.orAnd) selected.orAnd = selected.whereClause.orAnd
      if (!selected.orAnd) selected.orAnd = 1
      if (selected.filters) await updateFiltersLOVs(selected.filters)
      if (selected.user === currentUserRef.value.login) {
        localSelectedRef.value = selected
        if (!props?.modelValue) router.push('/search/' + selected.identifier)
      } else {
        const name = {}
        name[currentLanguage.value.identifier] = i18n.t('SearchSaveDialog.NameNew')
        localSelectedRef.value = { identifier: '', name: name, filters: selected.filters, whereClause: selected.whereClause, extended: selected.extended, public: false, orAnd: selected.orAnd || 1 }
      }
      if (selected.extended) extendedSearchRef.value = JSON.stringify(selected.whereClause)
      searchEntityRef.value = selected.entity ? selected.entity : 'ITEM'
      selectedRef.value = localSelectedRef.value
      searchLoadDialogRef.value.closeDialog()
    }

    function add (num) {
      if (num === 1) {
        if (!localSelectedRef.value.filters) root.$set(localSelectedRef.value, 'filters', [])
        localSelectedRef.value.filters.push({ type: 'attr', attr: null, operation: 1, value: '' })
      }
    }

    function remove () {
      localSelectedRef.value.filters.splice(selectedFilterRef.value, 1)
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
      searchSaveDialogRef.value.showDialog(localSelectedRef.value)
    }

    function load () {
      searchLoadDialogRef.value.showDialog()
    }

    function getAttrIdentifier (filter) {
      return filter.attr.substring(5)
    }

    function getDateType (filter) {
      const arrattr = fieldsSelection.value.find(elem => elem.value === filter.attr)
      return arrattr ? arrattr.type : null
    }

    function getAttrType (filter) {
      const arrattr = fieldsSelection.value.find(elem => elem.value === filter.attr)
      return arrattr ? arrattr.typeId : null
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
        if (filter.attr === '#level#' && !Array.isArray(filter.path)) {
          filter.path = [filter.path]
        }
        if (filter.attr === '#level#') {
          loadItemsByIds(filter.path, false).then(items => {
            filter.visible = []
            items.forEach((item, index) => {
              if (index === 0) {
                visibleSelectedRef.value = item
              }
              filter.visible.push(item)
            })
            filter.value = filter.visible.map(item =>
              item.name[currentLanguage.value.identifier] ||
              '[' + item.name[defaultLanguageIdentifier.value] + ']'
            )
            filter.path = filter.visible.map(item => item.id)
          })
        }
      }
    }

    function itemsSelected (id, filter) {
      itemSelectionDialogRef.value.closeDialog()
      loadItemsByIds([id], false).then(items => {
        if (!filter.visible) filter.visible = []
        const item = items[0]
        visibleSelectedRef.value = item
        filter.visible.push(item)
        filter.value = filter.visible.map(item => item.name[currentLanguage.value.identifier] || '[' + item.name[defaultLanguageIdentifier.value] + ']')
        filter.path = filter.visible.map(item => item.id)
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

    function removeVisible (filter) {
      if (visibleSelectedRef.value !== -1) filter.visible.splice(visibleSelectedRef.value, 1)
      visibleSelectedRef.value = null
      filter.path = filter.visible.map(item => item.id)
      filter.value = filter.visible.map(item => item.name[currentLanguage.value.identifier] || '[' + item.name[defaultLanguageIdentifier.value] + ']')
    }

    function clearSelectedRef () {
      const name = {}
      name[currentLanguage.value.identifier] = i18n.t('SearchSaveDialog.NameNew')
      const defaultObj = { identifier: '', entity: searchEntityRef.value, name: {}, filters: [], whereClause: {}, extended: false, public: false, orAnd: 1 }
      currentWhereRef.value = null
      selectedRef.value = defaultObj
      localSelectedRef.value = defaultObj
      if (!props?.modelValue) router.push('/search')
    }

    onMounted(() => {
      Promise.all([loadAllTypes(), loadAllLanguages(), loadAllAttributes(), loadAllChannels()]).then(async () => {
        const name = {}
        name[currentLanguage.value.identifier] = i18n.t('SearchSaveDialog.NameNew')
        if (!selectedRef.value) {
          localSelectedRef.value = { identifier: '', entity: 'ITEM', name: name, filters: [], whereClause: {}, extended: false, public: false, orAnd: 1 }
        }

        if (props.modelValue) {
          localSelectedRef.value = props.modelValue
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
            const data = { value: val, text: attr.identifier + ' - ' + nameText, lov: attr.lov, typeId: attr.type }
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
        emit('updateData', arr)

        // process current route
        if (!props?.modelValue) {
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
            } else {
              const tst2 = localStorage.getItem('last_item_search')
              if (tst2) searchSelected(JSON.parse(tst2))
            }
          }
        }
      })
    })

    watch(
      () => props.modelValue,
      (newVal) => {
        if (newVal) {
          localSelectedRef.value = newVal
        }
      },
      { immediate: true, deep: true }
    )

    return {
      currentWhereRef,
      currentLanguage,
      visibleSelectedRef,
      removeVisible,
      getAttrIdentifier,
      getAttrType,
      AttributeType,
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
      itemsSelected,
      collectionSelected,
      add,
      remove,
      save,
      load,
      extendedSearchRef,
      localSelectedRef,
      fieldsSelection,
      lovsMapRef,
      clearSelectedRef,
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
