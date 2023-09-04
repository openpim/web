<template>
  <div>
    <v-text-field
      v-if="channel"
      v-model="channel.config.extCmd"
      :readonly="readonly"
      :label="$t('Channels.Ext.cmd')"
      required
    ></v-text-field>
    <v-text-field
      v-if="channel"
      v-model="channel.config.file"
      :readonly="readonly"
      :label="$t('Channels.Ext.File')"
      required
    ></v-text-field>
    <v-text-field
      v-if="channel"
      v-model="channel.config.mime"
      :readonly="readonly"
      :label="$t('Channels.Ext.Mime')"
      required
    ></v-text-field>
    <v-text-field
      v-if="channel"
      v-model="channel.config.template"
      :readonly="readonly"
      :label="$t('Channels.Ext.Template')"
      required
    ></v-text-field>

    <XLSTemplMappingConfigCompoment
      v-if="channel"
      :channel="channel"
      :readonly="readonly"
      :variants="false"
    ></XLSTemplMappingConfigCompoment
    >
  </div>
</template>
<script>
import { watch } from '@vue/composition-api'
import XLSTemplMappingConfigCompoment from './XLSTemplMappingConfigCompoment.vue'

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
  setup (props, { root }) {
    watch(
      () => props.channel,
      (chan, previousValue) => {
        if (chan && !chan.config.extCmd) {
          root.$set(chan.config, 'extCmd', '')
        }
        if (chan && !chan.config.file) {
          root.$set(chan.config, 'file', '')
        }
        if (chan && !chan.config.mime) {
          root.$set(chan.config, 'mime', '')
        }
      }
    )
    return {}
  },
  components: { XLSTemplMappingConfigCompoment }
}
</script>
