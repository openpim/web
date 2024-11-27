<template>
<div class="ml-3 mr-3">
  <v-data-table @update:options="optionsUpdate"
      :options.sync="optionsRef"
      :server-items-length="totalItemsRef"
      :loading="loadingRef"
      :headers="headersRef"
      :items="itemsRef"
      :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50] }"
      class="elevation-1">
    <template v-slot:header.log="{ header }">
        <td>
          <v-row no-gutters>
            <v-col cols="11">
              <div class="mt-3">{{ header.text }}</div>
            </v-col>
            <v-col cols="1">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on" @click="optionsUpdate(optionsRef)"><v-icon>mdi-refresh</v-icon></v-btn>
                </template>
                <span>{{ $t('DataTable.Refresh') }}</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </td>
    </template>
    <template v-slot:item.startTime="{ item, header }">
        <td>{{ dateFormat(new Date(Date.parse(item[header.value])), DATE_FORMAT) }}</td>
    </template>
    <template v-slot:item.finishTime="{ item, header }">
        <td>{{ item[header.value] ? dateFormat(new Date(Date.parse(item[header.value])), DATE_FORMAT) : '' }}</td>
    </template>
    <template v-slot:item.status="{ item }">
        <td>
          <v-chip class="ma-2" :color="item.status === 1 ? '' : item.status === 2 ? '#66BB6A' : '#EF5350'" :text-color="item.status === 1 ? 'black' : 'white'">
              {{ item.status === 1 ? $t('ExecutionsTable.Status.Running') : item.status === 2 ? $t('ExecutionsTable.Status.Finished') : $t('ExecutionsTable.Status.Error') }}</v-chip>
        </td>
    </template>
    <template v-slot:item.file="{ item }">
        <td>
          <a v-if="item.storagePath" :href="damUrl + 'asset-channel/' + item.id + '?token=' + token">{{ channel.config.file ? channel.config.file : 'application/octet-stream' }}</a>
        </td>
    </template>
    <template v-slot:item.log="{ item }">
        <td>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" @click="showLog(item)"><v-icon>mdi-message-outline</v-icon></v-btn>
            </template>
            <span>{{ $t('ExecutionsTable.ViewDetails') }}</span>
          </v-tooltip>
        </td>
    </template>
  </v-data-table>
    <template>
      <v-row justify="center">
        <v-dialog v-model="dialogRef" persistent width="90%">
          <v-card>
            <div class="text-center" v-if="!logRef" style="height: 200px; display: flex; align-items: center; justify-content: center;">
              <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
            </div>
            <v-card-text v-else>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-textarea :rows="15" :readonly="true" v-model="logRef"></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text v-if="logRef" @click="dialogRef = false; logRef = null">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
</div>
</template>
<script>
import * as langStore from '../store/languages'
import * as errorStore from '../store/error'
import * as channelsStore from '../store/channels'
import dateFormat from 'dateformat'
import i18n from '../i18n'
import { ref, onMounted, watch } from '@vue/composition-api'

export default {
  props: {
    channel: {
      required: true
    }
  },
  setup (props, { emit, root }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadExecutions,
      loadExecutionById
    } = channelsStore.useStore()

    const { showError } = errorStore.useStore()

    const itemsRef = ref([])
    const totalItemsRef = ref(0)
    const optionsRef = ref({ page: 1, itemsPerPage: 10, sortBy: ['startTime'], sortDesc: [true] })
    const loadingRef = ref(false)
    const headersRef = ref([
      { identifier: 'startTime', text: i18n.t('ExecutionsTable.StartTime'), align: 'start', sortable: true, filterable: true, value: 'startTime' },
      { identifier: 'finishTime', text: i18n.t('ExecutionsTable.EndTime'), align: 'start', sortable: true, filterable: true, value: 'finishTime' },
      { identifier: 'status', text: i18n.t('ExecutionsTable.Status'), align: 'start', sortable: true, filterable: true, value: 'status' },
      { identifier: 'file', text: i18n.t('ExecutionsTable.File'), align: 'start', sortable: false, filterable: false, value: 'file' },
      { identifier: 'log', text: i18n.t('ExecutionsTable.Log'), align: 'start', sortable: false, filterable: false, value: 'log' }
    ])
    const dialogRef = ref(false)
    const logRef = ref('')

    async function showLog (item) {
      try {
        dialogRef.value = true
        const execution = await loadExecutionById(item.id)
        logRef.value = execution?.log || 'Лог отсутствует'
      } catch (error) {
        logRef.value = 'Ошибка загрузки логов'
        console.error('Ошибка загрузки логов:', error)
      }
    }

    watch(() => props.channel, (newItem, oldItem) => {
      optionsRef.value.page = 1
      optionsRef.value.log = false
      totalItemsRef.value = 0
      optionsUpdate(optionsRef.value)
    })

    function optionsUpdate (options) {
      if (!props.channel) return

      loadingRef.value = true
      loadExecutions(props.channel.internalId, options).then(data => {
        if (!data) return
        itemsRef.value = data.rows
        totalItemsRef.value = data.count
        loadingRef.value = false
      }).catch((error) => {
        showError(error)
        loadingRef.value = false
      })
    }

    onMounted(() => {
      optionsUpdate(optionsRef.value)
    })

    return {
      itemsRef,
      totalItemsRef,
      headersRef,
      currentLanguage,
      defaultLanguageIdentifier,
      optionsUpdate,
      optionsRef,
      loadingRef,
      dialogRef,
      logRef,
      showLog,
      dateFormat,
      DATE_FORMAT: process.env.VUE_APP_DATE_FORMAT,
      damUrl: window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/',
      token: localStorage.getItem('token')
    }
  }
}
</script>
