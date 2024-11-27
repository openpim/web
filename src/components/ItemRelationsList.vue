<template>
<div v-if="sourceRelations && targetRelations"> <!-- this is necessary to refrech computed itemRelations right way -->
  <v-row v-if="groupRelationsRef" justify="space-around">
    <v-col cols="12">
      <v-sheet elevation="0" class="pt-3 pl-4">
        <v-chip-group v-model="selectedGroupRef" mandatory active-class="primary--text">
          <v-chip v-for="(group, i) in groupsRef" :key="'G'+i">{{ group.name }}</v-chip>
        </v-chip-group>
      </v-sheet>
    </v-col>
  </v-row>

  <v-expansion-panels popout multiple focusable v-model="panels" class="mt-3">
    <template v-for="(rel, identifier, i) in itemRelations">
    <h5 style="flex: 1 0 100%; max-width: calc(100% - 32px);" :class="getOption(identifier, 'class', '')" :style="getOption(identifier, 'style', '')" :key="'T'+i" v-if="!groupRelationsRef && getOption(identifier, 'title', null)">{{getOption(identifier, 'title', null)}}</h5>
    <v-expansion-panel @change="panelChanged(i, identifier)" :key="i" :class="getOption(identifier, 'title', null) ? '' : getOption(identifier, 'class', '')" :style="getOption(identifier, 'title', null) ? '' : getOption(identifier, 'style', '')">
      <v-expansion-panel-header class="pb-0">{{ getRelationName(identifier) }} ({{ componentType === 'source' ? sourceRelationsTotal[identifier] : targetRelationsTotal[identifier]}})</v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-simple-table dense :key="'panel'+relationsRefreshKeys[identifier]">
            <template v-slot:default>
              <thead>
                <tr>
                  <th v-if="getOption(identifier, 'hideIdentifier', '') !== 'true'" class="text-left">{{$t('ItemRelationsList.Identifier')}}</th>

                  <th></th>

                  <th class="text-left" v-if="componentType === 'source'">{{$t('ItemRelationsList.Target')}}</th>
                  <th class="text-left" v-if="componentType === 'target'">{{$t('ItemRelationsList.Source')}}</th>

                  <th class="text-left" v-if="componentType === 'source' && getOption(identifier, 'showItemUpdateDate', '') === 'true'" >{{$t('ItemRelationsList.TargetDate')}}</th>
                  <th class="text-left" v-if="componentType === 'target' && getOption(identifier, 'showItemUpdateDate', '') === 'true'">{{$t('ItemRelationsList.SourceDate')}}</th>

                  <th class="text-left pa-0" v-for="(attr, j) in getAttributesForRelation(identifier)" :key="'A'+j" :width="getOption2(attr, 'tableWidth', '')">
                    <div>{{attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'}}</div>
                    <input v-if="!attr.lov && attr.type !== 2" type="text" style="border: solid; border-color: grey; border-width: 1px" v-model="attr['IRfilter'+identifier]" @input="filterChanged(identifier, attr)"/>
                    <v-autocomplete v-if="attr.lov && attr.type !== 2" v-model="attr['IRfilter'+identifier]" :items="getLOVItems(attr.lov)" dense clearable class="ml-2 mr-2" @input="filterChanged(identifier, attr)"></v-autocomplete>
                    <!-- skip type = 2 (boolean) for now because data can be true, false, empty and also the control should have ability to show not filter
                      all this is impossible to make with usual checkbox -->
                  </th>
                  <th class="text-left">
                    <v-tooltip top v-if="canEditItemRelationByIdentifier(identifier)">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" class="pa-0" icon color="primary" @click="add(identifier)"><v-icon dark>mdi-plus</v-icon></v-btn>
                      </template>
                      <span>{{ $t('Add') }}</span>
                    </v-tooltip>
                    <v-tooltip top v-if="canEditItemRelationByIdentifier(identifier)">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" class="pa-0" icon color="primary" @click="saveAllTab(identifier)"><v-icon dark>mdi-content-save-outline</v-icon></v-btn>
                      </template>
                      <span>{{ $t('Save') }}</span>
                    </v-tooltip>
                    <v-tooltip top v-if="canEditItemRelationByIdentifier(identifier)">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" class="pa-0" icon color="primary" @click="removeAllTab(identifier)"><v-icon dark>mdi-minus</v-icon></v-btn>
                      </template>
                      <span>{{ $t('Remove') }}</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" class="pa-0" icon color="primary" @click="pageSize = 5;pageSizeChanged(identifier)"><v-icon dark>mdi-alpha-r</v-icon></v-btn>
                      </template>
                      <span>{{ $t('ItemRelationsList.ResetPageSize') }}</span>
                    </v-tooltip>
                    <AfterButtonsComponent :item="item" :componentType="componentType" :relationIdentifier="identifier"></AfterButtonsComponent>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(itemRel, j) in rel" :key="'T'+j" :set="canEditItemRelation = canEditItemRelationByIdentifier(identifier)">
                  <td v-if="getOption(identifier, 'hideIdentifier', '') !== 'true'" class="pa-1"><input v-model="itemRel.identifier" :placeholder="$t('ItemRelationsList.Identifier')" :disabled="itemRel.id > 0"></td>

                  <td class="d-inline-flex">
                    <a v-if="itemRel.item" target="_blank" :href="damUrl + 'asset/' + itemRel.item.id + '?inline=true&token=' + token" style="text-decoration: none">
                      <v-icon v-if="itemRel.item.fileOrigName && !itemRel.item.mimeType.startsWith('image/')">mdi-download-circle-outline</v-icon>
                      <v-img class="pa-0 ma-0" v-if="itemRel.item.fileOrigName && itemRel.item.mimeType.startsWith('image/')" max-width="5vw" max-height="5vh" :src="damUrl + 'asset/' + itemRel.item.id + '/thumb?token=' + token" contain></v-img>
                    </a>
                    <a v-if="itemRel.item && itemRel.item.fileOrigName && itemRel.item.mimeType.startsWith('image/')" :href="damUrl + 'asset/' + itemRel.item.id + '?token=' + token" class="ml-1" style="text-decoration: none"><v-icon class="mt-2" color="grey darken-1">mdi-download-circle-outline</v-icon></a>

                    <a  v-if="itemRel.target" target="_blank" :href="damUrl + 'asset/' + itemRel.target.id + '?inline=true&token=' + token" style="text-decoration: none">
                      <v-icon v-if="itemRel.target.fileOrigName && !itemRel.target.mimeType.startsWith('image/')">mdi-download-circle-outline</v-icon>
                      <v-img class="pa-0 ma-0" v-if="itemRel.target.fileOrigName && itemRel.target.mimeType.startsWith('image/')" max-width="5vw" max-height="5vh" :src="damUrl + 'asset/' + itemRel.target.id + '/thumb?token=' + token" contain></v-img>
                    </a>
                    <a v-if="itemRel.target && itemRel.target.fileOrigName && itemRel.target.mimeType.startsWith('image/')" :href="damUrl + 'asset/' + itemRel.target.id + '?token=' + token" class="ml-1" style="text-decoration: none"><v-icon class="mt-2" color="grey darken-1">mdi-download-circle-outline</v-icon></a>
                  </td>

                  <td class="pa-1">
                    <span v-if="componentType === 'source' && itemRel.target">
                      <template v-if="!getOption2(itemRel.target.type, 'hideIdentifier', false)">
                        <router-link :to="'/item/' + itemRel.target.identifier">{{ itemRel.target.identifier }}</router-link>
                        <span class="ml-2">- {{ itemRel.target.name[currentLanguage.identifier] || '[' + itemRel.target.name[defaultLanguageIdentifier] + ']' }}</span>
                      </template>
                      <template v-else>
                        <router-link :to="'/item/' + itemRel.target.identifier">{{ itemRel.target.name[currentLanguage.identifier] || '[' + itemRel.target.name[defaultLanguageIdentifier] + ']' }}</router-link>
                      </template>
                    </span>
                    <span v-if="componentType === 'target' && itemRel.item">
                      <template v-if="!getOption2(itemRel.item.type, 'hideIdentifier', false)">
                        <router-link :to="'/item/' + itemRel.item.identifier">{{ itemRel.item.identifier }}</router-link>
                        <span class="ml-2">- {{ itemRel.item.name[currentLanguage.identifier] || '[' + itemRel.item.name[defaultLanguageIdentifier] + ']' }}</span>
                      </template>
                      <template v-else>
                        <router-link :to="'/item/' + itemRel.item.identifier">{{ itemRel.item.name[currentLanguage.identifier] || '[' + itemRel.item.name[defaultLanguageIdentifier] + ']' }}</router-link>
                      </template>
                    </span>
                    <v-tooltip top v-if="canEditItemRelation">
                      <template v-slot:activator="{ on }">
                      <v-btn v-on="on" class="pa-0 inline" icon @click="select(identifier, itemRel)"><v-icon dark>mdi-form-select</v-icon></v-btn>
                      </template>
                      <span>{{ $t('Select') }}</span>
                    </v-tooltip>
                  </td>
                  <td class="pa-1" v-if="getOption(identifier, 'showItemUpdateDate', '') === 'true'">
                    <span v-if="componentType === 'source' && itemRel.target">
                      {{  itemRel.target.updatedAt ? dateFormat(new Date(itemRel.target.updatedAt), DATE_FORMAT) : '' }}
                    </span>
                    <span v-if="componentType === 'target' && itemRel.item">
                      {{  itemRel.item.updatedAt ? dateFormat(new Date(itemRel.item.updatedAt), DATE_FORMAT) : '' }}
                    </span>
                  </td>
                  <td class="text-left pa-0" v-for="(attr, idx) in getAttributesForRelation(identifier)" :key="'attr'+idx">
                    <AttributeValue @input="attrChange(itemRel, attr, identifier)" :item="item" :attr="attr" :values="itemRel.values" :dense="true" :inTableView="false"></AttributeValue>
                  </td>
                  <td class="pa-1">
                    <v-tooltip top v-if="canEditItemRelation">
                      <template v-slot:activator="{ on }">
                        <template v-if="changedRelations.includes(itemRel.id)">
                          <v-btn v-on="on" color="primary" class="pa-0 inline" icon @click="save(identifier, itemRel.id)"><v-icon large dark>mdi-content-save</v-icon></v-btn>
                        </template>
                        <template v-else>
                          <v-btn v-on="on" class="pa-0 inline" icon @click="save(identifier, itemRel.id)"><v-icon dark>mdi-content-save-outline</v-icon></v-btn>
                        </template>
                      </template>
                      <span>{{ $t('Save') }}</span>
                    </v-tooltip>
                    <v-tooltip top v-if="canEditItemRelation">
                      <template v-slot:activator="{ on }">
                      <v-btn v-on="on" class="pa-0 inline" icon @click="remove(identifier, itemRel.id)"><v-icon dark>mdi-minus</v-icon></v-btn>
                      </template>
                      <span>{{ $t('Remove') }}</span>
                    </v-tooltip>
                    <SystemInformation :data="itemRel"></SystemInformation>
                    <v-tooltip top v-if="hasAccess('audit') && auditEnabled">
                      <template v-slot:activator="{ on }">
                      <v-btn v-on="on" class="pa-0 inline" icon @click="showHistory(itemRel)"><v-icon dark>mdi-history</v-icon></v-btn>
                      </template>
                      <span>{{ $t('ItemView.Tab.Audit') }}</span>
                    </v-tooltip>
                    <AfterButtonsComponentForItemRelation :itemRel="itemRel" :item="item" :componentType="componentType" :relationIdentifier="identifier"></AfterButtonsComponentForItemRelation>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
          <v-container class="pa-0" v-if="componentType === 'source' ? sourceRelationsTotal[identifier] > pageSize : targetRelationsTotal[identifier] > pageSize">
            <v-row>
              <v-col cols="2">
                <v-text-field type="number" v-model="pageSize" :label="$t('ItemRelationsList.RowsPerPage')" required :rules="[required, pageSizePositive]" @input="pageSizeChanged(identifier)"></v-text-field>
              </v-col>
              <v-col cols="2" class="mt-5">
                <span>{{ $t('ItemRelationsList.TotalRows') + ' ' + (componentType === 'source' ? sourceRelationsTotal[identifier] : targetRelationsTotal[identifier])}}</span>
              </v-col>
              <v-col cols="8">
                <template v-if="pageSize && pageSize !== '0'">
                  <v-pagination @input="pageChanged(identifier)" v-if="componentType === 'source' && Math.ceil(sourceRelationsTotal[identifier]/pageSize)>1" v-model="pagesSource[identifier]" :length="Math.ceil(sourceRelationsTotal[identifier]/pageSize)"></v-pagination>
                  <v-pagination @input="pageChanged(identifier)" v-if="componentType === 'target' && Math.ceil(targetRelationsTotal[identifier]/pageSize)>1" v-model="pagesTarget[identifier]" :length="Math.ceil(targetRelationsTotal[identifier]/pageSize)"></v-pagination>
                </template>
              </v-col>
            </v-row>
          </v-container>
      </v-expansion-panel-content>
    </v-expansion-panel>
    </template>
  </v-expansion-panels>
  <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemsSelected"/>
    <template v-if="auditEnabled">
      <v-row justify="center">
        <v-dialog v-model="historyDialogRef" max-width="90%">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('ItemView.Tab.Audit') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <HistoryTable ref="historyTableRef" :item="historySelectedRef" componentType="itemRelation"></HistoryTable>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="historyDialogRef = false">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
</div>
</template>
<script>
import { ref, reactive, watch, computed, onMounted } from '@vue/composition-api'
import * as actionsStore from '../store/actions'
import * as auditStore from '../store/audit'
import * as errorStore from '../store/error'
import * as itemRelStore from '../store/itemRelations'
import * as itemStore from '../store/item'
import * as langStore from '../store/languages'
import * as relStore from '../store/relations'
import * as typesStore from '../store/types'
import * as lovsStore from '../store/lovs'
import ItemsSelectionDialog from './ItemsSelectionDialog'
import i18n from '../i18n'
import * as userStore from '../store/users'
import AttributeValue from './AttributeValue'
import AttributeType from '../constants/attributeTypes'
import SystemInformation from './SystemInformation'
import HistoryTable from '../components/HistoryTable'
import dateFormat from 'dateformat'
import router from '../router'

import AfterButtonsComponent from '../_customizations/relations/list/afterButtons/AfterButtonsComponent'
import AfterButtonsComponentForItemRelation from '../_customizations/relations/list/afterButtons/AfterButtonsComponentForItemRelation'

export default {
  components: { ItemsSelectionDialog, AttributeValue, SystemInformation, HistoryTable, AfterButtonsComponent, AfterButtonsComponentForItemRelation },
  props: {
    item: {
      required: true
    },
    componentType: { // source or target
      required: true
    },
    itemRefreshFunction: {
      required: true
    }
  },
  setup (props, { emit, root }) {
    const {
      showError,
      showInfo
    } = errorStore.useStore()

    const { auditEnabled } = auditStore.useStore()

    const {
      canEditItemRelation,
      hasAccess
    } = userStore.useStore()

    const {
      relations,
      loadAllRelations
    } = relStore.useStore()

    const {
      actions
    } = actionsStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadSourceRelations,
      loadTargetRelations,
      loadSourcePage,
      loadTargetPage,
      sourceRelations,
      targetRelations,
      sourceRelationsTotal,
      targetRelationsTotal,
      identifierExists,
      saveItemRelation,
      removeItemRelation,
      getAttributesForRelationId
    } = itemRelStore.useStore()

    const {
      loadItemsByIds,
      loadItemByIdentifier,
      nextId
    } = itemStore.useStore()

    const {
      findType,
      loadAllTypes
    } = typesStore.useStore()

    const {
      getLOVData
    } = lovsStore.useStore()

    const pageSize = ref(localStorage.getItem('relPageSize') ? parseInt(localStorage.getItem('relPageSize')) : 5)
    const itemSelectionDialogRef = ref(null)
    const historyDialogRef = ref(false)
    const historySelectedRef = ref(null)

    const pagesSource = reactive({})
    const pagesTarget = reactive({})
    const panels = ref([])

    const groupRelationsRef = ref(false)
    const groupsRef = ref([])
    const selectedGroupRef = ref(null)

    const lovsMap = {}
    const relationsRefreshKeys = reactive({})

    watch(() => props.item, (newValue, previousValue) => {
      const type = findType(newValue.typeId)?.node
      if (type) {
        const tst = type.options.find(option => option.name === 'groupRelations')
        groupRelationsRef.value = tst && tst.value === 'true'
      }

      currentFilter = {}
      if (props.componentType === 'source') {
        loadSourceRelations(newValue, root, 0, pageSize.value).then(() => {
          emit('dataLoaded', sourceRelations)

          for (const identifier in sourceRelationsTotal) {
            root.$set(pagesSource, identifier, 1)
            root.$set(relationsRefreshKeys, identifier, 1)
          }
          calculateGroups()
        })
      } else {
        loadTargetRelations(newValue, root, 0, pageSize.value).then(() => {
          emit('dataLoaded', targetRelations)

          for (const identifier in targetRelationsTotal) {
            root.$set(pagesTarget, identifier, 1)
            root.$set(relationsRefreshKeys, identifier, 1)
          }
          calculateGroups()
        })
      }
    })

    function pageSizeChanged (identifier) {
      if (pageSize.value > 0) {
        if (props.componentType === 'source') pagesSource[identifier] = 1
        else pagesTarget[identifier] = 1
        pageChanged(identifier)
        localStorage.setItem('relPageSize', pageSize.value)
      }
    }

    function pageChanged (identifier) {
      const newPage = props.componentType === 'source' ? pagesSource[identifier] : pagesTarget[identifier]
      const offset = (newPage - 1) * pageSize.value

      if (props.componentType === 'source') {
        loadSourcePage(props.item, root, identifier, offset, pageSize.value, currentFilter[identifier] && Object.getOwnPropertyNames(currentFilter[identifier]).length !== 0 ? { values: currentFilter[identifier] } : null)
      } else {
        loadTargetPage(props.item, root, identifier, offset, pageSize.value, currentFilter[identifier] && Object.getOwnPropertyNames(currentFilter[identifier]).length !== 0 ? { values: currentFilter[identifier] } : null)
      }
    }

    function reloadRelation (relationId) {
      const rel = relations.find(rel => rel.id === relationId)
      if (rel) {
        if (getOption2(rel, 'reloadItemOnUpdate', false)) props.itemRefreshFunction()
        pageChanged(rel.identifier)
      }
    }

    const itemRelations = computed(() => {
      const relations = props.componentType === 'source' ? sourceRelations : targetRelations
      if (groupRelationsRef.value && selectedGroupRef.value !== null) {
        const group = groupsRef.value[selectedGroupRef.value]
        const filtered = Object.keys(relations).filter(key => group.relations.includes(key)).reduce((obj, key) => { obj[key] = relations[key]; return obj }, {})
        return filtered
      } else {
        return relations
      }
    })

    function calculateGroups () {
      const itemRels = props.componentType === 'source' ? sourceRelations : targetRelations
      if (!groupRelationsRef.value) {
        // open relations that were opened at previous item
        let idx = 0
        const openPanels = []
        for (const relIdent in itemRels) {
          const tst = localStorage.getItem('relState-' + relIdent)
          if (tst && tst === 'true') openPanels.push(idx)
          idx++
        }
        if (openPanels.length > 0) panels.value = openPanels
        return
      }

      const groupsArr = []
      let grp = null
      for (const relIdent in itemRels) {
        const rel = relations.find(rel => rel.identifier === relIdent)
        if (rel && rel.options) {
          const tst = rel.options.find(elem => elem.name === 'title')
          if (tst) {
            grp = { name: tst.value, relations: [relIdent] }
            groupsArr.push(grp)
          } else if (grp) {
            grp.relations.push(relIdent)
          }
        }
      }
      groupsRef.value = groupsArr
    }

    function panelChanged (idx, identifier) {
      const newState = !panels.value.includes(idx)
      localStorage.setItem('relState-' + identifier, newState)
    }

    function getRelationName (identifier) {
      const rel = relations.find(rel => rel.identifier === identifier)
      if (rel) {
        if (props.componentType !== 'source' && rel.options) {
          const tst = rel.options.find(elem => elem.name === 'nameFromTarget')
          if (tst) return tst.value
        }
        return rel.name[currentLanguage.value.identifier] || '[' + rel.name[defaultLanguageIdentifier.value] + ']'
      } else {
        return '???'
      }
    }

    function canEditItemRelationByIdentifier (identifier) {
      const rel = relations.find(rel => rel.identifier === identifier)
      if (rel) {
        return canEditItemRelation(rel.id)
      } else {
        return false
      }
    }

    function add (identifier) {
      const rel = relations.find(rel => rel.identifier === identifier)
      if (!rel) return

      props.item.type = findType(props.item.typeId).node
      if (!props.item.type) return

      if (props.componentType === 'source') {
        const rels = sourceRelations[identifier]
        if (!rels) return
        if (!rel.multi && rels.length > 0) {
          showError(i18n.t('ItemRelationsList.OnlyOne'))
        } else {
          const data = { id: -Date.now(), relationId: rel.id, item: props.item, values: {} }
          createLanguageDependentValues(rel.id, data)
          sourceRelations[identifier].unshift(data)
        }
      } else {
        const data = { id: -Date.now(), relationId: rel.id, target: props.item, values: {} }
        createLanguageDependentValues(rel.id, data)
        targetRelations[identifier].unshift(data)
      }
    }

    function createLanguageDependentValues (relId, data) {
      const attrs = getAttributesForRelationId(relId)
      attrs.forEach(attr => {
        if (attr.languageDependent) {
          data.values[attr.identifier] = {}
        }
      })
    }

    async function saveAll () {
      let reloadItem = false
      const itemRels = props.componentType === 'source' ? sourceRelations : targetRelations
      for (const prop in itemRels) {
        const rels = itemRels[prop]
        for (let i = 0; i < rels.length; i++) {
          const rel = rels[i]
          if (getOption2(rel, 'reloadItemOnUpdate', false)) reloadItem = true
          if (changedRelations.value.includes(rel.id)) {
            await save(prop, rel.id, true)
          }
        }
      }
      if (reloadItem) reloadItem(props.item)
    }

    async function saveAllTab (identifier) {
      let reloadItem = false
      const itemRels = props.componentType === 'source' ? sourceRelations : targetRelations
      const rels = itemRels[identifier]
      for (let i = 0; i < rels.length; i++) {
        const rel = rels[i]
        if (getOption2(rel, 'reloadItemOnUpdate', false)) reloadItem = true
        if (changedRelations.value.includes(rel.id)) {
          await save(identifier, rel.id, true)
        }
      }
      if (reloadItem) reloadItem(props.item)
    }

    async function removeAllTab (identifier) {
      if (confirm(i18n.t('ItemRelationsList.Confirm.DeleteAllItemRelations'))) {
        let reloadItem = false
        const itemRels = props.componentType === 'source' ? sourceRelations : targetRelations
        const rels = itemRels[identifier]
        for (let i = 0; i < rels.length; i++) {
          const rel = rels[i]
          if (getOption2(rel, 'reloadItemOnUpdate', false)) reloadItem = true
          await removeItemRelation(props.componentType, identifier, rel.id)
        }
        if (props.componentType === 'source') {
          sourceRelations[identifier] = []
          sourceRelationsTotal[identifier] = 0
        } else {
          targetRelations[identifier] = []
          targetRelationsTotal[identifier] = 0
        }
        if (reloadItem) props.itemRefreshFunction()
      }
    }

    async function save (identifier, id, skipMsg) {
      const itemRels = props.componentType === 'source' ? sourceRelations : targetRelations
      const itemRel = itemRels[identifier].find(elem => elem.id === id)

      // check identifier
      if (!/^[A-Za-z0-9_-]*$/.test(itemRel.identifier)) {
        showError(i18n.t('Wrong.Identifier'))
        return
      }
      if (!itemRel.identifier) {
        showError(i18n.t('ItemRelationsList.IdentifierRequired'))
        return
      }

      if (props.componentType === 'source') {
        if (!itemRel.target) {
          showError(i18n.t('ItemRelationsList.TargetRequired'))
          return
        }
      } else {
        if (!itemRel.item) {
          showError(i18n.t('ItemRelationsList.SourceRequired'))
          return
        }
      }

      const changedIdx = changedRelations.value.indexOf(itemRel.id)
      if (itemRel.id < 0) {
        const val = await identifierExists(itemRel.identifier)
        if (val) {
          showError(i18n.t('ItemRelationsList.IdentifierNotUnique'))
        } else {
          // create
          await saveItemRelation(itemRel)
          router.clearDataChanged(itemRel.identifier)
          changedRelations.value.splice(changedIdx, 1)
          const rel = relations.find(rel => rel.identifier === identifier)
          if (!skipMsg) {
            if (getOption2(rel, 'reloadItemOnUpdate', false)) props.itemRefreshFunction()
            showInfo(i18n.t('Saved'))
          }
        }
      } else {
        // update
        await saveItemRelation(itemRel)
        router.clearDataChanged(itemRel.identifier)
        changedRelations.value.splice(changedIdx, 1)
        const rel = relations.find(rel => rel.identifier === identifier)
        if (!skipMsg) {
          if (getOption2(rel, 'reloadItemOnUpdate', false)) props.itemRefreshFunction()
          showInfo(i18n.t('Saved'))
        }
      }
    }

    async function remove (identifier, id) {
      if (confirm(i18n.t('ItemRelationsList.Confirm.Delete'))) {
        await removeItemRelation(props.componentType, identifier, id)
        const rel = relations.find(rel => rel.identifier === identifier)
        if (getOption2(rel, 'reloadItemOnUpdate', false)) props.itemRefreshFunction()
      }
    }

    function select (identifier, itemRel) {
      const rel = relations.find(rel => rel.identifier === identifier)
      itemSelectionDialogRef.value.showDialog({ identifier: identifier, itemRelId: itemRel.id, itemRelIdentifier: itemRel.identifier }, props.componentType === 'source' ? rel.targets : rel.sources)
    }

    const changedRelations = ref([])
    function itemsSelected (id, parameters) {
      itemSelectionDialogRef.value.closeDialog()
      nextId().then(nextId => {
        loadItemsByIds([id], false).then(items => {
          const rel = relations.find(rel => rel.identifier === parameters.identifier)
          const typesArray = props.componentType === 'source' ? rel.targets : rel.sources
          const tst = typesArray.find(typeId => typeId === parseInt(items[0].typeId))
          if (tst) {
            const itemRels = props.componentType === 'source' ? sourceRelations : targetRelations
            itemRels[parameters.identifier].forEach(itemRel => {
              if (itemRel.id === parameters.itemRelId) {
                items[0].type = findType(items[0].typeId).node
                root.$set(itemRel, props.componentType === 'source' ? 'target' : 'item', items[0])
                if (!itemRel.identifier) {
                  const newIdentifier = props.componentType === 'source' ? props.item.identifier + '_' + items[0].identifier + '_' + nextId : items[0].identifier + '_' + props.item.identifier + '_' + nextId
                  root.$set(itemRel, 'identifier', newIdentifier)
                  router.dataChanged(newIdentifier, i18n.t('Router.Changed.ItemRelation') + newIdentifier)
                } else {
                  router.dataChanged(itemRel.identifier, i18n.t('Router.Changed.ItemRelation') + itemRel.identifier)
                }
                executeClientAction(itemRel, { type: props.componentType }, itemRels[parameters.identifier])
                changedRelations.value.push(itemRel.id)
              }
            })
          } else {
            showError(i18n.t('ItemRelationsList.WrongSelection'))
          }
        })
      })
    }

    /* change = {
      type = source|target|attribute
      attr
    } */
    function executeClientAction (itemRel, change, rels) {
      const relationChangedActions = filterRelationChangedActions(itemRel)
      for (let i = 0; i < relationChangedActions.length; i++) {
        const action = relationChangedActions[i]
        try {
          const itemStore = {
            loadItemByIdentifier: (identifier) => {
              return loadItemByIdentifier(identifier)
            }
          }
          // for feature usage
          const relStore = {}
          // eslint-disable-next-line no-new-func
          const func = new Function('itemRel', 'itemStore', 'relStore', 'change', 'relations', '"use strict"; ' + action.code)
          func(itemRel, itemStore, relStore, change, rels)
        } catch (err) {
          console.error('Failed to evaluate expression: "' + action.code + '" for action: ' + action.identifier, err)
        }
      }
    }

    function filterRelationChangedActions (itemRel) {
      let relationChangedActions = []
      if (itemRel) {
        const arr = []
        actions.forEach(action => {
          for (let i = 0; i < action.triggers.length; i++) {
            const trigger = action.triggers[i]
            const result = parseInt(trigger.type) === 2 && parseInt(trigger.event) === 8 && parseInt(trigger.relation) === parseInt(itemRel.relationId)
            if (result) {
              arr.push(action)
            }
          }
        })
        arr.sort((a, b) => a.order - b.order)
        relationChangedActions = arr
      }
      return relationChangedActions
    }

    function attrChange (itemRel, attr, relationIdentifier) {
      const relations = props.componentType === 'source' ? sourceRelations : targetRelations
      executeClientAction(itemRel, { type: 'attribute', attr }, relations[relationIdentifier])
      router.dataChanged(itemRel.identifier, i18n.t('Router.Changed.ItemRelation') + itemRel.identifier)
      changedRelations.value.push(itemRel.id)
    }

    function getAttributesForRelation (identifier) {
      const rel = relations.find(rel => rel.identifier === identifier)
      const arr = getAttributesForRelationId(rel.id)
      const attrLovs = arr.filter(attr => attr.lov)
      loadLOVs(attrLovs).then((loaded) => {
        if (loaded && relationsRefreshKeys[identifier] === 0) relationsRefreshKeys[identifier] = relationsRefreshKeys[identifier] + 1
      })
      return arr.filter(attr => attr.type !== AttributeType.Relation)
    }

    function getOption (identifier, name, defaultValue) {
      const rel = relations.find(rel => rel.identifier === identifier)
      if (rel.options) {
        const tst = rel.options.find(elem => elem.name === name)
        return tst ? tst.value : defaultValue
      }
      return defaultValue
    }

    function getOption2 (obj, name, defaultValue) {
      if (obj && obj.options) {
        const tst = obj.options.find(elem => elem.name === name)
        if (tst) {
          if (tst.value === 'null') return null
          if (tst.value === 'true') return true
          if (tst.value === 'false') return false
          return tst.value
        }
      }
      return defaultValue
    }

    function showHistory (itemRel) {
      if (itemRel.id < 0) return
      historySelectedRef.value = itemRel
      historyDialogRef.value = true
    }

    let currentFilter = {}
    function filterChanged (relationIdentifier, attr) {
      if (currentFilter[relationIdentifier]) {
        if (attr['IRfilter' + relationIdentifier]) {
          currentFilter[relationIdentifier][attr.identifier] = attr['IRfilter' + relationIdentifier]
        } else {
          if (currentFilter[relationIdentifier][attr.identifier]) delete currentFilter[relationIdentifier][attr.identifier]
        }
      } else {
        const tmp = {}
        tmp[attr.identifier] = attr['IRfilter' + relationIdentifier]
        currentFilter[relationIdentifier] = tmp
      }
      pageChanged(relationIdentifier)
    }

    function getLOVItems (lovId) {
      const lovValues = lovsMap[lovId]
      if (!lovValues) return []
      return lovValues.map(elem => { return { value: elem.id, text: elem.value[currentLanguage.value.identifier] || '[' + elem.value[defaultLanguageIdentifier.value] + ']' } })
    }

    async function loadLOVs (attrs) {
      let loaded = false
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i]
        if (!lovsMap[attr.lov]) {
          const values = await getLOVData(attr.lov)
          lovsMap[attr.lov] = values
          loaded = true
        }
      }
      return loaded
    }

    onMounted(() => {
      loadAllRelations()
      loadAllTypes()
    })

    return {
      currentLanguage,
      defaultLanguageIdentifier,
      itemRelations,
      sourceRelations,
      targetRelations,
      sourceRelationsTotal,
      targetRelationsTotal,
      getRelationName,
      add,
      save,
      saveAll,
      saveAllTab,
      remove,
      removeAllTab,
      select,
      itemSelectionDialogRef,
      itemsSelected,
      attrChange,
      pagesSource,
      pagesTarget,
      pageSize,
      pageChanged,
      getAttributesForRelation,
      canEditItemRelationByIdentifier,
      executeClientAction,
      panels,
      changedRelations,
      historyDialogRef,
      historySelectedRef,
      showHistory,
      auditEnabled,
      pageSizeChanged,
      hasAccess,
      getOption,
      getOption2,
      groupsRef,
      groupRelationsRef,
      selectedGroupRef,
      reloadRelation,
      panelChanged,
      filterChanged,
      getLOVItems,
      relationsRefreshKeys,
      required: value => !!value || i18n.t('ItemRelationsList.Required'),
      pageSizePositive: value => parseInt(value) > 1 || i18n.t('ItemRelationsList.MustBePositive'),
      damUrl: window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/',
      token: localStorage.getItem('token'),
      dateFormat,
      DATE_FORMAT: process.env.VUE_APP_DATE_FORMAT
    }
  }
}
</script>
<style scoped>
.inline {
  display: inline;
}
</style>
