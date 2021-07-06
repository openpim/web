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
          <MappingAttributesCompoment class="mt-5" v-if="pimAttributesRef && pimAttributesRef.length > 0" :attributes="channel.config.shopAttributes" :pimAttributes="pimAttributesRef" :channelAttributes="shopAttributes" />
      </v-tab-item>
      <v-tab-item>
      </v-tab-item>
      <v-tab-item>
      </v-tab-item>
      <v-tab-item>
        <div class="ml-5">
        <v-text-field v-if="channel" v-model="channel.config.file" :readonly=readonly label="Имя генерируемого файла" required></v-text-field>
        <v-text-field v-if="channel" v-model="channel.config.mime" :readonly=readonly label="Mime тип генерируемого файла" required></v-text-field>
        <v-text-field v-if="channel" v-model="channel.config.extCmd" :readonly=readonly label="Запустить эту программу после генерации файла (если надо). Файл будет передан как последний параметр." required></v-text-field>
        </div>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>
<script>
import { watch, ref, onMounted } from '@vue/composition-api'
import * as attrStore from '../../store/attributes'
import * as langStore from '../../store/languages'
import MappingAttributesCompoment from '../MappingAttributesCompoment'

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
  components: { MappingAttributesCompoment },
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

    const tabRef = ref(null)
    const pimAttributesRef = ref([])

    const shopAttributes = [
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
      { id: 'delivery-option1', name: 'Условия доставки 1', required: false, description: 'Условия доставки (можно задать до 3 значений). Формат: "300,4,18" - "<стоимость доставки>,< срок доставки в рабочих днях>,<время, до которого нужно сделать заказ, чтобы получить его в этот срок - необязательный параметр>".' },
      { id: 'delivery-option2', name: 'Условия доставки 2', required: false, description: 'Условия доставки (можно задать до 3 значений). Формат: "300,4,18" - "<стоимость доставки>,< срок доставки в рабочих днях>,<время, до которого нужно сделать заказ, чтобы получить его в этот срок - необязательный параметр>".' },
      { id: 'delivery-option3', name: 'Условия доставки 3', required: false, description: 'Условия доставки (можно задать до 3 значений). Формат: "300,4,18" - "<стоимость доставки>,< срок доставки в рабочих днях>,<время, до которого нужно сделать заказ, чтобы получить его в этот срок - необязательный параметр>".' },
      { id: 'enable_auto_discounts', name: 'enable_auto_discounts', required: false, description: 'Автоматический расчет и показ скидок для всего прайс-листа. true/false' },
      { id: 'store', name: 'store', required: false, description: 'Возможность купить товар без предварительного заказа. true — товары можно купить без предварительного заказа; false — товары нельзя купить без предварительного заказа' },
      { id: 'adult', name: 'adult', required: false, description: 'Товары имеют отношение к удовлетворению сексуальных потребностей либо иным образом эксплуатируют интерес к сексу. true/false' }
    ]

    watch(() => props.channel, (chan, previousValue) => {
      if (chan && !chan.config.shopAttributes) {
        root.$set(chan.config, 'shopAttributes', shopAttributes.map(elem => { return { id: elem.id, expr: (elem.id === 'currency1' ? '"RUR,1"' : ''), attrIdent: '' } }))
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
    })

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
    })

    return {
      tabRef,
      shopAttributes,
      pimAttributesRef
    }
  }
}
</script>
