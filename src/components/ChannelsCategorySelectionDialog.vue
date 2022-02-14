<template>
  <v-dialog v-model="selectionDialogRef" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">Выбор категорий</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="searchRef" :label="$t('Filter')" flat hide-details clearable clear-icon="mdi-close-circle-outline" class="ml-5 mr-5"></v-text-field>
              <v-treeview :search="searchRef" dense activatable hoverable :items="itemsRef" :active.sync="activeRef" :open="openRef">
                <template v-slot:prepend="{ item }">
                  <v-icon v-if="item.channel">mdi-access-point</v-icon>
                </template>
                <template v-slot:label="{ item }">
                  <div>{{item.name}} </div>
                </template>
              </v-treeview>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="selectionDialogRef = false">{{ $t('Cancel') }}</v-btn>
        <v-btn color="blue darken-1" text @click="selected" :disabled='activeRef.length===0 || activeRef[0].startsWith("CHAN")'>{{ $t('Select') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { ref } from '@vue/composition-api'
import * as channelsStore from '../store/channels'
import * as langStore from '../store/languages'

export default {
  name: 'RelationsSelection',
  props: {
    editAccessOnly: {
      type: Boolean,
      required: false
    },
    channelType: {
      required: false
    }
  },
  setup (props, { emit }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      channels,
      getAvailableChannels,
      loadAllChannels
    } = channelsStore.useStore()

    const selectionDialogRef = ref(false)
    const itemsRef = ref([])
    const activeRef = ref([])
    const openRef = ref([])

    function selected () {
      let mapping = null
      // eslint-disable-next-line no-labels
      exit:
      for (let i = 0; i < itemsRef.value.length; i++) {
        const chan = itemsRef.value[i]
        for (let j = 0; j < chan.children.length; j++) {
          const map = chan.children[j]
          if (map.id === activeRef.value[0]) {
            mapping = map.mapping
            // eslint-disable-next-line no-labels
            break exit
          }
        }
      }
      emit('selected', mapping)
    }

    const searchRef = ref('')

    function buildItems (channels) {
      const data = []
      channels.forEach(channel => {
        const obj = { id: 'CHAN_' + channel.id, name: (channel.name[currentLanguage.value.identifier] || '[' + channel.name[defaultLanguageIdentifier.value] + ']'), channel: channel, children: [] }
        if (channel.mappings) {
          for (const prop in channel.mappings) {
            const mapping = channel.mappings[prop]
            obj.children.push({ id: mapping.id, name: mapping.name, mapping: mapping })
          }
        }
        data.push(obj)
      })
      itemsRef.value = data
    }

    function showDialog () {
      if (channels.length === 0) {
        loadAllChannels().then(() => {
          selectionDialogRef.value = true
          let tmp = getAvailableChannels(props.editAccessOnly)
          if (props.channelType) tmp = tmp.filter(channel => channel.type === props.channelType)
          buildItems(tmp)
        })
      } else {
        selectionDialogRef.value = true
        let tmp = getAvailableChannels(props.editAccessOnly)
        if (props.channelType) tmp = tmp.filter(channel => channel.type === props.channelType)
        buildItems(tmp)
      }
    }

    function closeDialog () {
      selectionDialogRef.value = false
    }

    return {
      itemsRef,
      activeRef,
      openRef,
      searchRef,
      selectionDialogRef,
      selected,
      showDialog,
      closeDialog,
      currentLanguage,
      defaultLanguageIdentifier
    }
  }
}
</script>
