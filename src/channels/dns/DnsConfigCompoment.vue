<template>
  <div>
    <v-text-field v-if="channel" v-model="channel.config.dnsApiToken" :readonly="readonly" label="API-ключ DNS (sp_live_…)" required type="password"></v-text-field>
    <v-autocomplete item-text="text" item-value='identifier' v-model="channel.config.dnsIdAttr" :items="allAttributes" :readonly="readonly" label="Атрибут, где хранить идентификатор товара DNS" clearable/>

    <MappingConfigCompoment v-if="channel" :channel="channel" :readonly=readonly :variants="false" :imageRelations="false" ></MappingConfigCompoment>
    <v-btn v-if="!readonly" class="mb-5 mt-5" text @click="sync">Синхронизация данных</v-btn>
    <v-checkbox :readonly="readonly" v-model="channel.config.debug" label="Выводить отладочную информацию при работе" required></v-checkbox>
  </div>
</template>
<script>
import { watch, ref, onMounted } from '@vue/composition-api'
import * as channelsStore from '../../store/channels'
import * as attrStore from '../../store/attributes'
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

    watch(() => props.channel, (chan, previousValue) => {
      if (chan && !chan.config.dnsApiToken) {
        root.$set(chan.config, 'dnsApiToken', '')
      }
      if (chan && !chan.config.dnsIdAttr) {
        root.$set(chan.config, 'dnsIdAttr', '')
      }
    })

    function sync () {
      if (confirm('Запустить синхронизацию?')) triggerChannel(props.channel.internalId, { sync: true })
    }

    const allAttributes = ref([])
    onMounted(() => {
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
      sync
    }
  }
}
</script>
