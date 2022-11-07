<template>
  <v-container v-if="canViewConfigRef">
    <v-row no-gutters>
      <v-col cols="4">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ $t('Config.Attributes.GroupsAttributes') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip bottom v-if="canEditConfigRef">
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" @click="add" :disabled="selectedRef.id !== -1 && (selectedRef.internalId == 0 || !selectedRef.group)"><v-icon>mdi-plus</v-icon></v-btn>
            </template>
            <span>{{ $t('Add') }}</span>
          </v-tooltip>
        </v-toolbar>
        <v-text-field @input="searchChanged" @clear="searchChanged" v-model="searchRef" :label="$t('Filter')" flat hide-details clearable clear-icon="mdi-close-circle-outline" class="ml-5 mr-5"></v-text-field>
        <v-treeview dense activatable hoverable :items="groupsFiltered" @update:active="activeChanged" :active="activeRef" :open="openRef">
          <template v-slot:prepend="{ item }">
            <v-icon>{{ item.group ? 'mdi-format-list-bulleted-type' : 'mdi-alpha-a-box-outline' }}</v-icon>
          </template>
          <template v-slot:label="{ item }">
            {{ (item.group ? '' : item.identifier + ' - ') + (item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' ) }}
         </template>
        </v-treeview>
      </v-col>
      <v-col cols="8">
        <!-- group -->
        <v-form ref="formRef" lazy-validation class="ml-7" v-if="selectedRef.id != -1 && selectedRef.group">
          <div class="d-inline-flex align-center">
            <v-text-field style="min-width: 100%" v-model="selectedRef.identifier"  :disabled="selectedRef.internalId !== 0" :rules="identifierRules" :label="$t('Config.Attributes.Identifier')" required></v-text-field>
            <SystemInformation :data="selectedRef"></SystemInformation>
          </div>

          <LanguageDependentField :values="selectedRef.name" v-model="selectedRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('Config.Attributes.Name')"></LanguageDependentField>
          <v-text-field v-model="selectedRef.order" type="number" :label="$t('Config.Attributes.Order')" required></v-text-field>
          <v-checkbox v-model="selectedRef.visible" :label="$t('Config.Attributes.Group.Visible')"></v-checkbox>
          <OptionsTable :options="selectedRef.options" @changed="optionsChanged"/>
          <v-btn class="mr-4" v-if="canEditConfigRef" @click="save">{{ $t('Save') }}</v-btn>
          <v-btn class="mr-4" v-if="canEditConfigRef" @click.stop="remove" :disabled="selectedRef.attributes && selectedRef.attributes.length > 0">{{ $t('Remove') }}</v-btn>
        </v-form>

        <!-- attribute -->
        <v-form ref="formRef" lazy-validation class="ml-7" v-if="selectedRef.id != -1 && !selectedRef.group">
          <AttributeViewComponent :attr="selectedRef" :canEditConfig="canEditConfigRef" />

          <v-btn class="mr-4" v-if="canEditConfigRef" @click="save">{{ $t('Save') }}</v-btn>
          <v-menu offset-y v-if="canEditConfigRef">
            <template v-slot:activator="{ on }"><v-btn class="mr-4" v-on="on"> {{ $t('Config.Attributes.Connect') }}</v-btn></template>
            <v-list>
              <v-list-item v-for="(grp, index) in connectGroups" :key="index" @click="assign(grp.id)">
                <v-list-item-title>{{ grp.name[currentLanguage.identifier] || '[' + grp.name[defaultLanguageIdentifier] + ']' }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn class="mr-4" v-if="canEditConfigRef" @click.stop="remove" :disabled="selectedRef.attributes && selectedRef.attributes.length > 0">{{ $t('Remove') }}</v-btn>
        </v-form>

      </v-col>
    </v-row>
    <template>
      <v-row justify="center">
        <v-dialog v-model="dialogRef" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('Config.Attributes.Delete') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-radio-group v-model="attrDeletionRef">
                      <v-radio :label="$t('Config.Attributes.Delete.Link')" value="link"></v-radio>
                      <v-radio :label="$t('Config.Attributes.Delete.All')" value="all"></v-radio>
                    </v-radio-group>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
              <v-btn color="blue darken-1" text @click="removeAttr">{{ $t('Select') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import * as attrStore from '../../store/attributes'
import { ref, computed, onMounted, watch } from '@vue/composition-api'
import i18n from '../../i18n'
import router from '../../router'
import * as errorStore from '../../store/error'
import * as langStore from '../../store/languages'
import LanguageDependentField from '../../components/LanguageDependentField'
import * as userStore from '../../store/users'
import SystemInformation from '../../components/SystemInformation'
import OptionsTable from '../../components/OptionsTable'
import AttributeViewComponent from '../../components/AttributeViewComponent.vue'

export default {
  components: { LanguageDependentField, SystemInformation, OptionsTable, AttributeViewComponent },
  props: {
    item: {
      type: Object,
      required: false
    }
  },
  setup (props) {
    const { canViewConfig, canEditConfig } = userStore.useStore()

    const {
      showInfo,
      showError
    } = errorStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages
    } = langStore.useStore()

    const {
      groups,
      findById,
      findByIdentifier,
      checkIdentifier,
      loadAllAttributes,
      saveData,
      assignData,
      removeGroup,
      removeAttribute
    } = attrStore.useStore()

    const canViewConfigRef = ref(false)
    const canEditConfigRef = ref(false)

    const groupsFiltered = ref([])
    const searchRef = ref('')

    const attrDeletionRef = ref('link')
    const dialogRef = ref(false)
    const formRef = ref(null)
    const empty = { id: -1 }
    const selectedRef = ref(empty)
    const activeRef = ref([])
    const openRef = ref([])
    const selectedGroupsRef = ref([])
    const maxChiidrenNumber = 100

    const connectGroups = computed(() => {
      return selectedGroupsRef.value ? groups.filter((grp) => !selectedGroupsRef.value.find((item) => item.id === grp.id)) : []
    })

    let awaitingSearch = null
    function searchChanged () {
      if (searchRef.value && searchRef.value.length > 2) {
        if (awaitingSearch) {
          clearTimeout(awaitingSearch)
          awaitingSearch = null
        }
        if (!awaitingSearch) {
          awaitingSearch = setTimeout(() => {
            performSearch()
          }, 1000)
        }
      } else {
        groupsFiltered.value = groups.map(group => ({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: group.attributes.slice(0, maxChiidrenNumber) }))
      }
    }

    function performSearch () {
      openRef.value = []
      activeRef.value = []
      selectedRef.value = empty
      groupsFiltered.value = []
      for (let k = 0; k < groups.length; k++) {
        const group = groups[k]
        if (group.name[currentLanguage.value.identifier].toLowerCase().includes(searchRef.value.toLowerCase())) {
          groupsFiltered.value.push({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: group.attributes.slice(0, maxChiidrenNumber) })
          continue
        }
        const foundAttr = []
        const attr = group.attributes
        for (let i = 0; i < attr.length; i++) {
          if (attr[i].name[currentLanguage.value.identifier].toLowerCase().includes(searchRef.value.toLowerCase()) || attr[i].identifier.toLowerCase().includes(searchRef.value.toLowerCase())) {
            foundAttr.push(attr[i])
          }
        }
        if (foundAttr.length) {
          groupsFiltered.value.push({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: foundAttr.slice(0, maxChiidrenNumber) })
        }
      }
    }

    function filter (item, search, textKey) {
      const s = search.toLowerCase()
      return item.identifier.toLowerCase().indexOf(s) > -1 || (item.name && Object.values(item.name).find(val => val.toLowerCase().indexOf(s) > -1))
    }

    function activeChanged (active) {
      if (active.length !== 0) {
        if (selectedRef.value.internalId === 0 && active[0] !== selectedRef.value.id) {
          showInfo(i18n.t('Config.NotSaved'))
        }

        if (active[0] !== selectedRef.value.id) {
          activeRef.value[0] = active[0]
          const tmp = findById(active[0])
          selectedRef.value = tmp.item
          selectedGroupsRef.value = tmp.groups
          if (!props.item) {
            router.push('/config/attributes' + (selectedRef.value.identifier ? '/' + selectedRef.value.identifier : ''))
          }
        }
      } else {
        selectedRef.value = empty
        if (!props.item) {
          router.push('/config/attributes')
        }
      }
    }

    function optionsChanged (val) {
      selectedRef.value.options = val
    }

    function add () {
      if (selectedRef.value && selectedRef.value.group) {
        const name = {}
        name[currentLanguage.value.identifier] = i18n.t('Config.Attributes.Attr.NewName')
        const errorMessage = {}
        errorMessage[currentLanguage.value.identifier] = ''
        const newAttr = { id: Date.now(), internalId: 0, group: false, languageDependent: false, order: 0, visible: [], valid: [], relations: [], name: name, errorMessage: errorMessage, options: [] }
        selectedRef.value.attributes.push(newAttr)
        const groupFiltered = groupsFiltered.value.find((el) => el.id === selectedRef.value.id)
        groupFiltered.children.push(newAttr)
        openRef.value = [selectedRef.value.id]
        selectedRef.value = newAttr
        selectedGroupsRef.value = []
      } else {
        const name = {}
        name[currentLanguage.value.identifier] = i18n.t('Config.Attributes.Group.NewName')
        const newGroup = { id: Date.now(), internalId: 0, group: true, attributes: [], order: 0, visible: false, name: name, options: [] }
        groups.push(newGroup)
        const newGroupInTree = { ...newGroup }
        newGroupInTree.children = []
        groupsFiltered.value.push(newGroupInTree)
        selectedRef.value = newGroup
        selectedGroupsRef.value = []
      }
      activeRef.value.pop()
      activeRef.value.push(selectedRef.value.id)
    }

    function remove () {
      if (selectedRef.value.group) {
        if (confirm(i18n.t('Config.Attributes.Confirm.Delete', { name: selectedRef.value.name }))) {
          activeRef.value.pop()
          const indxToRemove = groupsFiltered.value.findIndex((el) => el.id === selectedRef.value.id)
          if (indxToRemove > -1) {
            groupsFiltered.value.splice(indxToRemove, 1)
          }
          removeGroup(selectedRef.value.id).then(() => {
            showInfo(i18n.t('Saved'))
          })
          selectedRef.value = empty
          if (!props.item) {
            router.push('/config/attributes')
          }
        }
      } else {
        dialogRef.value = true
      }
    }

    function removeAttr () {
      dialogRef.value = false
      activeRef.value.pop()
      if (attrDeletionRef.value !== 'link') {
        for (let i = 0; i < groupsFiltered.value.length; i++) {
          const group = groupsFiltered.value[i]
          const indxToRemove = group.children.findIndex((el) => el.id === selectedRef.value.id)
          if (indxToRemove > -1) {
            group.children.splice(indxToRemove, 1)
          }
        }
      } else {
        const data = findById(selectedRef.value.id)
        if (data.groups.length) {
          const grpId = data.groups[0].id
          const group = groupsFiltered.value.find((el) => el.id === grpId)
          const indxToRemove = group.children.findIndex((el) => el.id === selectedRef.value.id)
          if (indxToRemove > -1) {
            group.children.splice(indxToRemove, 1)
          }
        }
      }
      removeAttribute(selectedRef.value.id, attrDeletionRef.value !== 'link').then(() => {
        showInfo(i18n.t('Saved'))
      })
      selectedRef.value = empty
      if (!props.item) {
        router.push('/config/attributes')
      }
    }

    function save () {
      if (formRef.value.validate()) {
        if (!props.item) {
          router.push('/config/attributes/' + selectedRef.value.identifier)
        }
        saveData(selectedRef.value).then(() => {
          showInfo(i18n.t('Saved'))
        })
      }
    }

    function assign (grpId) {
      const attr = findByIdentifier(selectedRef.value.identifier)
      const grp = findById(grpId)
      if (attr.item.internalId === 0 || grp.item.internalId === 0) {
        showError(i18n.t('Config.NotSaved'))
        return
      }
      assignData(attr.item, grp.item).then(() => {
        openRef.value.push(grp.item.id)
        showInfo(i18n.t('Saved'))
      })
      const groupFiltered = groupsFiltered.value.find((el) => el.id === grpId)
      groupFiltered.children.push(attr.item)
    }

    onMounted(() => {
      loadAllLanguages()
      loadAllAttributes().then(() => {
        canViewConfigRef.value = canViewConfig('attributes')
        canEditConfigRef.value = canEditConfig('attributes')
        if (!props.item) {
          const id = router.currentRoute.params.id
          if (id) {
            const result = findByIdentifier(id)
            if (result.item) {
              selectedRef.value = result.item
              selectedGroupsRef.value = result.groups
              activeRef.value.push(result.item.id)
              if (!result.item.group) {
                openRef.value = result.groups.map(grp => grp.id)
              }
            } else {
              router.push('/config/attributes')
            }
          }
        }
      })
    })

    watch(() => props.item, () => {
      const pathArr = props.item.path.split('.').map(elem => parseInt(elem))
      groups.forEach(group => {
        const groupAttr = []
        group.attributes.forEach(attr => {
          if (pathArr.some(r => attr.visible.indexOf(r) !== -1)) {
            groupAttr.push(attr)
          }
        })
        group.itemAttributes = groupAttr
      })
      groupsFiltered.value = groups.filter(group => group.itemAttributes && group.itemAttributes.length > 0).map(group => ({ id: group.id, identifier: group.identifier, internalId: group.internalId, group: group.group, name: group.name, children: group.itemAttributes.slice(0, maxChiidrenNumber) }))
    })

    function identifierValidation (v) {
      if (!/^[A-Za-z0-9_]*$/.test(v)) {
        return i18n.t('Wrong.Identifier')
      }
      if (!v) {
        return i18n.t('Config.Attributes.Error.IdentifierRequired')
      }
      if (v && selectedRef.value.internalId === 0) {
        const found = checkIdentifier(v)
        if (found) {
          return i18n.t('Config.Attributes.Error.IdentifierNotUnique')
        }
      }
      return true
    }

    return {
      canViewConfigRef,
      canEditConfigRef,
      groups,
      activeChanged,
      searchRef,
      searchChanged,
      filter,
      add,
      remove,
      removeAttr,
      save,
      formRef,
      selectedRef,
      activeRef,
      openRef,
      connectGroups,
      groupsFiltered,
      assign,
      dialogRef,
      attrDeletionRef,
      currentLanguage,
      optionsChanged,
      defaultLanguageIdentifier,
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
