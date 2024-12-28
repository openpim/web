<template>
  <v-container v-if="canViewConfigRef" style="background-color:white">
    <v-row no-gutters>
      <v-col cols="3">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ $t('Config.Template.Templates') }}</v-toolbar-title>
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
            <v-list-item v-for="(item, i) in templatesFiltered" :key="i">
              <v-list-item-icon><v-icon>mdi-file-edit-outline</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col cols="9" v-if="selectedRef && selectedRef.id !== -1">
        <TemplateViewComponent :temp="selectedRef" :canEditConfig="canEditConfigRef"/>
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
import * as tempStore from '../../store/templates'
import * as errorStore from '../../store/error'
import i18n from '../../i18n'
import * as userStore from '../../store/users'
import router from '../../router'
import TemplateViewComponent from '../../components/TemplateViewComponent.vue'

export default {
  components: { TemplateViewComponent },
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
      templates,
      loadAllTemplates,
      saveTemplate,
      removeTemplate,
      addTemplate
    } = tempStore.useStore()

    const canViewConfigRef = ref(false)
    const canEditConfigRef = ref(false)

    const empty = { id: -1 }
    const selectedRef = ref(empty)
    const itemRef = ref(0)
    const searchRef = ref('')

    watch(itemRef, (selected, previous) => {
      if (selected == null) {
        selectedRef.value = empty
        router.push('/config/templates')
        return
      }
      const arr = templatesFiltered.value
      if (selected < arr.length) {
        if (previous && arr[previous].internalId === 0) {
          showInfo(i18n.t('Config.NotSaved'))
        }
        selectedRef.value = arr[selected]
        if (selectedRef.value.internalId !== 0 && selectedRef.value.identifier) {
          if (selectedRef.value.identifier) router.push('/config/templates/' + selectedRef.value.identifier)
        } else {
          router.push('/config/templates')
        }
      }
    })

    const templatesFiltered = computed(() => {
      let arr = templates
      if (searchRef.value) {
        const s = searchRef.value.toLowerCase()
        arr = templates.filter(item => item.identifier.toLowerCase().indexOf(s) > -1 || (item.name && Object.values(item.name).find(val => val.toLowerCase().indexOf(s) > -1)))
      }
      return arr.sort((a, b) => {
        if (a.name[defaultLanguageIdentifier.value] && b.name[defaultLanguageIdentifier.value]) {
          if (a.order === b.order) {
            return a.name[defaultLanguageIdentifier.value].localeCompare(b.name[defaultLanguageIdentifier.value])
          } else {
            return parseInt(a.order) - parseInt(b.order)
          }
        } else {
          return 0
        }
      })
    })

    function clearSelection () {
      selectedRef.value = empty
      itemRef.value = null
    }

    async function add () {
      selectedRef.value = addTemplate()
      itemRef.value = templates.length - 1
    }

    function save () {
      if (selectedRef.value) {
        router.push('/config/templates/' + selectedRef.value.identifier)
        saveTemplate(selectedRef.value).then(() => {
          showInfo(i18n.t('Saved'))
        })
      }
    }

    function remove () {
      if (confirm(i18n.t('Config.Template.Confirm.Delete'))) {
        removeTemplate(selectedRef.value.id)
        selectedRef.value = empty
        router.push('/config/templates')
      }
    }

    onMounted(() => {
      loadAllTemplates().then(() => {
        clearSelection()
        canViewConfigRef.value = canViewConfig('templates')
        canEditConfigRef.value = canEditConfig('templates')
        const id = router.currentRoute.params.id
        if (id) {
          const idx = templates.findIndex((elem) => elem.identifier === id)
          if (idx !== -1) {
            selectedRef.value = templates[idx]
            itemRef.value = idx
          } else {
            router.push('/config/templates')
          }
        }
      })
    })

    return {
      save,
      remove,
      templates,
      canViewConfigRef,
      canEditConfigRef,
      templatesFiltered,
      clearSelection,
      searchRef,
      selectedRef,
      itemRef,
      add,
      currentLanguage,
      defaultLanguageIdentifier
    }
  }
}
</script>
