<template>
  <div>
    <v-text-field v-if="channel" v-model="channel.config.ozonClientId" :readonly="readonly" label="Client ID" required></v-text-field>
    <v-text-field v-if="channel" v-model="channel.config.ozonApiKey" :readonly="readonly" label="Api-Key" required></v-text-field>
    <MappingConfigCompoment v-if="channel" :channel="channel" :readonly=readonly ></MappingConfigCompoment>

    <template v-if="channel">
      <v-row justify="center">
        <v-dialog v-model="dialogRef" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">Синхронизация товаров с Ozon</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="channel.config.ozonKeyAttribute" label="Идентификатор атрибута кода товара" required></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
              <v-btn color="blue darken-1" text @click="startSync" :disabled="!channel.config.wbKeyAttribute">Начать</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>

    <v-btn v-if="!readonly" class="mb-5 mt-5" text @click="sync">Синхронизация данных</v-btn>
  </div>
</template>
<script>
import { watch, ref } from '@vue/composition-api'
import * as channelsStore from '../../store/channels'
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
      dialogRef.value = true
    }

    function startSync () {
      dialogRef.value = false
      triggerChannel(props.channel.internalId, { sync: true, attr: props.channel.config.wbKeyAttribute })
    }

    return {
      dialogRef,
      sync,
      startSync
    }
  }
}
</script>
