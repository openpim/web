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
        <v-treeview dense activatable hoverable :items="groups" item-children="attributes" @update:active="activeChanged" :active="activeRef" :open="openRef">
          <template v-slot:prepend="{ item }">
            <v-icon>{{ item.group ? 'mdi-format-list-bulleted-type' : 'mdi-alpha-a-box-outline' }}</v-icon>
          </template>
          <template v-slot:label="{ item }">
            {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}
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
          <v-btn class="mr-4" v-if="canEditConfigRef" @click="save">{{ $t('Save') }}</v-btn>
          <v-btn class="mr-4" v-if="canEditConfigRef" @click.stop="remove" :disabled="selectedRef.attributes && selectedRef.attributes.length > 0">{{ $t('Remove') }}</v-btn>
        </v-form>

        <!-- attribute -->
        <v-form ref="formRef" lazy-validation class="ml-7" v-if="selectedRef.id != -1 && !selectedRef.group">
          <div class="d-inline-flex align-center">
            <v-text-field style="min-width: 100%" v-model="selectedRef.identifier"  :readonly="selectedRef.internalId !== 0" :rules="identifierRules" :label="$t('Config.Attributes.Identifier')" required></v-text-field>
            <SystemInformation :data="selectedRef"></SystemInformation>
          </div>

          <LanguageDependentField :values="selectedRef.name" v-model="selectedRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('Config.Attributes.Name')"></LanguageDependentField>
          <v-checkbox v-model="selectedRef.languageDependent" :label="$t('Config.Attributes.LanguageDependent')"></v-checkbox>

          <v-select v-model="selectedRef.type" :items="typeSelection" :rules="typeRules" :label="$t('Config.Attribute.Type')"></v-select>

          <v-checkbox v-if="selectedRef.type === AttributeType.Text" v-model="selectedRef.multiLine" :label="$t('Config.Attribute.MultiLine')"></v-checkbox>
          <v-checkbox v-if="selectedRef.type === AttributeType.Text" v-model="selectedRef.richText" :label="$t('Config.Attribute.RichText')"></v-checkbox>

          <v-text-field v-if="selectedRef.type === AttributeType.Text || selectedRef.type === AttributeType.Integer || selectedRef.type === AttributeType.Float || selectedRef.type === AttributeType.Date || selectedRef.type === AttributeType.DateTime" v-model="selectedRef.pattern" :label="$t('Config.Attribute.Pattern')" required></v-text-field>
          <LanguageDependentField v-if="selectedRef.type === AttributeType.Text || selectedRef.type === AttributeType.Integer || selectedRef.type === AttributeType.Float || selectedRef.type === AttributeType.Date || selectedRef.type === AttributeType.DateTime" :values="selectedRef.errorMessage" v-model="selectedRef.errorMessage[currentLanguage.identifier]" :label="$t('Config.Attribute.ErrorMessage')"></LanguageDependentField>

          <v-select v-if="selectedRef.type === AttributeType.LOV" v-model="selectedRef.lov" :items="lovSelection" :label="$t('Config.Attribute.LOV')"></v-select>

          <v-text-field v-model="selectedRef.order" type="number" :label="$t('Config.Attributes.Order')" required></v-text-field>

          <v-tabs v-model="tabRef">
            <v-tab v-text="$t('Config.Attributes.ForObjects')"></v-tab>
            <v-tab v-text="$t('Config.Attributes.ForRelations')"></v-tab>
          </v-tabs>
          <v-tabs-items v-model="tabRef">
            <v-tab-item>
              <v-card class="mb-5 mt-2">
                <v-card-title class="subtitle-2 font-weight-bold" >
                  <div style="width:90%">{{ $t('Config.Attributes.Valid') }}</div>
                  <v-tooltip bottom v-if="canEditConfigRef">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="editValid"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Edit') }}</span>
                  </v-tooltip>
                </v-card-title>
                <v-divider></v-divider>
                <v-list dense class="pt-0 pb-0">
                  <v-list-item v-for="(item, i) in valid" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
                    <router-link :to="'/config/types/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
                  </v-list-item-content></v-list-item>
                </v-list>
              </v-card>

              <v-card class="mb-5">
                <v-card-title class="subtitle-2 font-weight-bold" >
                  <div style="width:80%">{{ $t('Config.Attributes.Visible') }}</div>
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
            </v-tab-item>
            <v-tab-item>
              <v-card class="mb-5 mt-2">
                <v-card-title class="subtitle-2 font-weight-bold" >
                  <div style="width:90%">{{ $t('Config.Attributes.ForRelations') }}</div>
                  <v-tooltip bottom v-if="canEditConfigRef">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="editRelations"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Edit') }}</span>
                  </v-tooltip>
                </v-card-title>
                <v-divider></v-divider>
                <v-list dense class="pt-0 pb-0">
                  <v-list-item v-for="(item, i) in attrRelations" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
                    <router-link :to="'/config/relations/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
                  </v-list-item-content></v-list-item>
                </v-list>
              </v-card>
            </v-tab-item>
          </v-tabs-items>

          <OptionsTable :options="selectedRef.options" />

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
    <TypeSelectionDialog ref="typeSelectionDialogRef" :multiselect="true" @selected="typesSelected"/>
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemsSelected"/>
    <RelationsSelectionDialog ref="relSelectionDialogRef" :multiselect="true" @selected="relationsSelected"/>
  </v-container>
</template>

<script>
import * as attrStore from '../../store/attributes'
import * as typesStore from '../../store/types'
import * as itemStore from '../../store/item'
import * as relStore from '../../store/relations'
import { ref, computed, onMounted } from '@vue/composition-api'
import i18n from '../../i18n'
import router from '../../router'
import * as errorStore from '../../store/error'
import TypeSelectionDialog from '../../components/TypeSelectionDialog'
import ItemsSelectionDialog from '../../components/ItemsSelectionDialog'
import * as langStore from '../../store/languages'
import LanguageDependentField from '../../components/LanguageDependentField'
import RelationsSelectionDialog from '../../components/RelationsSelectionDialog'
import * as userStore from '../../store/users'
import * as lovStore from '../../store/lovs'
import AttributeType from '../../constants/attributeTypes'
import SystemInformation from '../../components/SystemInformation'
import OptionsTable from '../../components/OptionsTable'

export default {
  components: { TypeSelectionDialog, ItemsSelectionDialog, LanguageDependentField, RelationsSelectionDialog, SystemInformation, OptionsTable },
  setup () {
    const { canViewConfig, canEditConfig } = userStore.useStore()

    const { getLOVsForSelect } = lovStore.useStore()

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
      relations,
      loadAllRelations
    } = relStore.useStore()

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

    const {
      findType,
      loadAllTypes
    } = typesStore.useStore()

    const {
      loadItemsByIds
    } = itemStore.useStore()

    const tabRef = ref(null)
    const canViewConfigRef = ref(false)
    const canEditConfigRef = ref(false)

    const attrDeletionRef = ref('link')
    const dialogRef = ref(false)
    const formRef = ref(null)
    const empty = { id: -1 }
    const selectedRef = ref(empty)
    const activeRef = ref([])
    const openRef = ref([])
    const typeSelectionDialogRef = ref(null)
    const itemSelectionDialogRef = ref(null)
    const relSelectionDialogRef = ref(null)
    const connectGroups = computed(() => {
      const item = findByIdentifier(selectedRef.value.identifier)
      return groups.filter((grp) => !item.groups.find((item) => item.id === grp.id))
    })

    const lovSelection = ref([])

    const valid = computed(() => {
      if (selectedRef.value.valid) {
        return selectedRef.value.valid.map((id) => findType(id).node)
      } else {
        return []
      }
    })

    function editValid () {
      typeSelectionDialogRef.value.showDialog('valid', selectedRef.value.valid)
    }

    function typesSelected (arr) {
      typeSelectionDialogRef.value.closeDialog()
      selectedRef.value.valid = arr
    }

    const visible = ref([])
    const visibleSelectedRef = ref(null)

    function addVisible () {
      itemSelectionDialogRef.value.showDialog('visible', selectedRef.value.visible)
    }

    function itemsSelected (id) {
      itemSelectionDialogRef.value.closeDialog()
      const tst = selectedRef.value.visible.find(elem => elem === id)
      if (!tst) {
        selectedRef.value.visible.push(id)
        loadItemsByIds([id], false).then(items => {
          visible.value.push(items[0])
        })
      }
    }

    function removeVisible () {
      visible.value.splice(visibleSelectedRef.value, 1)
      selectedRef.value.visible.splice(visibleSelectedRef.value, 1)
      visibleSelectedRef.value = null
    }

    const attrRelations = computed(() => {
      if (selectedRef.value.relations) {
        return selectedRef.value.relations.map(id => relations.find(rel => rel.id === id))
      } else {
        return []
      }
    })

    function editRelations () {
      relSelectionDialogRef.value.showDialog('', selectedRef.value.relations)
    }

    function relationsSelected (arr) {
      relSelectionDialogRef.value.closeDialog()
      selectedRef.value.relations = arr
    }

    function newAttrSelected (attr) {
      visible.value = []
      if (attr && !attr.group && attr.visible && attr.visible.length > 0) {
        loadItemsByIds(attr.visible, false).then(items => {
          visible.value = items
        })
      }
    }

    function activeChanged (active) {
      if (active.length !== 0) {
        if (selectedRef.value.internalId === 0 && active[0] !== selectedRef.value.id) {
          showInfo(i18n.t('Config.NotSaved'))
        }

        if (active[0] !== selectedRef.value.id) {
          activeRef.value[0] = active[0]
          selectedRef.value = findById(active[0]).item
          router.push('/config/attributes' + (selectedRef.value.identifier ? '/' + selectedRef.value.identifier : ''))
          newAttrSelected(selectedRef.value)
        }
      } else {
        selectedRef.value = empty
        router.push('/config/attributes')
      }
    }

    function add () {
      if (selectedRef.value && selectedRef.value.group) {
        const name = {}
        name[currentLanguage.value.identifier] = i18n.t('Config.Attributes.Attr.NewName')
        const errorMessage = {}
        errorMessage[currentLanguage.value.identifier] = ''
        const newAttr = { id: Date.now(), internalId: 0, group: false, languageDependent: false, order: 0, visible: [], valid: [], relations: [], name: name, errorMessage: errorMessage, options: [] }
        selectedRef.value.attributes.push(newAttr)
        openRef.value = [selectedRef.value.id]
        visible.value = []
        selectedRef.value = newAttr
      } else {
        const name = {}
        name[currentLanguage.value.identifier] = i18n.t('Config.Attributes.Group.NewName')
        const newGroup = { id: Date.now(), internalId: 0, group: true, attributes: [], order: 0, visible: false, name: name }
        groups.push(newGroup)
        selectedRef.value = newGroup
      }
      activeRef.value.pop()
      activeRef.value.push(selectedRef.value.id)
    }

    function remove () {
      if (selectedRef.value.group) {
        if (confirm(i18n.t('Config.Attributes.Confirm.Delete', { name: selectedRef.value.name }))) {
          activeRef.value.pop()
          removeGroup(selectedRef.value.id).then(() => {
            showInfo(i18n.t('Saved'))
          })
          selectedRef.value = empty
          router.push('/config/attributes')
        }
      } else {
        dialogRef.value = true
      }
    }

    function removeAttr () {
      dialogRef.value = false
      activeRef.value.pop()
      removeAttribute(selectedRef.value.id, attrDeletionRef.value !== 'link').then(() => {
        showInfo(i18n.t('Saved'))
      })
      selectedRef.value = empty
      router.push('/config/attributes')
    }

    function save () {
      if (formRef.value.validate()) {
        router.push('/config/attributes/' + selectedRef.value.identifier)
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
    }

    onMounted(() => {
      loadAllLanguages().then(() =>
        getLOVsForSelect().then((arr) => {
          lovSelection.value = arr
        })
      )
      loadAllTypes()
      loadAllRelations()
      loadAllAttributes().then(() => {
        canViewConfigRef.value = canViewConfig('attributes')
        canEditConfigRef.value = canEditConfig('attributes')

        const id = router.currentRoute.params.id
        if (id) {
          const result = findByIdentifier(id)
          if (result.item) {
            selectedRef.value = result.item
            activeRef.value.push(result.item.id)
            if (!result.item.group) {
              openRef.value = result.groups.map(grp => grp.id)
            }
            newAttrSelected(selectedRef.value)
          } else {
            router.push('/config/attributes')
          }
        }
      })
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
      tabRef,
      groups,
      activeChanged,
      add,
      remove,
      removeAttr,
      save,
      formRef,
      selectedRef,
      activeRef,
      openRef,
      connectGroups,
      assign,
      dialogRef,
      editValid,
      valid,
      attrDeletionRef,
      typeSelectionDialogRef,
      typesSelected,
      addVisible,
      removeVisible,
      visible,
      itemsSelected,
      itemSelectionDialogRef,
      visibleSelectedRef,
      currentLanguage,
      defaultLanguageIdentifier,
      attrRelations,
      editRelations,
      relationsSelected,
      relSelectionDialogRef,
      lovSelection,
      AttributeType,
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('Config.Attributes.Error.NameRequired')
      ],
      typeRules: [
        v => !!v || i18n.t('Config.Attributes.Error.TypeRequired')
      ],
      typeSelection: [
        { text: i18n.t('Config.Attribute.Type.Text'), value: AttributeType.Text },
        { text: i18n.t('Config.Attribute.Type.Boolean'), value: AttributeType.Boolean },
        { text: i18n.t('Config.Attribute.Type.Integer'), value: AttributeType.Integer },
        { text: i18n.t('Config.Attribute.Type.Float'), value: AttributeType.Float },
        { text: i18n.t('Config.Attribute.Type.Date'), value: AttributeType.Date },
        { text: i18n.t('Config.Attribute.Type.Time'), value: AttributeType.Time },
        { text: i18n.t('Config.Attribute.Type.LOV'), value: AttributeType.LOV },
        { text: i18n.t('Config.Attribute.Type.URL'), value: AttributeType.URL }
      ]
    }
  }
}
</script>
