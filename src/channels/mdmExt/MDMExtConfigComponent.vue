<template>
  <div>
    <v-text-field v-if="channel" v-model="channel.config.extCmd" :readonly=readonly :label="$t('Channels.Ext.cmd')" required></v-text-field>
    <v-card class="mb-5 mt-5">
      <v-card-title class="subtitle-2 font-weight-bold" >
        <div style="width:90%">{{ $t('MappingConfigComponent.SupplierCategories') }}</div>
        <v-tooltip bottom v-if="!readonly">
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="editSupplierCategoryTypes"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
          </template>
          <span>{{ $t('Edit') }}</span>
        </v-tooltip>
      </v-card-title>
      <v-divider></v-divider>
      <v-list dense class="pt-0 pb-0">
        <v-list-item v-for="(item, i) in supplierCategoryTypes" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
          <router-link :to="'/config/types/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
        </v-list-item-content></v-list-item>
      </v-list>
    </v-card>
    <v-card class="mb-5 mt-5">
      <v-card-title class="subtitle-2 font-weight-bold" >
        <div style="width:90%">{{ $t('MappingConfigComponent.SupplierProducts') }}</div>
        <v-tooltip bottom v-if="!readonly">
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="editSupplierProductTypes"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
          </template>
          <span>{{ $t('Edit') }}</span>
        </v-tooltip>
      </v-card-title>
      <v-divider></v-divider>
      <v-list dense class="pt-0 pb-0">
        <v-list-item v-for="(item, i) in supplierProductTypes" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
          <router-link :to="'/config/types/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
        </v-list-item-content></v-list-item>
      </v-list>
    </v-card>
    <v-row>
      <v-col cols="12">
        <span class="ml-1 mr-3">{{ $t('MappingConfigComponent.VisibleFrom') }}:</span>
        <span v-if="supplierCategoryRef">
          <router-link :to="'/item/' + supplierCategoryRef.identifier">{{ supplierCategoryRef.identifier }}</router-link><span class="ml-2">- {{ supplierCategoryRef.name[currentLanguage.identifier] || '[' + supplierCategoryRef.name[defaultLanguageIdentifier] + ']' }}</span>
        </span>
        <v-btn color="blue darken-1" v-if="!readonly" text @click="supplierCategorySelectionDialogRef.showDialog()">{{ $t('Select') }}</v-btn>
      </v-col>
    </v-row>

    <v-card class="mb-5 mt-5">
      <v-card-title class="subtitle-2 font-weight-bold" >
        <div style="width:90%">{{ $t('MappingConfigComponent.MasterHost') }}</div>
      </v-card-title>
      <v-card-text>
        <v-divider></v-divider>
        <v-row>
          <v-col><v-text-field v-model="masterUrl" @change="masterUrlChanged" :label="$t('MappingConfigComponent.MasterHostUrl')" /></v-col>
        </v-row>
        <v-row class="pt-0 mt-0">
          <v-col><v-text-field v-model="masterLogin" @change="masterLoginChanged" :label="$t('MappingConfigComponent.MasterLogin')" dense/></v-col>
          <v-col><v-text-field v-model="masterPassword" @change="masterPasswordChanged" :label="$t('MappingConfigComponent.MasterPassword')" dense type="password" autocomplete="new-password"/></v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mb-5 mt-5">
      <v-card-title class="subtitle-2 font-weight-bold" >
        <div style="width:90%">{{ $t('MappingConfigComponent.MasterProductTypes') }}</div>
      </v-card-title>
      <v-card-text>
        <v-divider></v-divider>
        <v-row>
          <v-col>
            <v-text-field v-model="masterProductTypes" @change="masterProductTypesChanged" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mb-5 mt-5">
      <v-card-title class="subtitle-2 font-weight-bold" >
        <div style="width:90%">{{ $t('MappingConfigComponent.MasterCategoryAttribute') }}</div>
      </v-card-title>
      <v-card-text>
        <v-divider></v-divider>
        <v-row class="pt-0 mt-0">
          <v-col>
            <v-text-field v-model="masterCategoryAttributeIdentifier" @change="masterCategoryAttributeIdentifierChanged" dense :label="$t('MappingConfigComponent.MasterCategoryAttributeIdentifier')" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="11">
        <v-autocomplete v-model="categoryIdRef" @change="categoryChanged" :items="mappedCategories.filter(elem => !elem.deleted)" item-text="name" item-value="id" :label="$t('MappingConfigComponent.Category')" clearable></v-autocomplete>
      </v-col>
      <v-col cols="1">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" :disabled="!supplierCategoryRef || !supplierCategoryTypes.length" @click="add"><v-icon>mdi-plus</v-icon></v-btn>
          </template>
          <span>{{ $t('Add') }}</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon :disabled="!categoryIdRef" v-on="on" @click="remove"><v-icon>mdi-minus</v-icon></v-btn>
          </template>
          <span>{{ $t('Remove') }}</span>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-row v-if="dataLoading">
      <v-col cols="12" style="text-align: center;"><v-progress-circular indeterminate color="primary"></v-progress-circular></v-col>
    </v-row>

    <template>
      <v-row justify="center">
        <v-dialog v-model="dialogRef" persistent width="90%">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('MappingConfigComponent.Add.Title') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <template v-if="categoriesTreeRef">
                      <span v-if="!categoriesTreeRef.length">{{ $t('MappingConfigComponent.СategoriesNotFound') }}</span>
                      <v-treeview class="scroll-body" dense hoverable activatable :items="categoriesTreeRef" :active.sync="treeActiveRef" :load-children="addChildren2TreeView"></v-treeview>
                    </template>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
              <v-btn color="blue darken-1" text @click="addCategory">{{ $t('Select') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
    <v-row>
      <v-col cols="12">
        <MappingAttributesCompoment class="mt-5" v-if="masterAttributesRef.length && !categoryRef.deleted" :readonly="readonly" :category="categoryRef" :channel="channel" :canManageAttributes="channelFactory.canManageAttributes && canEditConfig('attributes')" :attributes="categoryRef.attributes" :pimAttributes="masterAttributesRef" :channelAttributes="channelAttributesRef" />
      </v-col>
    </v-row>
    <ItemsSelectionDialog ref="supplierCategorySelectionDialogRef" @selected="supplierCategorySelected"/>
    <TypeSelectionDialog ref="supplierCategoryTypeSelectionDialogRef" :multiselect="true" @selected="supplierCategoryTypesSelected"/>
    <TypeSelectionDialog ref="supplierProductTypeSelectionDialogRef" :multiselect="true" @selected="supplierProductTypesSelected"/>
  </div>
</template>
<script>

import { ref, onMounted, watch, computed } from '@vue/composition-api'

import * as itemStore from '@/store/item'
import * as langStore from '@/store/languages'
import * as userStore from '@/store/users'
import * as attrStore from '@/store/attributes'
import * as typesStore from '@/store/types'
import * as relStore from '@/store/relations'
import * as remotePIMInstanceStore from '@/store/remotePIMInstance'

import ItemsSelectionDialog from '@/components/ItemsSelectionDialog'
import TypeSelectionDialog from '@/components/TypeSelectionDialog'

import MappingAttributesCompoment from '@/channels/MappingAttributesCompoment'

import getChannelFactory from '@/channels'
import i18n from '@/i18n'

export default {
  props: {
    channel: {
      required: true
    },
    readonly: {
      type: Boolean,
      required: true
    }
  },
  components: { ItemsSelectionDialog, TypeSelectionDialog, MappingAttributesCompoment },
  setup (props, { root }) {
    const { canEditConfig } = userStore.useStore()

    const {
      loadChildren,
      loadItemsByIds
    } = itemStore.useStore()

    const {
      languages,
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      findType,
      loadAllTypes
    } = typesStore.useStore()

    const {
      loadAllAttributes,
      getAllItemsAttributes
    } = attrStore.useStore()

    const {
      seacrhAttributesRemotePIMInstance,
      seacrhTypesRemotePIMInstance,
      searchItemsRemotePIMInstance,
      loginRemotePIMInstance
    } = remotePIMInstanceStore.useStore()

    const {
      loadAllRelations
    } = relStore.useStore()

    const channelAttributesRef = ref([])
    const masterAttributesRef = ref([])

    const supplierCategoryRef = ref(null)

    const supplierCategorySelectionDialogRef = ref(null)
    const supplierCategoryTypeSelectionDialogRef = ref(null)
    const supplierProductTypeSelectionDialogRef = ref(null)

    const supplierCategoryTypes = ref([])
    const supplierProductTypes = ref([])
    const masterProductTypes = ref('')

    const masterUrl = ref('')
    const masterLogin = ref('')
    const masterPassword = ref('')

    const masterCategoryAttributeIdentifier = ref('')

    const typesLoadedRef = ref(false)
    const relationsLoadedRef = ref(false)

    const categoryIdRef = ref(null)
    const categoryRef = ref(null)
    const newCategoryIdRef = ref(null)
    const dialogRef = ref(false)
    const dataLoading = ref(false)
    const categoriesTreeRef = ref(null)
    const treeSearchRef = ref('')
    const treeActiveRef = ref([])

    const mappedCategories = computed(() => {
      if (props.channel && props.channel.mappings) {
        return Object.values(props.channel.mappings)
      } else {
        return []
      }
    })

    watch(() => props.channel, (chan, previousValue) => {
      if (!typesLoadedRef.value && !relationsLoadedRef.value) return
      supplierCategoryRef.value = chan.config.supplierCategory ? chan.config.supplierCategory : null
      supplierCategoryTypes.value = chan.config.supplierCategoryTypes ? chan.config.supplierCategoryTypes.map((id) => findType(id).node) : []
      supplierProductTypes.value = chan.config.supplierProductTypes ? chan.config.supplierProductTypes.map((id) => findType(id).node) : []
      masterProductTypes.value = chan.config.masterProductTypes ? chan.config.masterProductTypes : ''
      masterUrl.value = chan.config.masterUrl ? chan.config.masterUrl : ''
      masterLogin.value = chan.config.masterLogin ? chan.config.masterLogin : ''
      masterPassword.value = chan.config.masterPassword ? chan.config.masterPassword : ''
      masterAttributesRef.value = []
      masterCategoryAttributeIdentifier.value = chan.config.masterCategoryAttributeIdentifier ? chan.config.masterCategoryAttributeIdentifier : ''
      categoryRef.value = { attributes: [] }
      categoryIdRef.value = null
    })

    function editSupplierProductTypes () {
      supplierProductTypeSelectionDialogRef.value.showDialog('', props.channel.config.supplierProductTypes)
    }

    function editSupplierCategoryTypes () {
      supplierCategoryTypeSelectionDialogRef.value.showDialog('', props.channel.config.supplierCategoryTypes)
    }

    function supplierCategorySelected (id) {
      loadItemsByIds([id], false).then(async items => {
        if (mappedCategories.value.length && mappedCategories.value.some(el => !el.path.startsWith(items[0].path))) {
          if (confirm(i18n.t('MappingConfigComponent.MappingsForPathesWillBeDeletedWarning'))) {
            for (let i = 0; i < mappedCategories.value.length; i++) {
              const mappedCategory = mappedCategories.value[i]
              if (!mappedCategory.path.startsWith(items[0]).path) {
                props.channel.mappings['category_' + mappedCategory.id].deleted = true
              }
            }
            if (categoryRef.value) {
              categoryRef.value.attributes = []
            }
            masterAttributesRef.value = []
            categoryIdRef.value = null
            supplierCategoryRef.value = items[0]
            props.channel.config.supplierCategory = supplierCategoryRef.value
            supplierCategorySelectionDialogRef.value.closeDialog()
            loadAttributes()
          }
        } else {
          supplierCategoryRef.value = items[0]
          props.channel.config.supplierCategory = supplierCategoryRef.value
          supplierCategorySelectionDialogRef.value.closeDialog()
          loadAttributes()
        }
      })
    }

    function supplierCategoryTypesSelected (arr) {
      if (!mappedCategories.value.length || !mappedCategories.value.some(el => arr.indexOf(parseInt(el.typeId)) === -1)) {
        props.channel.config.supplierCategoryTypes = arr
        supplierCategoryTypes.value = props.channel.config.supplierCategoryTypes.map((id) => findType(id).node)
        supplierCategoryTypeSelectionDialogRef.value.closeDialog()
      } else {
        if (confirm(i18n.t('MappingConfigComponent.MappingsForTypesWillBeDeletedWarning'))) {
          for (let i = 0; i < mappedCategories.value.length; i++) {
            const mappedCategory = mappedCategories.value[i]
            if (arr.indexOf(parseInt(mappedCategory.typeId) === -1)) {
              props.channel.mappings['category_' + mappedCategory.id].deleted = true
            }
          }
          if (categoryRef.value) {
            categoryRef.value.attributes = []
          }
          masterAttributesRef.value = []
          categoryIdRef.value = null
          props.channel.config.supplierCategoryTypes = arr
          supplierCategoryTypes.value = props.channel.config.supplierCategoryTypes.map((id) => findType(id).node)
          supplierCategoryTypeSelectionDialogRef.value.closeDialog()
        } else {
          supplierCategoryTypeSelectionDialogRef.value.closeDialog()
        }
      }
    }

    function supplierProductTypesSelected (arr) {
      props.channel.config.supplierProductTypes = arr
      supplierProductTypes.value = props.channel.config.supplierProductTypes.map((id) => findType(id).node)
      supplierProductTypeSelectionDialogRef.value.closeDialog()
    }

    function masterCategoryAttributeIdentifierChanged (data) {
      props.channel.config.masterCategoryAttributeIdentifier = data
      loadAttributes()
    }

    function masterProductTypesChanged (data) {
      props.channel.config.masterProductTypes = data
      loadAttributes()
    }

    function masterUrlChanged (data) {
      props.channel.config.masterUrl = data
      loadAttributes()
    }

    function masterLoginChanged (data) {
      props.channel.config.masterLogin = data
      loadAttributes()
    }

    function masterPasswordChanged (data) {
      props.channel.config.masterPassword = data
      loadAttributes()
    }

    function addCategory () {
      if (treeActiveRef.value.length === 0) return
      categoryRef.value = findNodeByComparator(treeActiveRef.value[0], categoriesTreeRef.value, [], (id, item) => item.id === id)

      if (props.channel.config.supplierCategoryTypes.indexOf(parseInt(categoryRef.value.typeId)) === -1) {
        alert(i18n.t('MappingConfigComponent.IncorrectCategoryTypeSelected'))
        return
      }

      dialogRef.value = false
      loadAttributes()
      root.$set(props.channel.mappings, 'category_' + categoryRef.value.id, categoryRef.value)
      categoryIdRef.value = categoryRef.value.id
    }

    function findNodeByComparator (id, children, path, comparator) {
      for (var i = 0; i < children.length; i++) {
        const item = children[i]
        if (comparator(id, item)) {
          return item
        } else if (item.children && item.children.length > 0) {
          const found = findNodeByComparator(id, item.children, path, comparator)
          if (found) {
            if (path) path.unshift(item.name)
            return found
          }
        }
      }
      return null
    }

    async function add () {
      categoriesTreeRef.value = []
      categoriesTreeRef.value = await loadFilterChildren(supplierCategoryRef.value)
      newCategoryIdRef.value = null
      dialogRef.value = true
    }

    async function loadFilterChildren (item) {
      const data = await loadChildren(item.id, { page: 1, itemsPerPage: 10000 })
      for (let i = 0; i < data.rows.length; i++) {
        data.rows[i].name = (data.rows[i].name[currentLanguage.value.identifier] || '[' + data.rows[i].name[defaultLanguageIdentifier.value] + ']')
        data.rows[i].children = []
      }
      // return data.rows.filter(row => props.channel.config.supplierCategoryTypes.indexOf(parseInt(row.typeId)) !== -1).filter(row => mappedCategories.value.findIndex(el => el.id === row.id) === -1)
      return data.rows.filter(row => mappedCategories.value.findIndex(el => el.id === row.id && !el.deleted) === -1)
    }

    async function addChildren2TreeView (item) {
      item.children = await loadFilterChildren(item)
    }

    function remove () {
      if (confirm(i18n.t('MappingConfigComponent.Remove.Confirm'))) {
        props.channel.mappings['category_' + categoryIdRef.value] = { deleted: true }
        // root.$delete(props.channel.mappings, 'category_' + categoryIdRef.value)
        categoryRef.value.attributes = []
        masterAttributesRef.value = []
        categoryIdRef.value = null
      }
    }

    function categoryChanged () {
      categoryRef.value = mappedCategories.value.find(elem => elem.id === categoryIdRef.value)
      // if (categoryRef.value?.categoryAttr) lovChanged(categoryRef.value.categoryAttr)
      loadAttributes()
    }

    function loadAttributes () {
      if (!props.channel.type || !categoryRef.value || !categoryRef.value.identifier) return
      if (!masterUrl.value.length || !masterLogin.value.length || !masterPassword.value.length) return

      masterAttributesRef.value = []

      const req = {
        values: { [masterCategoryAttributeIdentifier.value]: { OP_eq: categoryRef.value.identifier } }
      }

      dataLoading.value = true
      loginRemotePIMInstance(masterUrl.value, masterLogin.value, masterPassword.value).then(() => {
        searchItemsRemotePIMInstance(req).then(async resp => {
          if (!resp.rows) return

          const allMasterTypes = await seacrhTypesRemotePIMInstance()
          let validMasterTypes = masterProductTypes.value.split(',')
          validMasterTypes = validMasterTypes.map(el => allMasterTypes.rows.find(type => type.identifier === el)).filter(el => el).map(el => el.id)

          const masterPathArr = []
          for (let i = 0; i < resp.rows.length; i++) {
            const row = resp.rows[i]
            const path = (row.path + '').split('.')
            for (let k = 0; k < path.length; k++) {
              if (masterPathArr.indexOf(path[k])) {
                masterPathArr.push(parseInt(path[k]))
              }
            }
          }

          const existedAttrs = categoryRef.value.attributes || []

          categoryRef.value.attributes = []
          const path = categoryRef.value.path
          const pathArr = path.split('.').map(elem => parseInt(elem))
          const attrs = getAllItemsAttributes()

          const masterReqData = await seacrhAttributesRemotePIMInstance(validMasterTypes, masterPathArr)
          masterAttributesRef.value = masterReqData.rows ? masterReqData.rows.map(el => ({ id: el.id, value: el.identifier, text: el.identifier + ' : ' + (el.name[currentLanguage.value.identifier] || '[' + el.name[defaultLanguageIdentifier.value] + ']') })) : []

          const validSupplierTypes = supplierCategoryTypes.value.concat(supplierProductTypes.value)

          for (let i = 0; i < attrs.length; i++) {
            const attr = attrs[i]

            const noMappingOption = attr.options.find(option => option.name === 'no_mapping')
            if (noMappingOption && noMappingOption.value === 'true') continue

            let isSupplierValid = false
            let isSupplierVisible = false
            // let isMasterValid = false
            // let isMasterVisible = false

            if (attr.valid && attr.valid.length) {
              for (let k = 0; k < validSupplierTypes.length; k++) {
                const type = validSupplierTypes[k]
                if (attr.valid.indexOf(type.id) !== -1) {
                  isSupplierValid = true
                }
              }
              /* for (let k = 0; k < validMasterTypes.length; k++) {
                const type = validMasterTypes[k]
                if (attr.valid.indexOf(type) !== -1) {
                  isMasterValid = true
                }
              } */
            }

            if (pathArr.some(r => attr.visible.indexOf(r) !== -1)) {
              isSupplierVisible = true
            }

            /* if (masterPathArr.some(r => attr.visible.indexOf(r) !== -1)) {
              isMasterVisible = true
            } */

            if (isSupplierValid && isSupplierVisible) {
              const nameText = (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']')
              if (attr.languageDependent) {
                for (let l = 0; i < languages.length; l++) {
                  const lang = languages[l]
                  const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
                  categoryRef.value.attributes.push({ id: attr.id, value: attr.identifier + '#' + lang.identifier, name: nameText + langText })
                }
              } else {
                categoryRef.value.attributes.push({ id: attr.id, value: attr.identifier, name: nameText })
              }
            }

            /* if (isMasterValid && isMasterVisible) {
              const nameText = attr.identifier + ' : ' + (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']')
              masterAttributesRef.value.push({ id: attr.id, value: attr.identifier, text: nameText })
            } */
          }

          const tmp = categoryRef.value.attributes
          tmp.sort((a, b) => {
            return channelAttributesRef.value.findIndex(elem => elem.id === a.id) - channelAttributesRef.value.findIndex(elem => elem.id === b.id)
          })
          categoryRef.value.attributes = tmp

          if (existedAttrs.length) {
            for (let i = 0; i < categoryRef.value.attributes.length; i++) {
              const attr = categoryRef.value.attributes[i]
              const existedAttr = existedAttrs.find(el => el.value === attr.value)
              if (existedAttr && existedAttr.attrIdent) {
                attr.attrIdent = existedAttr.attrIdent
              }
              if (existedAttr && existedAttr.expr) {
                attr.expr = existedAttr.expr
              }
            }
          }

          channelAttributesRef.value = categoryRef.value.attributes
          dataLoading.value = false
        })
      })
    }

    onMounted(() => {
      if (props.channel.config && props.channel.config.supplierCategory) {
        supplierCategoryRef.value = props.channel.config.supplierCategory
      }
      Promise.all([loadAllTypes(), loadAllRelations(), loadAllAttributes()]).then(async () => {
        supplierCategoryTypes.value = (props.channel.config && props.channel.config.supplierCategoryTypes) ? props.channel.config.supplierCategoryTypes.map((id) => findType(id).node) : []
        supplierProductTypes.value = (props.channel.config && props.channel.config.supplierProductTypes) ? props.channel.config.supplierProductTypes.map((id) => findType(id).node) : []
        masterProductTypes.value = (props.channel.config && props.channel.config.masterProductTypes) ? props.channel.config.masterProductTypes : ''
        masterUrl.value = (props.channel.config && props.channel.config.masterUrl) ? props.channel.config.masterUrl : ''
        masterLogin.value = (props.channel.config && props.channel.config.masterLogin) ? props.channel.config.masterLogin : ''
        masterPassword.value = (props.channel.config && props.channel.config.masterPassword) ? props.channel.config.masterPassword : ''
        masterCategoryAttributeIdentifier.value = (props.channel.config && props.channel.config.masterCategoryAttributeIdentifier) ? props.channel.config.masterCategoryAttributeIdentifier : ''
        typesLoadedRef.value = true
        relationsLoadedRef.value = true
        loadAttributes()
      })
    })

    return {
      categoryIdRef,
      categoryRef,
      newCategoryIdRef,
      add,
      addCategory,
      remove,
      categoryChanged,
      mappedCategories,
      dialogRef,
      categoriesTreeRef,
      treeSearchRef,
      addChildren2TreeView,
      treeActiveRef,

      channelAttributesRef,
      masterAttributesRef,

      supplierCategoryRef,
      supplierCategorySelected,
      supplierCategorySelectionDialogRef,

      supplierCategoryTypes,
      supplierCategoryTypeSelectionDialogRef,
      supplierCategoryTypesSelected,
      editSupplierCategoryTypes,

      supplierProductTypes,
      supplierProductTypeSelectionDialogRef,
      supplierProductTypesSelected,
      editSupplierProductTypes,

      masterProductTypes,
      masterProductTypesChanged,
      masterCategoryAttributeIdentifier,
      masterCategoryAttributeIdentifierChanged,

      masterUrl,
      masterUrlChanged,
      masterLogin,
      masterLoginChanged,
      masterPassword,
      masterPasswordChanged,
      dataLoading,

      languages,
      defaultLanguageIdentifier,
      currentLanguage,
      channelFactory: getChannelFactory(props.channel.type),
      canEditConfig
    }
  }
}
</script>
