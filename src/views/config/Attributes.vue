<template>
  <v-container v-if="canViewConfigRef" style="background-color:white">
    <v-row no-gutters>
      <v-col cols="4">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ $t('Config.Attributes.GroupsAttributes') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip bottom v-if="canEditConfigRef">
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" @click="add" :disabled="selectedRef.id !== -1 && (selectedRef.internalId == 0 || !selectedRef.group)"><v-icon>mdi-plus</v-icon></v-btn>
            </template>
            <span>{{ $t('Add') }}</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" @click="exportData"><v-icon>mdi-export</v-icon></v-btn>
            </template>
            <span>{{ $t('Config.LOV.Export') }}</span>
          </v-tooltip>
        </v-toolbar>
        <template v-if="item"><input type="checkbox" v-model="showEmptyGroups" class="ml-5 mr-2">{{$t('Config.Attributes.ShowEmptyGroups')}}</template>
        <v-text-field @input="searchChanged" @clear="searchChanged" v-model="searchRef" :label="$t('Filter')" flat hide-details clearable clear-icon="mdi-close-circle-outline" class="ml-5 mr-5 mt-2 pt-0">
          <template v-slot:append-outer>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" icon @click="filterDialogRef = true"><v-icon :color="additionalFilterActive ? 'blue' : ''">mdi-tune</v-icon></v-btn>
              </template>
              <span>{{ $t('Config.Attribute.Filtering.Options') }}</span>
            </v-tooltip>
          </template>
        </v-text-field>
        <v-treeview dense activatable hoverable :items="groupsFiltered" @update:active="activeChanged" :active="activeRef" :open="openRef">
          <template v-slot:prepend="{ item }">
            <v-icon>{{ item.group ? 'mdi-format-list-bulleted-type' : 'mdi-alpha-a-box-outline' }}</v-icon>
          </template>
          <template v-slot:label="{ item }">
            {{ (item.group ? '' : item.identifier + ' - ') + (item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' ) }}
         </template>
        </v-treeview>
      </v-col>
      <v-col cols="8">
        <!-- group -->
        <v-form ref="formRef" lazy-validation class="ml-7" v-if="selectedRef.id != -1 && selectedRef.group">
          <div class="d-inline-flex align-center">
            <v-text-field style="min-width: 100%" v-model="selectedRef.identifier"  :disabled="selectedRef.internalId !== 0" :rules="identifierRules" :label="$t('Config.Attributes.Identifier')" required></v-text-field>
            <SystemInformation :data="selectedRef"></SystemInformation>
          </div>

          <LanguageDependentField :values="selectedRef.name" v-model="selectedRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('Config.Attributes.Name')"></LanguageDependentField>
          <v-text-field v-model="selectedRef.order" type="number" :label="$t('Config.Attributes.Order')" required></v-text-field>
          <v-checkbox v-model="selectedRef.visible" :label="$t('Config.Attributes.Group.Visible')"></v-checkbox>
          <OptionsTable :options="selectedRef.options" @changed="optionsChanged"/>
          <v-btn class="mr-4" v-if="canEditConfigRef" @click="save">{{ $t('Save') }}</v-btn>
          <v-btn class="mr-4" v-if="canEditConfigRef" @click.stop="remove" :disabled="selectedRef.attributes && selectedRef.attributes.length > 0">{{ $t('Remove') }}</v-btn>
        </v-form>

        <!-- attribute -->
        <v-form ref="formRef" lazy-validation class="ml-7" v-if="selectedRef.id != -1 && !selectedRef.group">
          <AttributeViewComponent :attr="selectedRef" :canEditConfig="canEditConfigRef" />

          <v-btn class="mr-4" v-if="canEditConfigRef" @click="save">{{ $t('Save') }}</v-btn>
          <v-menu :close-on-content-click="false" offset-y v-if="canEditConfigRef">
            <template v-slot:activator="{ on }"><v-btn class="mr-4" v-on="on"> {{ $t('Config.Attributes.Connect') }}</v-btn></template>
            <v-card class="pa-4">
              <v-autocomplete v-model="grpId" item-value="id" :items="connectGroups" :item-text="'name.' + currentLanguage.identifier || 'name.' + defaultLanguageIdentifier" clearable clear-icon="mdi-close-circle-outline"></v-autocomplete>
              <div class="text-end"><v-btn @click="assign(grpId)"> {{ $t('Config.Attributes.Connect') }}</v-btn></div>
            </v-card>
          </v-menu>
          <v-menu :close-on-content-click="false" offset-y v-if="canEditConfigRef">
            <template v-slot:activator="{ on }"><v-btn class="mr-4" v-on="on"> {{ $t('Move') }}</v-btn></template>
            <v-card class="pa-4">
              <v-autocomplete v-model="grpId" item-value="id" :items="connectGroups" :item-text="'name.' + currentLanguage.identifier || 'name.' + defaultLanguageIdentifier" clearable clear-icon="mdi-close-circle-outline"></v-autocomplete>
              <div class="text-end"><v-btn @click="move(grpId)"> {{ $t('Move') }}</v-btn></div>
            </v-card>
          </v-menu>
          <v-btn class="mr-4" v-if="canEditConfigRef" @click.stop="remove" :disabled="selectedRef.attributes && selectedRef.attributes.length > 0">{{ $t('Remove') }}</v-btn>
        </v-form>

      </v-col>
    </v-row>
    <template>
      <v-row justify="center">
        <v-dialog v-model="dialogRef" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('Config.Attributes.Delete') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-radio-group v-model="attrDeletionRef">
                      <v-radio :label="$t('Config.Attributes.Delete.Link')" value="link"></v-radio>
                      <v-radio :label="$t('Config.Attributes.Delete.All')" value="all"></v-radio>
                    </v-radio-group>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
              <v-btn color="blue darken-1" text @click="removeAttr">{{ $t('Select') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
    <template>
      <v-row justify="center">
        <v-dialog v-model="filterDialogRef" persistent max-width="1000px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('Config.Attribute.Filtering.Options') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select v-model="filterData.type" :items="filterTypeSelection" :label="$t('Config.Attribute.Type')" chips multiple></v-select>
                    <ValidVisibleComponent :elem="filterData" :canEditConfig="true"/>
                    <v-card class="mb-5 mt-2">
                      <v-card-title class="subtitle-2 font-weight-bold" >
                        <div style="width:90%">{{ $t('Config.Attributes.ForRelations') }}</div>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on" @click="editFilterRelations"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                          </template>
                          <span>{{ $t('Edit') }}</span>
                        </v-tooltip>
                      </v-card-title>
                      <v-divider></v-divider>
                      <v-list dense class="pt-0 pb-0">
                        <v-list-item v-for="(item, i) in filterRelations" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
                          <router-link :to="'/config/relations/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
                        </v-list-item-content></v-list-item>
                      </v-list>
                    </v-card>
                    <RelationsSelectionDialog ref="filterRelSelectionDialogRef" :multiselect="true" @selected="filterRelationsSelected"/>
                    <v-card>
                      <v-card-text>
                        <OptionsTable :options="filterData.options" @changed="filterOptionsChanged" />
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="filterDialogRef = false">{{ $t('Cancel') }}</v-btn>
              <v-btn color="blue darken-1" text @click="clearFilter">{{ $t('Clear') }}</v-btn>
              <v-btn color="blue darken-1" text @click="applyFilter">{{ $t('Search') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import * as attrStore from '../../store/attributes'
import { ref, computed, onMounted, watch } from '@vue/composition-api'
import i18n from '../../i18n'
import router from '../../router'
import * as errorStore from '../../store/error'
import * as itemsStore from '../../store/item'
import * as langStore from '../../store/languages'
import * as relStore from '../../store/relations.js'
import LanguageDependentField from '../../components/LanguageDependentField'
import * as userStore from '../../store/users'
import SystemInformation from '../../components/SystemInformation'
import OptionsTable from '../../components/OptionsTable'
import AttributeViewComponent from '../../components/AttributeViewComponent.vue'
import newAttributeGenerator from '../../_customizations/attributes/newAttributeGenerator'
import filterAttrGroups from '../../_customizations/attributes/filterAttrGroups'
import ValidVisibleComponent from '../../components/ValidVisibleComponent'
import RelationsSelectionDialog from '../../components/RelationsSelectionDialog'
import additionalAttrTypesList from '../../_customizations/attributes/additionalTypes.js'

import XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { s2ab } from '../../store/utils.js'
import AttributeType from '../../constants/attributeTypes'

export default {
  components: { LanguageDependentField, SystemInformation, OptionsTable, AttributeViewComponent, ValidVisibleComponent, RelationsSelectionDialog },
  props: {
    item: {
      type: Object,
      required: false
    },
    type: {
      required: false
    }
  },
  setup (props) {
    const { canViewConfig, canEditConfig } = userStore.useStore()

    const {
      showInfo,
      showError
    } = errorStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages
    } = langStore.useStore()

    const {
      groups,
      findById,
      findByIdentifier,
      checkIdentifier,
      loadAllAttributes,
      saveData,
      assignData,
      removeGroup,
      removeAttribute
    } = attrStore.useStore()

    const {
      relations,
      loadAllRelations
    } = relStore.useStore()

    const { nextId } = itemsStore.useStore()

    const canViewConfigRef = ref(false)
    const canEditConfigRef = ref(false)

    const groupsFiltered = ref([])
    const searchRef = ref('')

    const attrDeletionRef = ref('link')
    const dialogRef = ref(false)
    const formRef = ref(null)
    const empty = { id: -1 }
    const selectedRef = ref(empty)
    const activeRef = ref([])
    const openRef = ref([])
    const selectedGroupsRef = ref([])
    const maxChiidrenNumber = 100
    const showEmptyGroups = ref(false)
    const grpId = ref(null)
    const rels = ref([])

    const filterDialogRef = ref(false)
    const filterData = ref({
      type: [],
      valid: [],
      visible: [],
      relations: [],
      options: []
    })
    const filterRelSelectionDialogRef = ref(null)

    function clearFilter () {
      filterData.value = {
        type: [],
        valid: [],
        visible: [],
        relations: [],
        options: []
      }
    }

    function editFilterRelations () {
      filterRelSelectionDialogRef.value.showDialog('', filterData.value.relations)
    }

    function filterRelationsSelected (arr) {
      filterRelSelectionDialogRef.value.closeDialog()
      filterData.value.relations = arr
    }

    const additionalFilterActive = computed(() => {
      if (filterData.value.type.length || filterData.value.valid.length || filterData.value.visible.length || filterData.value.relations.length || filterData.value.options.length) {
        return true
      }
      return false
    })

    const filterRelations = computed(() => {
      return filterData.value.relations.map(id => rels.value.find(rel => rel.id === id))
    })

    const connectGroups = computed(() => {
      const filteredGroups = filterAttrGroups(selectedRef.value, selectedGroupsRef.value, groups)
      if (filteredGroups) {
        return filteredGroups
      } else {
        return selectedGroupsRef.value ? groups.filter((grp) => !selectedGroupsRef.value.find((item) => item.id === grp.id)) : []
      }
    })

    let awaitingSearch = null
    function searchChanged () {
      if ((searchRef.value && searchRef.value.length > 2) || additionalFilterActive.value) {
        if (awaitingSearch) {
          clearTimeout(awaitingSearch)
          awaitingSearch = null
        }
        if (!awaitingSearch) {
          awaitingSearch = setTimeout(() => {
            performSearch()
          }, 1000)
        }
      } else {
        if (props.item) {
          groupsFiltered.value = filteredAttributes
        } else {
          groupsFiltered.value = groups.map(group => ({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: group.attributes.slice(0, maxChiidrenNumber) }))
        }
      }
    }

    function applyFilter () {
      performSearch()
      filterDialogRef.value = false
    }

    function performSearch () {
      openRef.value = []
      activeRef.value = []
      selectedRef.value = empty
      groupsFiltered.value = []
      const groupsToUse = props.item ? filteredAttributes : groups
      const searchJsonData = filterData.value
      if (!additionalFilterActive.value) {
        if (searchRef.value) {
          for (let k = 0; k < groupsToUse.length; k++) {
            const group = groupsToUse[k]
            if (group.name[currentLanguage.value.identifier].toLowerCase().includes(searchRef.value.toLowerCase())) {
              groupsFiltered.value.push({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: group.attributes.slice(0, maxChiidrenNumber) })
              continue
            }
            const foundAttr = []
            const attr = group.attributes
            for (let i = 0; i < attr.length; i++) {
              if (attr[i].name[currentLanguage.value.identifier].toLowerCase().includes(searchRef.value.toLowerCase()) || attr[i].identifier.toLowerCase().includes(searchRef.value.toLowerCase())) {
                foundAttr.push(attr[i])
              }
            }
            if (foundAttr.length) {
              groupsFiltered.value.push({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: foundAttr.slice(0, maxChiidrenNumber) })
            }
          }
        } else {
          if (props.item) {
            groupsFiltered.value = filteredAttributes
          } else {
            groupsFiltered.value = groups.map(group => ({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: group.attributes.slice(0, maxChiidrenNumber) }))
          }
        }
      } else {
        for (let k = 0; k < groupsToUse.length; k++) {
          const group = groupsToUse[k]
          const foundAttr = []
          const attrs = group.attributes
          for (let i = 0; i < attrs.length; i++) {
            const attr = attrs[i]
            if ((searchJsonData.type.length && !searchJsonData.type.includes(attr.type)) ||
              (searchJsonData.valid.length && !attr.valid.filter(value => searchJsonData.valid.includes(value)).length) ||
              (searchJsonData.visible.length && !attr.visible.filter(value => searchJsonData.visible.includes(value)).length) ||
              (searchJsonData.relations.length && !attr.relations.filter(value => searchJsonData.relations.includes(value)).length) ||
              (searchJsonData.options.length && !searchJsonData.options.filter(value => attr.options.some(option => {
                if (typeof (value.value) !== 'undefined' && value.value !== null && value.value !== '') {
                  return option.name === value.name && option.value === value.value
                } else {
                  return option.name === value.name
                }
              })).length)) {
              continue
            }
            if (searchRef.value && searchRef.value.length) {
              if (attr.name[currentLanguage.value.identifier].toLowerCase().includes(searchRef.value.toLowerCase()) || attr.identifier.toLowerCase().includes(searchRef.value.toLowerCase())) {
                foundAttr.push(attr)
              }
            } else {
              foundAttr.push(attr)
            }
          }
          if (foundAttr.length) {
            groupsFiltered.value.push({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: foundAttr.slice(0, maxChiidrenNumber) })
          }
        }
      }
    }

    function filter (item, search, textKey) {
      const s = search.toLowerCase()
      return item.identifier.toLowerCase().indexOf(s) > -1 || (item.name && Object.values(item.name).find(val => val.toLowerCase().indexOf(s) > -1))
    }

    function activeChanged (active) {
      if (active.length !== 0) {
        if (selectedRef.value.internalId === 0 && active[0] !== selectedRef.value.id) {
          showInfo(i18n.t('Config.NotSaved'))
        }

        if (active[0] !== selectedRef.value.id) {
          activeRef.value[0] = active[0]
          const tmp = findById(active[0])
          selectedRef.value = tmp.item
          selectedGroupsRef.value = tmp.groups
          if (!props.item) {
            router.push('/config/attributes' + (selectedRef.value.identifier ? '/' + selectedRef.value.identifier : ''))
          }
        }
      } else {
        selectedRef.value = empty
        if (!props.item) {
          router.push('/config/attributes')
        }
      }
    }

    const filterTypeSelection = ref([
      { text: i18n.t('Config.Attribute.Type.Text'), value: AttributeType.Text },
      { text: i18n.t('Config.Attribute.Type.Boolean'), value: AttributeType.Boolean },
      { text: i18n.t('Config.Attribute.Type.Integer'), value: AttributeType.Integer },
      { text: i18n.t('Config.Attribute.Type.Float'), value: AttributeType.Float },
      { text: i18n.t('Config.Attribute.Type.Date'), value: AttributeType.Date },
      { text: i18n.t('Config.Attribute.Type.Time'), value: AttributeType.Time },
      { text: i18n.t('Config.Attribute.Type.LOV'), value: AttributeType.LOV },
      { text: i18n.t('Config.Attribute.Type.URL'), value: AttributeType.URL },
      { text: i18n.t('Config.Attribute.Type.Relation'), value: AttributeType.Relation }
    ])

    if (additionalAttrTypesList) {
      const mappedAddAttrTypeList = additionalAttrTypesList.map(el => ({ text: el.text, value: el.value }))
      filterTypeSelection.value = [...filterTypeSelection.value, ...mappedAddAttrTypeList]
    }

    function optionsChanged (val) {
      selectedRef.value.options = val
    }

    function filterOptionsChanged (val) {
      filterData.value.options = val
    }

    async function add () {
      if (selectedRef.value && selectedRef.value.group) {
        const name = {}
        name[currentLanguage.value.identifier] = i18n.t('Config.Attributes.Attr.NewName')
        const errorMessage = {}
        errorMessage[currentLanguage.value.identifier] = ''
        const newAttr = { id: Date.now(), internalId: 0, group: false, languageDependent: false, order: 0, visible: [], valid: [], relations: [], name: name, errorMessage: errorMessage, options: [] }
        if (props.item) {
          newAttr.valid.push(props.item.typeId)
          if (props.item.path.includes('.')) {
            const arr = props.item.path.split('.')
            newAttr.visible.push(arr[arr.length - 2])
          } else {
            newAttr.visible.push(props.item.id)
          }
        }
        selectedRef.value.attributes.push(newAttr)
        const groupFiltered = groupsFiltered.value.find((el) => el.id === selectedRef.value.id)
        groupFiltered.children.push(newAttr)
        openRef.value = [selectedRef.value.id]
        const obj = await newAttributeGenerator(nextId)
        if (obj) {
          newAttr.identifier = obj.identifier
          if (obj.name) newAttr.name = obj.name
          if (obj.options) newAttr.options = obj.options
        }
        selectedRef.value = newAttr
        selectedGroupsRef.value = []
      } else {
        const name = {}
        name[currentLanguage.value.identifier] = i18n.t('Config.Attributes.Group.NewName')
        const newGroup = { id: Date.now(), internalId: 0, group: true, attributes: [], order: 0, visible: false, name: name, options: [] }
        groups.push(newGroup)
        const newGroupInTree = { ...newGroup }
        newGroupInTree.children = []
        groupsFiltered.value.push(newGroupInTree)
        selectedRef.value = newGroup
        selectedGroupsRef.value = []
      }
      activeRef.value.pop()
      activeRef.value.push(selectedRef.value.id)
    }

    function remove () {
      if (selectedRef.value.group) {
        if (confirm(i18n.t('Config.Attributes.Confirm.Delete', { name: selectedRef.value.name }))) {
          activeRef.value.pop()
          const indxToRemove = groupsFiltered.value.findIndex((el) => el.id === selectedRef.value.id)
          if (indxToRemove > -1) {
            groupsFiltered.value.splice(indxToRemove, 1)
          }
          removeGroup(selectedRef.value.id).then(() => {
            showInfo(i18n.t('Saved'))
          })
          selectedRef.value = empty
          if (!props.item) {
            router.push('/config/attributes')
          }
        }
      } else {
        dialogRef.value = true
      }
    }

    function removeAttr () {
      dialogRef.value = false
      activeRef.value.pop()
      if (attrDeletionRef.value !== 'link') {
        for (let i = 0; i < groupsFiltered.value.length; i++) {
          const group = groupsFiltered.value[i]
          const indxToRemove = group.children.findIndex((el) => el.id === selectedRef.value.id)
          if (indxToRemove > -1) {
            group.children.splice(indxToRemove, 1)
          }
        }
      } else {
        const data = findById(selectedRef.value.id)
        if (data.groups.length) {
          const grpId = data.groups[0].id
          const group = groupsFiltered.value.find((el) => el.id === grpId)
          const indxToRemove = group.children.findIndex((el) => el.id === selectedRef.value.id)
          if (indxToRemove > -1) {
            group.children.splice(indxToRemove, 1)
          }
        }
      }
      removeAttribute(selectedRef.value.id, attrDeletionRef.value !== 'link').then(() => {
        showInfo(i18n.t('Saved'))
      })
      selectedRef.value = empty
      if (!props.item) {
        router.push('/config/attributes')
      }
    }

    function save () {
      if (formRef.value.validate()) {
        if (!props.item) {
          router.push('/config/attributes/' + selectedRef.value.identifier)
        }
        saveData(selectedRef.value).then(() => {
          showInfo(i18n.t('Saved'))
        })
      }
    }

    function assign (grpId) {
      const attr = findByIdentifier(selectedRef.value.identifier)
      const grp = findById(grpId)
      if (attr.item.internalId === 0 || grp.item.internalId === 0) {
        showError(i18n.t('Config.NotSaved'))
        return
      }
      assignData(attr.item, grp.item).then(() => {
        openRef.value.push(grp.item.id)
        showInfo(i18n.t('Saved'))
      })
      const groupFiltered = groupsFiltered.value.find((el) => el.id === grpId)
      groupFiltered.children.push(attr.item)
    }

    async function move (grpId) {
      const attr = findByIdentifier(selectedRef.value.identifier)
      const grp = findById(grpId)
      if (attr.item.internalId === 0 || grp.item.internalId === 0) {
        showError(i18n.t('Config.NotSaved'))
        return
      }

      await assignData(attr.item, grp.item)
      openRef.value.push(grp.item.id)

      const groupFiltered = groupsFiltered.value.find((el) => el.id === grpId)
      groupFiltered.children.push(attr.item)
      const data = findById(selectedRef.value.id)
      if (data.groups.length) {
        const grpId = data.groups[0].id
        const group = groupsFiltered.value.find((el) => el.id === grpId)
        const indxToRemove = group.children.findIndex((el) => el.id === selectedRef.value.id)
        if (indxToRemove > -1) {
          group.children.splice(indxToRemove, 1)
        }
      }
      await removeAttribute(selectedRef.value.id, false)
      showInfo(i18n.t('Saved'))
    }

    onMounted(() => {
      loadAllLanguages()
      loadAllRelations().then(() => {
        rels.value = relations
      })
      loadAllAttributes().then(() => {
        canViewConfigRef.value = canViewConfig('attributes')
        canEditConfigRef.value = canEditConfig('attributes')
        if (!props.item) {
          const id = router.currentRoute.params.id
          if (id) {
            const result = findByIdentifier(id)
            if (result.item) {
              selectedRef.value = result.item
              selectedGroupsRef.value = result.groups
              activeRef.value.push(result.item.id)
              if (!result.item.group) {
                openRef.value = result.groups.map(grp => grp.id)
              }
            } else {
              router.push('/config/attributes')
            }
          }
        }
        if (!props.item) groupsFiltered.value = groups.map(group => ({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: group.attributes.slice(0, maxChiidrenNumber) }))
      })
    })

    let filteredAttributes = []
    refreshItemAttributes()
    watch(() => props.item, () => {
      refreshItemAttributes()
    })

    watch(() => props.type, () => {
      refreshItemAttributes()
    })

    watch(showEmptyGroups, () => {
      searchRef.value = ''
      refreshItemAttributes()
    })

    function refreshItemAttributes () {
      if (!props.item) return
      const pathArr = props.item.path.split('.').map(elem => parseInt(elem))
      const newGroups = []
      groups.forEach(group => {
        const newGroup = { ...group }
        const groupAttr = []
        group.attributes.forEach(attr => {
          if (props.type === 1) { // show attributes only for this object (check type)
            if (attr.valid.includes(parseInt(props.item.typeId)) && pathArr.some(r => attr.visible.indexOf(r) !== -1)) {
              groupAttr.push(attr)
            }
          } else { // show attributes for any type of object going through this level
            if (pathArr.some(r => attr.visible.indexOf(r) !== -1)) {
              groupAttr.push(attr)
            }
          }
        })
        newGroup.attributes = groupAttr
        if (showEmptyGroups.value || groupAttr.length > 0) newGroups.push(newGroup)
      })
      filteredAttributes = newGroups.map(group => ({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, attributes: group.attributes, children: group.attributes.slice(0, maxChiidrenNumber) }))
      groupsFiltered.value = filteredAttributes.map(group => ({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: group.children }))
    }

    function exportData () {
      const cols = ['group identifier', 'group name', 'identifier', 'name', 'type']
      const data = [cols]
      for (const grp of groupsFiltered.value) {
        for (const attr of grp.children) {
          const row = [grp.identifier, grp.name[defaultLanguageIdentifier.value], attr.identifier, attr.name[defaultLanguageIdentifier.value]]
          let type = attr.type
          for (const prop in AttributeType) {
            if (AttributeType[prop] === type) {
              type = prop
              break
            }
          }
          row.push(type)
          data.push(row)
        }
      }
      const ws = XLSX.utils.aoa_to_sheet(data)
      var wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data')
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
      saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'data.xlsx')
    }

    function identifierValidation (v) {
      if (!/^[A-Za-z0-9_]*$/.test(v)) {
        return i18n.t('Wrong.Identifier')
      }
      if (!v) {
        return i18n.t('Config.Attributes.Error.IdentifierRequired')
      }
      if (v && selectedRef.value.internalId === 0) {
        const found = checkIdentifier(v)
        if (found) {
          return i18n.t('Config.Attributes.Error.IdentifierNotUnique')
        }
      }
      return true
    }

    return {
      additionalFilterActive,
      applyFilter,
      clearFilter,
      grpId,
      canViewConfigRef,
      canEditConfigRef,
      groups,
      activeChanged,
      searchRef,
      searchChanged,
      filter,
      filterData,
      filterDialogRef,
      filterRelations,
      filterTypeSelection,
      filterRelSelectionDialogRef,
      filterRelationsSelected,
      filterOptionsChanged,
      editFilterRelations,
      add,
      remove,
      removeAttr,
      save,
      formRef,
      selectedRef,
      activeRef,
      openRef,
      connectGroups,
      groupsFiltered,
      assign,
      move,
      dialogRef,
      attrDeletionRef,
      currentLanguage,
      optionsChanged,
      defaultLanguageIdentifier,
      showEmptyGroups,
      refreshItemAttributes,
      exportData,
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('Config.Attributes.Error.NameRequired')
      ]
    }
  }
}
</script>
