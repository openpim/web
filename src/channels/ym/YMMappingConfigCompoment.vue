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
          <ValidVisibleComponent v-if="categoryIdRef !== '_default'" :elem="categoryRef" :canEditConfig="!readonly"/>

          <v-select v-model="categoryRef.type" v-if="categoryRef" :items="offerTypes" label="Тип предложения" @change="refreshAttributes()"></v-select>

          <MappingAttributesCompoment v-if="categoryRef && pimAttributesRef && pimAttributesRef.length > 0" :readonly="readonly" :attributes="categoryRef.attributes" :pimAttributes="pimAttributesRef" :channelAttributes="categoryAttributes" />

          <div class="mt-2">Дополнительные параметры</div>
          <v-simple-table dense class="mb-4" v-if="categoryRef">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">Наименование</th>
                    <th class="text-left">Атрибут</th>
                    <th class="text-left">Выражение</th>
                    <th class="text-left">
                      <v-tooltip top>
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" class="pa-0" icon color="primary" @click="addValue"><v-icon dark>mdi-plus</v-icon></v-btn>
                        </template>
                        <span>{{ $t('Add') }}</span>
                      </v-tooltip>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(elem, j) in categoryRef.params" :key="j">
                    <td class="pa-1">
                      <input v-model="elem.id" :placeholder="наименование">
                    </td>
                    <td class="pa-1">
                      <v-autocomplete dense :readonly="readonly" v-model="elem.attrIdent" :items="pimAttributesRef" clearable></v-autocomplete>
                    </td>
                    <td class="pa-1" colspan="2">
                      <textarea rows="1"  cols="50" v-model="elem.expr"/>
                      <v-btn class="pa-0" icon color="primary" @click="removeValue(j)"><v-icon dark>mdi-close-circle-outline</v-icon></v-btn>
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
            <v-btn icon :disabled="!categoryIdRef || categoryIdRef === '_default'" v-on="on" @click="remove"><v-icon>mdi-minus</v-icon></v-btn>
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
    const categoryIdRef = ref('_default')
    const newCategoryNameRef = ref(null)
    const categoryRef = ref(null)
    const pimAttributesRef = ref([])
    const exprDialogRef = ref(null)
    const exprAttrRef = ref(null)

    watch(() => props.channel, (chan) => {
      if (chan && !chan.mappings._default) {
        categoryRef.value = { id: '_default', name: 'По умолчанию', type: 'simple', attributes: [], params: [] }
        root.$set(chan.mappings, '_default', categoryRef.value)
      } else {
        categoryRef.value = chan.mappings._default
      }
    })

    const ymSimpleAttributes = [
      { id: 'name', name: 'name', required: true, description: 'Полное название предложения, в которое входит: тип товара, производитель, модель и название товара, важные характеристики. Составляйте по схеме: что (тип товара) + кто (производитель) + товар (модель, название) + важные характеристики.' }
    ]

    const ymVendorModelAttributes = [
      { id: 'model', name: 'model', required: true, description: 'Модель и название товара.' },
      { id: 'vendor', name: 'vendor', required: true, description: 'Название производителя.' },
      { id: 'typePrefix', name: 'typePrefix', required: false, description: 'Тип / категория товара (например, «мобильный телефон», «стиральная машина», «угловой диван»).' }
    ]

    const ymMedicineAttributes = [
      { id: 'name', name: 'name', required: true, description: 'Полное название предложения, в которое входит: тип товара, производитель, модель и название товара, важные характеристики. Составляйте по схеме: что (тип товара) + кто (производитель) + товар (модель, название) + важные характеристики.' },
      { id: 'delivery', name: 'delivery', required: true, description: 'Возможность курьерской доставки (по всем регионам, в которые доставляет магазин). true/false' },
      { id: 'pickup', name: 'pickup', required: true, description: 'Возможность самовывоза из пунктов выдачи (во всех регионах, в которые доставляет магазин). true/false.' }
    ]

    const ymBookAttributes = [
      { id: 'name', name: 'name', required: true, description: 'Полное название предложения.' },
      { id: 'publisher', name: 'publisher', required: true, description: 'Издательство.' },
      { id: 'ISBN', name: 'ISBN', required: true, description: 'Обязателен для попадания на карточку книжного издания.' },
      { id: 'author', name: 'name', required: false, description: 'Автор произведения.' },
      { id: 'series', name: 'name', required: false, description: 'Серия.' },
      { id: 'year', name: 'year', required: false, description: 'Год издания.' },
      { id: 'volume', name: 'volume', required: false, description: 'Общее количество томов, если издание состоит из нескольких томов.' },
      { id: 'part', name: 'part', required: false, description: 'Укажите номер тома, если издание состоит из нескольких томов.' },
      { id: 'language', name: 'language', required: false, description: 'Язык, на котором издано произведение.' },
      { id: 'table_of_contents', name: 'table_of_contents', required: false, description: 'Оглавление.' },
      { id: 'binding', name: 'binding', required: false, description: 'Формат.' },
      { id: 'page_extent', name: 'page_extent', required: false, description: 'Количество страниц в книге, должно быть целым положительным числом.' },
      { id: 'age', name: 'age', required: true, description: 'Возрастная категория товара. Годы задаются с помощью атрибута unit со значением year. Допустимые значения параметра age при unit="year": 0, 6, 12, 16, 18. Месяцы задаются с помощью атрибута unit со значением month. Допустимые значения параметра age при unit="month": 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12.' }
    ]

    const ymStandardAttributes = [
      { id: 'id', name: 'id', required: true, description: 'Идентификатор предложения. Может состоять только из цифр и латинских букв. Максимальная длина — 20 символов. Должен быть уникальным для каждого предложения.' },
      { id: 'vendor', name: 'vendor', required: false, description: 'Название производителя.' },
      { id: 'vendorCode', name: 'vendorCode', required: false, description: 'Код товара, который ему присвоил производитель.' },
      { id: 'bid', name: 'bid', required: false, description: 'Размер ставки. Указывайте размер ставки в условных центах: например, значение 80 соответствует ставке 0,8 у. е. Значения должны быть целыми и положительными числами.' },
      { id: 'url', name: 'url', required: true, description: 'URL страницы товара на сайте магазина. Максимальная длина ссылки — 2048 символов.' },
      { id: 'price', name: 'price', required: true, description: 'Актуальная цена товара. Формат: целое или дробное число. Разделитель целой и дробной части — точка.' },
      { id: 'oldprice', name: 'oldprice', required: false, description: 'Старая цена товара, должна быть выше текущей. Маркет автоматически рассчитывает разницу и показывает пользователям скидку.' },
      { id: 'purchase_price', name: 'purchase_price', required: false, description: 'Закупочная цена товара. Она нужна для расчета наценки и настройки стратегии по маржинальности в PriceLabs.' },
      { id: 'enable_auto_discounts', name: 'enable_auto_discounts', required: false, description: 'Автоматический расчет и показ скидок для предложения.' },
      { id: 'currencyId', name: 'currencyId', required: true, description: 'Валюта, в которой указана цена товара: RUR, USD, EUR, UAH, KZT, BYN. Цена и валюта должны соответствовать друг другу.' },
      { id: 'categoryId', name: 'categoryId', required: true, description: 'Идентификатор категории товара, присвоенный магазином (целое число, не более 18 знаков).' },
      { id: 'picture', name: 'picture', required: false, description: 'URL-ссылка на картинку товара. Обязательно для части категорий.' },
      { id: 'supplier', name: 'supplier', required: false, description: 'ОГРН или ОГРНИП стороннего продавца. ОГРН должен содержать 13 символов, ОГРНИП — 15.' },
      { id: 'delivery', name: 'delivery', required: false, description: 'Возможность курьерской доставки (по всем регионам, в которые доставляет магазин). true/false' },
      { id: 'pickup', name: 'pickup', required: false, description: 'Возможность самовывоза из пунктов выдачи (во всех регионах, в которые доставляет магазин). true/false.' },
      { id: 'store', name: 'store', required: false, description: 'Возможность купить товар без предварительного заказа. true/false.' },
      { id: 'description', name: 'description', required: false, description: 'Описание предложения. Оно отображается: на странице Цены карточки товара — в полном виде; в результатах поиска Маркета — в сокращенном виде (описание длиной не больше 300 символов). Длина текста — не более 3000 символов (включая знаки препинания).' },
      { id: 'sales_notes', name: 'sales_notes', required: false, description: 'Элемент обязателен, если у вас есть ограничения при покупке (например, минимальное количество товаров или необходимость предоплаты). Также можно указать варианты оплаты, акции и распродажи. В этом случае использование элемента необязательно.' },
      { id: 'min-quantity', name: 'min-quantity', required: false, description: 'Минимальное количество одинаковых товаров в заказе (для случаев, когда покупка возможна только комплектом, а не поштучно).' },
      { id: 'manufacturer_warranty', name: 'manufacturer_warranty', required: false, description: 'Официальная гарантия производителя. true/false.' },
      { id: 'country_of_origin', name: 'country_of_origin', required: false, description: 'Страна производства товара.' },
      { id: 'adult', name: 'adult', required: false, description: 'Товар имеет отношение к удовлетворению сексуальных потребностей, либо иным образом эксплуатирует интерес к сексу. Возможные значения — true, false.' },
      { id: 'barcode', name: 'barcode', required: false, description: 'Штрихкод товара от производителя в одном из форматов: EAN-13, EAN-8, UPC-A, UPC-E.' },
      { id: 'condition', name: 'condition', required: false, description: 'Используйте элемент для подержанных товаров и товаров, уцененных из-за недостатков. В атрибуте type укажите состояние товара: likenew — как новый (товар не был в употреблении, уценен из‑за недостатков); used — подержанный (товар был в употреблении)..' },
      { id: 'condition-reason', name: 'condition reason', required: false, description: 'В элементе reason обязательно укажите причину уценки и подробно опишите недостатки. Длина текста не более 3000 символов (включая знаки препинания).' },
      { id: 'credit-template', name: 'credit-template', required: false, description: 'Идентификатор кредитной программы.' },
      { id: 'expiry', name: 'expiry', required: false, description: 'Срок годности или службы.' },
      { id: 'weight', name: 'weight', required: false, description: 'Вес товара в килограммах с учетом упаковки.' },
      { id: 'dimensions', name: 'dimensions', required: false, description: 'Габариты товара (длина, ширина, высота) в упаковке. Размеры укажите в сантиметрах. Формат: три положительных числа с точностью 0.001, разделитель целой и дробной части — точка. Числа должны быть разделены символом «/» без пробелов.' },
      { id: 'downloadable', name: 'downloadable', required: false, description: 'Продукт можно скачать. Если указано true, предложение показывается во всех регионах, при этом способы оплаты для него не отображаются.' },
      { id: 'available', name: 'available', required: false, description: 'С помощью элемента available со значением false можно задать для товара вместо конкретного срока курьерской доставки и самовывоза значение «до 60 дней» (или «предзаказ», если в базе данных Маркета есть дата, когда товар официально начнет продаваться).' },
      { id: 'age', name: 'age', required: false, description: 'Возрастная категория товара. Годы задаются с помощью атрибута unit со значением year. Допустимые значения параметра age при unit="year": 0, 6, 12, 16, 18. Месяцы задаются с помощью атрибута unit со значением month. Допустимые значения параметра age при unit="month": 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12.' },
      { id: 'group_id', name: 'group_id', required: false, description: 'Элемент объединяет все предложения, которые являются вариациями одной модели и должен иметь одинаковое значение. Значение должно быть целым числом, максимум 9 знаков.' }
    ]

    const categoryAttributes = computed(() => {
      if (categoryRef.value) {
        if (categoryRef.value.type === 'simple') {
          return ymSimpleAttributes.concat(ymStandardAttributes.filter(elem => !ymSimpleAttributes.some(elem2 => elem2.id === elem.id)))
        } else if (categoryRef.value.type === 'vendor.model') {
          return ymVendorModelAttributes.concat(ymStandardAttributes.filter(elem => !ymVendorModelAttributes.some(elem2 => elem2.id === elem.id)))
        } else if (categoryRef.value.type === 'medicine') {
          return ymMedicineAttributes.concat(ymStandardAttributes.filter(elem => !ymMedicineAttributes.some(elem2 => elem2.id === elem.id)))
        } else if (categoryRef.value.type === 'books') {
          return ymBookAttributes.concat(ymStandardAttributes.filter(elem => !ymBookAttributes.some(elem2 => elem2.id === elem.id)))
        }
      }
      return []
    })

    function refreshAttributes () {
      if (!categoryRef.value) return

      const arr = categoryAttributes.value.sort((a, b) => {
        if (a.required && !b.required) return -1
        if (!a.required && b.required) return 1
        return 0
      })

      arr.forEach((attr, idx) => {
        if (!categoryRef.value.attributes.find(elem => elem.id === attr.id)) {
          categoryRef.value.attributes.splice(idx, 0, { id: attr.id, attrIdent: '', expr: '' })
        }
      })
      // remove attributes not in channel
      categoryRef.value.attributes = categoryRef.value.attributes.filter(elem => arr.find(attr => elem.id === attr.id))
    }

    function add () {
      newCategoryNameRef.value = null
      dialogRef.value = true
    }

    function addCategory () {
      dialogRef.value = false
      const id = 'cat' + Date.now()
      categoryRef.value = { id: id, name: newCategoryNameRef.value, valid: props.channel.valid || [], visible: [], type: 'simple', attributes: [], params: [] }
      refreshAttributes()
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
    }

    function addValue () {
      categoryRef.value.params.push({ id: '', attrIdent: '', expr: '' })
    }

    function removeValue (idx) {
      categoryRef.value.params.splice(idx, 1)
    }

    onMounted(() => {
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

        refreshAttributes()
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
      categoryAttributes,
      exprDialogRef,
      exprAttrRef,
      currentLanguage,
      defaultLanguageIdentifier,
      refreshAttributes,
      add,
      remove,
      addValue,
      removeValue,
      offerTypes: [
        { text: 'Упрощенное предложение', value: 'simple' },
        { text: 'Произвольное предложение', value: 'vendor.model' },
        { text: 'Лекарства', value: 'medicine' },
        { text: 'Книги', value: 'books' }
        /* TODO (if necessary)
        { text: 'Аудиокниги', value: 'audiobooks' },
        { text: 'Музыкальная и видеопродукция', value: 'artist.title' },
        { text: 'Билеты на мероприятия', value: 'event-ticket' },
        { text: 'Туры', value: 'tour' },
        { text: 'Алкоголь', value: 'alco' } */
      ]
    }
  }
}
</script>
