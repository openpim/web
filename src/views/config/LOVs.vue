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
                  <th class="text-left" v-for="(channel, i) in awailableChannelsRef" :key="i">{{channel.name[currentLanguage.identifier] || '[' + channel.name[defaultLanguageIdentifier] + ']'}}</th>
                  <th class="text-left">{{$t('Config.LOV.Level')}}</th>
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
                    <input v-model="elem.id" type="number" size="5" maxlength="5" :placeholder="$t('Config.LOV.ID')"/>
                  </td>
                  <td class="pa-1">
                    <input v-model="elem.value[currentLanguage.identifier]" size="50" :placeholder="$t('Config.LOV.Value')"/>
                  </td>
                  <td class="pa-1" v-for="(channel, i) in awailableChannelsRef" :key="i">
                    <input v-model="elem[channel.identifier][currentLanguage.identifier]"/>
                  </td>
                  <td class="pa-1">
                    <v-chip @click="editLevels(elem)"><v-icon left>mdi-form-select</v-icon>{{elem.level && elem.level.length > 0 ? '...' : ''}}</v-chip>
                  </td>
                  <td class="pa-1">
                    <input v-model="elem.filter" type="number" :placeholder="$t('Config.LOV.Filter')"/>
                    <v-btn class="pa-0" icon color="primary" @click="removeValue(j)"><v-icon dark>mdi-close-circle-outline</v-icon></v-btn>
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
    <template>
      <v-row justify="center">
        <v-dialog v-model="dialogRef" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('Config.LOV.Level') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-card class="mb-5">
                      <v-card-title class="subtitle-2 font-weight-bold" >
                        <div style="width:80%">{{ $t('Config.LOV.Visible') }}</div>
                        <v-tooltip bottom v-if="canEditConfigRef">
                          <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on" @click="addVisible"><v-icon>mdi-plus</v-icon></v-btn>
                          </template>
                          <span>{{ $t('Add') }}</span>
                        </v-tooltip>
                        <v-tooltip bottom v-if="canEditConfigRef">
                          <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on" @click="removeVisible" :disabled="visibleSelectedRef == null"><v-icon>mdi-minus</v-icon></v-btn>
                          </template>
                          <span>{{ $t('Remove') }}</span>
                        </v-tooltip>
                      </v-card-title>
                      <v-divider></v-divider>
                      <v-list dense class="pt-0 pb-0">
                        <v-list-item-group v-model="visibleSelectedRef" color="primary">
                          <v-list-item dense class="pt-0 pb-0"  v-for="(item, i) in visible" :key="i">
                            <v-list-item-content class="pt-0 pb-0" style="display: inline">
                            <router-link :to="'/item/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list-item-group>
                      </v-list>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialogClose">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemsSelected"/>
  </v-container>
</template>

<script>
import { ref, watch, onMounted, computed } from '@vue/composition-api'
import * as langStore from '../../store/languages'
import * as lovStore from '../../store/lovs'
import * as errorStore from '../../store/error'
import * as itemStore from '../../store/item'
import * as typesStore from '../../store/types'
import * as channelsStore from '../../store/channels'
import i18n from '../../i18n'
import LanguageDependentField from '../../components/LanguageDependentField'
import * as userStore from '../../store/users'
import router from '../../router'
import SystemInformation from '../../components/SystemInformation'
import ItemsSelectionDialog from '../../components/ItemsSelectionDialog'

export default {
  components: { LanguageDependentField, SystemInformation, ItemsSelectionDialog },
  setup (props, { root }) {
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

    const { loadAllChannels, getAwailableChannels } = channelsStore.useStore()

    const { loadItemsByIds } = itemStore.useStore()

    const { loadAllTypes } = typesStore.useStore()

    const canViewConfigRef = ref(false)
    const canEditConfigRef = ref(false)

    const empty = { id: -1 }
    const formRef = ref(null)
    const selectedRef = ref(empty)
    const itemRef = ref(null)
    const searchRef = ref('')

    const dialogRef = ref(false)
    const visible = ref([])
    const visibleSelectedRef = ref(null)
    const itemSelectionDialogRef = ref(null)
    const awailableChannelsRef = ref([])
    let dialogElem = null

    function editLevels (elem) {
      dialogElem = elem
      if (elem.level.length === 0) {
        visible.value = []
      } else {
        const ids = elem.level.map(path => {
          const arr = path.split('.')
          return parseInt(arr[arr.length - 1])
        })
        loadItemsByIds(ids, false).then(items => {
          visible.value = items
        })
      }
      dialogRef.value = true
    }

    function addVisible () {
      itemSelectionDialogRef.value.showDialog()
    }

    function itemsSelected (id) {
      itemSelectionDialogRef.value.closeDialog()
      loadItemsByIds([id], false).then(items => {
        visible.value.push(items[0])
      })
    }

    function removeVisible () {
      visible.value.splice(visibleSelectedRef.value, 1)
      visibleSelectedRef.value = null
    }

    function dialogClose () {
      dialogRef.value = false
      dialogElem.level = visible.value.map(item => item.path)
    }

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
        checkOldValues()
        if (selectedRef.value.internalId !== 0 && selectedRef.value.identifier) {
          router.push('/config/lovs/' + selectedRef.value.identifier)
        } else {
          router.push('/config/lovs')
        }
      }
    })

    function checkOldValues () {
      selectedRef.value.values.forEach(elem => {
        if (!elem.filter) root.$set(elem, 'filter', null)
        if (!elem.level) root.$set(elem, 'level', [])
        awailableChannelsRef.value.forEach(channel => {
          if (!elem[channel.identifier]) root.$set(elem, channel.identifier, {})
        })
      })
    }

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
      let max = selectedRef.value.values.reduce((accumulator, currentValue) => Math.max(accumulator, currentValue.id), 0)
      if (!max) max = 0
      selectedRef.value.values.push({ id: ++max, value: val, filter: null, level: [] })
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

    function removeValue (idx) {
      selectedRef.value.values.splice(idx, 1)
    }

    onMounted(() => {
      loadAllTypes()
      Promise.all([loadAllLOVs(), loadAllChannels()]).then(() => {
        awailableChannelsRef.value = getAwailableChannels(true).filter(channel => channel.type !== 1)

        canViewConfigRef.value = canViewConfig('lovs')
        canEditConfigRef.value = canEditConfig('lovs')

        const id = router.currentRoute.params.id
        if (id) {
          const idx = lovs.findIndex((elem) => elem.identifier === id)
          if (idx !== -1) {
            selectedRef.value = lovs[idx]
            checkOldValues()
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
      dialogRef,
      dialogClose,
      visibleSelectedRef,
      visible,
      addVisible,
      removeVisible,
      itemSelectionDialogRef,
      itemsSelected,
      editLevels,
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
      removeValue,
      currentLanguage,
      defaultLanguageIdentifier,
      awailableChannelsRef,
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
