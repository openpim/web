<template>
<div v-if="sourceRelations && targetRelations"> <!-- this is necessary to refrech computed itemRelations right way -->
  <v-expansion-panels popout multiple focusable :model="panels" class="mt-3">
    <template v-for="(rel, identifier, i) in itemRelations">
    <h5 style="flex: 1 0 100%; max-width: calc(100% - 32px);" :class="getOption(identifier, 'class', '')" :style="getOption(identifier, 'style', '')" :key="i" v-if="getOption(identifier, 'title', null)">{{getOption(identifier, 'title', null)}}</h5>
    <v-expansion-panel :key="i" :class="getOption(identifier, 'title', null) ? '' : getOption(identifier, 'class', '')" :style="getOption(identifier, 'title', null) ? '' : getOption(identifier, 'style', '')">
      <v-expansion-panel-header class="pb-0">{{ getRelationName(identifier) }}</v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-simple-table dense>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">{{$t('ItemRelationsList.Identifier')}}</th>

                  <th class="text-left" v-if="componentType === 'source'">{{$t('ItemRelationsList.Target')}}</th>
                  <th class="text-left" v-if="componentType === 'target'">{{$t('ItemRelationsList.Source')}}</th>

                  <th class="text-left" v-if="componentType === 'source'">{{$t('ItemRelationsList.TargetDate')}}</th>
                  <th class="text-left" v-if="componentType === 'target'">{{$t('ItemRelationsList.SourceDate')}}</th>

                  <th class="text-left" v-for="(attr, i) in getAttributesForRelation(identifier)" :key="i">
                    {{attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'}}
                  </th>
                  <th class="text-left" v-if="canEditItemRelationByIdentifier(identifier)">
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" class="pa-0" icon color="primary" @click="add(identifier)"><v-icon dark>mdi-plus</v-icon></v-btn>
                      </template>
                      <span>{{ $t('Add') }}</span>
                    </v-tooltip>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(itemRel, j) in rel" :key="j" :set="canEditItemRelation = canEditItemRelationByIdentifier(identifier)">
                  <td class="pa-1"><input v-model="itemRel.identifier" :placeholder="$t('ItemRelationsList.Identifier')" :disabled="itemRel.id > 0"></td>
                  <td class="pa-1">
                    <span v-if="componentType === 'source' && itemRel.target">
                        <router-link :to="'/item/' + itemRel.target.identifier">{{ itemRel.target.identifier }}</router-link>
                        <span class="ml-2">- {{ itemRel.target.name[currentLanguage.identifier] || '[' + itemRel.target.name[defaultLanguageIdentifier] + ']' }}</span>
                    </span>
                    <span v-if="componentType === 'target' && itemRel.item">
                      <router-link :to="'/item/' + itemRel.item.identifier">{{ itemRel.item.identifier }}</router-link>
                      <span class="ml-2">- {{ itemRel.item.name[currentLanguage.identifier] || '[' + itemRel.item.name[defaultLanguageIdentifier] + ']' }}</span>
                    </span>
                    <v-tooltip top v-if="canEditItemRelation">
                      <template v-slot:activator="{ on }">
                      <v-btn v-on="on" class="pa-0 inline" icon @click="select(identifier, itemRel)"><v-icon dark>mdi-form-select</v-icon></v-btn>
                      </template>
                      <span>{{ $t('Select') }}</span>
                    </v-tooltip>
                  </td>
                  <td class="pa-1">
                    <span v-if="componentType === 'source' && itemRel.target">
                      {{  itemRel.target.updatedAt ? dateFormat(new Date(itemRel.target.updatedAt), DATE_FORMAT) : '' }}
                    </span>
                    <span v-if="componentType === 'target' && itemRel.item">
                      {{  itemRel.item.updatedAt ? dateFormat(new Date(itemRel.item.updatedAt), DATE_FORMAT) : '' }}
                    </span>
                  </td>
                  <td class="text-left" v-for="(attr, i) in getAttributesForRelation(identifier)" :key="i">
                    <AttributeValue @input="attrChange(itemRel)" :item="item" :attr="attr" :values="itemRel.values" :dense="true"></AttributeValue>
                  </td>
                  <td class="pa-1" v-if="canEditItemRelation">
                    <v-tooltip top>
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
                    <v-tooltip top>
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
import { ref, reactive, watch, computed } from '@vue/composition-api'
import * as errorStore from '../store/error'
import * as langStore from '../store/languages'
import * as relStore from '../store/relations'
import * as itemRelStore from '../store/itemRelations'
import * as itemStore from '../store/item'
import * as auditStore from '../store/audit'
import ItemsSelectionDialog from './ItemsSelectionDialog'
import i18n from '../i18n'
import * as userStore from '../store/users'
import AttributeValue from './AttributeValue'
import SystemInformation from './SystemInformation'
import HistoryTable from '../components/HistoryTable'
import dateFormat from 'dateformat'
import router from '../router'

export default {
  components: { ItemsSelectionDialog, AttributeValue, SystemInformation, HistoryTable },
  props: {
    item: {
      required: true
    },
    componentType: { // source or target
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
      relations
    } = relStore.useStore()

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
      nextId
    } = itemStore.useStore()

    const pageSize = ref(5)
    const itemSelectionDialogRef = ref(null)
    const historyDialogRef = ref(false)
    const historySelectedRef = ref(null)

    const pagesSource = reactive({})
    const pagesTarget = reactive({})
    const panels = ref([])

    watch(() => props.item, (newValue, previousValue) => {
      if (props.componentType === 'source') {
        loadSourceRelations(newValue, root, 0, pageSize.value).then(() => {
          emit('dataLoaded', sourceRelations)

          for (const identifier in sourceRelationsTotal) {
            root.$set(pagesSource, identifier, 1)
          }
        })
      } else {
        loadTargetRelations(newValue, root, 0, pageSize.value).then(() => {
          emit('dataLoaded', targetRelations)

          for (const identifier in targetRelationsTotal) {
            root.$set(pagesTarget, identifier, 1)
          }
        })
      }
    })

    function pageSizeChanged (identifier) {
      if (pageSize.value > 0) {
        if (props.componentType === 'source') pagesSource[identifier] = 1
        else pagesTarget[identifier] = 1
        pageChanged(identifier)
      }
    }

    function pageChanged (identifier) {
      const newPage = props.componentType === 'source' ? pagesSource[identifier] : pagesTarget[identifier]
      const offset = (newPage - 1) * pageSize.value
      if (props.componentType === 'source') {
        loadSourcePage(props.item, root, identifier, offset, pageSize.value)
      } else {
        loadTargetPage(props.item, root, identifier, offset, pageSize.value)
      }
    }

    const itemRelations = computed(() => {
      return props.componentType === 'source' ? sourceRelations : targetRelations
    })

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

      if (props.componentType === 'source') {
        if (!rel.multi && sourceRelations[identifier].length > 0) {
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

    function save (identifier, id) {
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
        identifierExists(itemRel.identifier).then((val) => {
          if (val) {
            showError(i18n.t('ItemRelationsList.IdentifierNotUnique'))
          } else {
            // create
            saveItemRelation(itemRel).then(() => {
              router.clearDataChanged(itemRel.identifier)
              changedRelations.value.splice(changedIdx, 1)
              showInfo(i18n.t('Saved'))
            })
          }
        })
      } else {
        // update
        saveItemRelation(itemRel).then(() => {
          router.clearDataChanged(itemRel.identifier)
          changedRelations.value.splice(changedIdx, 1)
          showInfo(i18n.t('Saved'))
        })
      }
    }

    function remove (identifier, id) {
      if (confirm(i18n.t('ItemRelationsList.Confirm.Delete'))) {
        removeItemRelation(props.componentType, identifier, id)
      }
    }

    function select (identifier, itemRel) {
      itemSelectionDialogRef.value.showDialog({ identifier: identifier, itemRelId: itemRel.id, itemRelIdentifier: itemRel.identifier })
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
                root.$set(itemRel, props.componentType === 'source' ? 'target' : 'item', items[0])
                if (!itemRel.identifier) {
                  const newIdentifier = props.componentType === 'source' ? props.item.identifier + '_' + items[0].identifier + '_' + nextId : items[0].identifier + '_' + props.item.identifier + '_' + nextId
                  root.$set(itemRel, 'identifier', newIdentifier)
                  router.dataChanged(newIdentifier, i18n.t('Router.Changed.ItemRelation') + newIdentifier)
                } else {
                  router.dataChanged(itemRel.identifier, i18n.t('Router.Changed.ItemRelation') + itemRel.identifier)
                }
                changedRelations.value.push(itemRel.id)
              }
            })
          } else {
            showError(i18n.t('ItemRelationsList.WrongSelection'))
          }
        })
      })
    }

    function attrChange (itemRel) {
      router.dataChanged(itemRel.identifier, i18n.t('Router.Changed.ItemRelation') + itemRel.identifier)
      changedRelations.value.push(itemRel.id)
    }

    function getAttributesForRelation (identifier) {
      const rel = relations.find(rel => rel.identifier === identifier)
      return getAttributesForRelationId(rel.id)
    }

    function getOption (identifier, name, defaultValue) {
      const rel = relations.find(rel => rel.identifier === identifier)
      if (rel.options) {
        const tst = rel.options.find(elem => elem.name === name)
        return tst ? tst.value : defaultValue
      }
      return defaultValue
    }

    function showHistory (itemRel) {
      if (itemRel.id < 0) return
      historySelectedRef.value = itemRel
      historyDialogRef.value = true
    }

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
      remove,
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
      panels,
      changedRelations,
      historyDialogRef,
      historySelectedRef,
      showHistory,
      auditEnabled,
      pageSizeChanged,
      hasAccess,
      getOption,
      required: value => !!value || i18n.t('ItemRelationsList.Required'),
      pageSizePositive: value => parseInt(value) > 1 || i18n.t('ItemRelationsList.MustBePositive'),
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
