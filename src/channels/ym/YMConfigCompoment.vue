<template>
  <div>
    <v-tabs v-model="tabRef">
      <v-tab>Заголовок</v-tab>
      <v-tab>Категории</v-tab>
      <v-tab>Продукты</v-tab>
      <v-tab>Файл</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tabRef">
      <v-tab-item>
          <MappingAttributesCompoment class="mt-5" v-if="pimAttributesRef && pimAttributesRef.length > 0"  :readonly="readonly"  :channel="channel" :canManageAttributes="false" :attributes="channel.config.ymShopAttributes" :pimAttributes="pimAttributesRef" :channelAttributes="ymShopAttributes" />
      </v-tab-item>
      <v-tab-item>
        <v-card class="mb-5 mt-5">
          <v-card-title class="subtitle-2 font-weight-bold" >
            <div style="width:90%">Типы для категории</div>
            <v-tooltip bottom v-if="!readonly">
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on" @click="editTypes"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
              </template>
              <span>{{ $t('Edit') }}</span>
            </v-tooltip>
          </v-card-title>
          <v-divider></v-divider>
          <v-list dense class="pt-0 pb-0">
            <v-list-item v-for="(item, i) in categoryTypes" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
              <router-link :to="'/config/types/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
            </v-list-item-content></v-list-item>
          </v-list>
        </v-card>

        <div class="d-inline-flex align-center">
          <span class="ml-1 mr-3">Начиная с:</span>
          <div v-if="categoryFromRef">
            <router-link :to="'/item/' + categoryFromRef.identifier">{{ categoryFromRef.identifier }}</router-link><span class="ml-2">- {{ categoryFromRef.name[currentLanguage.identifier] || '[' + categoryFromRef.name[defaultLanguageIdentifier] + ']' }}</span>
          </div>
          <v-btn color="blue darken-1" v-if="!readonly" text @click="itemSelectionDialogRef.showDialog()">Выбрать</v-btn>
        </div>

        <MappingAttributesCompoment class="mt-5" v-if="pimAttributesRef && pimAttributesRef.length > 0"  :readonly="readonly"  :channel="channel" :canManageAttributes="false" :attributes="channel.config.ymCategoryAttributes" :pimAttributes="pimAttributesRef" :channelAttributes="ymCategoryAttributes" />

      </v-tab-item>
      <v-tab-item>
        <YMMappingConfigCompoment v-if="channel" :channel="channel" :readonly=readonly ></YMMappingConfigCompoment>
      </v-tab-item>
      <v-tab-item>
        <div class="ml-5">
        <v-text-field v-if="channel" v-model="channel.config.file" :readonly="readonly" label="Имя генерируемого файла" required></v-text-field>
        <v-text-field v-if="channel" v-model="channel.config.mime" :readonly="readonly" label="Mime тип генерируемого файла" required></v-text-field>
        <v-text-field v-if="channel" v-model="channel.config.extCmd" :readonly="readonly" label="Запустить эту программу после генерации файла (если надо). Файл будет передан как {file} параметр." required></v-text-field>
        </div>
      </v-tab-item>
    </v-tabs-items>
    <TypeSelectionDialog ref="typeSelectionDialogRef" :multiselect="true" @selected="typesSelected"/>
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemSelected"/>
  </div>
</template>
<script>
import { watch, ref, onMounted, computed } from '@vue/composition-api'
import * as attrStore from '../../store/attributes'
import * as langStore from '../../store/languages'
import * as typesStore from '../../store/types'
import * as itemStore from '../../store/item'
import MappingAttributesCompoment from '../MappingAttributesCompoment'
import TypeSelectionDialog from '../../components/TypeSelectionDialog'
import ItemsSelectionDialog from '../../components/ItemsSelectionDialog'
import YMMappingConfigCompoment from './YMMappingConfigCompoment'

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
  components: { MappingAttributesCompoment, TypeSelectionDialog, ItemsSelectionDialog, YMMappingConfigCompoment },
  setup (props, { root }) {
    const {
      loadAllAttributes,
      getAllItemsAttributes
    } = attrStore.useStore()

    const {
      languages,
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      findType,
      loadAllTypes
    } = typesStore.useStore()

    const {
      loadItemsByIds
    } = itemStore.useStore()

    const tabRef = ref(null)
    const pimAttributesRef = ref([])
    const typesLoadedRef = ref(false)
    const typeSelectionDialogRef = ref(null)
    const itemSelectionDialogRef = ref(null)
    const categoryFromRef = ref(null)

    const ymShopAttributes = [
      { id: 'name', name: 'name', required: true, description: 'Короткое название магазина. В названии нельзя использовать слова, которые не относятся к наименованию магазина (например «лучший», «дешевый»), указывать номер телефона и т. п. Название магазина должно совпадать с фактическим названием, которое публикуется на сайте. Если требование не соблюдается, Яндекс.Маркет может самостоятельно изменить название без уведомления магазина.' },
      { id: 'company', name: 'company', required: true, description: 'Полное наименование компании, владеющей магазином. Не публикуется.' },
      { id: 'url', name: 'url', required: true, description: 'URL главной страницы магазина. Максимальная длина ссылки — 2048 символов.' },
      { id: 'currency1', name: 'Валюта 1', required: true, description: 'Валюта для цены (можно задать до 3 валют). Формат: "RUR,1" - "<код валюты>,<курс обмена>".' },
      { id: 'currency2', name: 'Валюта 2', required: false, description: 'Валюта для цены (можно задать до 3 валют). Формат: "RUR,1" - "<код валюты>,<курс обмена>".' },
      { id: 'currency3', name: 'Валюта 3', required: false, description: 'Валюта для цены (можно задать до 3 валют). Формат: "RUR,1" - "<код валюты>,<курс обмена>".' },
      { id: 'platform', name: 'platform', required: false, description: 'Система управления контентом, на основе которой работает магазин (CMS).' },
      { id: 'version', name: 'version', required: false, description: 'Версия CMS.' },
      { id: 'agency', name: 'agency', required: false, description: 'Наименование агентства, которое оказывает техническую поддержку магазину и отвечает за работоспособность сайта.' },
      { id: 'email', name: 'email', required: false, description: 'Контактный адрес разработчиков CMS или агентства, осуществляющего техподдержку.' },
      { id: 'delivery', name: 'delivery', required: false, description: 'Возможность курьерской доставки (по всем регионам, в которые доставляет магазин). true — курьерская доставка есть, значение по умолчанию; false — курьерской доставки нет.' },
      { id: 'delivery-option1', name: 'delivery-option 1', required: false, description: 'Условия доставки (можно задать до 3 значений). Формат: "300,4,18" - "<стоимость доставки>,< срок доставки в рабочих днях>,<время, до которого нужно сделать заказ, чтобы получить его в этот срок - необязательный параметр>".' },
      { id: 'delivery-option2', name: 'delivery-option 2', required: false, description: 'Условия доставки (можно задать до 3 значений). Формат: "300,4,18" - "<стоимость доставки>,< срок доставки в рабочих днях>,<время, до которого нужно сделать заказ, чтобы получить его в этот срок - необязательный параметр>".' },
      { id: 'delivery-option3', name: 'delivery-option 3', required: false, description: 'Условия доставки (можно задать до 3 значений). Формат: "300,4,18" - "<стоимость доставки>,< срок доставки в рабочих днях>,<время, до которого нужно сделать заказ, чтобы получить его в этот срок - необязательный параметр>".' },
      { id: 'enable_auto_discounts', name: 'enable_auto_discounts', required: false, description: 'Автоматический расчет и показ скидок для всего прайс-листа. true/false' },
      { id: 'store', name: 'store', required: false, description: 'Возможность купить товар без предварительного заказа. true — товары можно купить без предварительного заказа; false — товары нельзя купить без предварительного заказа' },
      { id: 'adult', name: 'adult', required: false, description: 'Товары имеют отношение к удовлетворению сексуальных потребностей либо иным образом эксплуатируют интерес к сексу. true/false' }
    ]

    const ymCategoryAttributes = [
      { id: 'id', name: 'id', required: true, description: 'id категории.' },
      { id: 'name', name: 'Название', required: true, description: 'Название категории.' }
    ]

    watch(() => props.channel, (chan, previousValue) => {
      if (chan && !chan.config.ymShopAttributes) {
        root.$set(chan.config, 'ymShopAttributes', ymShopAttributes.map(elem => { return { id: elem.id, expr: (elem.id === 'currency1' ? '"RUR,1"' : ''), attrIdent: '' } }))
      }

      if (chan && !chan.config.file) {
        root.$set(chan.config, 'file', '')
      }
      if (chan && !chan.config.mime) {
        root.$set(chan.config, 'mime', 'text/xml')
      }
      if (chan && !chan.config.extCmd) {
        root.$set(chan.config, 'extCmd', '')
      }
      if (chan && !chan.config.ymCategoryTypes) {
        root.$set(chan.config, 'ymCategoryTypes', [])
      }
      if (chan && !chan.config.ymCategoryFrom) {
        root.$set(chan.config, 'ymCategoryFrom', null)
      } else {
        itemSelected(chan.config.ymCategoryFrom)
      }
      if (chan && !chan.config.ymCategoryAttributes) {
        root.$set(chan.config, 'ymCategoryAttributes', ymCategoryAttributes.map(elem => { return { id: elem.id, expr: '', attrIdent: '' } }))
      }
    })

    const categoryTypes = computed(() => {
      if (typesLoadedRef.value && props.channel.config.ymCategoryTypes) {
        return props.channel.config.ymCategoryTypes.map((id) => findType(id).node)
      } else {
        return []
      }
    })

    function editTypes () {
      typeSelectionDialogRef.value.showDialog('', props.channel.config.ymCategoryTypes)
    }

    function typesSelected (arr) {
      typeSelectionDialogRef.value.closeDialog()
      props.channel.config.ymCategoryTypes = arr
    }

    function itemSelected (id) {
      if (itemSelectionDialogRef.value) itemSelectionDialogRef.value.closeDialog()
      props.channel.config.ymCategoryFrom = id
      loadItemsByIds([id], false).then(items => {
        categoryFromRef.value = items[0]
      })
    }

    onMounted(() => {
      loadAllTypes().then(() => { typesLoadedRef.value = true })
      loadAllAttributes().then(() => {
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
    })

    return {
      tabRef,
      ymShopAttributes,
      pimAttributesRef,
      categoryTypes,
      typeSelectionDialogRef,
      editTypes,
      typesSelected,
      categoryFromRef,
      itemSelectionDialogRef,
      itemSelected,
      ymCategoryAttributes,
      currentLanguage,
      defaultLanguageIdentifier
    }
  }
}
</script>
