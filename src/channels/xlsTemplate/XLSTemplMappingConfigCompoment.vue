<template>
  <div>
    <v-row>
        <v-col cols="11">
            <v-autocomplete
              v-model="categoryIdRef"
              @change="categoryChanged"
              :items="mappedCategories.filter(elem => !elem.deleted)"
              item-text="name"
              item-value="id"
              :label="$t('MappingConfigComponent.Category')"
              clearable
            ></v-autocomplete>
            <div v-if="categoryIdRef">
                <v-row>
                  <v-col cols="11">
                    <ValidVisibleComponent :elem="categoryRef" :canEditConfig="!readonly"/>
                    <v-select clearable class="mb-5" v-model="categoryRef.visibleRelation" :item-text="item => item.name[defaultLanguageIdentifier]" item-value="id" :items="relations" :label="$t('MappingConfigComponent.VisibleRelation')"></v-select>
                  </v-col>
                  <v-col cols="1">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn icon v-on="on" @click="relCategoryDialogRef.showDialog()"><v-icon>mdi-content-copy</v-icon></v-btn>
                      </template>
                      <span>{{$t('MappingConfigComponent.CopyMapping')}}</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn icon v-on="on" @click="addAttribute"><v-icon>mdi-plus</v-icon></v-btn>
                      </template>
                      <span>{{$t('MappingConfigComponent.AddAttribute')}}</span>
                    </v-tooltip>

                  </v-col>
                </v-row>
                <v-row>
                    <v-col cols="11">
                        <v-autocomplete
                            v-model="sheetIdRef"
                            @change="sheetChanged"
                            :items="mappedSheets.filter(elem => !elem.deleted)"
                            item-text="name"
                            item-value="id"
                            :label="$t('MappingConfigComponent.Sheet')"
                            clearable
                        >
                        </v-autocomplete>
                        <div v-if="sheetIdRef">
                            <v-text-field type="number" :readonly="readonly" v-model="sheetRef.index" :label="$t('MappingConfigComponent.SheetIndex')" required></v-text-field>
                            <v-text-field type="number" :readonly="readonly" v-model="sheetRef.rowStartFrom" :label="$t('MappingConfigComponent.SheetRowStartFrom')" required></v-text-field>
                            <v-simple-table dense class="mb-4" v-if="sheetRef.colunms">
                                <template v-slot:default>
                                    <thead>
                                        <tr>
                                            <th class="text-left" style="width:30%">{{$t('MappingConfigComponent.SheetColumn')}}</th>
                                            <th class="text-left" style="width:30%">{{$t('MappingConfigComponent.Table.Attribute')}}</th>
                                            <th class="text-left">{{$t('MappingConfigComponent.Table.Expression')}}</th>
                                            <th class="text-left">
                                                <v-btn icon @click="addCell" class="d-inline-flex"><v-icon>mdi-plus</v-icon></v-btn>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(elem, i) in sheetRef.colunms" :key="i">
                                            <td class="pa-1">
                                                <v-text-field v-model="elem.column" dense :readonly="readonly" class="ml-3 mr-3 d-inline-flex" />
                                            </td>
                                            <td class="pa-1">
                                                <v-autocomplete dense :readonly="readonly" v-model="elem.attrIdent" :items="allAttributes"></v-autocomplete>
                                            </td>
                                            <td class="pa-1">
                                                <v-text-field v-model="elem.expr" dense :readonly="readonly" class="ml-3 mr-3 d-inline-flex" :prepend-icon="''" @click:prepend="showOptions(sheetRef.colunms[i])" append-outer-icon="mdi-message-outline" @click:append-outer="showExpression(sheetRef.colunms[i])" />
                                            </td>
                                            <td>
                                                <v-btn icon @click="removeCell(i)" class="d-inline-flex"><v-icon>mdi-minus-circle-outline</v-icon></v-btn>
                                            </td>
                                        </tr>
                                    </tbody>
                                </template>
                            </v-simple-table>
                        </div>
                    </v-col>
                    <v-col cols="1">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn icon v-on="on" @click="addS"><v-icon>mdi-plus</v-icon></v-btn>
                            </template>
                            <span>{{ $t('Add') }}</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn icon :disabled="!sheetIdRef" v-on="on" @click="removeSheet"><v-icon>mdi-minus</v-icon></v-btn>
                            </template>
                            <span>{{ $t('Remove') }}</span>
                        </v-tooltip>
                    </v-col>
                </v-row>
            </div>
        </v-col>
        <v-col cols="1">
            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on" @click="add"><v-icon>mdi-plus</v-icon></v-btn>
                </template>
                <span>{{ $t('Add') }}</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn icon :disabled="!categoryIdRef" v-on="on" @click="remove"><v-icon>mdi-minus</v-icon></v-btn>
                </template>
                <span>{{ $t('Remove') }}</span>
            </v-tooltip>
          </v-col>
    </v-row>
    <template>
      <v-row justify="center">
        <v-dialog v-model="dialogRef" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">{{$t('MappingConfigComponent.CategoryAdd')}}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="newCategoryNameRef" :label="$t('MappingConfigComponent.CategoryName')" required></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
              <v-btn color="blue darken-1" text :disabled="!newCategoryNameRef" @click="addCategory">{{ $t('Select') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
    <template>
      <v-row justify="center">
        <v-dialog v-model="dialogSheetRef" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">{{$t('MappingConfigComponent.SheetAdd')}}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="newSheetNameRef" :label="$t('MappingConfigComponent.SheetName')" required></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialogSheetRef = false">{{ $t('Cancel') }}</v-btn>
              <v-btn color="blue darken-1" text :disabled="!newSheetNameRef" @click="addSheet">{{ $t('Select') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
    <template>
        <v-row justify="center" v-if="exprAttrRef">
            <v-dialog v-model="exprDialogRef" persistent max-width="90%">
            <v-card>
                <v-card-text>
                <v-container>
                    <v-row>
                    <v-col cols="12">
                        <v-textarea :rows="15" :readonly="readonly" v-model="exprAttrRef.expr"></v-textarea>
                    </v-col>
                    </v-row>
                </v-container>
                </v-card-text>
                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="exprDialogRef = false">{{ $t('Close') }}</v-btn>
                </v-card-actions>
            </v-card>
            </v-dialog>
        </v-row>
    </template>
    <template>
      <v-row justify="center" v-if="optAttrRef">
        <v-dialog v-model="optDialogRef" persistent max-width="90%">
          <v-card>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <OptionsTable :options="optAttrRef.options" @changed="optionsChanged" />
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="optDialogRef = false">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted } from '@vue/composition-api'
import * as relStore from '../../store/relations'
import * as attrStore from '../../store/attributes'
import * as langStore from '../../store/languages'
import ValidVisibleComponent from '../../components/ValidVisibleComponent'
import i18n from '../../i18n'

export default {
  props: {
    channel: {
      required: true
    },
    readonly: {
      type: Boolean,
      required: true
    },
    variants: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  components: { ValidVisibleComponent },
  setup (props, { root }) {
    const {
      relations,
      loadAllRelations
    } = relStore.useStore()

    const {
      loadAllAttributes,
      groups
    } = attrStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const mappedCategories = computed(() => {
      if (props.channel && props.channel.mappings) {
        return Object.values(props.channel.mappings)
      } else {
        return []
      }
    })

    const mappedSheets = computed(() => {
      if (props.channel && props.channel.mappings && props.channel.mappings[categoryIdRef.value]?.sheets) {
        return Object.values(props.channel.mappings[categoryIdRef.value]?.sheets)
      } else {
        return []
      }
    })

    function showExpression (attr) {
      exprAttrRef.value = attr
      exprDialogRef.value = true
    }

    function showOptions (attr) {
      if (!attr.options) {
        root.$set(attr, 'options', [])
      }
      optAttrRef.value = attr
      optDialogRef.value = true
    }

    function add () {
      newCategoryNameRef.value = null
      dialogRef.value = true
    }

    function addS () {
      newSheetNameRef.value = null
      dialogSheetRef.value = true
    }

    function addCategory () {
      dialogRef.value = false
      channelAttributesRef.value = []
      const id = 'cat' + Date.now()
      categoryRef.value = { id: id, name: newCategoryNameRef.value, valid: props.channel.valid || [], visible: [], type: 'simple', attributes: [], params: [], categoryAttributes: [], sheets: [] }
      root.$set(props.channel.mappings, id, categoryRef.value)
      categoryIdRef.value = id
    }

    function addCell () {
      sheetRef.value.colunms.push({ column: '', attrIdent: '', expr: '' })
    }

    function addSheet () {
      dialogSheetRef.value = false
      const id = 'sheet' + Date.now()
      sheetRef.value = { id: id, name: newSheetNameRef.value, index: '', colunms: [], rowStartFrom: 0 }
      categoryRef.value.sheets.push(sheetRef.value)
      root.$set(props.channel.mappings, categoryRef.value.id, categoryRef.value)
      sheetIdRef.value = id
    }

    function remove () {
      if (confirm(i18n.t('MappingConfigComponent.Remove.Confirm'))) {
        props.channel.mappings[categoryIdRef.value] = { deleted: true }
        categoryIdRef.value = null
      }
    }

    function removeSheet () {
      if (confirm(i18n.t('MappingConfigComponent.Remove.Confirm'))) {
        props.channel.mappings[sheetIdRef.value] = { deleted: true }
        sheetIdRef.value = null
      }
    }

    function removeCell (i) {
      if (confirm(i18n.t('Remove') + '?')) {
        sheetRef.value.colunms.splice(i, 1)
      }
    }

    const availableCategories = computed(() => {
      return categoriesRef.value.filter(elem => !mappedCategories.value.find(cat => elem.id === cat.id))
    })

    function categoryChanged () {
      categoryRef.value = mappedCategories.value.find(elem => elem.id === categoryIdRef.value)
      sheetIdRef.value = null
    }

    function sheetChanged () {
      sheetRef.value = mappedSheets.value.find(elem => elem.id === sheetIdRef.value)
    }

    const categoryIdRef = ref(null)
    const sheetIdRef = ref(null)
    const channelAttributesRef = ref([])
    const newSheetNameRef = ref(null)
    const newCategoryNameRef = ref(null)
    const categoryRef = ref(null)
    const sheetRef = ref(null)
    const dialogRef = ref(null)
    const dialogSheetRef = ref(null)
    const categoriesRef = ref([])
    const relationsLoadedRef = ref(false)
    const allAttributes = ref([])
    const exprAttrRef = ref(null)
    const exprDialogRef = ref(null)
    const optAttrRef = ref(null)
    const optDialogRef = ref(null)

    onMounted(() => {
      loadAllRelations().then(() => { relationsLoadedRef.value = true })
      loadAllAttributes().then(() => {
        const arr = []
        arr.push({ value: '#name#', text: i18n.t('Item.name') })
        for (var i = 0; i < groups.length; i++) {
          const group = groups[i]
          for (var j = 0; j < group.attributes.length; j++) {
            const attr = group.attributes[j]
            arr.push({ value: attr.identifier, text: attr.identifier + ' - ' + attr.name?.ru })
          }
        }
        allAttributes.value = arr
      })
    })

    return {
      addCategory,
      addSheet,
      remove,
      removeSheet,
      removeCell,
      categoryChanged,
      sheetChanged,
      showExpression,
      currentLanguage,
      defaultLanguageIdentifier,
      mappedCategories,
      mappedSheets,
      availableCategories,
      dialogRef,
      dialogSheetRef,
      add,
      addS,
      categoryRef,
      sheetRef,
      categoryIdRef,
      sheetIdRef,
      relations,
      newCategoryNameRef,
      newSheetNameRef,
      allAttributes,
      exprAttrRef,
      exprDialogRef,
      showOptions,
      optAttrRef,
      optDialogRef,
      addCell
    }
  }
}
</script>
<style>
.scroll-body {
  overflow-y: auto;
  max-height: 50vh;
}
</style>
