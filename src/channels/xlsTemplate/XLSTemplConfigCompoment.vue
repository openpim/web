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

    <v-card-title>
      <v-col cols="8">
        <v-file-input show-size v-model="fileRef" :label="$t('ItemView.NewFile')"></v-file-input>
      </v-col>
      <v-col cols="4">
        <v-btn class="d-inline" :disabled="!fileRef" text @click="upload" v-text="$t('ItemView.Upload')"></v-btn>
      </v-col>
    </v-card-title>

    <XLSTemplMappingConfigCompoment
      v-if="channel"
      :channel="channel"
      :readonly="readonly"
      :variants="false"
    ></XLSTemplMappingConfigCompoment>
  </div>
</template>
<script>
import { ref, watch } from '@vue/composition-api'
import XLSTemplMappingConfigCompoment from './XLSTemplMappingConfigCompoment.vue'
import * as channelsStore from '../../store/channels'

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
    const { uploadXlsxTemplate } = channelsStore.useStore()

    const fileRef = ref(null)

    function upload () {
      uploadXlsxTemplate(props.channel.id, fileRef.value).then((item) => {
        if (item) {
          console.log(JSON.stringify(item))
          props.channel.config.template = item.config.template
          fileRef.value = null
        }
      })
    }
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

    return {
      upload,
      fileRef
    }
  },
  components: { XLSTemplMappingConfigCompoment }
}
</script>
