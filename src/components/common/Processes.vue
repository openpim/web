<template>
  <div>
     <v-data-table
      @update:options="activeOptionsUpdate"
      :caption="$t('Process.Table.ActiveCaption')"
      :options="activeOptionsRef"
      :server-items-length="activeProcesses.count"
      :loading="activeLoadingRef"
      :headers="activeHeaders"
      :items="activeProcesses.rows"
      :footer-props="{itemsPerPageText: $t('Process.Table.items-per-page-text'), itemsPerPageAllText: $t('Process.Table.items-per-page-all-text'), pageText: $t('Process.Table.page-text')}"
      :loading-text="$t('Process.Table.loading-text')"
      :no-data-text="$t('Process.Table.no-data-text')"
      :no-results-text="$t('Process.Table.no-results-text')"
      density="compact"
      class="mt-14 ml-5 mr-5 mb-5"
    >
      <template v-slot:item="{ item, headers }">
        <tr class="zebra">
          <td v-for="header in headers" :key="header.key" class="truncate p-1">
            <template v-if="header.key === 'createdAt'">{{dateFormat(item[header.key], DATE_FORMAT)}}</template>
            <template v-if="header.key === 'title' || header.key === 'status'">{{item[header.key]}}</template>
            <template v-if="header.key === 'log'">
              <v-row>
                <v-col cols="7">{{item.log.length >  7 ? item.log.substring(0, 7) + '...' : item.log}}</v-col>
                <v-col cols="5">
                  <v-tooltip top v-if="item.log.length > 20">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="showLog(item.log)"><v-icon>mdi-message-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('ExecutionsTable.ViewDetails') }}</span>
                  </v-tooltip>
                </v-col>
              </v-row>
            </template>
            <template v-if="header.key === 'storagePath'">
              <a v-if="item.storagePath" :href="damUrl + 'asset-process/' + item.id + '?token=' + token">{{ item.fileName ? item.fileName : 'file.bin' }}</a>
            </template>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-row class="justify-end">
      <v-btn text @click="activeOptionsUpdate(activeOptionsRef);finishedOptionsUpdate(finishedOptionsRef)" class="mr-5">
        {{$t('DataTable.Refresh')}}
      </v-btn>
    </v-row>

    <v-data-table
      @update:options="finishedOptionsUpdate"
      :caption="$t('Process.Table.FinishedCaption')"
      :options="finishedOptionsRef"
      :server-items-length="finishedProcesses.count"
      :loading="finishedLoadingRef"
      :headers="finishedHeaders"
      :items="finishedProcesses.rows"
      :footer-props="{itemsPerPageText: $t('Process.Table.items-per-page-text'), itemsPerPageAllText: $t('Process.Table.items-per-page-all-text'), pageText: $t('Process.Table.page-text')}"
      :loading-text="$t('Process.Table.loading-text')"
      :no-data-text="$t('Process.Table.no-data-text')"
      :no-results-text="$t('Process.Table.no-results-text')"
      density="compact"
      class="mt-15 ml-5 mr-5 mb-0"
    >
      <template v-slot:item="{ item, headers }">
        <tr class="zebra">
          <td v-for="(header, i) in headers" :key="i" class="truncate p-1">
            <template v-if="header.value === 'createdAt'">{{dateFormat(item[header.value], DATE_FORMAT)}}</template>
            <template v-if="header.value === 'finishTime'">{{item.finishTime ? dateFormat(item.finishTime, DATE_FORMAT) : ''}}</template>
            <template v-if="header.value == 'title' || header.value == 'status'">{{item[header.value]}}</template>
            <template v-if="header.value === 'log'">
              <v-row>
                <v-col cols="7">{{item.log.length >  7 ? item.log.substring(0, 7) + '...' : item.log}}</v-col>
                <v-col cols="5">
                  <v-tooltip top v-if="item.log.length > 20">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="showLog(item.log)"><v-icon>mdi-message-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('ExecutionsTable.ViewDetails') }}</span>
                  </v-tooltip>
                </v-col>
              </v-row>
            </template>
            <template v-if="header.value === 'storagePath'">
              <a v-if="item.storagePath" :href="damUrl + 'asset-process/' + item.id + '?token=' + token">
                {{ item.fileName ? item.fileName : 'file.bin' }}
              </a>
            </template>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-dialog v-model="logDialogRef" persistent width="90%">
      <v-card>
        <v-card-text>
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
          <v-btn color="blue darken-1" text @click="logDialogRef = false">{{ $t('Close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import dateFormat from 'dateformat'

import * as errorStore from '../../store/error'
import * as procStore from '../../store/processes'

export default {
  props: {

  },
  setup (props) {
    const { t } = useI18n()

    const {
      showInfo
    } = errorStore.useStore()

    const {
      loadActiveProcesses,
      loadFinishedProcesses
    } = procStore.useStore()

    const activeProcesses = ref({ count: 0, rows: [] })
    const activeOptionsRef = ref({ page: 1, itemsPerPage: 5, sortBy: ['createdAt'], sortDesc: [true] })
    const activeLoadingRef = ref(false)
    const logDialogRef = ref(null)
    const logRef = ref(null)
    const finishedProcesses = ref({ count: 0, rows: [] })
    const finishedOptionsRef = ref({ page: 1, itemsPerPage: 5, sortBy: ['createdAt'], sortDesc: [true] })
    const finishedLoadingRef = ref(false)

    async function activeOptionsUpdate (options) {
      activeLoadingRef.value = true
      const data = await loadActiveProcesses(options)
      activeProcesses.value = data
      activeLoadingRef.value = false
    }

    async function finishedOptionsUpdate (options) {
      finishedLoadingRef.value = true
      const data = await loadFinishedProcesses(options)
      finishedProcesses.value = data
      finishedLoadingRef.value = false
    }

    function showLog (log) {
      logRef.value = log
      logDialogRef.value = true
    }

    const damUrl = window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/'
    const token = localStorage.getItem('token')

    let lastProcess
    async function checkFinishedProcesses () {
      const data = await loadFinishedProcesses({ page: 1, itemsPerPage: 1, sortBy: ['id'], sortDesc: [false] })
      if (data.count > 0) {
        if (lastProcess === undefined) {
          lastProcess = data.rows[0]
        } else if (lastProcess === null || lastProcess.id !== data.rows[0].id) {
          // new finished process found
          lastProcess = data.rows[0]
          const msg = lastProcess.storagePath
            ? t('Process.Finished2', { name: lastProcess.title, href: damUrl + 'asset-process/' + lastProcess.id + '?token=' + token, file: lastProcess.fileName || 'file.bin' })
            : t('Process.Finished1', { name: lastProcess.title })
          showInfo(msg)
          activeOptionsUpdate(activeOptionsRef.value)
          finishedOptionsUpdate(finishedOptionsRef.value)
        }
      } else if (lastProcess === undefined) {
        lastProcess = null
      }
    }

    let timer
    onMounted(() => {
      timer = setInterval(checkFinishedProcesses, 60000)
    })

    onUnmounted(() => {
      clearInterval(timer)
    })

    return {
      activeProcesses,
      activeOptionsRef,
      activeLoadingRef,
      activeOptionsUpdate,
      activeHeaders: [
        { title: t('Process.Header.Title'), key: 'title', width: '40%' },
        { title: t('Process.Header.Status'), key: 'status', width: '15%' },
        { title: t('Process.Header.Log'), key: 'log', sortable: false, width: '15%' },
        { title: t('Process.Header.File'), key: 'storagePath', width: '15%' },
        { title: t('Process.Header.StartedAt'), key: 'createdAt', width: '15%' }
      ],
      finishedProcesses,
      finishedOptionsRef,
      finishedLoadingRef,
      finishedOptionsUpdate,
      finishedHeaders: [
        { title: t('Process.Header.Title'), key: 'title', width: '25%' },
        { title: t('Process.Header.Status'), key: 'status', width: '15%' },
        { title: t('Process.Header.Log'), key: 'log', sortable: false, width: '15%' },
        { title: t('Process.Header.File'), key: 'storagePath', width: '15%' },
        { title: t('Process.Header.StartedAt'), key: 'createdAt', width: '15%' },
        { title: t('Process.Header.FinishedAt'), key: 'finishTime', width: '15%' }
      ],
      dateFormat,
      DATE_FORMAT: process.env.VUE_APP_DATE_FORMAT,
      logDialogRef,
      logRef,
      showLog,
      damUrl,
      token,
      showInfo
    }
  }
}
</script>
<style>
  .truncate {
    max-width: 1px;
    overflow: hidden;
    border: thin solid rgba(0, 0, 0, 0.12);
  }

  .truncate > span {
    white-space: pre-wrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: -webkit-box;
    /* number of visible lines */
    -webkit-line-clamp: 10;
    -webkit-box-orient: vertical;
  }

  .zebra:nth-of-type(even) {
    background-color: #FCFCFC;
  }
</style>
