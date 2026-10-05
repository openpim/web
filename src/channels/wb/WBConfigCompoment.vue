<template>
  <div>
    <v-text-field v-if="channel" v-model="channel.config.wbToken" :readonly="readonly" label="API token" required></v-text-field>
    <v-autocomplete item-text="text" item-value='identifier' v-model="channel.config.wbCodeAttr" :items="allAttributes" :readonly="readonly" label="Атрибут где находится артикул товара" clearable/>
    <v-autocomplete item-text="text" item-value='identifier' v-model="channel.config.imtIDAttr" :items="allAttributes" :readonly="readonly" label="Атрибут где хранить imtID" clearable/>
    <v-autocomplete item-text="text" item-value='identifier' v-model="channel.config.nmIDAttr" :items="allAttributes" :readonly="readonly" label="Атрибут где хранить nmID" clearable/>
    <v-autocomplete item-text="text" item-value='identifier' v-model="channel.config.wbGroupAttr" :items="allAttributes" :readonly="readonly" label="Атрибут для объединения карточек" clearable/>
    <v-checkbox :readonly="readonly" v-model="channel.config.barcodeBool" label="Генерировать баркод при создании товара" required></v-checkbox>
    <v-autocomplete v-if="channel.config.barcodeBool" item-text="text" item-value='identifier' v-model="channel.config.wbBarcodeAttr" :items="allAttributes" :readonly="readonly" label="Атрибут для баркода" clearable/>
    <v-checkbox :readonly="readonly" v-model="channel.config.wbGetContentRating" label="Получать среднюю оценку товара" required></v-checkbox>
    <v-autocomplete item-text="text" item-value='identifier' v-model="channel.config.wbAttrContentRating" :items="allAttributes" :readonly="readonly" label="Атрибут где лежит средняя оценка товара" clearable  v-if="channel.config.wbGetContentRating"/>
    <v-checkbox v-if="channel" :readonly="readonly" v-model="channel.config.wbGetCertificateStatus" label="Получать статусы сертификатов"/>
    <template v-if="channel && channel.config.wbGetCertificateStatus">
      <v-autocomplete v-model="channel.config.wbCertificateRelations" :items="certificateRelations" item-text="text" item-value="id" :readonly="readonly" label="Зависимости для проверки сертификатов" multiple chips clearable/>
      <v-autocomplete v-model="channel.config.wbCertificateStatusAttr" :items="certificateStatusAttributes" item-text="text" item-value="identifier" :readonly="readonly" label="Атрибут зависимости для статуса сертификата" hint="Успех — approved; проверка не завершена — awaiting_verification; ошибка — код причины WB (или unknown, если причины нет)." persistent-hint clearable/>
      <v-autocomplete v-model="channel.config.wbCertificateNumberAttr" :items="allAttributes" item-text="text" item-value="identifier" :readonly="readonly" label="Атрибут номера на объекте сертификата" clearable/>
    </template>
    <MappingConfigCompoment v-if="channel" :channel="channel" :readonly=readonly :variants="false" :imageRelations="false" ></MappingConfigCompoment>
    <v-checkbox :readonly="readonly" v-model="channel.config.saveVideos" label="Сохранять видео из личного кабинета" required></v-checkbox>

    <v-btn v-if="!readonly" class="mb-5 mt-5" text @click="sync">Синхронизация данных</v-btn>
    <v-checkbox :readonly="readonly" v-model="channel.config.debug" label="Выводить отладочную информацию при работе" required></v-checkbox>
  </div>
</template>
<script>
import { computed, watch, ref, onMounted } from '@vue/composition-api'
import * as channelsStore from '../../store/channels'
import * as attrStore from '../../store/attributes'
import * as relationsStore from '../../store/relations'
import MappingConfigCompoment from '../MappingConfigCompoment'

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
  components: { MappingConfigCompoment },
  setup (props, { root }) {
    const {
      triggerChannel
    } = channelsStore.useStore()

    const {
      loadAllAttributes,
      groups
    } = attrStore.useStore()
    const { loadAllRelations, relations } = relationsStore.useStore()

    watch(() => props.channel, (chan, previousValue) => {
      if (chan && !chan.config.wbToken) {
        root.$set(chan.config, 'wbToken', '')
      }
      if (chan && !chan.config.wbKeyAttribute) {
        root.$set(chan.config, 'wbKeyAttribute', '')
      }
      if (chan && !chan.config.imgRelations) {
        root.$set(chan.config, 'imgRelations', [])
      }
      if (chan) {
        const defaults = { wbGetCertificateStatus: false, wbCertificateStatusAttr: null, wbCertificateNumberAttr: null, wbCertificateRelations: [] }
        for (const key of Object.keys(defaults)) {
          if (chan.config[key] === undefined || chan.config[key] === null) root.$set(chan.config, key, defaults[key])
        }
      }
    }, { immediate: true })

    function sync () {
      if (confirm('Запустить синхронизацию?')) triggerChannel(props.channel.internalId, { sync: true })
    }

    const allAttributes = ref([])
    const certificateRelations = computed(() => relations.map(relation => ({
      ...relation,
      text: relation.identifier + ' (' + (relation.name.ru || relation.identifier) + ')'
    })))
    const certificateStatusAttributes = computed(() => {
      const selected = (props.channel.config.wbCertificateRelations || []).map(String)
      return allAttributes.value.filter(attr => attr.type === 1 && Array.isArray(attr.relations) && attr.relations.length > 0 && selected.every(id => attr.relations.map(String).includes(id)))
    })
    onMounted(() => {
      loadAllRelations()
      loadAllAttributes().then(() => {
        const arr = []
        for (var i = 0; i < groups.length; i++) {
          const group = groups[i]
          for (var j = 0; j < group.attributes.length; j++) {
            const attr = group.attributes[j]
            attr.text = attr.identifier + ' (' + attr.name.ru + ')'
            arr.push(attr)
          }
        }
        allAttributes.value = arr
      })
    })

    return {
      allAttributes,
      certificateRelations,
      certificateStatusAttributes,
      sync
    }
  }
}
</script>
