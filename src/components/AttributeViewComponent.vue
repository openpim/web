<template>
  <div v-if="attr">
          <div class="d-inline-flex align-center">
            <v-text-field style="min-width: 100%" v-model="attr.identifier"  :readonly="attr.internalId !== 0" :rules="identifierRules" :label="$t('Config.Attributes.Identifier')" required></v-text-field>
            <SystemInformation :data="attr"></SystemInformation>
          </div>

          <LanguageDependentField :values="attr.name" v-model="attr.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('Config.Attributes.Name')"></LanguageDependentField>
          <v-checkbox v-model="attr.languageDependent" :label="$t('Config.Attributes.LanguageDependent')"></v-checkbox>

          <v-select v-model="attr.type" :items="typeSelection" :rules="typeRules" :label="$t('Config.Attribute.Type')"></v-select>

          <v-checkbox v-if="attr.type === AttributeType.Text" v-model="attr.multiLine" :label="$t('Config.Attribute.MultiLine')"></v-checkbox>
          <v-checkbox v-if="attr.type === AttributeType.Text" v-model="attr.richText" :label="$t('Config.Attribute.RichText')"></v-checkbox>
          <v-text-field v-if="attr.type === AttributeType.Text || attr.type === AttributeType.Integer || attr.type === AttributeType.Float || attr.type === AttributeType.Date || attr.type === AttributeType.DateTime" v-model="attr.pattern" :label="$t('Config.Attribute.Pattern')" required></v-text-field>
          <LanguageDependentField v-if="attr.type === AttributeType.Text || attr.type === AttributeType.Integer || attr.type === AttributeType.Float || attr.type === AttributeType.Date || attr.type === AttributeType.DateTime" :values="attr.errorMessage" v-model="attr.errorMessage[currentLanguage.identifier]" :label="$t('Config.Attribute.ErrorMessage')"></LanguageDependentField>

          <v-container v-if="attr.type === AttributeType.LOV">
            <v-row v-if="attr.type === AttributeType.LOV">
              <v-autocomplete v-model="attr.lov" :items="lovSelection" :label="$t('Config.Attribute.LOV')" clearable clear-icon="mdi-close-circle-outline"></v-autocomplete>
              <v-tooltip bottom v-if="attr.lov">
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on" @click="changeLOV(attr.lov)"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                </template>
                <span>{{ $t('Edit') }}</span>
              </v-tooltip>
              <v-tooltip bottom v-if="!attr.lov">
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on" @click="addNewLOV()"><v-icon>mdi-plus</v-icon></v-btn>
                </template>
                <span>{{ $t('Add') }}</span>
              </v-tooltip>
            </v-row>
          </v-container>

          <v-text-field v-model="attr.order" type="number" :label="$t('Config.Attributes.Order')" required></v-text-field>

          <v-tabs v-model="tabRef">
            <v-tab v-text="$t('Config.Attributes.ForObjects')"></v-tab>
            <v-tab v-text="$t('Config.Attributes.ForRelations')"></v-tab>
          </v-tabs>
          <v-tabs-items v-model="tabRef">
            <v-tab-item>
              <ValidVisibleComponent :elem="attr" :canEditConfig="canEditConfig"/>
            </v-tab-item>
            <v-tab-item>
              <v-card class="mb-5 mt-2">
                <v-card-title class="subtitle-2 font-weight-bold" >
                  <div style="width:90%">{{ $t('Config.Attributes.ForRelations') }}</div>
                  <v-tooltip bottom v-if="canEditConfig">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="editRelations"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Edit') }}</span>
                  </v-tooltip>
                </v-card-title>
                <v-divider></v-divider>
                <v-list dense class="pt-0 pb-0">
                  <v-list-item v-for="(item, i) in attrRelations" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
                    <router-link :to="'/config/relations/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
                  </v-list-item-content></v-list-item>
                </v-list>
              </v-card>
            </v-tab-item>
          </v-tabs-items>

          <OptionsTable :options="attr.options" @changed="optionsChanged" />
    <RelationsSelectionDialog ref="relSelectionDialogRef" :multiselect="true" @selected="relationsSelected"/>
    <template v-if=changeLOVDialogRef>
      <v-dialog v-model="changeLOVDialogRef" persistent max-width="1200px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ $t('Config.Attribute.LOV') }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <LOVViewComponent ref="changeLOVDialogRef" :lov="lov" :canEditConfig="canEditConfig" />
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text v-if="canEditConfig && lov.id !== -1" @click="save">{{ $t('Save') }}</v-btn>
            <v-btn color="blue darken-1" text @click=closeChangeLOV()>{{ $t('Cancel') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>
<script>
import { onMounted, computed, ref } from '@vue/composition-api'
import i18n from '../i18n'
import AttributeType from '../constants/attributeTypes'
import * as attrStore from '../store/attributes'
import * as langStore from '../store/languages'
import * as relStore from '../store/relations'
import * as lovStore from '../store/lovs'
import * as errorStore from '../store/error'
import * as itemsStore from '../store/item'

import OptionsTable from '../components/OptionsTable'
import ValidVisibleComponent from '../components/ValidVisibleComponent'
import SystemInformation from '../components/SystemInformation'
import LanguageDependentField from '../components/LanguageDependentField'
import RelationsSelectionDialog from '../components/RelationsSelectionDialog'
import LOVViewComponent from '../components/LOVViewComponent'

import additionalAttrTypesList from '../_customizations/attributes/additionalTypes.js'
import newLOVGenerator from '../_customizations/lovs/newLOVGenerator.js'

export default {
  components: { OptionsTable, ValidVisibleComponent, SystemInformation, LanguageDependentField, RelationsSelectionDialog, LOVViewComponent },
  props: {
    attr: {
      required: true
    },
    canEditConfig: {
      required: true
    }
  },
  setup (props, context) {
    const {
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages
    } = langStore.useStore()

    const {
      showInfo
    } = errorStore.useStore()

    const {
      checkIdentifier
    } = attrStore.useStore()

    const {
      relations,
      loadAllRelations
    } = relStore.useStore()

    const { nextId } = itemsStore.useStore()

    let typeSelection = [
      { text: i18n.t('Config.Attribute.Type.Text'), value: AttributeType.Text },
      { text: i18n.t('Config.Attribute.Type.Boolean'), value: AttributeType.Boolean },
      { text: i18n.t('Config.Attribute.Type.Integer'), value: AttributeType.Integer },
      { text: i18n.t('Config.Attribute.Type.Float'), value: AttributeType.Float },
      { text: i18n.t('Config.Attribute.Type.Date'), value: AttributeType.Date },
      { text: i18n.t('Config.Attribute.Type.Time'), value: AttributeType.Time },
      { text: i18n.t('Config.Attribute.Type.LOV'), value: AttributeType.LOV },
      { text: i18n.t('Config.Attribute.Type.URL'), value: AttributeType.URL }
    ]

    if (additionalAttrTypesList) {
      const mappedAddAttrTypeList = additionalAttrTypesList.map(el => ({ text: el.text, value: el.value }))
      typeSelection = [...typeSelection, ...mappedAddAttrTypeList]
    }

    const { lovs, loadAllLOVs, saveLOV, getLOVsForSelect, addLOV } = lovStore.useStore()

    const lovSelection = ref([])
    const lov = ref({ id: -1 })
    const tabRef = ref(null)
    const relSelectionDialogRef = ref(null)
    const changeLOVDialogRef = ref(null)
    const rels = ref([])

    const attrRelations = computed(() => {
      if (props.attr.relations) {
        return props.attr.relations.map(id => rels.value.find(rel => rel.id === id))
      } else {
        return []
      }
    })

    function editRelations () {
      relSelectionDialogRef.value.showDialog('', props.attr.relations)
    }

    function relationsSelected (arr) {
      relSelectionDialogRef.value.closeDialog()
      props.attr.relations = arr
    }

    async function addNewLOV () {
      const obj = await newLOVGenerator(nextId, props.attr)
      lov.value = addLOV()
      if (obj) {
        lov.value.identifier = obj.identifier
        if (obj.name) lov.value.name = obj.name
      }
      changeLOVDialogRef.value = true
    }

    function changeLOV (value) {
      if (!value) return
      const previousLOV = lov.value
      lov.value = lovs.find(function (lov) {
        return (lov.id === value.toString())
      })
      if (typeof lov.value === 'undefined') lov.value = previousLOV
      changeLOVDialogRef.value = true
    }

    function closeChangeLOV () {
      changeLOVDialogRef.value = false
    }

    async function save () {
      if (lov.value) {
        await saveLOV(lov.value).then(() => {
          showInfo(i18n.t('Saved'))
          closeChangeLOV()
        })
        if (lov.value.id !== lov.value.internalId) {
          props.attr.lov = lov.value.internalId
          getLOVsForSelect().then((arr) => {
            lovSelection.value = arr
          })
        }
      }
    }

    onMounted(() => {
      loadAllRelations().then(() => {
        rels.value = relations
      })
      loadAllLanguages().then(() =>
        getLOVsForSelect().then((arr) => {
          lovSelection.value = arr
        })
      )
      Promise.all([loadAllLOVs()])
    })

    function optionsChanged (val) {
      props.attr.options = val
    }

    function identifierValidation (v) {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(v)) {
        return i18n.t('Wrong.Attribute.Identifier')
      }
      if (!v) {
        return i18n.t('Config.Attributes.Error.IdentifierRequired')
      }
      if (v && props.attr.internalId === 0) {
        const found = checkIdentifier(v)
        if (found) {
          return i18n.t('Config.Attributes.Error.IdentifierNotUnique')
        }
      }
      return true
    }

    return {
      lov,
      save,
      changeLOV,
      addNewLOV,
      closeChangeLOV,
      editRelations,
      relationsSelected,
      relSelectionDialogRef,
      changeLOVDialogRef,
      tabRef,
      AttributeType,
      lovSelection,
      attrRelations,
      currentLanguage,
      defaultLanguageIdentifier,
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('Config.Attributes.Error.NameRequired')
      ],
      typeRules: [
        v => !!v || i18n.t('Config.Attributes.Error.TypeRequired')
      ],
      optionsChanged,
      typeSelection
    }
  }
}
</script>
