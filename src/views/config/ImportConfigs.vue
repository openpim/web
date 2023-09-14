<template>
  <v-container v-if="canViewConfigRef">
    <v-row no-gutters>
      <v-col cols="3" lg="2" xl="2">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ $t('Config.ImportConfigs.Title') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip bottom v-if="canEditConfigRef">
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" @click="add"><v-icon>mdi-plus</v-icon></v-btn>
            </template>
            <span>{{ $t('Add') }}</span>
          </v-tooltip>
        </v-toolbar>
        <v-text-field v-model="searchRef" @input="clearSelection" :label="$t('Filter')" flat hide-details clearable clear-icon="mdi-close-circle-outline" class="ml-5 mr-5"></v-text-field>
        <v-list nav dense>
          <v-list-item-group v-model="itemRef" color="primary">
            <v-list-item v-for="(item, id) in importConfigsFiltered" :key="id">
              <v-list-item-icon><v-icon>mdi-file-code-outline</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col cols="9" lg="10" xl="10">
        <v-form ref="formRef" lazy-validation class="ml-7" v-if="selectedRef && selectedRef.id != -1">
          <div class="d-inline-flex align-center">
            <v-text-field style="min-width: 100%" v-model="selectedRef.identifier"  :disabled="selectedRef.internalId !== 0" :rules="identifierRules" :label="$t('Config.ImportConfigs.Identifier')" required></v-text-field>
            <SystemInformation :data="selectedRef"></SystemInformation>
          </div>
          <LanguageDependentField :values="selectedRef.name" v-model="selectedRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('Config.ImportConfigs.Name')"></LanguageDependentField>
          <v-select v-model="selectedRef.type" @change="resetModel" :items="types" :readonly="!canEditConfigRef" :label="$t('Config.ImportConfigs.Type')"></v-select>
          <component v-if="importConfigFactory.getConfigCompoment()" :is="importConfigFactory.getConfigCompoment()" :importConfig="selectedRef" :readonly="!canEditConfigRef" ></component>
          <v-btn class="mr-4" v-if="canEditConfigRef" :disabled="!selectedRef.filedata.info.fileName" @click="save">{{ $t('Save') }}</v-btn>
          <v-btn class="mr-4" v-if="canEditConfigRef" :disabled="isTestDisabled()" @click="saveAndTest">{{ $t('ImportConfig.SaveAndTest') }}</v-btn>
          <v-btn class="mr-4" v-if="canEditConfigRef" @click.stop="remove" :disabled="selectedRef.attributes && selectedRef.attributes.length > 0">{{ $t('Remove') }}</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch } from '@vue/composition-api'
import * as errorStore from '../../store/error'
import * as importConfigsStore from '../../store/importConfigs'
// import * as actionsStore from '../../store/actions'
import * as attrStore from '../../store/attributes'
import * as typesStore from '../../store/types'
import * as langStore from '../../store/languages'
import * as userStore from '../../store/users'
import i18n from '../../i18n'
import LanguageDependentField from '../../components/LanguageDependentField'
import router from '../../router'
import SystemInformation from '../../components/SystemInformation'
import getImportConfigFactory from '../../components/ImportConfigs'

import CSVFactory from '@/components/ImportConfigs/csv/CSVFactory.vue'
import XLSFactory from '@/components/ImportConfigs/xls/XLSFactory.vue'
import YandexFactory from '@/components/ImportConfigs/yandex/YandexFactory.vue'

import eventBus from '@/eventBus'

export default {
  components: { LanguageDependentField, SystemInformation, CSVFactory, XLSFactory, YandexFactory },
  setup () {
    const { canViewConfig, canEditConfig } = userStore.useStore()
    const { defaultLanguageIdentifier, currentLanguage } = langStore.useStore()
    const { importConfigs, loadAllImportConfigs, saveImportConfig, removeImportConfig, testImportConfig } = importConfigsStore.useStore()
    const { showInfo } = errorStore.useStore()

    const canEditConfigRef = ref(false)
    const canViewConfigRef = ref(false)
    // const empty = { id: -1, type: 2, afterUpdateAction: generateEmptyActionObject('empty', 3), beforeUpdateAction: generateEmptyActionObject('empty', 4) }
    const empty = { id: -1, type: 2 }
    const formRef = ref(null)
    const itemRef = ref(null)
    const searchRef = ref('')
    const selectedRef = ref(empty)
    const selectedTypeRef = ref([])
    const typesLoadedRef = ref(false)
    const visible = ref([])

    const availableFields = ref([])

    const {
      findType,
      loadAllTypes
    } = typesStore.useStore()

    const {
      getAttributesForItem
    } = attrStore.useStore()

    const importConfigFactory = computed(() => {
      return getImportConfigFactory(selectedRef.value.type)
    })

    const types = ref([
      { value: 1, text: i18n.t('ImportConfig.Filetype.CSV') },
      { value: 2, text: i18n.t('ImportConfig.Filetype.XLS') },
      { value: 3, text: i18n.t('ImportConfig.Filetype.YML') }
    ])

    function add () {
      selectedRef.value = addImportConfig()
      itemRef.value = importConfigs.length - 1
    }

    function clearSelection () {
      selectedRef.value = null
      itemRef.value = null
    }

    const valid = computed(() => {
      if (typesLoadedRef.value && selectedTypeRef.value) {
        return selectedTypeRef.value.map((id) => findType(id).node)
      }
      return []
    })

    watch(() => selectedTypeRef.value, () => {
      if (selectedTypeRef.value && visible.value.length) {
        availableFields.value = getAttributesForItem(selectedTypeRef.value, visible.value[0].path)
      }
    })

    onMounted(() => {
      eventBus.on('tab_updated', data => {
        selectedRef.value.tab = data
      })

      eventBus.on('mappings_updated', data => {
        console.log(data)
        selectedRef.value.mappings = data
      })

      eventBus.on('file_updated', data => {
        console.log(data)
        selectedRef.value.filedata = data
      })

      eventBus.on('config_updated', data => {
        console.log(data)
        selectedRef.value.config = data
      })

      canViewConfigRef.value = canViewConfig('importConfigs')
      canEditConfigRef.value = canEditConfig('importConfigs')
      Promise.all([loadAllTypes(), loadAllImportConfigs()]).then(() => {
        typesLoadedRef.value = true
        clearSelection()
        const id = router.currentRoute.params.id
        if (id) {
          const idx = importConfigs.findIndex((elem) => elem.identifier === id)
          if (idx !== -1) {
            selectedRef.value = importConfigs[idx]
            itemRef.value = idx
          } else {
            router.push('/config/imports')
          }
        }
      })
    })

    function addImportConfig () {
      const name = {}
      name[currentLanguage.value.identifier] = i18n.t('Config.ImportConfigs.NewName')
      const newImportConfig = {
        id: Date.now(),
        isNew: true,
        language: currentLanguage.value.identifier,
        internalId: 0,
        name: name,
        type: 2,
        mappings: [
          {
            attribute: 'identifier',
            column: null,
            expression: null
          },
          {
            attribute: 'typeIdentifier',
            column: null,
            expression: null
          },
          {
            attribute: 'parentIdentifier',
            column: null,
            expression: null
          }
        ],
        config: {
          selectedTab: null,
          noHeadersChecked: false,
          headerLineNumber: 1,
          dataLineNumber: 2,
          limit: 0
        },
        filedata: {
          info: {},
          data: {}
        }
        // beforeUpdateAction: generateEmptyActionObject(null, 3),
        // afterUpdateAction: generateEmptyActionObject(null, 4)
      }
      importConfigs.push(newImportConfig)
      return newImportConfig
    }

    function isTestDisabled () {
      const identifierMapping = selectedRef.value.mappings.find(el => el.attribute === 'identifier')
      if (selectedRef.value.filedata.info.fileName && identifierMapping && (identifierMapping.column || (identifierMapping.expression && identifierMapping.expression.length))) {
        return false
      }
      return true
    }

    function resetModel () {
      selectedRef.value.filedata = {
        info: {},
        data: {}
      }

      selectedRef.value.config = {
        headerLineNumber: 1,
        dataLineNumber: 2,
        limit: 0
      }

      selectedRef.value.mappings = [
        {
          attribute: 'identifier',
          column: null,
          expression: null
        },
        {
          attribute: 'typeIdentifier',
          column: null,
          expression: null
        },
        {
          attribute: 'parentIdentifier',
          column: null,
          expression: null
        }
      ]
    }

    onUnmounted(() => {
      eventBus.off('mappings_updated')
      eventBus.off('config_updated')
      eventBus.off('file_updated')
    })

    watch(importConfigs, (selected, previous) => {
      console.log('importConfigs changed')
    })

    watch(itemRef, (selected, previous) => {
      if (selected == null) {
        selectedRef.value = empty
        return
      }
      if (selected < importConfigsFiltered.value.length) {
        if (previous && importConfigsFiltered.value[previous] && importConfigsFiltered.value[previous].internalId === 0) {
          showInfo(i18n.t('Config.NotSaved'))
        }
        selectedRef.value = importConfigsFiltered.value[selected]
        // selectedRef.value.beforeUpdateAction = getActionForImportConfig(importConfigsFiltered.value[selected].identifier, 3)
        // selectedRef.value.afterUpdateAction = getActionForImportConfig(importConfigsFiltered.value[selected].identifier, 4)
        if (selectedRef.value.internalId !== 0 && selectedRef.value.identifier) {
          router.push('/config/imports/' + selectedRef.value.identifier)
        } else {
          router.push('/config/imports')
        }
      }
    })

    function identifierValidation (v) {
      if (!v) {
        return i18n.t('Config.ImportConfigs.Error.IdentifierRequired')
      }
      if (!/^[A-Za-z0-9_]*$/.test(v)) {
        return i18n.t('Wrong.Identifier')
      }
      if (v && selectedRef.value.internalId === 0) {
        const found = importConfigs.find((lang) => lang.identifier === v)
        if (found && found.internalId !== 0) {
          return i18n.t('Config.ImportConfigs.Error.IdentifierNotUnique')
        }
      }
      return true
    }

    const importConfigsFiltered = computed(() => {
      console.log('importConfigsFiltered')
      let arr = importConfigs
      if (searchRef.value) {
        const s = searchRef.value.toLowerCase()
        arr = importConfigs.filter(item => item.identifier.toLowerCase().indexOf(s) > -1 || (item.name && Object.values(item.name).find(val => val.toLowerCase().indexOf(s) > -1)))
      }
      return arr.sort((a, b) => {
        if (a.name[defaultLanguageIdentifier.value] && b.name[defaultLanguageIdentifier.value]) {
          return a.name[defaultLanguageIdentifier.value].localeCompare(b.name[defaultLanguageIdentifier.value])
        } else {
          return 0
        }
      })
    })

    function save () {
      if (formRef.value.validate()) {
        saveImportConfig(selectedRef.value).then(() => {
          showInfo(i18n.t('Saved'))
        })
      }
    }

    function saveAndTest () {
      if (formRef.value.validate()) {
        saveImportConfig(selectedRef.value).then(() => {
          testImportConfig(selectedRef.value).then(() => {
            showInfo(i18n.t('Tested'))
          })
        })
      }
    }

    function remove () {
      if (confirm(i18n.t('Config.ImportConfigs.Confirm.Delete', { name: selectedRef.value.name }))) {
        removeImportConfig(selectedRef.value.id)
        selectedRef.value = empty
      }
    }

    return {
      add,
      availableFields,
      canEditConfigRef,
      canViewConfigRef,
      clearSelection,
      currentLanguage,
      defaultLanguageIdentifier,
      formRef,
      importConfigsFiltered,
      importConfigFactory,
      itemRef,
      remove,
      save,
      saveAndTest,
      searchRef,
      selectedRef,
      selectedTypeRef,
      types,
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('Config.ImportConfigs.Error.NameRequired')
      ],
      valid,
      visible,
      resetModel,
      isTestDisabled
    }
  }
}
</script>
