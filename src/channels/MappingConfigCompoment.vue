<template>
  <div>
    <v-row>
      <v-col cols="11">
        <v-select v-model="categoryIdRef" @change="categoryChanged" :items="mappedCategories" item-text="name" item-value="id" :label="$t('MappingConfigComponent.Category')"></v-select>

        <div v-if="categoryIdRef">
          <ValidVisibleComponent :elem="categoryRef" :canEditConfig="!readonly"/>

          <v-simple-table v-if="attributesLoadedRef" dense class="mb-4">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left" style="width:30%">{{$t('MappingConfigComponent.Table.ChannelAttribute')}}</th>
                    <th class="text-left" style="width:30%">{{$t('MappingConfigComponent.Table.Attribute')}}</th>
                    <th class="text-left">{{$t('MappingConfigComponent.Table.Expression')}}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(elem, i) in categoryRef.attributes" :key="i" :set="attr = getAttribute(elem.id)">
                    <td class="pa-1">
                      <span :class="attr.required ? 'font-weight-bold' : ''">{{ attr.name }}</span>
                      <v-tooltip bottom v-if="attr.dictionaryLink">
                        <template v-slot:activator="{ on }">
                          <v-btn icon v-on="on" @click="openWindow(i)"><v-icon>mdi-arrow-top-right</v-icon></v-btn>
                        </template>
                        <span>{{ $t('MappingConfigComponent.Table.DictionaryLink') }}</span>
                      </v-tooltip>
                    </td>
                    <td class="pa-1">
                      <v-autocomplete dense :readonly="readonly" v-model="categoryRef.attributes[i].attrIdent" :items="pimAttributesRef" clearable></v-autocomplete>
                    </td>
                    <td class="pa-1">
                      <v-text-field v-model="categoryRef.attributes[i].expr" dense :readonly="readonly" class="ml-3 mr-3" append-outer-icon="mdi-message-outline" @click:append-outer="showExpression(categoryRef.attributes[i])" />
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
              <span class="headline">{{ $t('MappingConfigComponent.Add.Title') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-autocomplete dense v-model="newCategoryIdRef" :items="availableCategories" item-text="name" item-value="id" :label="$t('MappingConfigComponent.Add.Category')"></v-autocomplete>
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
  </div>
</template>
<script>
import { ref, onMounted, computed } from '@vue/composition-api'
import * as channelsStore from '../store/channels'
import * as attrStore from '../store/attributes'
import * as langStore from '../store/languages'
import ValidVisibleComponent from '../components/ValidVisibleComponent'
import i18n from '../i18n'

export default {
  props: {
    channel: {
      required: true
    },
    readonly: {
      type: Boolean,
      required: true
    }
  },
  components: { ValidVisibleComponent },
  setup (props, { root }) {
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
      getAllItemsAttributes
    } = attrStore.useStore()

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
    const categoryIdRef = ref(null)
    const newCategoryIdRef = ref(null)
    const categoryRef = ref(null)
    const attributesLoadedRef = ref(false)
    let channelAttributes = []
    const pimAttributesRef = ref([])
    const exprDialogRef = ref(null)
    const exprAttrRef = ref(null)

    function loadCategories () {
      if (props.channel) {
        getChannelCategories(props.channel.internalId).then(data => { categoriesRef.value = data })
      }
    }

    function add () {
      newCategoryIdRef.value = null
      dialogRef.value = true
    }

    function addCategory () {
      dialogRef.value = false
      const newCat = categoriesRef.value.find(elem => elem.id === newCategoryIdRef.value)
      categoryRef.value = { id: newCat.id, name: newCat.name, valid: props.channel.valid || [], visible: [], attributes: [] }
      loadAttributes()
      root.$set(props.channel.mappings, newCat.id, categoryRef.value)
      categoryIdRef.value = newCat.id
    }

    function remove () {
      if (confirm(i18n.t('MappingConfigComponent.Remove.Confirm'))) {
        root.$delete(props.channel.mappings, categoryIdRef.value)
        categoryIdRef.value = null
      }
    }

    function categoryChanged () {
      categoryRef.value = mappedCategories.value.find(elem => elem.id === categoryIdRef.value)
      loadAttributes()
    }

    function loadAttributes () {
      attributesLoadedRef.value = false
      getChannelAttributes(props.channel.internalId, categoryRef.value.id).then(arr => {
        channelAttributes = arr.sort((a, b) => {
          if (a.required && !b.required) return -1
          if (!a.required && b.required) return 1
          return 0
        })
        channelAttributes.forEach(attr => {
          if (!categoryRef.value.attributes.find(elem => elem.id === attr.id)) {
            categoryRef.value.attributes.push({ id: attr.id, attrIdent: '', expr: '' })
          }
        })
        attributesLoadedRef.value = true
        // remove attributes not in channel
        categoryRef.value.attributes = categoryRef.value.attributes.filter(elem => channelAttributes.find(attr => elem.id === attr.id))
      })
    }

    function getAttribute (id) {
      return channelAttributes.find(elem => elem.id === id)
    }

    function openWindow (i) {
      window.open(channelAttributes[i].dictionaryLink, '_blank').focus()
    }

    function showExpression (attr) {
      exprAttrRef.value = attr
      exprDialogRef.value = true
    }

    onMounted(() => {
      loadAllAttributes().then(() => {
        const arr = []
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
      mappedCategories,
      availableCategories,
      categoryRef,
      categoryIdRef,
      newCategoryIdRef,
      dialogRef,
      addCategory,
      categoryChanged,
      getAttribute,
      attributesLoadedRef,
      openWindow,
      pimAttributesRef,
      showExpression,
      exprDialogRef,
      exprAttrRef,
      add,
      remove
    }
  }
}
</script>
