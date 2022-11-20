<template>
  <v-container v-if="canViewConfigRef">
    <v-row no-gutters>
      <v-col cols="4">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ $t('Config.Relations.Relations') }}</v-toolbar-title>
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
            <v-list-item v-for="(item, i) in relationsFiltered" :key="i">
              <v-list-item-icon><v-icon>mdi-vector-line</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col cols="8">
        <v-form ref="formRef" lazy-validation class="ml-7" v-if="selectedRef && selectedRef.id != -1">
          <div class="d-inline-flex align-center">
            <v-text-field style="min-width: 100%" v-model="selectedRef.identifier"  :disabled="selectedRef.internalId !== 0" :rules="identifierRules" :label="$t('Config.Relations.Identifier')" required></v-text-field>
            <SystemInformation :data="selectedRef"></SystemInformation>
          </div>

          <LanguageDependentField :values="selectedRef.name" v-model="selectedRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('Config.Relations.Name')"></LanguageDependentField>
          <v-checkbox v-model="selectedRef.child" :label="$t('Config.Relations.Child')"></v-checkbox>
          <v-checkbox v-model="selectedRef.multi" :label="$t('Config.Relations.Multi')"></v-checkbox>

            <v-card class="mb-5">
              <v-card-title class="subtitle-2 font-weight-bold" >
                <div style="width:90%">{{ $t('Config.Relations.Sources') }}</div>
                <v-tooltip bottom v-if="canEditConfigRef">
                  <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on" @click="editSources"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                  </template>
                  <span>{{ $t('Edit') }}</span>
                </v-tooltip>
              </v-card-title>
              <v-divider></v-divider>
              <v-list dense class="pt-0 pb-0">
                <v-list-item v-for="(item, i) in sources" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
                  <router-link :to="'/config/types/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
                </v-list-item-content></v-list-item>
              </v-list>
            </v-card>

            <v-card class="mb-5">
              <v-card-title class="subtitle-2 font-weight-bold" >
                <div style="width:90%">{{ $t('Config.Relations.Targets') }}</div>
                <v-tooltip bottom v-if="canEditConfigRef">
                  <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on" @click="editTargets"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                  </template>
                  <span>{{ $t('Edit') }}</span>
                </v-tooltip>
              </v-card-title>
              <v-divider></v-divider>
              <v-list dense class="pt-0 pb-0">
                <v-list-item  v-for="(item, i) in targets" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
                  <router-link :to="'/config/types/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
                </v-list-item-content></v-list-item>
              </v-list>
            </v-card>

          <v-text-field v-model="selectedRef.order" type="number" :label="$t('Config.Relations.Order')" required></v-text-field>

          <OptionsTable :options="selectedRef.options" @changed="optionsChanged" />

          <v-btn class="mr-4" v-if="canEditConfigRef" @click="save">{{ $t('Save') }}</v-btn>
          <v-btn class="mr-4" v-if="canEditConfigRef" @click.stop="remove" :disabled="selectedRef.attributes && selectedRef.attributes.length > 0">{{ $t('Remove') }}</v-btn>
        </v-form>
      </v-col>
    </v-row>
    <TypeSelectionDialog ref="typeSelectionDialogRef" :multiselect="true" @selected="typesSelected"/>
  </v-container>
</template>

<script>
import { ref, watch, onMounted, computed } from '@vue/composition-api'
import * as relStore from '../../store/relations'
import * as errorStore from '../../store/error'
import * as typesStore from '../../store/types'
import i18n from '../../i18n'
import router from '../../router'
import TypeSelectionDialog from '../../components/TypeSelectionDialog'
import * as langStore from '../../store/languages'
import LanguageDependentField from '../../components/LanguageDependentField'
import * as userStore from '../../store/users'
import SystemInformation from '../../components/SystemInformation'
import OptionsTable from '../../components/OptionsTable'

export default {
  components: { TypeSelectionDialog, LanguageDependentField, SystemInformation, OptionsTable },
  setup () {
    const { canViewConfig, canEditConfig } = userStore.useStore()

    const {
      showInfo
    } = errorStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      relations,
      addRelation,
      saveRelation,
      loadAllRelations,
      removeRelation
    } = relStore.useStore()

    const {
      findType,
      loadAllTypes
    } = typesStore.useStore()

    const canViewConfigRef = ref(false)
    const canEditConfigRef = ref(false)

    const empty = { id: -1 }
    const formRef = ref(null)
    const typeSelectionDialogRef = ref(null)
    const selectedRef = ref(empty)
    const itemRef = ref(0)
    const sources = computed(() => {
      if (selectedRef.value.sources) {
        return selectedRef.value.sources.map((id) => findType(id).node)
      } else {
        return []
      }
    })
    const targets = computed(() => {
      if (selectedRef.value.targets) {
        return selectedRef.value.targets.map((id) => findType(id).node)
      } else {
        return []
      }
    })

    watch(itemRef, (selected, previous) => {
      if (selected == null) {
        selectedRef.value = empty
        router.push('/config/relations')
        return
      }
      if (selected < relationsFiltered.value.length) {
        if (previous && relationsFiltered.value[previous].internalId === 0) {
          showInfo(i18n.t('Config.NotSaved'))
        }
        selectedRef.value = relationsFiltered.value[selected]
        if (selectedRef.value.internalId !== 0 && selectedRef.value.identifier) {
          router.push('/config/relations/' + selectedRef.value.identifier)
        } else {
          router.push('/config/relations')
        }
      }
    })

    function add () {
      selectedRef.value = addRelation()
      itemRef.value = relations.length - 1
    }

    function save () {
      if (formRef.value.validate()) {
        router.push('/config/relations/' + selectedRef.value.identifier)
        saveRelation(selectedRef.value).then(() => {
          showInfo(i18n.t('Saved'))
        })
      }
    }

    function remove () {
      if (confirm(i18n.t('Config.Relations.Confirm.Delete'))) {
        removeRelation(selectedRef.value.id)
        selectedRef.value = empty
        router.push('/config/relations')
      }
    }

    function editSources () {
      typeSelectionDialogRef.value.showDialog('sources', selectedRef.value.sources)
    }

    function editTargets () {
      typeSelectionDialogRef.value.showDialog('targets', selectedRef.value.targets)
    }

    function optionsChanged (val) {
      selectedRef.value.options = val
    }

    function typesSelected (arr, initiator) {
      typeSelectionDialogRef.value.closeDialog()
      if (initiator === 'sources') {
        selectedRef.value.sources = arr
      } else {
        selectedRef.value.targets = arr
      }
    }

    const searchRef = ref('')
    const relationsFiltered = computed(() => {
      let arr = relations
      if (searchRef.value) {
        const s = searchRef.value.toLowerCase()
        arr = relations.filter(item => item.identifier.toLowerCase().indexOf(s) > -1 || (item.name && Object.values(item.name).find(val => val.toLowerCase().indexOf(s) > -1)))
      }
      return arr.sort((a, b) => {
        if (a.name[defaultLanguageIdentifier.value] && b.name[defaultLanguageIdentifier.value]) {
          return a.name[defaultLanguageIdentifier.value].localeCompare(b.name[defaultLanguageIdentifier.value])
        } else {
          return 0
        }
      })
    })
    function clearSelection () {
      selectedRef.value = null
      itemRef.value = null
    }

    onMounted(() => {
      loadAllTypes()
      loadAllRelations().then(() => {
        canViewConfigRef.value = canViewConfig('types')
        canEditConfigRef.value = canEditConfig('types')

        const id = router.currentRoute.params.id
        if (id) {
          relations.sort((a, b) => {
            if (a.name[defaultLanguageIdentifier.value] && b.name[defaultLanguageIdentifier.value]) {
              return a.name[defaultLanguageIdentifier.value].localeCompare(b.name[defaultLanguageIdentifier.value])
            } else {
              return 0
            }
          })
          const idx = relations.findIndex((elem) => elem.identifier === id)
          if (idx !== -1) {
            selectedRef.value = relations[idx]
            itemRef.value = idx
          } else {
            router.push('/config/relations')
          }
        } else {
          if (relations.length > 0) {
            selectedRef.value = relations[0]
          }
        }
      })
    })

    function identifierValidation (v) {
      if (!/^[A-Za-z0-9_-]*$/.test(v)) {
        return i18n.t('Wrong.Identifier')
      }
      if (!v) {
        return i18n.t('Config.Relations.Error.IdentifierRequired')
      }
      if (v && selectedRef.value.internalId === 0) {
        const found = relations.find((rel) => rel.identifier === v)
        if (found && found.internalId !== 0) {
          return i18n.t('Config.Relations.Error.IdentifierNotUnique')
        }
      }
      return true
    }

    return {
      canViewConfigRef,
      canEditConfigRef,
      formRef,
      relations,
      selectedRef,
      itemRef,
      add,
      remove,
      save,
      editSources,
      editTargets,
      typesSelected,
      typeSelectionDialogRef,
      sources,
      targets,
      currentLanguage,
      defaultLanguageIdentifier,
      searchRef,
      optionsChanged,
      relationsFiltered,
      clearSelection,
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('Config.Relations.Error.NameRequired')
      ]
    }
  }
}
</script>
