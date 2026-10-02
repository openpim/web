<template>
  <div v-if="channel">
    <v-text-field v-model="channel.config.mvideoApiKey" label="API-ключ МВидео (право MATERIAL_CREATE)" type="password" :readonly="readonly" required />
    <v-autocomplete v-model="channel.config.mvideoOfferIdAttr" :items="allAttributes" item-text="text" item-value="identifier" label="Атрибут с offerId (по умолчанию identifier товара)" :readonly="readonly" clearable />
    <v-autocomplete v-model="channel.config.mvideoIdAttr" :items="allAttributes" item-text="text" item-value="identifier" label="Атрибут для productId / SAP-кода МВидео" :readonly="readonly" required clearable />
    <v-alert type="info" text class="mb-4">
      Канал создаёт карточки товаров. После отправки заявка ожидает обработки МВидео.
      Настройте расписание синхронизации или нажмите «Проверить заявки», чтобы получить результат и SAP-коды.
    </v-alert>
    <MappingConfigCompoment :channel="channel" :readonly="readonly" :variants="false" :imageRelations="false" />
    <v-btn v-if="!readonly" class="my-5" text @click="sync">Проверить заявки</v-btn>
  </div>
</template>
<script>
import { computed, onMounted, watch } from '@vue/composition-api'
import * as channelsStore from '../../store/channels'
import * as attributesStore from '../../store/attributes'
import MappingConfigCompoment from '../MappingConfigCompoment.vue'

export default {
  components: { MappingConfigCompoment },
  props: { channel: { type: Object, required: true }, readonly: { type: Boolean, required: true } },
  setup (props, { root }) {
    const channels = channelsStore.useStore()
    const attributes = attributesStore.useStore()
    watch(() => props.channel, channel => {
      if (!channel) return
      for (const field of ['mvideoApiKey', 'mvideoIdAttr', 'mvideoOfferIdAttr']) {
        if (channel.config[field] === undefined) root.$set(channel.config, field, '')
      }
    }, { immediate: true })
    const allAttributes = computed(() => attributes.groups.flatMap(group => group.attributes.map(attr => ({
      ...attr, text: attr.identifier + ' (' + (attr.name.ru || attr.identifier) + ')'
    }))))
    onMounted(() => attributes.loadAllAttributes())
    const sync = () => channels.triggerChannel(props.channel.internalId, { sync: true })
    return { allAttributes, sync }
  }
}
</script>
