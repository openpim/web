<template>
  <v-container v-if="canViewConfigRef" style="background-color:white">
    <v-row no-gutters>
      <v-col cols="3">
        <v-toolbar density="compact" flat>
          <v-toolbar-title>{{ $t('Config.Actions.Title') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip bottom v-if="canEditConfigRef">
            <template v-slot:activator="{ props }">
              <v-btn icon v-bind="props" @click="add"><v-icon>mdi-plus</v-icon></v-btn>
            </template>
            <span>{{ $t('Add') }}</span>
          </v-tooltip>
        </v-toolbar>
        <v-text-field v-model="searchRef" @input="clearSelection" :label="$t('Filter')" flat hide-details clearable clear-icon="mdi-close-circle-outline" class="ml-5 mr-5"></v-text-field>
        <v-list nav density="compact" color="primary" v-model="itemRef" @click:select="onSelectAction">
            <v-list-item v-for="(item, i) in actionsFiltered" :key="i" :value="i">
              <template v-slot:prepend>
                <v-icon>mdi-file-code-outline</v-icon>
              </template>
                <v-list-item-title>{{item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'}}</v-list-item-title>
            </v-list-item>
        </v-list>
      </v-col>
      <v-col cols="9">
        <template v-if="selectedRef && selectedRef.id != -1">
        <v-form ref="formRef" lazy-validation class="ml-7">
          <div class="d-inline-flex align-center">
            <v-text-field style="min-width: 100%" v-model="selectedRef.identifier"  :disabled="selectedRef.internalId !== 0" :rules="identifierRules" :label="$t('Config.Languages.Identifier')" required></v-text-field>
            <SystemInformation :data="selectedRef"></SystemInformation>
          </div>
          <LanguageDependentField :values="selectedRef.name" v-model="selectedRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('Config.Languages.Name')"></LanguageDependentField>
          <v-text-field v-model="selectedRef.order" type="number" :label="$t('Config.Actions.Order')" required></v-text-field>
        </v-form>

        <v-tabs v-model="tabRef">
          <v-tab value="code">{{$t('Config.Actions.Tab.Code')}}</v-tab>
          <v-tab value="triggers">{{$t('Config.Actions.Tab.Triggers')}}</v-tab>
        </v-tabs>
        <v-card-text>
        <v-window v-model="tabRef">
          <v-window-item value="code"> <!-- Code -->
            <v-textarea class="ml-3 mr-3" v-model="selectedRef.code" :label="$t('Config.Actions.Code')"></v-textarea>
          </v-window-item>
          <v-window-item value="triggers"> <!-- Triggers -->
            <v-toolbar density="compact" flat>
              <v-toolbar-title class="subtitle-2">{{ $t('Config.Actions.Triggers.Title') }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-tooltip bottom v-if="canEditConfigRef">
                <template v-slot:activator="{ props }">
                  <v-btn icon v-bind="props" @click="addTrigger"><v-icon>mdi-plus</v-icon></v-btn>
                </template>
                <span>{{ $t('Add') }}</span>
              </v-tooltip>
              <v-tooltip bottom v-if="canEditConfigRef">
                <template v-slot:activator="{ props }">
                  <v-btn icon v-bind="props" @click="removeTrigger"><v-icon>mdi-minus</v-icon></v-btn>
                </template>
                <span>{{ $t('Remove') }}</span>
              </v-tooltip>
            </v-toolbar>
            <v-list nav density="compact" class="mb-4" color="primary" v-model="triggerRef">
                <v-list-item v-for="(trigger, i) in selectedRef.triggers" :key="i" :v1="relation = getRelation(trigger.relation)" :v2="type = getType(trigger.itemType)" :v3="item = getItem(trigger.itemFrom)" :v4="roles = getRoles(trigger.roles)">
                  <template v-slot:prepend>
                    <v-icon>mdi-flash-outline</v-icon>
                  </template>
                    <v-list-item-title>
                      <div v-if="trigger.type === 1">
                        {{ $t('Config.Actions.Triggers.Item1') }}
                        <router-link :to="'/config/types/' + type.identifier">{{ type.identifier }}</router-link>
                        {{ $t('Config.Actions.Triggers.Item2') }}
                        <router-link v-if="item" :to="'/item/' + item.identifier">{{ item.identifier }}</router-link>
                        ({{ displayEvent(trigger.event) }})
                      </div>
                      <div v-if="trigger.type === 2">
                        {{ $t('Config.Actions.Triggers.Relation') }}
                        <router-link :to="'/config/relations/' + relation.identifier">{{ relation.identifier }}</router-link>
                        ({{ displayEvent(trigger.event) }})
                      </div>
                      <div v-if="trigger.type === 3">
                        {{ $t('Config.Actions.Triggers.ButtonsWithText', {text: trigger.itemButton}) }}
                        <router-link :to="'/config/types/' + type.identifier">{{ type.identifier }}</router-link>
                        {{ $t('Config.Actions.Triggers.Item2') }}
                        <router-link v-if="item" :to="'/item/' + item.identifier">{{ item.identifier }}</router-link>
                        <br />
                        {{ $t('Config.Roles') + ': ' }}
                        {{ roles.map(role => role.name).join(', ') }}
                        {{ trigger.askBeforeExec ? ' ('+ $t('Config.Actions.Triggers.AskBeforeExec') + ')' : '' }}
                        {{ trigger.selectItems ? ' ('+ $t('Config.Actions.Triggers.ButtonSelectItems') + (trigger.selectItemsFilter? ':['+trigger.selectItemsFilter+']' : '') + ')' : '' }}
                      </div>
                      <div v-if="trigger.type === 4">
                        {{ $t('Config.Actions.Triggers.Type.AttrGroup') }}
                        ({{ displayEvent(trigger.event) }})
                      </div>
                      <div v-if="trigger.type === 5">
                        {{ $t('Config.Actions.Triggers.Type.Attribute') }}
                        ({{ displayEvent(trigger.event) }})
                      </div>
                      <div v-if="trigger.type === 6">
                        {{ type && item ? $t('Config.Actions.Triggers.ButtonsWithText', {text: trigger.itemButton}) : $t('Config.Actions.Triggers.ButtonsWithText2', {text: trigger.itemButton}) }}
                        <template v-if="type && item">
                          <router-link :to="'/config/types/' + type.identifier">{{ type.identifier }}</router-link>
                          {{ $t('Config.Actions.Triggers.Item2') }}
                          <router-link v-if="item" :to="'/item/' + item.identifier">{{ item.identifier }}</router-link>
                        </template>
                        <br />
                        {{ trigger.askBeforeExec ? ' ('+ $t('Config.Actions.Triggers.AskBeforeExec') + ')' : '' }}
                        {{ trigger.selectItems ? ' ('+ $t('Config.Actions.Triggers.ButtonSelectItems') + (trigger.selectItemsFilter? ':['+trigger.selectItemsFilter+']' : '') + ')' : '' }}
                      </div>
                    </v-list-item-title>
                </v-list-item>
            </v-list>
          </v-window-item>
        </v-window>
        </v-card-text>

        <v-btn class="mr-4" v-if="canEditConfigRef" @click="save">{{ $t('Save') }}</v-btn>
        <v-btn class="mr-4" v-if="canEditConfigRef" @click.stop="remove" :disabled="selectedRef.attributes && selectedRef.attributes.length > 0">{{ $t('Remove') }}</v-btn>
        <v-btn class="mr-4" v-if="canEditConfigRef" @click="itemSelectionDialogRef.showDialog()">{{ $t('Config.Actions.Test') }}</v-btn>
        </template>
      </v-col>
    </v-row>
    <ActionTriggerCreationDialog ref="triggerDialogRef" @created="triggerCreated"></ActionTriggerCreationDialog>
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemSelected"/>
    <template>
      <v-row justify="center">
        <v-dialog v-model="testDialogRef" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('Config.Actions.TestResult.Title') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <template v-if="testResultRef && !testResultRef.failed && !testResultRef.error">
                      <v-alert type="success">{{ $t('Config.Actions.TestResult.Success') }}</v-alert>
                      <v-textarea v-model="testResultRef.log" readonly :label="$t('Config.Actions.TestResult.Log')"></v-textarea>
                      <v-text-field v-if="testResultRef.message" v-model="testResultRef.message" readonly></v-text-field>
                    </template>
                    <template v-if="testResultRef && (testResultRef.failed || testResultRef.error)">
                      <v-alert type="error">{{ $t('Config.Actions.TestResult.Failed') }}</v-alert>
                      <v-textarea v-if="testResultRef.error" v-model="testResultRef.error" readonly :label="$t('Config.Actions.TestResult.RunError')"></v-textarea>
                      <v-textarea v-if="testResultRef.compileError" v-model="testResultRef.compileError" readonly :label="$t('Config.Actions.TestResult.CompileError')"></v-textarea>
                      <v-textarea v-if="testResultRef.message" v-model="testResultRef.message" readonly></v-textarea>
                    </template>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="testDialogRef = false">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import { ref, watch, onMounted, computed } from 'vue'
import * as langStore from '../../store/languages'
import * as actionsStore from '../../store/actions'
import * as errorStore from '../../store/error'
import * as relStore from '../../store/relations'
import * as typesStore from '../../store/types'
import * as itemStore from '../../store/item'
import * as rolesStore from '../../store/roles'
import { useI18n } from 'vue-i18n'
import LanguageDependentField from '../../components/LanguageDependentField'
import * as userStore from '../../store/users'
import SystemInformation from '../../components/SystemInformation'
import ActionTriggerCreationDialog from '../../components/ActionTriggerCreationDialog'
import ItemsSelectionDialog from '../../components/ItemsSelectionDialog'
import router from '../../router'

export default {
  components: {
    LanguageDependentField,
    SystemInformation,
    ActionTriggerCreationDialog,
    ItemsSelectionDialog
  },
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
      loadAllActions,
      actions,
      addAction,
      saveAction,
      removeAction,
      testAction
    } = actionsStore.useStore()

    const {
      relations,
      loadAllRelations
    } = relStore.useStore()

    const {
      findType,
      loadAllTypes
    } = typesStore.useStore()

    const {
      loadItemsByIds
    } = itemStore.useStore()

    const { t } = useI18n()

    const canViewConfigRef = ref(false)
    const canEditConfigRef = ref(false)

    const empty = { id: -1 }
    const formRef = ref(null)
    const selectedRef = ref(empty)
    const itemRef = ref(null)
    const tabRef = ref(null)
    const triggerRef = ref(null)
    const triggerDialogRef = ref(null)
    const itemSelectionDialogRef = ref(null)
    const itemsRef = ref([])
    const testResultRef = ref(null)
    const testDialogRef = ref(false)

    function triggerCreated (trigger) {
      triggerDialogRef.value.closeDialog()
      selectedRef.value.triggers.push(trigger)
      if (trigger.type === 1 || trigger.type === 3 || trigger.type === 6) {
        loadItemsByIds([trigger.itemFrom]).then(arr => { itemsRef.value.push(arr[0]) })
      }
    }

    function displayEvent (event) {
      event = parseInt(event)
      if (event === 1) {
        return t('Config.Actions.Triggers.Event.BeforeCreate')
      }
      if (event === 2) {
        return t('Config.Actions.Triggers.Event.AfterCreate')
      }
      if (event === 3) {
        return t('Config.Actions.Triggers.Event.BeforeUpdate')
      }
      if (event === 4) {
        return t('Config.Actions.Triggers.Event.AfterUpdate')
      }
      if (event === 5) {
        return t('Config.Actions.Triggers.Event.BeforeDelete')
      }
      if (event === 6) {
        return t('Config.Actions.Triggers.Event.AfterDelete')
      }
      if (event === 7) {
        return t('Config.Actions.Triggers.Event.BeforeShow')
      }
      if (event === 8) {
        return t('Config.Actions.Triggers.Event.ChangedOnClient')
      }

      return '???'
    }

    function getRelation (id) {
      if (!id) return null
      return relations.find(rel => rel.id === id)
    }

    function getType (id) {
      if (!id) return null
      return findType(id).node
    }

    function getItem (id) {
      if (!id) return null
      return itemsRef.value.find(elem => elem.id === id)
    }

    const onSelectAction = (options) => {
      itemRef.value = options.id
    }

    watch(itemRef, (selected, previous) => {
      if (selected == null) {
        selectedRef.value = empty
        return
      }
      if (selected < actionsFiltered.value.length) {
        if (previous && actionsFiltered.value[previous].internalId === 0) {
          showInfo(t('Config.NotSaved'))
        }
        setSelected(actionsFiltered.value[selected])
      }
    })

    const {
      roles,
      loadAllRoles
    } = rolesStore.useStore()

    function getRoles (triggerRoles) {
      if (!triggerRoles) return []
      else return triggerRoles.map(id => roles.find(role => role.id === id || role.internalId === id))
    }

    function setSelected (action) {
      selectedRef.value = action
      const ids = []
      selectedRef.value.triggers.forEach(trigger => {
        if (trigger.type === 1 || trigger.type === 3 || trigger.type === 6) ids.push(trigger.itemFrom)
      })
      loadItemsByIds(ids).then(arr => { itemsRef.value = arr })
      if (action.identifier) router.push('/config/actions/' + action.identifier)
    }

    function addTrigger () {
      triggerDialogRef.value.showDialog()
    }

    function removeTrigger () {
      if (confirm(t('Config.Actions.Triggers.ConfirmDelete'))) {
        selectedRef.value.triggers.splice(triggerRef.value, 1)
      }
    }

    function add () {
      selectedRef.value = addAction()
      itemRef.value = actions.length - 1
    }

    function save () {
      if (formRef.value.validate()) {
        saveAction(selectedRef.value).then(() => {
          showInfo(t('Saved'))
        })
      }
    }

    function remove () {
      if (confirm(t('Config.Actions.Confirm.Delete'))) {
        removeAction(selectedRef.value.id)
        selectedRef.value = empty
      }
    }

    function itemSelected (id) {
      itemSelectionDialogRef.value.closeDialog()
      testAction(id, selectedRef.value.internalId).then(result => {
        testResultRef.value = result
        testDialogRef.value = true
      })
    }

    const searchRef = ref('')
    const actionsFiltered = computed(() => {
      let arr = actions
      if (searchRef.value) {
        const s = searchRef.value.toLowerCase()
        arr = actions.filter(item => item.identifier.toLowerCase().indexOf(s) > -1 || (item.name && Object.values(item.name).find(val => val.toLowerCase().indexOf(s) > -1)))
      }
      return arr.sort((a, b) => {
        if (a.name[defaultLanguageIdentifier.value] && b.name[defaultLanguageIdentifier.value]) {
          if (a.order === b.order) {
            return a.name[defaultLanguageIdentifier.value].localeCompare(b.name[defaultLanguageIdentifier.value])
          } else {
            return a.order - b.order
          }
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
      Promise.all([
        loadAllRoles(),
        loadAllTypes(),
        loadAllRelations(),
        loadAllActions()]).then(() => {
        clearSelection()
        const id = router.currentRoute.params?.id
        if (id) {
          const idx = actions.findIndex(elem => elem.identifier === id)
          if (idx !== -1) {
            itemRef.value = idx
            setSelected(actions[idx])
          } else {
            router.push('/config/actions')
          }
        }
      })
      canViewConfigRef.value = canViewConfig('actions')
      canEditConfigRef.value = canEditConfig('actions')
    })

    function identifierValidation (v) {
      if (!v) {
        return t('Config.Actions.Error.IdentifierRequired')
      }
      if (!/^[A-Za-z0-9_-]*$/.test(v)) {
        return t('Wrong.Identifier')
      }
      if (v && selectedRef.value.internalId === 0) {
        const found = actions.find((lang) => lang.identifier === v)
        if (found && found.internalId !== 0) {
          return t('Config.Actions.Error.IdentifierNotUnique')
        }
      }
      return true
    }

    return {
      testResultRef,
      testDialogRef,
      getRoles,
      itemSelected,
      getItem,
      getType,
      getRelation,
      displayEvent,
      triggerDialogRef,
      itemSelectionDialogRef,
      triggerCreated,
      addTrigger,
      removeTrigger,
      triggerRef,
      tabRef,
      canViewConfigRef,
      canEditConfigRef,
      formRef,
      actions,
      selectedRef,
      itemRef,
      add,
      remove,
      save,
      currentLanguage,
      defaultLanguageIdentifier,
      searchRef,
      actionsFiltered,
      clearSelection,
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || t('Config.Actions.Error.NameRequired')
      ],
      onSelectAction
    }
  }
}
</script>
