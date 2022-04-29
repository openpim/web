<template>
  <div>
    <v-row>
      <v-col cols="11">
              <v-card class="mb-5 mt-2">
                <v-card-title class="subtitle-2 font-weight-bold" >
                  <div style="width:90%">Зависимости для изображений</div>
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
        <v-checkbox v-model="channel.config.variantsSupport" label="Поддержка вариантов" required></v-checkbox>
        <v-text-field v-if= "channel.config.variantsSupport" v-model="channel.config.variantExpr" dense class="ml-5" label="Выражение для определения вариант или нет" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="11">
        <v-autocomplete v-model="categoryIdRef" @change="categoryChanged" :items="mappedCategories.filter(elem => !elem.deleted)" item-text="name" item-value="id" :label="$t('MappingConfigComponent.Category')" clearable></v-autocomplete>

        <div v-if="categoryIdRef">
          <v-row>
            <v-col cols="11">
              <ValidVisibleComponent :elem="categoryRef" :canEditConfig="!readonly"/>
            </v-col>
            <v-col cols="1">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on" @click="relCategoryDialogRef.showDialog()"><v-icon>mdi-content-copy</v-icon></v-btn>
                </template>
                <span>Скопировать настройки из другой категории</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-textarea :rows="1" :readonly="readonly" v-model="categoryRef.categoryExpr" label="Выражение для определения категории" required/>
          <v-row>
            <v-col cols="6">
              <v-autocomplete @input="lovChanged" item-text="name.ru" item-value='identifier' v-model="categoryRef.categoryAttr" :items="lovAttributes" :readonly="readonly" label="Атрибут где находится категория маркетплейса" clearable/>
            </v-col>
            <v-col cols="6">
              <v-autocomplete item-text="value.ru" item-value='id' v-model="categoryRef.categoryAttrValue" :items="categoryLovValues" :readonly="readonly" label="Значение атрибута" clearable/>
            </v-col>
          </v-row>

          <MappingAttributesCompoment class="mt-5" v-if="pimAttributesRef && pimAttributesRef.length > 0" :readonly="readonly" :channel="channel" :canManageAttributes="channelFactory.canManageAttributes && canEditConfig('attributes')" :attributes="categoryRef.attributes" :pimAttributes="pimAttributesRef" :channelAttributes="channelAttributesRef" />
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
        <v-dialog v-model="dialogRef" persistent width="90%">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('MappingConfigComponent.Add.Title') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <template v-if="categoriesTreeRef">
                      <v-text-field v-model="treeSearchRef" label="Поиск" flat hide-details clearable clear-icon="mdi-close-circle-outline"></v-text-field>
                      <v-treeview class="scroll-body" :search="treeSearchRef" dense hoverable activatable :active.sync="treeActiveRef" :items="categoriesTreeRef.children"></v-treeview>
                    </template>
                    <v-autocomplete v-else dense v-model="newCategoryIdRef" :items="availableCategories" item-text="name" item-value="id" :label="$t('MappingConfigComponent.Add.Category')"></v-autocomplete>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
              <v-btn color="blue darken-1" text @click="addCategory">{{ $t('Select') }}</v-btn>
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
import { ref, onMounted, computed } from '@vue/composition-api'
import * as channelsStore from '../store/channels'
import * as attrStore from '../store/attributes'
import * as langStore from '../store/languages'
import * as relStore from '../store/relations'
import * as lovsStore from '../store/lovs'
import * as errorStore from '../store/error'
import * as userStore from '../store/users'
import ValidVisibleComponent from '../components/ValidVisibleComponent'
import RelationsSelectionDialog from '../components/RelationsSelectionDialog'
import MappingAttributesCompoment from './MappingAttributesCompoment'
import ChannelsCategorySelectionDialog from '../components/ChannelsCategorySelectionDialog.vue'

import i18n from '../i18n'
import getChannelFactory from '../channels'

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
    const {
      showError
    } = errorStore.useStore()

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
      getChannelCategories,
      getChannelAttributes
    } = channelsStore.useStore()

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
    const newCategoryIdRef = ref(null)
    const categoryRef = ref(null)
    const channelAttributesRef = ref([])
    const pimAttributesRef = ref([])
    const exprDialogRef = ref(null)
    const exprAttrRef = ref(null)
    const relSelectionDialogRef = ref(null)
    const relationsLoadedRef = ref(false)
    const relCategoryDialogRef = ref(null)

    function loadCategories () {
      if (props.channel) {
        getChannelCategories(props.channel.internalId)
          .then(data => {
            if (data.tree) {
              categoriesTreeRef.value = data.tree
            } else {
              categoriesRef.value = data.list
            }
          })
          .catch((error) => {
            showError(error.message)
          })
      }
    }

    function add () {
      newCategoryIdRef.value = null
      dialogRef.value = true
    }

    function addCategory () {
      let newCat
      let newName
      if (categoriesTreeRef.value) {
        if (treeActiveRef.value.length === 0) return
        const parents = []
        newCat = findNodeByComparator(treeActiveRef.value[0], categoriesTreeRef.value.children, parents, (id, item) => item.id === id)
        if (newCat.children.length > 0) return
        const fulName = parents.join('\\')
        newName = fulName + '\\' + newCat.name
      } else {
        if (!newCategoryIdRef.value) return
        newCat = categoriesRef.value.find(elem => elem.id === newCategoryIdRef.value)
        newName = newCat.name
      }
      dialogRef.value = false
      categoryRef.value = { id: newCat.id, name: newName, valid: props.channel.valid || [], visible: [], attributes: [] }
      loadAttributes()
      root.$set(props.channel.mappings, newCat.id, categoryRef.value)
      categoryIdRef.value = newCat.id
    }
    function findNodeByComparator (id, children, path, comparator) {
      for (var i = 0; i < children.length; i++) {
        const item = children[i]
        if (comparator(id, item)) {
          return item
        } else if (item.children && item.children.length > 0) {
          const found = findNodeByComparator(id, item.children, path, comparator)
          if (found) {
            if (path) path.unshift(item.name)
            return found
          }
        }
      }
      return null
    }

    function remove () {
      if (confirm(i18n.t('MappingConfigComponent.Remove.Confirm'))) {
        props.channel.mappings[categoryIdRef.value] = { deleted: true }
        // root.$delete(props.channel.mappings, categoryIdRef.value)
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

      getChannelAttributes(props.channel.internalId, categoryRef.value.id).then(arr => {
        channelAttributesRef.value = arr.sort((a, b) => {
          if (a.required && !b.required) return -1
          if (!a.required && b.required) return 1
          return 0
        })

        const stAttributes = getChannelFactory(props.channel.type).getStandardAttributes()
        channelAttributesRef.value = stAttributes.concat(channelAttributesRef.value)

        channelAttributesRef.value.forEach((attr, idx) => {
          if (!categoryRef.value.attributes.find(elem => elem.id === attr.id)) {
            categoryRef.value.attributes.splice(idx, 0, { id: attr.id, attrIdent: '', expr: '' })
          }
        })
        // remove attributes not in channel
        categoryRef.value.attributes = categoryRef.value.attributes.filter(elem => channelAttributesRef.value.find(attr => elem.id === attr.id))
      })
        .catch((error) => {
          showError(error.message)
        })
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
      if (confirm('Все настройки атрибутов будут переписаны. Продолжать?')) {
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

    onMounted(() => {
      loadAllLOVs()
      loadAllRelations().then(() => { relationsLoadedRef.value = true })
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

        const arr = [{ value: '$id', text: 'Внутренний номер объекта' }, { value: '$parentId', text: 'Внутренний номер родительского объекта' }]
        for (let i = 0; i < languages.length; i++) {
          const lang = languages[i]
          const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
          arr.push({ value: '$name#' + lang.identifier, text: 'Наименование объекта' + langText })
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
      loadCategories()
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
      newCategoryIdRef,
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
