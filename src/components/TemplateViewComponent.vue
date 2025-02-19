<template>
  <div v-if="temp">
    <v-form ref="formRef" lazy-validation class="ml-7" v-if="temp.id != -1">
      <div class="d-inline-flex align-center">
        <v-text-field style="min-width: 100%" v-model="temp.identifier" :disabled="temp.internalId !== 0" :rules="identifierRules" :label="$t('Config.Template.Identifier')" required></v-text-field>
        <SystemInformation :data="temp"/>
      </div>
      <LanguageDependentField :values="temp.name" v-model="temp.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('Config.Template.Name')"></LanguageDependentField>
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
          <jodit-editor ref="joditRef" :config="joditConfig" v-model="temp.templateRichtext" :key="editorKey" />
        </v-tab-item>
        <v-tab-item>
          <v-textarea :rows="15" style="min-width: 100%" v-model="temp.template" :label="$t('Config.Template.Template')" required></v-textarea>
        </v-tab-item>
      </v-tabs-items>
      <br />
      <OptionsTable :options="temp.options" @changed="optionsChanged" />
    </v-form>
    <v-dialog v-model="isSearchDialogOpen" persistent width="70%">
      <v-card>
        <v-card-title>
          <span class="headline">{{ $t('Search') }}</span>
        </v-card-title>
        <v-card-text>
          <div class="text-right">
            <v-btn v-if="!itemSelected" color="blue darken-1" text @click="addVisible">{{ $t('Config.Template.Button.SelectItem') }}</v-btn>
          </div>
          <v-container v-if="itemSelected" ref="tabsContRef" class="ma-0 pa-0">
            <v-tabs v-model="tabPasteRef">
              <v-tab v-text="$t('Config.Template.Attribute')"></v-tab>
              <v-tab v-text="$t('Config.Template.ItemRelation')"></v-tab>
            </v-tabs>
          </v-container>
          <v-tabs-items v-if="itemSelected" v-model="tabPasteRef">
            <v-tab-item>
              <v-row>
                <v-col cols="10" class="pb-0">
                  <v-text-field v-if="itemSelected" v-model="itemSelected.identifier" :label="$t('Config.Template.Identifier')"></v-text-field>
                </v-col>
                <v-col cols="2" v-if="itemSelected" class="d-flex align-center">
                  <v-btn color="blue darken-1" text @click="addVisible">{{ $t('Config.Template.Button.SelectItem') }}</v-btn>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="10" class="pt-0 pb-0">
                  <v-autocomplete v-if="itemSelected" v-model="attrSelected" :items="availableAttributesKeys" :label="$t('Config.Template.Attribute')" item-text="name" item-value="key"></v-autocomplete>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="10" class="pt-0 pb-0">
                  <v-text-field v-if="itemSelected" v-model="selectedValueForUser" :label="$t('Config.Template.Value')"></v-text-field>
                </v-col>
                <v-col cols="2" class="d-flex align-center">
                  <v-btn icon @click="openMappingDialog(index)">
                    <v-icon>mdi-file-document-edit-outline</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <!-- <v-text-field v-if="itemSelected" v-model="selectedValue" :label="$t('Config.Template.Value')"></v-text-field> -->
            </v-tab-item>
            <v-tab-item>
              <v-row>
                <v-col cols="10 pb-0">
                  <v-text-field v-if="itemSelected" v-model="itemSelected.identifier" :label="$t('Config.Template.Identifier')"></v-text-field>
                </v-col>
                <v-col cols="2" v-if="itemSelected" class="d-flex align-center">
                  <v-btn color="blue darken-1" text @click="addVisible">{{ $t('Config.Template.Button.SelectItem') }}</v-btn>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="10" class="pt-0 pb-0">
                  <v-autocomplete v-if="itemSelected" v-model="itemRelationSelected" :items="availableItemRelationsKeys" :label="$t('Config.Template.ItemRelation')" item-text="name" item-value="key"></v-autocomplete>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="10" class="pt-0 pb-0">
                  <v-text-field v-if="itemSelected" v-model="order" type="number" :label="$t('Config.Template.Order')"></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="10" class="pt-0 pb-0">
                  <v-text-field v-if="itemSelected" v-model="selectedValueForUser" :label="$t('Config.Template.Value')"></v-text-field>
                </v-col>
                <v-col cols="2" class="d-flex align-center">
                  <v-btn icon @click="openMappingDialog(index)">
                    <v-icon>mdi-file-document-edit-outline</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <!-- <v-text-field v-if="itemSelected" v-model="selectedValue" :label="$t('Config.Template.Value')"></v-text-field> -->
            </v-tab-item>
          </v-tabs-items>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="isSearchDialogOpen = false">{{ $t('Close') }}</v-btn>
          <v-btn color="blue darken-1" text @click="closeSearchDialog">{{ $t('Select') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogMappingRef" persistent max-width="1000px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ $t('Config.Template.Mapping') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{{ $t('Config.Template.Replace.What') }}</th>
                    <th>{{ $t('Config.Template.Replace.With') }}</th>
                    <th>
                      <v-btn icon @click="addTextFiend()">
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in mapping" :key="i">
                    <td>{{ i + 1 }}</td>
                    <td>
                      <v-text-field
                        v-model="mapping[i].before" :label="$t('Config.Template.Replace.What')"
                      ></v-text-field>
                    </td>
                    <td>
                      <v-text-field
                        v-model="mapping[i].after" :label="$t('Config.Template.Replace.With')"
                      ></v-text-field>
                    </td>
                    <td>
                      <v-btn icon @click="removeTextFiend(i)">
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialogMappingRef = false">{{ $t('Config.Template.Button.Apply') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="isBackgroundDialogOpen" persistent max-width="1000px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ $t('Config.Template.Background') }}</span>
        </v-card-title>
        <v-card-text>
          <v-autocomplete v-model="backgroundSelected" :items="staticImages" item-text="name" item-value="url"></v-autocomplete>
          <v-text-field v-model="width" :label="$t('Config.Template.Width')"></v-text-field>
          <v-text-field v-model="height" :label="$t('Config.Template.Height')"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="isBackgroundDialogOpen = false">{{ $t('Close') }}</v-btn>
          <v-btn color="blue darken-1" text @click="applyBackgroundDialog">{{ $t('Config.Template.Button.Apply') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemsSelected" />
  </div>
</template>
<script>
import { ref, onMounted, computed } from '@vue/composition-api'
import i18n from '../i18n'
import ValidVisibleComponent from '../components/ValidVisibleComponent'
import * as langStore from '../store/languages'
import * as tempStore from '../store/templates'
import * as itemStore from '../store/item'
import * as relationsStore from '../store/relations'
import * as itemRelationStore from '../store/itemRelations'
import * as attrStore from '../store/attributes'
import * as lovStore from '../store/lovs'
import * as mediaStore from '../store/media'
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
      loadAllAttributes,
      getAttributesForItem
    } = attrStore.useStore()

    const {
      lovs,
      loadAllLOVs,
      getLOVData
    } = lovStore.useStore()

    const {
      searchItemRelations
    } = itemRelationStore.useStore()

    const {
      staticFonts,
      loadAllFonts,
      staticImages,
      loadAllImages
    } = mediaStore.useStore()

    const formRef = ref(null)
    const tabRef = ref(0)
    const tabPasteRef = ref(0)

    const fontListRef = ref(null)
    const fontStylesRef = ref(null)

    const joditRef = ref(null)
    const editorKey = ref(0)
    let editorJodit = null
    const joditConfig = ref({
      readonly: false,
      toolbarAdaptive: true,
      toolbarButtonSize: 'small',
      extraButtons: ['openSearchDialog', 'addBackground'],
      controls: {
        openSearchDialog: {
          tooltip: 'Открыть окно вставки',
          exec: (editor) => {
            editorJodit = editor
            openSearchDialog()
          },
          iconURL: '/folder-search.svg'
        },
        addBackground: {
          tooltip: 'Открыть окно вставки фона',
          exec: () => {
            openBackgroundDialog()
          },
          iconURL: '/image-edit.svg'
        },
        font: {
          list: {}
        }
      }
    })

    const isSearchDialogOpen = ref(false)
    const isBackgroundDialogOpen = ref(false)
    const dialogMappingRef = ref(false)
    const selectedOption = ref('')

    function openSearchDialog () {
      isSearchDialogOpen.value = true
      itemSelected.value ||= JSON.parse(localStorage.getItem('itemSelectedTemplate'))
      if (itemSelected.value) {
        availableAttributes.value = getAttributesForItem(itemSelected.value.typeId, itemSelected.value.path)[0].attributes
      }
    }

    const backgroundSelected = ref(null)

    function openBackgroundDialog () {
      isBackgroundDialogOpen.value = true
    }

    const width = ref(1200)
    const height = ref(1200)

    function applyBackgroundDialog () {
      props.temp.templateRichtext = `
      <div style="background-image: url('${backgroundSelected.value}'); width: ${width.value}px; height: ${height.value}px">
      ${props.temp.templateRichtext}
      </div>`
      isBackgroundDialogOpen.value = false
    }

    const selectedItemRel = ref(null)
    const order = ref(null)

    const selectedValueForUser = computed(() => {
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
            return `${value}`
          } else {
            const value = itemSelected.value.values[attrSelected.value] || ''
            return `${value}`
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
          return `<img src='${damUrl}asset/inline/${selectedItemRel.value?.targetId}'/>`
        }
      }

      return ''
    })

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
            return `<attr identifier='${attrSelected.value}' language='${currentLanguage.value.identifier}' relidentifier='' order='' mapping='${JSON.stringify(mapping.value)}'><span>${value}</span></attr> <br>`
          } else {
            const value = itemSelected.value.values[attrSelected.value] || ''
            return `<attr identifier='${attrSelected.value}' language='${currentLanguage.value.identifier}' relidentifier='' order='' mapping='${JSON.stringify(mapping.value)}'><span>${value}</span></attr> <br>`
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
          return `<attr identifier='' language='' relIdentifier='${rel.identifier}' order='${order ? order.value : ''}' mapping='${JSON.stringify(mapping.value)}'><img src='${damUrl}asset/inline/${selectedItemRel.value?.targetId}'/></attr> <br>`
        }
      }

      return ''
    })

    function closeSearchDialog () {
      isSearchDialogOpen.value = false
      if (editorJodit && editorJodit.s) {
        setTimeout(() => {
          editorJodit.s.insertHTML(selectedValue.value)
          mapping.value = []
        }, 0)
      }
    }

    function openMappingDialog () {
      dialogMappingRef.value = true
    }

    const mapping = ref([])

    function addTextFiend () {
      mapping.value.push({ before: '', after: '' })
    }

    function removeTextFiend (index) {
      mapping.value.splice(index, 1)
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
        localStorage.setItem('itemSelectedTemplate', JSON.stringify(itemSelected.value))
        availableAttributes.value = getAttributesForItem(itemSelected.value.typeId, itemSelected.value.path)[0].attributes
      })
    }

    const itemRelationSelected = ref(null)
    const availableItemRelations = ref(null)

    const availableAttributesKeys = computed(() => {
      if (!availableAttributes.value) return []
      return availableAttributes.value.map(attr => ({
        key: attr.identifier,
        name: `${attr.identifier} (${attr.name[currentLanguage.value.identifier]})`
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

    const lovAttributes = ref([])
    const availableLOVs = ref([])

    function getFontFormat (filename) {
      const ext = filename.split('.').pop().toLowerCase()
      switch (ext) {
        case 'ttf': return 'truetype'
        case 'otf': return 'opentype'
        case 'woff': return 'woff'
        case 'woff2': return 'woff2'
        default: return 'truetype'
      }
    }

    onMounted(() => {
      if (!props.temp?.templateRichtext) {
        props.temp.templateRichtext = ''
      }
      if (!props.temp?.template) {
        props.temp.template = ''
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
      loadAllFonts().then(() => {
        joditConfig.value.controls.font.list = Object.fromEntries(staticFonts.map(font => [`${font.name.replace(/\.(ttf|woff|woff2|otf)$/i, '')}, sans-serif`, font.name.replace(/\.(ttf|woff|woff2|otf)$/i, '')]))
        fontStylesRef.value = staticFonts
          .map(
            (font) => `
      @font-face {
        font-family: '${font.name.replace(/\.(ttf|woff|woff2|otf)$/i, '')}';
        src: url('${font.url}') format('${getFontFormat(font.url)}');
        font-weight: normal;
        font-style: normal;
      }
    `
          ).join('\n')
        const styleTag = document.createElement('style')
        styleTag.type = 'text/css'
        styleTag.innerHTML = fontStylesRef.value
        document.head.appendChild(styleTag)
        editorKey.value++
      })
      loadAllImages()
    })

    return {
      editorKey,
      width,
      height,
      fontListRef,
      fontStylesRef,
      applyBackgroundDialog,
      staticFonts,
      staticImages,
      backgroundSelected,
      mapping,
      addTextFiend,
      removeTextFiend,
      openMappingDialog,
      dialogMappingRef,
      selectedValueForUser,
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
      isBackgroundDialogOpen,
      openSearchDialog,
      openBackgroundDialog,
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
