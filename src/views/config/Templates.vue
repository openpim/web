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
      <v-col cols="9" v-if="selectedRef.id !== -1">
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
import * as typesStore from '../../store/types'
import * as itemsStore from '../../store/item'
import i18n from '../../i18n'
import * as userStore from '../../store/users'
import router from '../../router'
import TemplateViewComponent from '../../components/TemplateViewComponent.vue'

export default {
  components: { TemplateViewComponent },
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
      templates,
      loadAllTemplates,
      saveTemplate,
      removeTemplate,
      addTemplate
    } = tempStore.useStore()

    const { loadAllTypes } = typesStore.useStore()

    const { nextId } = itemsStore.useStore()

    const canViewConfigRef = ref(false)
    const canEditConfigRef = ref(false)

    const empty = { id: -1 }
    const selectedRef = ref(empty)
    const itemRef = ref(null)
    const searchRef = ref('')

    const availableChannelsRef = ref([])

    watch(itemRef, (selected, previous) => {
      // if (typeof (previous) === 'undefined') return
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
          router.push('/config/templates/' + selectedRef.value.identifier)
        } else {
          router.push('/config/templates')
        }
      }
    })

    const templatesFiltered = computed(() => {
      if (!searchRef.value) return templates.slice(0, 100)
      const s = searchRef.value.toLowerCase()
      return templates.filter(item => item.identifier.toLowerCase().indexOf(s) > -1 || (item.title && Object.values(item.name).find(val => val.toLowerCase().indexOf(s) > -1)))
    })

    function clearSelection () {
      selectedRef.value = empty
      itemRef.value = null
    }

    async function add () {
      const obj = await nextId()
      selectedRef.value = addTemplate()
      itemRef.value = templates.length - 1
      if (obj) {
        selectedRef.value.identifier = obj.identifier
        if (obj.name) selectedRef.value.name = obj.name
      }
    }

    function save () {
      if (selectedRef.value) {
        saveTemplate(selectedRef.value).then(() => {
          showInfo(i18n.t('Saved'))
        })
      }
    }

    function remove () {
      if (confirm(i18n.t('Config.Template.Confirm.Delete', { name: selectedRef.value.name }))) {
        removeTemplate(selectedRef.value.id)
        selectedRef.value = empty
      }
    }

    onMounted(() => {
      loadAllTypes()
      Promise.all([loadAllTemplates()]).then(() => {
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

    function identifierValidation (v) {
      if (!v) {
        return i18n.t('Config.Template.Error.IdentifierRequired')
      }
      if (!/^[A-Za-z0-9_-]*$/.test(v)) {
        return i18n.t('Wrong.Identifier')
      }
      if (v && selectedRef.value.internalId === 0) {
        const found = templates.find((lang) => lang.identifier === v)
        if (found && found.internalId !== 0) {
          return i18n.t('Config.Template.Error.IdentifierNotUnique')
        }
      }
      return true
    }

    return {
      save,
      remove,
      canViewConfigRef,
      canEditConfigRef,
      templatesFiltered,
      clearSelection,
      searchRef,
      selectedRef,
      itemRef,
      add,
      currentLanguage,
      defaultLanguageIdentifier,
      availableChannelsRef,
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('Config.Template.Error.NameRequired')
      ]
    }
  }
}
</script>
