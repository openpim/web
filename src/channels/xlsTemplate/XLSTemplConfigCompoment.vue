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

    <v-row v-if="!channel.config.template">
      <v-col cols="8">
        <v-file-input show-size v-model="fileRef" :label="$t('ItemView.NewFile')"></v-file-input>
      </v-col>
      <v-col cols="4">
        <v-btn class="d-inline" :disabled="!fileRef" text @click="upload" v-text="$t('ItemView.Upload')"></v-btn>
      </v-col>
    </v-row>
    <v-row v-if="channel.config.template" class="mt-1 mb-0">
      <v-col>
        <a :href="damUrl + 'xlsx-template/' + channel.id + '?token=' + token">{{ channel.config.template ? getFileName(channel.config) : 'file.xlsx' }}</a>
        <v-btn class="ml-3" color="primary" text @click="channel.config.template = null; fileRef = null">{{ $t('ImportConfig.SelectAnotherFile') }}</v-btn>
      </v-col>
    </v-row>

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

    function getFileName (config) {
      if (config.originalFilename) return config.originalFilename
      const extNum = config.template?.lastIndexOf('/')
      const fileName = extNum !== -1 ? config.template?.substring(extNum + 1) : ''
      return fileName
    }

    function upload () {
      uploadXlsxTemplate(props.channel.id, fileRef.value).then((item) => {
        if (item) {
          props.channel.config.template = item.config.template
          props.channel.config.originalFilename = item.config.originalFilename
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
      fileRef,
      getFileName,
      damUrl: window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/',
      token: localStorage.getItem('token')
    }
  },
  components: { XLSTemplMappingConfigCompoment }
}
</script>
