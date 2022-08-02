<template>
  <div>
    <v-text-field v-if="channel" v-model="channel.config.ozonClientId" :readonly="readonly" label="Client ID" required></v-text-field>
    <v-text-field v-if="channel" v-model="channel.config.ozonApiKey" :readonly="readonly" label="Api-Key" required></v-text-field>

    <v-autocomplete item-text="text" item-value='identifier' v-model="channel.config.ozonIdAttr" :items="allAttributes" :readonly="readonly" label="Атрибут где хранить product ID" clearable/>
    <v-autocomplete item-text="text" item-value='identifier' v-model="channel.config.ozonFBOIdAttr" :items="allAttributes" :readonly="readonly" label="Атрибут где хранить FBO ID" clearable/>
    <v-autocomplete item-text="text" item-value='identifier' v-model="channel.config.ozonFBSIdAttr" :items="allAttributes" :readonly="readonly" label="Атрибут где хранить FBS ID" clearable/>
    <v-autocomplete item-text="text" item-value='identifier' v-model="channel.config.ozonImageAttr" :items="allAttributes" :readonly="readonly" label="Атрибут где лежит URL изображения" clearable/>

    <MappingConfigCompoment v-if="channel" :channel="channel" :readonly=readonly :variants="false"></MappingConfigCompoment>

    <v-btn v-if="!readonly" class="mb-5 mt-5" text @click="sync">Синхронизация данных</v-btn>
    <v-btn v-if="!readonly" class="mb-5 mt-5" text @click="clearCache">Очистить кеш</v-btn>
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

    const dialogRef = ref(false)

    watch(() => props.channel, (chan, previousValue) => {
      if (chan && !chan.config.ozonClientId) {
        root.$set(chan.config, 'ozonClientId', '')
      }
      if (chan && !chan.config.ozonApiKey) {
        root.$set(chan.config, 'ozonApiKey', '')
      }
      if (chan && !chan.config.ozonKeyAttribute) {
        root.$set(chan.config, 'ozonKeyAttribute', '')
      }
      if (chan && !chan.config.imgRelations) {
        root.$set(chan.config, 'imgRelations', [])
      }
    })

    function sync () {
      if (confirm('Запустить синхронизацию?')) triggerChannel(props.channel.internalId, { sync: true })
    }

    function clearCache () {
      if (confirm('Запустить?')) triggerChannel(props.channel.internalId, { clearCache: true })
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
      dialogRef,
      allAttributes,
      sync,
      clearCache
    }
  }
}
</script>
