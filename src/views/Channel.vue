<template>
  <v-container v-if="channelRef" class="pa-0">
    <v-row no-gutters>
      <v-col cols="12">
        <v-card class="mx-auto mb-1" outlined>
          <v-card-title class="pt-0 pb-0">
            <span class="mr-0">{{ channelRef.name[currentLanguage.identifier] || '[' + channelRef.name[defaultLanguageIdentifier] + ']' }}</span>
            <SystemInformation :data="channelRef"></SystemInformation>
            <div class="text-body-1 ml-5">
              {{ChannelView.LastStartAt}}: <span>111</span>
              duration: 1111, status: ..., Next start: 222
            </div>
          </v-card-title>
          <v-card-actions>
            <v-btn v-if="true" text @click="save" v-text="$t('Trigger now')"></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-tabs v-model="tabRef">
          <v-tab v-text="$t('ChannelView.Dashboard')"></v-tab>
          <v-tab v-text="$t('ChannelView.Executions')"></v-tab>
        </v-tabs>
        <v-tabs-items v-model="tabRef">
          <v-tab-item> <!-- Dashboard -->
          Dashboard
          </v-tab-item>
          <v-tab-item> <!-- Executions -->
          Executions
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, watch } from '@vue/composition-api'
import * as channelsStore from '../store/channels'
import * as langStore from '../store/languages'
import { useRouter } from '../router/useRouter'
import SystemInformation from '../components/SystemInformation'
// import i18n from '../i18n'

export default {
  components: { SystemInformation },
  setup (params, context) {
    const { route } = useRouter()

    const {
      channels,
      loadAllChannels
    } = channelsStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const channelRef = ref(null)
    const tabRef = ref(null)

    watch(route, (current, previous) => {
      if (current && current.params && current.params.id) {
        channelRef.value = channels.find(elem => elem.identifier === current.params.id)
      } else {
        channelRef.value = null
      }
    })

    onMounted(() => {
      loadAllChannels().then(() => {
        if (route.value && route.value.params && route.value.params.id) {
          channelRef.value = channels.find(elem => elem.identifier === route.value.params.id)
        }
      })
    })

    return {
      channelRef,
      tabRef,
      currentLanguage,
      defaultLanguageIdentifier
    }
  }
}
</script>
