<template>
  <div>
    <v-row>
      <v-col cols="11" class="pb-0">
        <v-checkbox v-model="channel.config.variantsSupport" label="Поддержка вариантов" required></v-checkbox>
        <v-text-field v-if= "channel.config.variantsSupport" v-model="channel.config.variantExpr" dense class="ml-5" label="Выражение для определения вариант или нет" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="11">
        <v-select v-model="categoryIdRef" @change="categoryChanged" :items="mappedCategories" item-text="name" item-value="id" :label="$t('MappingConfigComponent.Category')"></v-select>

        <div v-if="categoryIdRef">
          <ValidVisibleComponent v-if="categoryIdRef !== '$default'" :elem="categoryRef" :canEditConfig="!readonly"/>

          <v-select v-model="categoryRef.type" v-if="categoryRef" :items="offerTypes" label="Тип предложения"></v-select>

          <MappingAttributesCompoment v-if="pimAttributesRef && pimAttributesRef.length > 0" :readonly="readonly" :attributes="categoryRef.attributes" :pimAttributes="pimAttributesRef" :channelAttributes="categoryAttributesRef" />
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
            <v-btn icon :disabled="!categoryIdRef || categoryIdRef === '$default'" v-on="on" @click="remove"><v-icon>mdi-minus</v-icon></v-btn>
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
              <span class="headline">Создание новой категории</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="newCategoryNameRef" label="Название категории" required></v-text-field>
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
  </div>
</template>
<script>
import { ref, onMounted, computed, watch } from '@vue/composition-api'
import * as attrStore from '../../store/attributes'
import * as langStore from '../../store/languages'
import ValidVisibleComponent from '../../components/ValidVisibleComponent'
import MappingAttributesCompoment from '../MappingAttributesCompoment'

import i18n from '../../i18n'

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
  components: { ValidVisibleComponent, MappingAttributesCompoment },
  setup (props, { root }) {
    const {
      languages,
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

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

    const dialogRef = ref(null)
    const categoryIdRef = ref('$default')
    const newCategoryNameRef = ref(null)
    const categoryRef = ref(null)
    const pimAttributesRef = ref([])
    const exprDialogRef = ref(null)
    const exprAttrRef = ref(null)
    const categoryAttributesRef = ref([])

    watch(() => props.channel, (chan) => {
      if (chan && !chan.mappings.$default) {
        categoryRef.value = { id: '$default', name: 'По умолчанию', type: 'simple', attributes: [] }
        root.$set(chan.mappings, '$default', categoryRef.value)
      }
    })

    function add () {
      newCategoryNameRef.value = null
      dialogRef.value = true
    }

    function addCategory () {
      dialogRef.value = false
      const id = 'cat' + Date.now()
      categoryRef.value = { id: id, name: newCategoryNameRef.value, valid: props.channel.valid || [], visible: [], type: 'simple', attributes: [] }
      // loadAttributes()
      root.$set(props.channel.mappings, id, categoryRef.value)
      categoryIdRef.value = id
    }

    function remove () {
      if (confirm(i18n.t('MappingConfigComponent.Remove.Confirm'))) {
        root.$delete(props.channel.mappings, categoryIdRef.value)
        categoryIdRef.value = null
      }
    }

    function categoryChanged () {
      categoryRef.value = mappedCategories.value.find(elem => elem.id === categoryIdRef.value)
      // loadAttributes()
    }

    onMounted(() => {
      loadAllAttributes().then(() => {
        const arr = [{ value: '$parentId', text: 'Внутренний номер родительского объекта' }]
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
    })

    return {
      mappedCategories,
      categoryRef,
      categoryIdRef,
      newCategoryNameRef,
      dialogRef,
      addCategory,
      categoryChanged,
      pimAttributesRef,
      categoryAttributesRef,
      exprDialogRef,
      exprAttrRef,
      currentLanguage,
      defaultLanguageIdentifier,
      add,
      remove,
      offerTypes: [
        { text: 'Упрощенное предложение', value: 'simple' },
        { text: 'Произвольное предложение', value: 'vendor.model' },
        { text: 'Лекарства', value: 'medicine' },
        { text: 'Книги', value: 'books' },
        { text: 'Аудиокниги', value: 'audiobooks' },
        { text: 'Музыкальная и видеопродукция', value: 'artist.title' },
        { text: 'Билеты на мероприятия', value: 'event-ticket' },
        { text: 'Туры', value: 'tour' },
        { text: 'Алкоголь', value: 'alco' }
      ]
    }
  }
}
</script>
