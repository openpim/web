<template>
  <v-dialog v-model="selectionDialogRef" persistent max-width="90%">
    <v-card>
      <v-card-title>
        <span class="headline">Выбор категорий</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="searchRef" :label="$t('Filter')" flat hide-details clearable clear-icon="mdi-close-circle-outline" class="ml-5 mr-5"></v-text-field>
              <v-treeview :search="searchRef" item-text="name" dense activatable hoverable :items="itemsRef" :active.sync="activeRef" :open.sync="openRef">
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
        <v-btn color="blue darken-1" text @click="selected" :disabled="!selectedMapping">{{ $t('Select') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { ref, computed } from '@vue/composition-api'
import { buildChannelMappingCopyItems, findChannelMappingBySelection } from '../channels/mappingUtils'
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
      getAvailableChannelsWithGroups,
      loadAllChannelsWithMapping
    } = channelsStore.useStore()

    const selectionDialogRef = ref(false)
    const itemsRef = ref([])
    const activeRef = ref([])
    const openRef = ref([])
    const selectedMapping = computed(() => findChannelMappingBySelection(itemsRef.value, activeRef.value[0]))

    function selected () {
      if (selectedMapping.value) emit('selected', selectedMapping.value)
    }

    const searchRef = ref('')

    function buildItems (channels) {
      itemsRef.value = buildChannelMappingCopyItems(
        channels,
        currentLanguage.value?.identifier,
        defaultLanguageIdentifier.value
      )
    }

    async function showDialog () {
      activeRef.value = []
      openRef.value = []
      searchRef.value = ''
      await loadAllChannelsWithMapping()
      let tmp = getAvailableChannelsWithGroups(props.editAccessOnly)
      if (props.channelType != null) tmp = tmp.filter(channel => Number(channel.type) === Number(props.channelType))
      buildItems(tmp)
      selectionDialogRef.value = true
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
      selectedMapping,
      showDialog,
      closeDialog,
      currentLanguage,
      defaultLanguageIdentifier
    }
  }
}
</script>
