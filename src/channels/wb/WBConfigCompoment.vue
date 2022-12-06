<template>
  <div>
    <v-text-field v-if="channel" v-model="channel.config.wbToken" :readonly="readonly" label="API token" required></v-text-field>
    <v-autocomplete item-text="text" item-value='identifier' v-model="channel.config.wbCodeAttr" :items="allAttributes" :readonly="readonly" label="Атрибут где находится артикул товара" clearable/>
    <v-autocomplete item-text="text" item-value='identifier' v-model="channel.config.imtIDAttr" :items="allAttributes" :readonly="readonly" label="Атрибут где хранить imtID" clearable/>
    <v-autocomplete item-text="text" item-value='identifier' v-model="channel.config.nmIDAttr" :items="allAttributes" :readonly="readonly" label="Атрибут где хранить nmID" clearable/>
    <v-autocomplete item-text="text" item-value='identifier' v-model="channel.config.wbGroupAttr" :items="allAttributes" :readonly="readonly" label="Атрибут для объединения карточек" clearable/>

    <MappingConfigCompoment v-if="channel" :channel="channel" :readonly=readonly :variants="false" :imageRelations="false" ></MappingConfigCompoment>

    <v-btn v-if="!readonly" class="mb-5 mt-5" text @click="sync">Синхронизация данных</v-btn>
    <v-checkbox :readonly="readonly" v-model="channel.config.debug" label="Выводить отладочную информацию при работе" required></v-checkbox>
  </div>
</template>
<script>
import { watch, ref, onMounted } from 'vue'
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
      if (chan && !chan.config.wbToken) {
        root.$set(chan.config, 'wbToken', '')
      }
      if (chan && !chan.config.wbKeyAttribute) {
        root.$set(chan.config, 'wbKeyAttribute', '')
      }
      if (chan && !chan.config.imgRelations) {
        root.$set(chan.config, 'imgRelations', [])
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
