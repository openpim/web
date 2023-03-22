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
        <v-btn color="blue darken-1" v-if="!readonly" text @click="supplierCategorySelectionDialogRef.showDialog()">Выбрать</v-btn>
      </v-col>
    </v-row>

    <v-card class="mb-5 mt-5">
      <v-card-title class="subtitle-2 font-weight-bold" >
        <div style="width:90%">{{ $t('MappingConfigComponent.MasterProductTypes') }}</div>
        <v-tooltip bottom v-if="!readonly">
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="editMasterProductTypes"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
          </template>
          <span>{{ $t('Edit') }}</span>
        </v-tooltip>
      </v-card-title>
      <v-divider></v-divider>
      <v-list dense class="pt-0 pb-0">
        <v-list-item v-for="(item, i) in masterProductTypes" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
          <router-link :to="'/config/types/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
        </v-list-item-content></v-list-item>
      </v-list>
    </v-card>

    <v-card class="mb-5 mt-2">
      <v-card-title class="subtitle-2 font-weight-bold" >
        <div style="width:90%">{{ $t('MappingConfigComponent.MasterRelations') }}</div>
        <v-tooltip bottom v-if="!readonly">
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="editRelations"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
          </template>
          <span>{{ $t('Edit') }}</span>
        </v-tooltip>
      </v-card-title>
      <v-divider></v-divider>
      <v-list dense class="pt-0 pb-0">
        <v-list-item v-for="(item, i) in masterRelations" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
          <router-link :to="'/config/relations/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
        </v-list-item-content></v-list-item>
      </v-list>
    </v-card>

    <v-row>
      <v-col cols="12">
        <MappingAttributesCompoment class="mt-5" v-if="masterAttributesRef.length && supplierAttributesRef.length" :readonly="readonly" :category="supplierCategoryRef" :channel="channel" :canManageAttributes="channelFactory.canManageAttributes && canEditConfig('attributes')" :attributes="supplierAttributesRef" :pimAttributes="masterAttributesRef" :channelAttributes="channelAttributesRef" />
      </v-col>
    </v-row>
    <ItemsSelectionDialog ref="supplierCategorySelectionDialogRef" @selected="supplierCategorySelected"/>
    <TypeSelectionDialog ref="supplierCategoryTypeSelectionDialogRef" :multiselect="true" @selected="supplierCategoryTypesSelected"/>
    <TypeSelectionDialog ref="supplierProductTypeSelectionDialogRef" :multiselect="true" @selected="supplierProductTypesSelected"/>
    <TypeSelectionDialog ref="masterProductTypeSelectionDialogRef" :multiselect="true" @selected="masterProductTypesSelected"/>
    <RelationsSelectionDialog ref="relSelectionDialogRef" :multiselect="true" @selected="relationsSelected"/>
  </div>
</template>
<script>
import { ref, onMounted, watch } from '@vue/composition-api'

import * as itemStore from '@/store/item'
import * as langStore from '@/store/languages'
import * as userStore from '@/store/users'
import * as attrStore from '@/store/attributes'
import * as typesStore from '@/store/types'
import * as relStore from '@/store/relations'

import RelationsSelectionDialog from '@/components/RelationsSelectionDialog'
import ItemsSelectionDialog from '@/components/ItemsSelectionDialog'
import TypeSelectionDialog from '@/components/TypeSelectionDialog'

import MappingAttributesCompoment from '@/channels/MappingAttributesCompoment'

import getChannelFactory from '@/channels'

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
  components: { ItemsSelectionDialog, TypeSelectionDialog, MappingAttributesCompoment, RelationsSelectionDialog },
  setup (props, { root }) {
    const { canEditConfig } = userStore.useStore()

    const {
      loadItemsByIds,
      searchItems
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
      relations,
      loadAllRelations
    } = relStore.useStore()

    const channelAttributesRef = ref([])
    const supplierAttributesRef = ref([])
    const masterAttributesRef = ref([])

    const supplierCategoryRef = ref(null)

    const supplierCategorySelectionDialogRef = ref(null)
    const supplierCategoryTypeSelectionDialogRef = ref(null)
    const supplierProductTypeSelectionDialogRef = ref(null)
    const masterProductTypeSelectionDialogRef = ref(null)
    const relSelectionDialogRef = ref(null)

    const supplierCategoryTypes = ref([])
    const supplierProductTypes = ref([])
    const masterProductTypes = ref([])
    const masterRelations = ref([])

    const typesLoadedRef = ref(false)
    const relationsLoadedRef = ref(false)

    watch(() => props.channel, (chan, previousValue) => {
      if (!typesLoadedRef.value && !relationsLoadedRef.value) return
      supplierCategoryRef.value = chan.config.supplierCategory ? chan.config.supplierCategory : null
      supplierCategoryTypes.value = chan.config.supplierCategoryTypes ? chan.config.supplierCategoryTypes.map((id) => findType(id).node) : []
      supplierProductTypes.value = chan.config.supplierProductTypes ? chan.config.supplierProductTypes.map((id) => findType(id).node) : []
      masterProductTypes.value = chan.config.masterProductTypes ? chan.config.masterProductTypes.map((id) => findType(id).node) : []
      masterRelations.value = chan.config.masterRelations ? chan.config.masterRelations.map(id => relations.find(rel => rel.id === id)) : []
      masterAttributesRef.value = []
      supplierAttributesRef.value = []
      loadAttributes()
    })

    /* watch(() => supplierAttributesRef.value, (attrs, previousValue) => {
      console.log(JSON.stringify([...supplierAttributesRef.value]))
    }) */

    function editSupplierProductTypes () {
      supplierProductTypeSelectionDialogRef.value.showDialog('', props.channel.config.supplierProductTypes)
    }

    function editMasterProductTypes () {
      masterProductTypeSelectionDialogRef.value.showDialog('', props.channel.config.masterProductTypes)
    }

    function editSupplierCategoryTypes () {
      supplierCategoryTypeSelectionDialogRef.value.showDialog('', props.channel.config.supplierCategoryTypes)
    }

    function editRelations () {
      relSelectionDialogRef.value.showDialog('', props.channel.config.masterRelations)
    }

    function supplierCategorySelected (id) {
      if (supplierCategorySelectionDialogRef.value) supplierCategorySelectionDialogRef.value.closeDialog()
      loadItemsByIds([id], false).then(items => {
        supplierCategoryRef.value = items[0]
        props.channel.config.supplierCategory = supplierCategoryRef.value
        loadAttributes()
      })
    }

    function supplierCategoryTypesSelected (arr) {
      props.channel.config.supplierCategoryTypes = arr
      supplierCategoryTypes.value = props.channel.config.supplierCategoryTypes.map((id) => findType(id).node)
      supplierCategoryTypeSelectionDialogRef.value.closeDialog()
      loadAttributes()
    }

    function supplierProductTypesSelected (arr) {
      props.channel.config.supplierProductTypes = arr
      supplierProductTypes.value = props.channel.config.supplierProductTypes.map((id) => findType(id).node)
      supplierProductTypeSelectionDialogRef.value.closeDialog()
      loadAttributes()
    }

    function masterProductTypesSelected (arr) {
      props.channel.config.masterProductTypes = arr
      masterProductTypes.value = props.channel.config.masterProductTypes.map((id) => findType(id).node)
      masterProductTypeSelectionDialogRef.value.closeDialog()
      loadAttributes()
    }

    function relationsSelected (arr) {
      props.channel.config.masterRelations = arr
      masterRelations.value = props.channel.config.masterRelations.map(id => relations.find(rel => rel.id === id))
      relSelectionDialogRef.value.closeDialog()
      loadAttributes()
    }

    function loadAttributes () {
      if (!props.channel.type || !supplierCategoryRef.value) return
      masterAttributesRef.value = []
      let validMasterTypes = []
      for (let i = 0; i < masterRelations.value.length; i++) {
        const rel = masterRelations.value[i]
        for (let k = 0; k < rel.targets.length; k++) {
          validMasterTypes.push(rel.targets[k])
        }
      }

      validMasterTypes = validMasterTypes.concat(masterProductTypes.value.map(type => type.id))

      const req = {
        include: [{
          as: 'targetRelation',
          required: true,
          where: {
            relationIdentifier: {
              OP_in: masterRelations.value.map(rel => rel.identifier)
            }
          },
          include: [{
            as: 'sourceItem',
            required: true,
            where: {
              identifier: supplierCategoryRef.value.identifier
            }
          }]
        }]
      }

      searchItems(req, { page: 1, itemsPerPage: 10000 }).then(resp => {
        if (!resp.rows) return

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

        supplierAttributesRef.value = []
        const path = supplierCategoryRef.value.path
        const pathArr = path.split('.').map(elem => parseInt(elem))
        const attrs = getAllItemsAttributes()
        const validSupplierTypes = supplierCategoryTypes.value.concat(supplierProductTypes.value)

        for (let i = 0; i < attrs.length; i++) {
          const attr = attrs[i]

          let isSupplierValid = false
          let isSupplierVisible = false
          let isMasterValid = false
          let isMasterVisible = false

          if (attr.valid && attr.valid.length) {
            for (let k = 0; k < validSupplierTypes.length; k++) {
              const type = validSupplierTypes[k]
              if (attr.valid.indexOf(type.id) !== -1) {
                isSupplierValid = true
              }
            }
            for (let k = 0; k < validMasterTypes.length; k++) {
              const type = validMasterTypes[k]
              if (attr.valid.indexOf(type) !== -1) {
                isMasterValid = true
              }
            }
          }

          if (pathArr.some(r => attr.visible.indexOf(r) !== -1)) {
            isSupplierVisible = true
          }

          if (masterPathArr.some(r => attr.visible.indexOf(r) !== -1)) {
            isMasterVisible = true
          }

          if (isSupplierValid && isSupplierVisible) {
            const nameText = (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']')
            if (attr.languageDependent) {
              for (let l = 0; i < languages.length; l++) {
                const lang = languages[l]
                const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
                supplierAttributesRef.value.push({ id: attr.id, value: attr.identifier + '#' + lang.identifier, name: nameText + langText })
              }
            } else {
              supplierAttributesRef.value.push({ id: attr.id, value: attr.identifier, name: nameText })
            }
          }

          if (isMasterValid && isMasterVisible) {
            const nameText = (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']')
            masterAttributesRef.value.push({ id: attr.id, value: attr.identifier, text: nameText })
          }
        }

        for (let i = 0; i < supplierAttributesRef.value.length; i++) {
          const attr = supplierAttributesRef.value[i]
          const existedMapping = props.channel.mappings.attributes.find(el => el.value === attr.value)
          if (existedMapping) {
            if (existedMapping.attrIdent) {
              attr.attrIdent = existedMapping.attrIdent
            }
            if (existedMapping.expr) {
              attr.expr = existedMapping.expr
            }
          }
        }

        channelAttributesRef.value = supplierAttributesRef.value
        props.channel.mappings.attributes = supplierAttributesRef.value
      })
    }

    onMounted(() => {
      if (props.channel.config && props.channel.config.supplierCategory) {
        supplierCategoryRef.value = props.channel.config.supplierCategory
      }
      Promise.all([loadAllTypes(), loadAllRelations(), loadAllAttributes()]).then(async () => {
        supplierCategoryTypes.value = (props.channel.config && props.channel.config.supplierCategoryTypes) ? props.channel.config.supplierCategoryTypes.map((id) => findType(id).node) : []
        supplierProductTypes.value = (props.channel.config && props.channel.config.supplierProductTypes) ? props.channel.config.supplierProductTypes.map((id) => findType(id).node) : []
        masterProductTypes.value = (props.channel.config && props.channel.config.masterProductTypes) ? props.channel.config.masterProductTypes.map((id) => findType(id).node) : []
        masterRelations.value = (props.channel.config && props.channel.config.masterRelations) ? props.channel.config.masterRelations.map(id => relations.find(rel => rel.id === id)) : []
        typesLoadedRef.value = true
        relationsLoadedRef.value = true
        loadAttributes()
      })
    })

    return {
      channelAttributesRef,
      supplierAttributesRef,
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
      masterProductTypeSelectionDialogRef,
      masterProductTypesSelected,
      editMasterProductTypes,

      masterRelations,
      relSelectionDialogRef,
      relationsSelected,
      editRelations,

      languages,
      defaultLanguageIdentifier,
      currentLanguage,
      channelFactory: getChannelFactory(props.channel.type),
      canEditConfig
    }
  }
}
</script>
