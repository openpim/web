<template>
  <v-container v-if="channelRef && channelReadAccess" class="pa-0">
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
                <span style="font-weight: bold;">{{$t('ChannelView.LastStartAt')}}:</span> {{ channelRef.runtime.lastStart ? dateFormat(new Date(Date.parse(channelRef.runtime.lastStart)), DATE_FORMAT) : $t('ChannelView.Never')  }}
                <span class="ml-3" style="font-weight: bold;">{{$t('ChannelView.Duration')}}:</span> {{ channelRef.runtime.duration ? channelRef.runtime.duration/1000 + ' ' + $t('ChannelView.Seconds') : ''  }}
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
            <v-btn v-if="channelReadAccess" text @click="channelSelected(channelRef)" v-text="$t('DataTable.Refresh')"></v-btn>
            <v-btn v-if="channelWriteAccess" text @click="triggerNow" v-text="$t('ChannelView.TriggerNow')"></v-btn>
            <v-btn v-if="channelWriteAccess" text @click="resetQueue" v-text="$t('ChannelView.ResetQueue')"></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-tabs v-model="tabRef">
          <v-tab>{{$t('ChannelView.Dashboard')}}</v-tab>
          <v-tab v-if="channelHasExecutions">{{$t('ChannelView.Executions')}}</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tabRef">
          <v-tab-item> <!-- Dashboard -->
              <v-row dense>
                <v-col cols="4">
                  <PieChart v-if="loadedRef" :data="pieData" :options="{onClick: function(event, item){chartClick(event, item)},title: {display: true, text: ''}}"></PieChart>
                </v-col>
                <v-col cols="8">
                  <div v-for="(status,i) in statusByCategoriesRef" :key="i">
                    <h6 :class="i > 0 ? 'mt-8' : ''">{{status.name ? status.name : $t('ChannelView.NoCategory') }}</h6>
                    <ChannelCategoryStatuses @click="categoryClick" :key="Date.now()"
                      :category="status.id"
                      :submitted="status.statuses.find(elem => elem.status === 1).count"
                      :syncked="status.statuses.find(elem => elem.status === 2).count"
                      :error="status.statuses.find(elem => elem.status === 3).count"
                      :waiting="status.statuses.find(elem => elem.status === 4).count"/>
                  </div>
                </v-col>
              </v-row>
          </v-tab-item>
          <v-tab-item v-if="channelHasExecutions"> <!-- Executions -->
            <ExecutionsTable :channel="channelRef"></ExecutionsTable>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
    <template>
      <v-row justify="center">
        <v-dialog v-model="progressDialogRef" persistent width="80%">
          <v-card>
            <v-card-title>
              <span class="headline"></span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-progress-linear v-model="progressDialogValueRef" color="primary" height="25">
                      <template v-slot:default="{ value }">
                        <strong>{{ Math.ceil(value) }}%</strong>
                      </template>
                    </v-progress-linear>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="progressDialogRef=false">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import * as channelsStore from '../store/channels'
import * as langStore from '../store/languages'
import * as searchStore from '../store/search'
import * as itemStore from '../store/item'
import { useRouter } from '../router/useRouter'
import SystemInformation from '../components/SystemInformation'
import PieChart from '../components/PieChart'
import ChannelCategoryStatuses from '../components/ChannelCategoryStatuses'
import ExecutionsTable from '../components/ExecutionsTable'
import i18n from '../i18n'
import router from '../router'
import dateFormat from 'dateformat'
import getChannelFactory from '../channels'

export default {
  components: { SystemInformation, PieChart, ChannelCategoryStatuses, ExecutionsTable },
  setup (params, context) {
    const { route } = useRouter()

    const {
      channels,
      loadAllChannels,
      getChannelStatus,
      getChannelStatusByCategories,
      hasChannelAccess,
      triggerChannel,
      updateItemChannels
    } = channelsStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      searchToOpenRef
    } = searchStore.useStore()

    const {
      searchItems
    } = itemStore.useStore()

    const channelRef = ref(null)
    const tabRef = ref(null)
    const pieData = ref({
      labels: [i18n.t('ItemView.Channels.Submitted'), i18n.t('ItemView.Channels.Synced'), i18n.t('ItemView.Channels.Error'), i18n.t('ItemView.Channels.Waiting')],
      datasets: [{ data: [5, 5, 5, 5], backgroundColor: ['#78909C', '#66BB6A', '#EF5350', '#3F51B5'] }]
    })
    const loadedRef = ref(false)

    const submittedRef = ref(0)
    const synckedRef = ref(0)
    const errorRef = ref(0)

    const statusByCategoriesRef = ref([])

    const progressDialogRef = ref(null)
    const progressDialogValueRef = ref(0)

    function channelSelected (selected) {
      channelRef.value = selected
      if (selected) {
        loadedRef.value = false
        getChannelStatus(selected.internalId).then(records => {
          const data = [0, 0, 0, 0]
          submittedRef.value = 0
          synckedRef.value = 0
          errorRef.value = 0
          records.forEach(elem => {
            if (elem.status === 1) {
              data[0] = elem.count
              submittedRef.value = elem.count
            }
            if (elem.status === 2) {
              data[1] = elem.count
              synckedRef.value = elem.count
            }
            if (elem.status === 3) {
              data[2] = elem.count
              errorRef.value = elem.count
            }
            if (elem.status === 4) {
              data[3] = elem.count
              errorRef.value = elem.count
            }
          })
          pieData.value.datasets[0].data = data
          loadedRef.value = true
        })
        getChannelStatusByCategories(selected.internalId).then(records => {
          statusByCategoriesRef.value = records.sort((a, b) => {
            if (!a.id) return -1
            if (!b.id) return 1
            return 0
          })
        })
      }
    }

    function chartClick (event, item) {
      const status = item[0]._index + 1
      const where = { channels: {} }
      where.channels[channelRef.value.identifier] = { status: status }
      searchToOpenRef.value = { whereClause: where, extended: true }
      router.push('/search/')
    }

    function categoryClick (status, category) {
      const where = { channels: {} }
      where.channels[channelRef.value.identifier] = { status: status, category: category }
      searchToOpenRef.value = { whereClause: where, extended: true }
      router.push('/search/')
    }

    const channelHasExecutions = computed(() => {
      return channelRef.value ? getChannelFactory(channelRef.value.type).hasExecutions : false
    })

    const channelReadAccess = computed(() => {
      return channelRef.value ? hasChannelAccess(channelRef.value, false) : false
    })

    const channelWriteAccess = computed(() => {
      return channelRef.value ? hasChannelAccess(channelRef.value, true) : false
    })

    watch(route, (current, previous) => {
      if (current && current.params && current.params.id) {
        channelSelected(channels.find(elem => elem.identifier === current.params.id))
      } else {
        channelRef.value = null
      }
    })

    onMounted(() => {
      loadAllChannels().then(() => {
        if (route.value && route.value.params && route.value.params.id) {
          channelSelected(channels.find(elem => elem.identifier === route.value.params.id))
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
      triggerChannel(channelRef.value.internalId)
    }

    async function resetQueue () {
      if (confirm(t('ChannelView.ConfirmReset'))) {
        const where = { channels: {} }
        where.channels[channelRef.value.identifier] = { status: 1 }
        // let's use only one page with 10000 items for now to make it simple
        const res = await searchItems(where, { page: 1, itemsPerPage: 10000, sortBy: ['id'], sortDesc: [false] })
        progressDialogRef.value = true
        for (let i = 0; i < res.rows.length; i++) {
          const item = res.rows[i]
          const channels = {}
          channels[channelRef.value.identifier] = { is_deleted: true }
          await updateItemChannels(item, channels)
          progressDialogValueRef.value = i * 100 / res.rows.length
        }
        progressDialogRef.value = false
        channelSelected(channelRef.value)
      }
    }

    return {
      channelRef,
      tabRef,
      currentLanguage,
      defaultLanguageIdentifier,
      triggerNow,
      resetQueue,
      progressDialogRef,
      progressDialogValueRef,
      nextStart,
      pieData,
      loadedRef,
      submittedRef,
      synckedRef,
      errorRef,
      statusByCategoriesRef,
      chartClick,
      categoryClick,
      channelReadAccess,
      channelWriteAccess,
      channelSelected,
      channelHasExecutions,
      dateFormat,
      DATE_FORMAT: process.env.VUE_APP_DATE_FORMAT
    }
  }
}
</script>
