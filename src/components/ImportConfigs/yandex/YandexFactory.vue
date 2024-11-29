<template>
  <v-row v-if="importConfigYMLLicenceExist">
    <v-tabs v-model="tabRef">
      <v-tab v-text="$t('ImportConfig.YML.Categories')"></v-tab>
      <v-tab v-text="$t('ImportConfig.YML.Offers')"></v-tab>
    </v-tabs>
    <v-tabs-items v-model="tabRef" style="width: 100%;">
      <v-tab-item style="width: 100%;">
        <v-simple-table dense class="py-4 my-6">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left grey lighten-3 py-4">{{ $t('ImportConfig.OptionsTable.Attribute') }}</th>
                <th class="text-left grey lighten-3 py-4">{{ $t('ImportConfig.OptionsTable.Categories') }}</th>
                <th class="text-left grey lighten-3 py-4">
                  {{ $t('ImportConfig.OptionsTable.Expression') }}
                  <v-tooltip bottom>
                    <template #activator="{ on: onTooltip }">
                      <v-btn v-on="{ ...onTooltip }" icon><v-icon>mdi-help-circle-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('ImportConfig.ExpessionsHelpText') }}</span>
                  </v-tooltip>
                </th>
                <th class="text-left grey lighten-3 py-4 px-0" style="width: 50px;">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" class="pa-0" icon color="primary" @click="addCategory"><v-icon
                          dark>mdi-plus</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Add') }}</span>
                  </v-tooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(elem, j) in categories" :key="j">
                <td class="pa-1 pr-10">
                  <v-autocomplete v-model="elem.attribute" @change="updateMappings" @click:clear="updateMappings"
                    :items="getFilteredAttributesForCategory(elem)" item-text="name" item-value="identifier"
                    :label="$t('ImportConfig.MappingsTable.SelectAttribute')" clearable></v-autocomplete>
                </td>
                <td class="pa-1 pr-10">
                  <v-autocomplete v-model="elem.column" @change="updateMappings" @click:clear="updateMappings"
                    :items="ymCategoriesAttrs" item-text="description" item-value="name"
                    :label="$t('ImportConfig.MappingsTable.SelectValue')" clearable></v-autocomplete>
                </td>
                <td class="pa-1 pr-10">
                  <v-text-field v-model="elem.expression" @input="updateMappings" dense class="mt-4 ml-3 mr-3"
                    append-outer-icon="mdi-message-outline" @click:append-outer="showExpression(elem)" />
                </td>
                <td class="pa-0">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" class="pa-0" icon @click="deleteCategoryRow(j)"><v-icon
                          dark>mdi-delete-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Remove') }}</span>
                  </v-tooltip>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-tab-item>
      <v-tab-item style="width: 100%;">
        <v-simple-table dense class="py-4 my-6">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left grey lighten-3 py-4">{{ $t('ImportConfig.OptionsTable.Attribute') }}</th>
                <th class="text-left grey lighten-3 py-4">{{ $t('ImportConfig.OptionsTable.Offer') }}</th>
                <th class="text-left grey lighten-3 py-4 px-0" style="width: 50px;">
                    <span>{{ $t('ImportConfig.MappingsTable.DataSource') }}</span>
                </th>
                <th class="text-left grey lighten-3 py-4">
                  {{ $t('ImportConfig.OptionsTable.Expression') }}
                  <v-tooltip bottom>
                    <template #activator="{ on: onTooltip }">
                      <v-btn v-on="{ ...onTooltip }" icon><v-icon>mdi-help-circle-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('ImportConfig.ExpessionsHelpText') }}</span>
                  </v-tooltip>
                </th>
                <th class="text-left grey lighten-3 py-4 px-0" style="width: 50px;">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" class="pa-0" icon color="primary" @click="addOffer"><v-icon
                          dark>mdi-plus</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Add') }}</span>
                  </v-tooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(elem, j) in offers" :key="j">
                <td class="pa-1 pr-10">
                  <v-autocomplete v-model="elem.attribute" @change="updateMappings" @click:clear="updateMappings"
                    :items="getFilteredAttributes(elem)" item-text="name" item-value="identifier"
                    :label="$t('ImportConfig.MappingsTable.SelectAttribute')" clearable></v-autocomplete>
                </td>
                <td class="pa-1 pr-10">
                  <v-autocomplete v-if="elem.source === 'element'" v-model="elem.column" @change="updateMappings" @click:clear="updateMappings"
                    :items="ymStandardAttributes" item-text="name" item-value="name"
                    :label="$t('ImportConfig.MappingsTable.SelectValue')" clearable></v-autocomplete>
                  <v-text-field v-else v-model="elem.column" :label="$t('ImportConfig.MappingsTable.SelectValue')" @input="updateMappings" dense class="mt-4 ml-3 mr-3" />
                </td>
                <td>
                  <v-select v-model="elem.source" item-text="name" item-value="id" :items="sources" :label="$t('ImportConfig.MappingsTable.DataSource')" />
                </td>
                <td class="pa-1 pr-10">
                  <v-text-field v-model="elem.expression" @input="updateMappings" dense class="mt-4 ml-3 mr-3"
                    append-outer-icon="mdi-message-outline" @click:append-outer="showExpression(elem)" />
                </td>
                <td class="pa-0">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" class="pa-0" icon @click="deleteOfferRow(j)"><v-icon
                          dark>mdi-delete-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Remove') }}</span>
                  </v-tooltip>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-tab-item>
    </v-tabs-items>
    <template>
      <v-row justify="center" v-if="exprAttrRef">
        <v-dialog v-model="exprDialogRef" persistent max-width="90%">
          <v-card>
            <v-card-text>
              <v-container>
                <v-alert border="bottom" colored-border type="info" elevation="2" class="mt-6">{{ $t('ImportConfig.ExpessionsHelpText') }}</v-alert>
                <v-row>
                  <v-col cols="12">
                    <v-textarea :rows="15" v-model="exprAttrRef.expression"></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeExpressionDialog">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
  </v-row>

</template>
<script>

import { ref, onMounted, watch, computed } from '@vue/composition-api'
import i18n from '@/i18n'

import * as attrStore from '@/store/attributes'
import * as langStore from '@/store/languages'
import * as channelsStore from '@/store/channels'

export default {
  props: {
    importConfig: {
      type: Object
    }
  },
  setup (props, { root }) {
    const {
      loadAllAttributes,
      groups
    } = attrStore.useStore()

    const {
      channelTypes,
      loadAllChannelTypes
    } = channelsStore.useStore()

    const {
      languages,
      loadAllLanguages,
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const extraAttributes = [
      {
        identifier: 'identifier',
        name: i18n.t('ImportConfig.Attribute.identifier')
      },
      {
        identifier: 'typeIdentifier',
        name: i18n.t('ImportConfig.Attribute.typeIdentifier')
      },
      {
        identifier: 'parentIdentifier',
        name: i18n.t('ImportConfig.Attribute.parentIdentifier')
      }
    ]

    const sources = [
      {
        id: 'element',
        name: i18n.t('ImportConfig.Attribute.Sources.Element')
      },
      {
        id: 'attribute',
        name: i18n.t('ImportConfig.Attribute.Sources.Attribute')
      },
      {
        id: 'parameter',
        name: i18n.t('ImportConfig.Attribute.Sources.Parameter')
      },
      {
        id: 'customElement',
        name: i18n.t('ImportConfig.Attribute.Sources.CustomElement')
      }
    ]

    const ymCategoriesAttrs = [
      { id: 'id', name: 'id', required: true, description: 'Идентификатор категории' },
      { id: 'parentId', name: 'parentId', required: false, description: 'Идентификатор родительской категории' },
      { id: 'name', name: 'name', required: false, description: 'Наименовании категории' }
    ]

    const ymStandardAttributes = [
      { id: 'id', name: 'id', required: true, description: 'Идентификатор предложения. Может состоять только из цифр и латинских букв. Максимальная длина — 20 символов. Должен быть уникальным для каждого предложения.' },
      { id: 'vendor', name: 'vendor', required: false, description: 'Название производителя.' },
      { id: 'vendorCode', name: 'vendorCode', required: false, description: 'Код товара, который ему присвоил производитель.' },
      { id: 'bid', name: 'bid', required: false, description: 'Размер ставки. Указывайте размер ставки в условных центах: например, значение 80 соответствует ставке 0,8 у. е. Значения должны быть целыми и положительными числами.' },
      { id: 'url', name: 'url', required: false, description: 'URL страницы товара на сайте магазина. Максимальная длина ссылки — 2048 символов.' },
      { id: 'price', name: 'price', required: true, description: 'Актуальная цена товара. Формат: целое или дробное число. Разделитель целой и дробной части — точка.' },
      { id: 'count', name: 'count', required: false, description: 'Остатки товара — общее количество товара, доступное для продажи на Маркете и зарезервированное под заказы. Если товара нет в наличии, укажите 0. Если у вас включена опция передачи данных об остатках товаров и вы не укажете элемент count, товар не будет размещен на Маркете.' },
      { id: 'outlets', name: 'outlets', required: false, description: 'Остатки товара по складам. На вход принимается массив массивов [[id1,stock1],[id2,stock2]]' },
      { id: 'oldprice', name: 'oldprice', required: false, description: 'Старая цена товара, должна быть выше текущей. Маркет автоматически рассчитывает разницу и показывает пользователям скидку.' },
      { id: 'purchase_price', name: 'purchase_price', required: false, description: 'Закупочная цена товара. Она нужна для расчета наценки и настройки стратегии по маржинальности в PriceLabs.' },
      { id: 'enable_auto_discounts', name: 'enable_auto_discounts', required: false, description: 'Автоматический расчет и показ скидок для предложения.' },
      { id: 'currencyId', name: 'currencyId', required: true, description: 'Валюта, в которой указана цена товара: RUR, USD, EUR, UAH, KZT, BYN. Цена и валюта должны соответствовать друг другу.' },
      { id: 'categoryId', name: 'categoryId', required: true, description: 'Идентификатор категории товара, присвоенный магазином (целое число, не более 18 знаков).' },
      { id: 'picture', name: 'picture', required: false, description: 'URL-ссылка на картинку товара. Обязательно для части категорий.' },
      { id: 'supplier', name: 'supplier', required: false, description: 'ОГРН или ОГРНИП стороннего продавца. ОГРН должен содержать 13 символов, ОГРНИП — 15.' },
      { id: 'delivery', name: 'delivery', required: false, description: 'Возможность курьерской доставки (по всем регионам, в которые доставляет магазин). true/false' },
      { id: 'delivery-option', name: 'delivery-option', required: false, description: 'Условия доставки (можно задать до 3 значений). Формат: "300,4,18" - "<стоимость доставки>,< срок доставки в рабочих днях>,<время, до которого нужно сделать заказ, чтобы получить его в этот срок - необязательный параметр>".' },
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
      { id: 'cpa', name: 'cpa', required: false, description: 'Возможность заказать товар на Маркете: 1 — товар можно заказать на Маркете. 0 — товар можно заказать только на сайте магазина. Значение по умолчанию: 1.' },
      { id: 'group_id', name: 'group_id', required: false, description: 'Элемент объединяет все предложения, которые являются вариациями одной модели и должен иметь одинаковое значение. Значение должно быть целым числом, максимум 9 знаков.' }
    ]

    const allAttributesRef = ref([])
    const exprAttrRef = ref(null)
    const exprDialogRef = ref(false)
    const mappingRef = ref({ categories: [], offers: [] })
    const tabRef = ref(null)
    const importConfigYMLLicenceExist = ref(false)

    const categories = computed(() => {
      return mappingRef.value.categories
    })

    const offers = computed(() => {
      return mappingRef.value.offers
    })

    onMounted(async () => {
      await loadAllAttributes()
      await loadAllLanguages()
      await loadAllChannelTypes()
      const arr = []
      for (var i = 0; i < groups.length; i++) {
        const group = groups[i]
        for (var j = 0; j < group.attributes.length; j++) {
          const attr = group.attributes[j]
          attr.name = attr.identifier + ' (' + (attr.name[currentLanguage.value.identifier] || attr.name[defaultLanguageIdentifier.value]) + ')'
          arr.push(attr)
        }
      }
      for (let i = 0; i < languages.length; i++) {
        const lang = languages[i]
        const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
        extraAttributes.push({ identifier: '$name#' + lang.identifier, name: 'Наименование объекта' + langText })
      }
      allAttributesRef.value = extraAttributes.concat(arr)

      const importConfigYMLLicence = channelTypes.find(el => el === 1001)
      if (importConfigYMLLicence) {
        importConfigYMLLicenceExist.value = true
      }
    })

    watch(() => props.importConfig, async (newValue, previousValue) => {
      /* newValue.mappings.forEach(el => {
        if (!el.type) el.type = 'category'
      }) */
      mappingRef.value = newValue.mappings
    })

    function addCategory () {
      mappingRef.value.categories.push({
        attribute: null,
        column: null,
        expression: null,
        type: 'category'
      })
    }

    function addOffer () {
      mappingRef.value.offers.push({
        attribute: null,
        column: null,
        type: 'offer',
        source: 'element',
        expression: null
      })
    }

    function closeExpressionDialog () {
      exprDialogRef.value = false
      updateMappings()
    }

    function deleteOfferRow (indx) {
      if (confirm(i18n.t('ImportConfig.AreYouSure'))) {
        mappingRef.value.offers.splice(indx, 1)
      }
    }

    function deleteCategoryRow (indx) {
      if (confirm(i18n.t('ImportConfig.AreYouSure'))) {
        mappingRef.value.categories.splice(indx, 1)
      }
    }

    const getFilteredAttributes = (fieldMapping) => {
      const res = []
      const name = allAttributesRef.value.find(el => el.identifier === fieldMapping.attribute) ? allAttributesRef.value.find(el => el.identifier === fieldMapping.attribute).name : null
      if (fieldMapping && fieldMapping.attribute && name) {
        const currentObj = {
          identifier: fieldMapping.attribute,
          name: allAttributesRef.value.find(el => el.identifier === fieldMapping.attribute).name
        }
        res.push(currentObj)
      }
      allAttributesRef.value.forEach((el) => {
        if (!mappingRef.value.offers.some(mapping => mapping.attribute === el.identifier)) {
          res.push(el)
        }
      })
      return res
    }

    const getFilteredAttributesForCategory = (fieldMapping) => {
      const res = []
      const name = allAttributesRef.value.find(el => el.identifier === fieldMapping.attribute) ? allAttributesRef.value.find(el => el.identifier === fieldMapping.attribute).name : null
      if (fieldMapping && fieldMapping.attribute && name) {
        const currentObj = {
          identifier: fieldMapping.attribute,
          name: allAttributesRef.value.find(el => el.identifier === fieldMapping.attribute).name
        }
        res.push(currentObj)
      }
      allAttributesRef.value.forEach((el) => {
        if (!mappingRef.value.categories.some(mapping => mapping.attribute === el.identifier)) {
          res.push(el)
        }
      })
      return res
    }

    function showExpression (attr) {
      exprAttrRef.value = attr
      exprDialogRef.value = true
    }

    function updateMappings () {
      // eventBus.emit('mappings_updated', mappingRef.value)
      // console.log(mappingRef.value)
      props.importConfig.mappings = mappingRef.value
    }

    return {
      exprAttrRef,
      exprDialogRef,
      tabRef,
      mappingRef,
      addCategory,
      addOffer,
      closeExpressionDialog,
      deleteCategoryRow,
      deleteOfferRow,
      getFilteredAttributes,
      getFilteredAttributesForCategory,
      showExpression,
      updateMappings,
      ymStandardAttributes,
      ymCategoriesAttrs,
      categories,
      offers,
      sources,
      importConfigYMLLicenceExist
    }
  }
}
</script>
