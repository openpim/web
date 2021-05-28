<template>
  <v-container v-if="channelRef" class="pa-0">
    <v-row no-gutters>
      <v-col cols="12">
        <v-card class="mx-auto mb-1" outlined>
          <v-card-title class="pt-0 pb-0">
              <v-row dense>
                <v-col cols="2" class="pl-3 mt-3">
                  <span class="mr-0">{{ channelRef.name[currentLanguage.identifier] || '[' + channelRef.name[defaultLanguageIdentifier] + ']' }}</span>
                  <SystemInformation :data="channelRef"></SystemInformation>
                </v-col>
                <v-col cols="10">
            <div class="text-body-2 ml-5 mt-3">
              <div>
                <span style="font-weight: bold;">{{$t('ChannelView.LastStartAt')}}:</span> {{ channelRef.runtime.lastStart ? 'TODO' : $t('ChannelView.Never')  }}
                <span class="ml-3" style="font-weight: bold;">{{$t('ChannelView.Duration')}}:</span> {{ channelRef.runtime.duration ? 'TODO' : ''  }}
                <span class="ml-3" style="font-weight: bold;">{{$t('ChannelView.Status')}}:</span>
                  <v-chip class="ma-2" :color="channelRef.active ? 'green' : ''" :text-color="channelRef.active ? 'white' : 'black'">
                    {{ channelRef.active ? $t('ChannelView.Active') : $t('ChannelView.Stopped')  }}
                  </v-chip>
              </div>
              <div>
                <span style="font-weight: bold;">{{$t('ChannelView.NextStartAt')}}:</span> {{nextStart}}
              </div>
            </div>
                </v-col>
              </v-row>
          </v-card-title>
          <v-card-actions>
            <v-btn v-if="true" text @click="triggerNow" v-text="$t('ChannelView.TriggerNow')"></v-btn>
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
              <v-row dense>
                <v-col cols="3">
                  <PieChart :data="pieData" :options="{onClick: function(event, item){chartClick(event, item)},title: {display: true, text: 'Items by status'}}"></PieChart>
                </v-col>
              </v-row>
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
import { ref, onMounted, watch, computed } from '@vue/composition-api'
import * as channelsStore from '../store/channels'
import * as langStore from '../store/languages'
import { useRouter } from '../router/useRouter'
import SystemInformation from '../components/SystemInformation'
import PieChart from '../components/PieChart'
import i18n from '../i18n'

export default {
  components: { SystemInformation, PieChart },
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

    const nextStart = computed(() => {
      if (!channelRef.value.active) return i18n.t('ChannelView.Stopped')
      if (channelRef.value.config.start === 1) return i18n.t('ChannelView.Manual')
      if (channelRef.value.config.start === 2) {
        if (channelRef.value.runtime.lastStart) {
          return 'TODO'
        } else {
          return i18n.t('ChannelView.InMinutes', { num: channelRef.value.config.interval })
        }
      }
      if (channelRef.value.config.start === 3) {
        return channelRef.value.config.time
      }
      return ''
    })

    function triggerNow () {
    }

    return {
      channelRef,
      tabRef,
      currentLanguage,
      defaultLanguageIdentifier,
      triggerNow,
      nextStart,
      pieData: { labels: ['Submitted', 'Syncked', 'Error'], datasets: [{ data: ['15', '55', '30'], backgroundColor: ['#78909C', '#388E3C', '#D32F2F'] }] }
    }
  }
}
</script>
