<template>
  <div v-if="temp">
    <v-form ref="formRef" lazy-validation class="ml-7" v-if="temp.id != -1">
      <div class="d-inline-flex align-center">
        <v-text-field style="min-width: 100%" v-model="temp.identifier" :disabled="temp.internalId !== 0"
          :rules="identifierRules" :label="$t('Config.Languages.Identifier')" required></v-text-field>
        <SystemInformation :data="temp"></SystemInformation>
      </div>
      <LanguageDependentField :values="temp.name" v-model="temp.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('Config.Languages.Name')"></LanguageDependentField>
      <v-text-field v-model="temp.order" type="number" :label="$t('Config.Attributes.Order')" required></v-text-field>
      <ValidVisibleComponent :elem="temp" :canEditConfig="canEditConfig"/>
      <v-textarea :rows="15" style="min-width: 100%" v-model="temp.template" :label="$t('Config.Template.Template')" required></v-textarea>
      <br />
      <OptionsTable :options="temp.options" @changed="optionsChanged" />
    </v-form>
  </div>
</template>
<script>
import { ref } from '@vue/composition-api'
import i18n from '../i18n'
import ValidVisibleComponent from '../components/ValidVisibleComponent'
import * as langStore from '../store/languages'
import * as tempStore from '../store/templates'
import OptionsTable from '../components/OptionsTable'
import SystemInformation from '../components/SystemInformation'
import LanguageDependentField from '../components/LanguageDependentField'

export default {
  components: { SystemInformation, LanguageDependentField, ValidVisibleComponent, OptionsTable },
  props: {
    temp: {
      required: true
    },
    canEditConfig: {
      required: true
    }
  },
  setup (props, { root }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages
    } = langStore.useStore()

    const {
      templates
    } = tempStore.useStore()

    const formRef = ref(null)

    function optionsChanged (val) {
      props.temp.options = val
    }

    function identifierValidation (v) {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(v)) {
        return i18n.t('Wrong.Identifier')
      }
      if (!v) {
        return i18n.t('Config.Template.Error.IdentifierRequired')
      }
      if (v && props.temp.internalId === 0) {
        const found = templates.find((temp) => temp.identifier === v)
        if (found && found.internalId !== 0) {
          return i18n.t('Config.Template.Error.IdentifierNotUnique')
        }
      }
      return true
    }

    return {
      formRef,
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages,
      optionsChanged,
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
