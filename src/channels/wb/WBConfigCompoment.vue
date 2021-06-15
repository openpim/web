<template>
  <div>
    <v-text-field v-if="channel" v-model="channel.config.wbToken" :readonly="readonly" label="API token" required></v-text-field>
    <v-text-field v-if="channel" v-model="channel.config.wbSupplierID" :readonly="readonly" label="Идентификатор поставщика" required></v-text-field>
    <MappingConfigCompoment v-if="channel" :channel="channel" :readonly=readonly ></MappingConfigCompoment>

    <template v-if="channel">
      <v-row justify="center">
        <v-dialog v-model="dialogRef" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">Синхронизация товаров с Wildberries</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="channel.config.wbKeyAttribute" label="Идентификатор атрибута кода товара" required></v-text-field>
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

    <v-btn v-if="!readonly" class="mb-4" text @click="sync">Синхронизация данных</v-btn>
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
      if (chan && !chan.config.wbToken) {
        root.$set(chan.config, 'wbToken', '')
      }
      if (chan && !chan.config.wbSupplierID) {
        root.$set(chan.config, 'wbSupplierID', '')
      }
      if (chan && !chan.config.wbKeyAttribute) {
        root.$set(chan.config, 'wbKeyAttribute', '')
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
