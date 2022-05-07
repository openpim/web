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

          <v-select v-if="attr.type === AttributeType.LOV" v-model="attr.lov" :items="lovSelection" :label="$t('Config.Attribute.LOV')"></v-select>

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

import OptionsTable from '../components/OptionsTable'
import ValidVisibleComponent from '../components/ValidVisibleComponent'
import SystemInformation from '../components/SystemInformation'
import LanguageDependentField from '../components/LanguageDependentField'
import RelationsSelectionDialog from '../components/RelationsSelectionDialog'

export default {
  components: { OptionsTable, ValidVisibleComponent, SystemInformation, LanguageDependentField, RelationsSelectionDialog },
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
      checkIdentifier
    } = attrStore.useStore()

    const {
      relations,
      loadAllRelations
    } = relStore.useStore()

    const { getLOVsForSelect } = lovStore.useStore()

    const lovSelection = ref([])
    const tabRef = ref(null)
    const relSelectionDialogRef = ref(null)
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

    onMounted(() => {
      loadAllRelations().then(() => {
        rels.value = relations
      })
      loadAllLanguages().then(() =>
        getLOVsForSelect().then((arr) => {
          lovSelection.value = arr
        })
      )
    })

    function optionsChanged (val) {
      props.attr.options = val
    }

    function identifierValidation (v) {
      if (!/^[A-Za-z0-9_]*$/.test(v)) {
        return i18n.t('Wrong.Identifier')
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
      editRelations,
      relationsSelected,
      relSelectionDialogRef,
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
      typeSelection: [
        { text: i18n.t('Config.Attribute.Type.Text'), value: AttributeType.Text },
        { text: i18n.t('Config.Attribute.Type.Boolean'), value: AttributeType.Boolean },
        { text: i18n.t('Config.Attribute.Type.Integer'), value: AttributeType.Integer },
        { text: i18n.t('Config.Attribute.Type.Float'), value: AttributeType.Float },
        { text: i18n.t('Config.Attribute.Type.Date'), value: AttributeType.Date },
        { text: i18n.t('Config.Attribute.Type.Time'), value: AttributeType.Time },
        { text: i18n.t('Config.Attribute.Type.LOV'), value: AttributeType.LOV },
        { text: i18n.t('Config.Attribute.Type.URL'), value: AttributeType.URL }
      ]
    }
  }
}
</script>
