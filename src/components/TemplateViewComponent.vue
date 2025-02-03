<template>
  <div v-if="temp">
    <v-form ref="formRef" lazy-validation class="ml-7" v-if="temp.id != -1">
      <div class="d-inline-flex align-center">
        <v-text-field style="min-width: 100%" v-model="temp.identifier" :disabled="temp.internalId !== 0"
          :rules="identifierRules" :label="$t('Config.Template.Identifier')" required></v-text-field>
        <SystemInformation :data="temp" />
      </div>
      <LanguageDependentField :values="temp.name" v-model="temp.name[currentLanguage.identifier]" :rules="nameRules"
        :label="$t('Config.Template.Name')"></LanguageDependentField>
      <v-text-field v-model="temp.order" type="number" :label="$t('Config.Template.Order')" required></v-text-field>
      <ValidVisibleComponent :elem="temp" :canEditConfig="canEditConfig" />
      <v-container ref="tabsContainerRef" class="ma-0 pa-0">
        <v-tabs v-model="tabRef">
          <v-tab v-text="'RichText'"></v-tab>
          <v-tab v-text="$t('Config.Template.Template')"></v-tab>
        </v-tabs>
      </v-container>
      <v-tabs-items v-model="tabRef">
        <v-tab-item>
          <jodit-editor ref="joditRef" :config="joditConfig" v-model="temp.templateRichtext" />
          <v-card v-if="isSearchDialogOpen">
            <v-card-title>
              <span class="headline">Поиск</span>
            </v-card-title>
            <v-card-text class="pr-1">
              <div class="pa-0 text-right">
                <v-btn color="blue darken-1" text @click="addVisible">{{ $t('Select') }}</v-btn>
              </div>
              <v-container v-if="itemSelected" ref="tabsContRef" class="ma-0 pa-0">
                <v-tabs v-model="tabPasteRef">
                  <v-tab v-text="$t('Config.Template.Attribute')"></v-tab>
                  <v-tab v-text="$t('Config.Template.ItemRelation')"></v-tab>
                </v-tabs>
              </v-container>
              <v-tabs-items v-if="itemSelected" v-model="tabPasteRef">
                <v-tab-item>
                  <v-text-field v-if="itemSelected" v-model="itemSelected.identifier"
                    :label="$t('Config.Template.Identifier')"></v-text-field>
                  <v-autocomplete v-if="itemSelected" v-model="attrSelected" :items="availableAttributesKeys"
                    :label="$t('Config.Template.Attribute')" item-text="name" item-value="key"></v-autocomplete>
                  <v-text-field v-if="itemSelected" v-model="selectedValue"
                    :label="$t('Config.Template.Value')"></v-text-field>
                </v-tab-item>
                <v-tab-item>
                  <v-text-field v-if="itemSelected" v-model="itemSelected.identifier"
                    :label="$t('Config.Template.Identifier')"></v-text-field>
                  <v-autocomplete v-if="itemSelected" v-model="itemRelationSelected" :items="availableItemRelationsKeys"
                    :label="$t('Config.Template.ItemRelation')" item-text="name" item-value="key"></v-autocomplete>
                  <v-text-field v-if="itemSelected" v-model="order" type="number"
                    :label="$t('Config.Template.Order')"></v-text-field>
                  <v-text-field v-if="itemSelected" v-model="selectedValue"
                    :label="$t('Config.Template.Value')"></v-text-field>
                </v-tab-item>
              </v-tabs-items>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="isSearchDialogOpen = false">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-textarea :rows="15" style="min-width: 100%" v-model="temp.template" :label="$t('Config.Template.Template')"
            required></v-textarea>
        </v-tab-item>
      </v-tabs-items>
      <br />
      <OptionsTable :options="temp.options" @changed="optionsChanged" />
    </v-form>
    <v-dialog v-model="isSearchDialogOpen_" persistent width="80%">
      <v-card>
        <v-card-title>
          <span class="headline">Поиск</span>
        </v-card-title>
        <v-card-text>
          <v-btn color="blue darken-1" text @click="addVisible">{{ $t('Add') }}</v-btn>
          <v-text-field v-if="itemSelected" v-model="itemSelected.identifier"></v-text-field>
          <v-autocomplete v-if="itemSelected" v-model="attrSelected" :items="availableAttributesKeys" label="Атрибут"
            item-text="name" item-value="key"></v-autocomplete>
          <v-text-field v-if="itemSelected" v-model="selectedValue"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="isSearchDialogOpen = false">{{ $t('Close') }}</v-btn>
          <v-btn color="blue darken-1" text @click="closeSearchDialog">{{ $t('Select') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemsSelected" />
  </div>
</template>
<script>
import { ref, onBeforeUpdate, onMounted, computed } from '@vue/composition-api'
import i18n from '../i18n'
import ValidVisibleComponent from '../components/ValidVisibleComponent'
import * as langStore from '../store/languages'
import * as tempStore from '../store/templates'
import * as itemStore from '../store/item'
import * as relationsStore from '../store/relations'
import * as itemRelationStore from '../store/itemRelations'
import * as attrStore from '../store/attributes'
import * as lovStore from '../store/lovs'
import OptionsTable from '../components/OptionsTable'
import SystemInformation from '../components/SystemInformation'
import LanguageDependentField from '../components/LanguageDependentField'
import ItemsSelectionDialog from '../components/ItemsSelectionDialog'

import 'jodit/build/jodit.min.css'
import { JoditEditor } from 'jodit-vue'

export default {
  components: {
    SystemInformation,
    LanguageDependentField,
    ValidVisibleComponent,
    OptionsTable,
    JoditEditor,
    ItemsSelectionDialog
  },
  props: {
    temp: {
      type: Object,
      required: true
    },
    canEditConfig: {
      type: Boolean,
      required: true
    }
  },
  setup (props, { root }) {
    const { currentLanguage, defaultLanguageIdentifier, loadAllLanguages } = langStore.useStore()
    const { templates } = tempStore.useStore()
    const {
      loadItemsByIdsForImport
    } = itemStore.useStore()

    const {
      relations,
      loadAllRelations
    } = relationsStore.useStore()

    const {
      groups,
      loadAllAttributes
    } = attrStore.useStore()

    const {
      lovs,
      loadAllLOVs,
      getLOVData
    } = lovStore.useStore()

    const {
      searchItemRelations
    } = itemRelationStore.useStore()

    const formRef = ref(null)
    const tabRef = ref(0)
    const tabPasteRef = ref(0)

    const joditRef = ref(null)
    const joditConfig = ref({
      readonly: false,
      toolbarAdaptive: true,
      toolbarButtonSize: 'small',
      extraButtons: ['myCustomButton', 'myCustomButton2'],
      controls: {
        myCustomButton: {
          tooltip: 'Открыть окно вставки',
          exec: () => {
            openSearchDialog()
          },
          iconURL: 'https://www.svgrepo.com/download/509178/open.svg'
        },
        myCustomButton2: {
          tooltip: 'Вставить',
          exec: (editor) => {
            editor.s.insertHTML(selectedValue.value)
          },
          iconURL: 'https://www.svgrepo.com/download/521781/paste.svg'
        }
      }
    })

    const isSearchDialogOpen = ref(false)
    const isSearchDialogOpen_ = ref(false)

    const selectedOption = ref('')

    const handler = (event) => {
      console.log('Событие сработало:', event.type)
      if (joditRef.value && joditRef.value.editor) {
        console.log('Текущее содержимое:', joditRef.value.editor.getEditorValue())
      }
    }

    const currentEditor = ref(null)

    function openSearchDialog (editor) {
      currentEditor.value = editor
      isSearchDialogOpen.value = true
    }

    const selectedItemRel = ref(null)
    const order = ref(null)

    const selectedValue = computed(() => {
      if (tabPasteRef.value === 0) {
        if (!itemSelected.value || !attrSelected.value) return ''

        if (attrSelected.value && itemSelected.value) {
          itemRelationSelected.value = null
          const lovAttr = lovAttributes.value.find(attr => attr.identifier === attrSelected.value)
          if (lovAttr) {
            const lov = availableLOVs.value.find(lov => parseInt(lov.id) === parseInt(lovAttr.lov))
            getLOVData(lov.id).then((data) => {
              lov.values = data
            })
            const value = lov?.values?.find(el => el.id === itemSelected.value.values?.[attrSelected.value])?.value[currentLanguage.value.identifier] || ''
            return `<attr identifier='${attrSelected.value}' language='${currentLanguage.value.identifier}' relidentifier='' order=''>${value}</attr> `
          } else {
            const value = itemSelected.value.values[attrSelected.value] || ''
            return `<attr identifier='${attrSelected.value}' language='${currentLanguage.value.identifier}' relidentifier='' order=''${value}</attr> `
          }
        }
      }

      if (tabPasteRef.value === 1) {
        if (!itemSelected.value || !itemRelationSelected.value) return ''

        if (itemRelationSelected.value) {
          attrSelected.value = null
          const rel = availableItemRelations.value[itemRelationSelected.value]
          const where = {
            itemId: itemSelected.value.id,
            relationId: rel.id
          }
          const options = { page: 1, itemsPerPage: 50 }
          searchItemRelations(where, options).then((data) => {
            selectedItemRel.value = data.rows.find(
              (itemRel) => parseInt(itemRel.values._itemRelationOrder) === parseInt(order.value)
            )
            if (!selectedItemRel.value) selectedItemRel.value = data.rows[0]
          })
          const damUrl = window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/'
          return `<attr identifier='' language='' relIdentifier='${rel.identifier}' order='${order ? order.value : ''}'><img src='${damUrl}asset/inline/${selectedItemRel.value?.targetId}'/></attr> `
        }
      }

      return ''
    })

    function closeSearchDialog () {
      try {
        if (!attrSelected.value || !itemSelected.value || !itemSelected.value.values) {
          console.error('Некорректные данные для вставки')
          return
        }

        const valueToInsert = selectedValue.value
        if (!valueToInsert) {
          console.error('Нет значения для вставки')
          return
        }

        if (!currentEditor.value?.s) {
          console.error('Редактор не инициализирован')
          return
        }

        currentEditor.value.s.insertHTML(valueToInsert)
        isSearchDialogOpen.value = false
      } catch (error) {
        console.error('Ошибка при вставке значения:', error)
      }
    }

    function optionsChanged (val) {
      props.temp.options = val
    }

    function identifierValidation (v) {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(v)) {
        return i18n.t('Wrong.Identifier')
      }
      if (!v) {
        return i18n.t('Config.Template.Error.IdentifierRequired')
      }
      if (v && props.temp.internalId === 0) {
        const found = templates.find((temp) => temp.identifier === v)
        if (found && found.internalId !== 0) {
          return i18n.t('Config.Template.Error.IdentifierNotUnique')
        }
      }
      return true
    }

    const itemSelectionDialogRef = ref(null)
    const attrSelected = ref(null)

    function addVisible () {
      itemSelectionDialogRef.value.showDialog()
    }

    const itemSelected = ref(null)
    const availableAttributes = ref(null)

    function itemsSelected (id) {
      itemSelectionDialogRef.value.closeDialog()
      loadItemsByIdsForImport(id, false).then(item => {
        itemSelected.value = item[0]
        availableAttributes.value = item[0].values
      })
    }

    const itemRelationSelected = ref(null)
    const availableItemRelations = ref(null)

    const availableAttributesKeys = computed(() => {
      if (!availableAttributes.value) return []
      return Object.keys(availableAttributes.value).map(key => ({
        key,
        name: key
      }))
    })

    const availableItemRelationsKeys = computed(() => {
      if (!availableItemRelations.value) return []

      return Object.keys(availableItemRelations.value)
        .map((key) => {
          const relation = availableItemRelations.value[key]
          const name = relation.name?.ru || key
          const id = relation.id
          const isTypeMatch = relation.sources?.some(typeId => typeId === parseInt(itemSelected.value?.typeId)) || false

          return isTypeMatch ? { key, name, id } : null
        })
        .filter(Boolean)
    })

    onBeforeUpdate(() => {
      if (joditRef.value?.editor) {
        const editor = joditRef.value.editor
        editor.events.on('keyup', handler)
        editor.events.on('afterPaste', handler)
      }
    })

    const lovAttributes = ref([])
    const availableLOVs = ref([])

    onMounted(() => {
      if (!props.temp?.templateRichtext) {
        props.temp.templateRichtext = ''
      }
      if (!props.temp?.template) {
        props.temp.template = ''
      }
      if (joditRef.value?.editor) {
        const editor = joditRef.value.editor
        editor.events.on('keyup', handler)
        editor.events.on('afterPaste', handler)
      }
      loadAllRelations().then(() => {
        availableItemRelations.value = relations
      })
      loadAllAttributes().then(() => {
        const lovArr = []
        for (var i = 0; i < groups.length; i++) {
          const group = groups[i]
          for (var j = 0; j < group.attributes.length; j++) {
            const attr = group.attributes[j]
            if (attr.lov) {
              lovArr.push(attr)
            }
          }
        }
        lovAttributes.value = lovArr
      })
      loadAllLOVs().then(() => {
        availableLOVs.value = lovs
      })
      loadAllLanguages()
    })

    return {
      order,
      selectedItemRel,
      availableLOVs,
      lovAttributes,
      availableItemRelationsKeys,
      itemRelationSelected,
      selectedValue,
      availableAttributesKeys,
      availableAttributes,
      attrSelected,
      itemSelected,
      itemSelectionDialogRef,
      addVisible,
      itemsSelected,
      isSearchDialogOpen,
      isSearchDialogOpen_,
      openSearchDialog,
      closeSearchDialog,
      selectedOption,
      joditRef,
      joditConfig,
      formRef,
      tabRef,
      tabPasteRef,
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages,
      optionsChanged,
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
