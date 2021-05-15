<template>
  <v-container v-if="canViewConfigRef">
    <v-row no-gutters>
      <v-col cols="3">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ $t('Config.LOV.LOVs') }}</v-toolbar-title>
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
            <v-list-item v-for="(item, i) in lovsFiltered" :key="i">
              <v-list-item-icon><v-icon>mdi-view-headline</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col cols="9" v-if="selectedRef">
        <v-form ref="formRef" lazy-validation class="ml-7" v-if="selectedRef.id != -1">
          <div class="d-inline-flex align-center">
            <v-text-field style="min-width: 100%" v-model="selectedRef.identifier"  :disabled="selectedRef.internalId !== 0" :rules="identifierRules" :label="$t('Config.Languages.Identifier')" required></v-text-field>
            <SystemInformation :data="selectedRef"></SystemInformation>
          </div>

          <LanguageDependentField :values="selectedRef.name" v-model="selectedRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('Config.Languages.Name')"></LanguageDependentField>

        <v-simple-table dense class="mb-4">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">{{$t('Config.LOV.ID')}}</th>
                  <th class="text-left">{{$t('Config.LOV.Value')}}</th>
                  <th class="text-left">
                    {{$t('Config.LOV.Filter')}}
                    <v-tooltip top v-if="canEditConfigRef" class="ml-4">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" class="pa-0" icon color="primary" @click="addValue"><v-icon dark>mdi-plus</v-icon></v-btn>
                      </template>
                      <span>{{ $t('Add') }}</span>
                    </v-tooltip>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(elem, j) in selectedRef.values" :key="j">
                  <td class="pa-1">
                    <input v-model="elem.id" type="number" :placeholder="$t('Config.LOV.ID')">
                  </td>
                  <td class="pa-1">
                    <input v-model="elem.value[currentLanguage.identifier]" :placeholder="$t('Config.LOV.Value')">
                  </td>
                  <td class="pa-1">
                    <input v-model="elem.filter" type="number" :placeholder="$t('Config.LOV.Filter')">
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>

          <v-btn class="mr-4" v-if="canEditConfigRef" @click="save">{{ $t('Save') }}</v-btn>
          <v-btn class="mr-4" v-if="canEditConfigRef" @click.stop="remove" :disabled="selectedRef.attributes && selectedRef.attributes.length > 0">{{ $t('Remove') }}</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, watch, onMounted, computed } from '@vue/composition-api'
import * as langStore from '../../store/languages'
import * as lovStore from '../../store/lovs'
import * as errorStore from '../../store/error'
import i18n from '../../i18n'
import LanguageDependentField from '../../components/LanguageDependentField'
import * as userStore from '../../store/users'
import router from '../../router'
import SystemInformation from '../../components/SystemInformation'

export default {
  components: { LanguageDependentField, SystemInformation },
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
      lovs,
      loadAllLOVs,
      addLOV,
      saveLOV,
      removeLOV
    } = lovStore.useStore()

    const canViewConfigRef = ref(false)
    const canEditConfigRef = ref(false)

    const empty = { id: -1 }
    const formRef = ref(null)
    const selectedRef = ref(empty)
    const itemRef = ref(null)
    const searchRef = ref('')

    watch(itemRef, (selected, previous) => {
      // if (typeof (previous) === 'undefined') return
      if (selected == null) {
        selectedRef.value = empty
        router.push('/config/lovs')
        return
      }
      const arr = lovsFiltered.value
      if (selected < arr.length) {
        if (previous && arr[previous].internalId === 0) {
          showInfo(i18n.t('Config.NotSaved'))
        }
        selectedRef.value = arr[selected]
        if (selectedRef.value.internalId !== 0 && selectedRef.value.identifier) {
          router.push('/config/lovs/' + selectedRef.value.identifier)
        } else {
          router.push('/config/lovs')
        }
      }
    })

    const lovsFiltered = computed(() => {
      if (!searchRef.value) return lovs

      const s = searchRef.value.toLowerCase()
      return lovs.filter(item => item.identifier.toLowerCase().indexOf(s) > -1 || (item.name && Object.values(item.name).find(val => val.toLowerCase().indexOf(s) > -1)))
    })

    function clearSelection () {
      selectedRef.value = null
      itemRef.value = null
    }

    function addValue () {
      const val = {}
      val[currentLanguage.value.identifier] = ''
      selectedRef.value.values.push({ id: 0, value: val, filter: null })
    }

    function add () {
      selectedRef.value = addLOV()
      itemRef.value = lovs.length - 1
    }

    function save () {
      if (formRef.value.validate()) {
        saveLOV(selectedRef.value).then(() => {
          showInfo(i18n.t('Saved'))
        })
      }
    }

    function remove () {
      if (confirm(i18n.t('Config.LOV.Confirm.Delete', { name: selectedRef.value.name }))) {
        removeLOV(selectedRef.value.id)
        selectedRef.value = empty
      }
    }

    onMounted(() => {
      loadAllLOVs().then(() => {
        canViewConfigRef.value = canViewConfig('lovs')
        canEditConfigRef.value = canEditConfig('lovs')

        const id = router.currentRoute.params.id
        if (id) {
          const idx = lovs.findIndex((elem) => elem.identifier === id)
          if (idx !== -1) {
            selectedRef.value = lovs[idx]
            itemRef.value = idx
          } else {
            router.push('/config/lovs')
          }
        }
      })
    })

    function identifierValidation (v) {
      if (!v) {
        return i18n.t('Config.LOV.Error.IdentifierRequired')
      }
      if (!/^[A-Za-z0-9_-]*$/.test(v)) {
        return i18n.t('Wrong.Identifier')
      }
      if (v && selectedRef.value.internalId === 0) {
        const found = lovs.find((lang) => lang.identifier === v)
        if (found && found.internalId !== 0) {
          return i18n.t('Config.LOV.Error.IdentifierNotUnique')
        }
      }
      return true
    }

    return {
      canViewConfigRef,
      canEditConfigRef,
      formRef,
      lovs,
      lovsFiltered,
      clearSelection,
      searchRef,
      selectedRef,
      itemRef,
      add,
      remove,
      save,
      addValue,
      currentLanguage,
      defaultLanguageIdentifier,
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('Config.LOV.Error.NameRequired')
      ]
    }
  }
}
</script>
