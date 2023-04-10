<template>
  <v-container v-if="canViewConfigRef" style="background-color:white">
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
      <v-col cols="9" v-if="selectedRef.id !== -1">
        <LOVViewComponent :lov="selectedRef" :canEditConfig="canEditConfigRef"/>
        <v-spacer class="pa-4"></v-spacer>
        <v-btn class="mr-4 ml-5" v-if="canEditConfigRef && selectedRef.id !== -1" @click="save">{{ $t('Save') }}</v-btn>
        <v-btn class="mr-4" v-if="canEditConfigRef && selectedRef.id !== -1" @click.stop="remove" :disabled="selectedRef.attributes && selectedRef.attributes.length > 0">{{ $t('Remove') }}</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, watch, onMounted, computed } from '@vue/composition-api'
import * as langStore from '../../store/languages'
import * as lovStore from '../../store/lovs'
import * as errorStore from '../../store/error'
import * as typesStore from '../../store/types'
import * as channelsStore from '../../store/channels'
import i18n from '../../i18n'
import * as userStore from '../../store/users'
import router from '../../router'
import LOVViewComponent from '../../components/LOVViewComponent.vue'

export default {
  components: { LOVViewComponent },
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
      saveLOV,
      removeLOV,
      addLOV
    } = lovStore.useStore()

    const { loadAllChannels, getAvailableChannels } = channelsStore.useStore()

    const { loadAllTypes } = typesStore.useStore()

    const canViewConfigRef = ref(false)
    const canEditConfigRef = ref(false)

    const empty = { id: -1 }
    const selectedRef = ref(empty)
    const itemRef = ref(null)
    const searchRef = ref('')

    const awailableChannelsRef = ref([])

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
      if (!searchRef.value) return lovs.slice(0, 100)

      const s = searchRef.value.toLowerCase()
      return lovs.filter(item => item.identifier.toLowerCase().indexOf(s) > -1 || (item.name && Object.values(item.name).find(val => val.toLowerCase().indexOf(s) > -1)))
    })

    function clearSelection () {
      selectedRef.value = empty
      itemRef.value = null
    }

    function add () {
      selectedRef.value = addLOV()
      itemRef.value = lovs.length - 1
    }

    function save () {
      if (selectedRef.value) {
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
      loadAllTypes()
      Promise.all([loadAllLOVs(), loadAllChannels()]).then(() => {
        awailableChannelsRef.value = getAvailableChannels(true)

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
      save,
      remove,
      canViewConfigRef,
      canEditConfigRef,
      lovsFiltered,
      clearSelection,
      searchRef,
      selectedRef,
      itemRef,
      add,
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
