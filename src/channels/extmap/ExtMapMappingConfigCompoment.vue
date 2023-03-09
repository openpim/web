<template>
  <div>
    <v-row>
      <v-col cols="11">
              <v-card class="mb-5 mt-2">
                <v-card-title class="subtitle-2 font-weight-bold" >
                  <div style="width:90%">{{$t('MappingConfigComponent.ImageRelations')}}</div>
                  <v-tooltip bottom v-if="!readonly">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="editRelations"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Edit') }}</span>
                  </v-tooltip>
                </v-card-title>
                <v-divider></v-divider>
                <v-list dense class="pt-0 pb-0">
                  <v-list-item v-for="(item, i) in imgRelations" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
                    <router-link :to="'/config/relations/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
                  </v-list-item-content></v-list-item>
                </v-list>
              </v-card>
      </v-col>
    </v-row>
    <v-row v-if="variants">
      <v-col cols="11">
        <v-checkbox v-model="channel.config.variantsSupport" :label="$t('MappingConfigComponent.VariantsSupport')" required></v-checkbox>
        <v-text-field v-if= "channel.config.variantsSupport" v-model="channel.config.variantExpr" dense class="ml-5" :label="$t('MappingConfigComponent.VariantsExpr')" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="11">
        <v-autocomplete v-model="categoryIdRef" @change="categoryChanged" :items="mappedCategories.filter(elem => !elem.deleted)" item-text="name" item-value="id" :label="$t('MappingConfigComponent.Category')" clearable></v-autocomplete>

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
          <v-textarea :rows="1" :readonly="readonly" v-model="categoryRef.categoryExpr" :label="$t('MappingConfigComponent.CategoryExpr')" required/>
          <v-row>
            <v-col cols="6">
              <v-autocomplete @input="lovChanged" :item-text="item => item.name[defaultLanguageIdentifier]" item-value='identifier' v-model="categoryRef.categoryAttr" :items="lovAttributes" :readonly="readonly" :label="$t('MappingConfigComponent.AttributeForCategory')" clearable/>
            </v-col>
            <v-col cols="6">
              <v-autocomplete :item-text="item => item.value[defaultLanguageIdentifier]" item-value='id' v-model="categoryRef.categoryAttrValue" :items="categoryLovValues" :readonly="readonly" :label="$t('MappingConfigComponent.CategoryAttributeValue')" clearable/>
            </v-col>
          </v-row>

          <MappingAttributesCompoment class="mt-5" v-if="pimAttributesRef && pimAttributesRef.length > 0" :readonly="readonly" :category="categoryRef" :channel="channel" :canManageAttributes="channelFactory.canManageAttributes && canEditConfig('attributes')" :attributes="categoryRef.attributes" :pimAttributes="pimAttributesRef" :channelAttributes="channelAttributesRef" :canManageOrder="true" />
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
        <v-dialog v-model="attrDialogRef" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">{{$t('MappingConfigComponent.AttributeAdd')}}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="newAttrIdRef" :label="$t('MappingConfigComponent.AttributeId')" required></v-text-field>
                    <v-text-field v-model="newAttrNameRef" :label="$t('MappingConfigComponent.AttributeName')" required></v-text-field>
                    <v-checkbox v-model="newAttrRequiredRef" :label="$t('MappingConfigComponent.AttributeRequired')" required></v-checkbox>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="attrDialogRef = false">{{ $t('Cancel') }}</v-btn>
              <v-btn color="blue darken-1" text :disabled="!newAttrIdRef || !newAttrNameRef" @click="addAttributeFinish">{{ $t('Save') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
    <RelationsSelectionDialog ref="relSelectionDialogRef" :multiselect="true" @selected="relationsSelected"/>
    <ChannelsCategorySelectionDialog ref="relCategoryDialogRef" :channelType="channel.type" @selected="categoryToCopySelected"/>
  </div>
</template>
<script>
import { ref, onMounted, computed } from 'vue'
import * as attrStore from '../../store/attributes'
import * as langStore from '../../store/languages'
import * as relStore from '../../store/relations'
import * as lovsStore from '../../store/lovs'
import * as userStore from '../../store/users'
import ValidVisibleComponent from '../../components/ValidVisibleComponent'
import RelationsSelectionDialog from '../../components/RelationsSelectionDialog'
import MappingAttributesCompoment from '../MappingAttributesCompoment'
import ChannelsCategorySelectionDialog from '../../components/ChannelsCategorySelectionDialog.vue'

import i18n from '../../i18n'
import getChannelFactory from '../../channels'

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
  components: { ValidVisibleComponent, RelationsSelectionDialog, MappingAttributesCompoment, ChannelsCategorySelectionDialog },
  setup (props, { root }) {
    const { canEditConfig } = userStore.useStore()

    const {
      lovs,
      loadAllLOVs
    } = lovsStore.useStore()

    const {
      languages,
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadAllAttributes,
      getAllItemsAttributes,
      groups
    } = attrStore.useStore()

    const {
      relations,
      loadAllRelations
    } = relStore.useStore()

    const mappedCategories = computed(() => {
      if (props.channel && props.channel.mappings) {
        return Object.values(props.channel.mappings)
      } else {
        return []
      }
    })

    const availableCategories = computed(() => {
      return categoriesRef.value.filter(elem => !mappedCategories.value.find(cat => elem.id === cat.id))
    })

    const dialogRef = ref(null)
    const categoriesRef = ref([])
    const categoriesTreeRef = ref(null)
    const treeSearchRef = ref('')
    const treeActiveRef = ref([])
    const categoryIdRef = ref(null)
    const newCategoryNameRef = ref(null)
    const categoryRef = ref(null)
    const channelAttributesRef = ref([])
    const pimAttributesRef = ref([])
    const exprDialogRef = ref(null)
    const exprAttrRef = ref(null)
    const relSelectionDialogRef = ref(null)
    const relationsLoadedRef = ref(false)
    const relCategoryDialogRef = ref(null)

    const attrDialogRef = ref(null)
    const newAttrIdRef = ref('')
    const newAttrNameRef = ref('')
    const newAttrRequiredRef = ref('')

    function add () {
      newCategoryNameRef.value = null
      dialogRef.value = true
    }

    function addCategory () {
      dialogRef.value = false
      channelAttributesRef.value = []
      const id = 'cat' + Date.now()
      categoryRef.value = {
        id,
        name: newCategoryNameRef.value,
        valid: props.channel.valid || [],
        visible: [],
        type: 'simple',
        attributes: [],
        params: [],
        categoryAttributes: []
      }
      root.$set(props.channel.mappings, id, categoryRef.value)
      categoryIdRef.value = id
    }

    function remove () {
      if (confirm(i18n.t('MappingConfigComponent.Remove.Confirm'))) {
        props.channel.mappings[categoryIdRef.value] = { deleted: true }
        categoryIdRef.value = null
      }
    }

    function categoryChanged () {
      categoryRef.value = mappedCategories.value.find(elem => elem.id === categoryIdRef.value)
      if (categoryRef.value?.categoryAttr) lovChanged(categoryRef.value.categoryAttr)
      loadAttributes()
    }

    function loadAttributes () {
      if (!props.channel.type) return

      channelAttributesRef.value = categoryRef.value.categoryAttributes
    }

    const imgRelations = computed(() => {
      if (relationsLoadedRef.value && props.channel && props.channel.config.imgRelations) {
        return props.channel.config.imgRelations.map(id => relations.find(rel => rel.id === id))
      } else {
        return []
      }
    })

    function editRelations () {
      relSelectionDialogRef.value.showDialog('', props.channel.config.imgRelations)
    }

    function relationsSelected (arr) {
      relSelectionDialogRef.value.closeDialog()
      props.channel.config.imgRelations = arr
    }

    const categoryLovValues = ref([])
    const lovAttributes = ref([])
    function lovChanged (val) {
      if (!val) {
        categoryLovValues.value = []
      } else {
        const lovId = '' + lovAttributes.value.find(attr => attr.identifier === val).lov
        const lov = lovs.find(lov => lov.id === lovId)
        categoryLovValues.value = lov.values
      }
    }

    function categoryToCopySelected (mapping) {
      relCategoryDialogRef.value.closeDialog()
      if (confirm(i18n.t('MappingConfigComponent.CopyMappingConfirmation'))) {
        for (let i = 0; i < categoryRef.value.attributes.length; i++) {
          const attr = categoryRef.value.attributes[i]
          const tst = mapping.attributes.find(elem => elem.id === attr.id)
          if (tst) {
            attr.attrIdent = tst.attrIdent
            attr.expr = tst.expr
          }
        }
      }
    }

    function addAttribute () {
      newAttrIdRef.value = ''
      newAttrNameRef.value = ''
      newAttrRequiredRef.value = false
      attrDialogRef.value = true
    }

    function addAttributeFinish () {
      attrDialogRef.value = false
      const attr = { id: newAttrIdRef.value, name: newAttrNameRef.value, required: newAttrRequiredRef.value, dictionary: false, description: 'id: ' + newAttrIdRef.value }

      channelAttributesRef.value.push(attr)
      categoryRef.value.attributes.push({ id: newAttrIdRef.value, expr: '', attrIdent: '', description: 'id: ' + newAttrIdRef.value })
      categoryRef.value.categoryAttributes = channelAttributesRef.value
    }

    onMounted(() => {
      loadAllLOVs()
      loadAllRelations().then(() => { relationsLoadedRef.value = true })
      loadAllAttributes().then(() => {
        const lovArr = []
        for (let i = 0; i < groups.length; i++) {
          const group = groups[i]
          for (let j = 0; j < group.attributes.length; j++) {
            const attr = group.attributes[j]
            if (attr.lov) {
              lovArr.push(attr)
            }
          }
        }
        lovAttributes.value = lovArr

        const arr = [{ value: '$id', text: i18n.t('MappingConfigComponent.Id') }, { value: '$parentId', text: i18n.t('MappingConfigComponent.ParentId') }]
        for (let i = 0; i < languages.length; i++) {
          const lang = languages[i]
          const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
          arr.push({ value: '$name#' + lang.identifier, text: i18n.t('MappingConfigComponent.Name') + langText })
        }

        const attrs = getAllItemsAttributes()
        for (let i = 0; i < attrs.length; i++) {
          const attr = attrs[i]
          const nameText = (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']')
          if (attr.languageDependent) {
            for (let i = 0; i < languages.length; i++) {
              const lang = languages[i]
              const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
              const val = attr.identifier + '#' + lang.identifier
              arr.push({ value: val, text: nameText + langText })
            }
          } else {
            const val = attr.identifier
            arr.push({ value: val, text: nameText })
          }
        }

        pimAttributesRef.value = arr
      })
    })

    return {
      canEditConfig,
      mappedCategories,
      categoriesTreeRef,
      treeSearchRef,
      treeActiveRef,
      availableCategories,
      categoryRef,
      categoryIdRef,
      dialogRef,
      addCategory,
      categoryChanged,
      pimAttributesRef,
      channelAttributesRef,
      exprDialogRef,
      exprAttrRef,
      imgRelations,
      relSelectionDialogRef,
      relationsSelected,
      editRelations,
      currentLanguage,
      defaultLanguageIdentifier,
      lovAttributes,
      lovChanged,
      categoryLovValues,
      add,
      remove,
      relCategoryDialogRef,
      categoryToCopySelected,
      newCategoryNameRef,
      addAttribute,
      addAttributeFinish,
      attrDialogRef,
      newAttrIdRef,
      newAttrNameRef,
      newAttrRequiredRef,
      relations,
      channelFactory: getChannelFactory(props.channel.type)
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
