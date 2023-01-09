<template>
  <v-app>
    <v-layout>
    <ErrorBox />
    <AppHeader :export="isExportSearch" :drawer="drawer" @on-show-user="handleUserDialogShow" @on-trigger-drawer="handleDrawerTrigger"/>

    <v-navigation-drawer :width="drawerWidth" v-model="drawer" ref="drawerRef" :clipped="display.lgAndUp" app v-if="currentUserRef.tenantId !== '0'">
      <router-view name="menu"></router-view>

      <div class="mt-2 mb-1 nav" v-if="!isExportSearch && activeBottom">
<!--      <div grow height="50" class="mt-2 mb-1" v-model="activeBottom" v-if="!isExportSearch">-->
        <v-btn to="/" v-if="hasDashboards" class="btn-nav" variant="text">
          <v-icon>mdi-sitemap</v-icon>
          <span>{{ $t('Main.Dashboards') }}</span>
        </v-btn>
        <v-btn to="/" class="btn-nav" variant="text">
          <v-icon>mdi-home</v-icon>
          <span>{{ $t('Main.Work') }}</span>
        </v-btn>
        <v-btn to="/search" v-if="hasSearchAccess" class="btn-nav" variant="text">
          <v-icon>mdi-magnify</v-icon>
          <span>{{ $t('Main.Search') }}</span>
        </v-btn>
        <v-btn to="/channels" v-if="hasChannelsRef" class="btn-nav" variant="text">
          <v-icon>mdi-access-point</v-icon>
          <span>{{ $t('Main.Channels') }}</span>
        </v-btn>
        <v-btn to="/config/home" v-if="hasConfigRef" class="btn-nav" variant="text">
          <v-icon>mdi-cog-outline</v-icon>
          <span>{{ $t('Main.Settings') }}</span>
        </v-btn>
      </div>
      <a class="copyright-link d-flex flex-row-reverse mr-2" href="https://openpim.org" target="_blank">&copy; OpenPIM</a>
      <Resizer :left="drawerWidth" @on-resize="handleResize"/>
    </v-navigation-drawer>
    <v-navigation-drawer v-model="drawerRight" absolute right clipped width="45%">

      <v-data-table @update:options="activeOptionsUpdate"
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
      dense
      class="mt-14 ml-5 mr-5 mb-0">
      <template v-slot:item="{ item, headers }">
        <tr class="zebra">
          <td v-for="(header, i) in headers" :key="i" class="truncate p-1">
            <template v-if="header.value === 'createdAt'">{{dateFormat(item[header.value], DATE_FORMAT)}}</template>
            <template v-if="header.value == 'title' || header.value == 'status'">{{item[header.value]}}</template>
            <template v-if="header.value === 'log'">
              <v-row><v-col cols="7">{{item.log.length >  7 ? item.log.substring(0, 7) + '...' : item.log}}</v-col>
              <v-col cols="5"><v-tooltip top v-if="item.log.length > 20">
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on" @click="showLog(item.log)"><v-icon>mdi-message-outline</v-icon></v-btn>
                </template>
                <span>{{ $t('ExecutionsTable.ViewDetails') }}</span>
              </v-tooltip></v-col></v-row>
            </template>
            <template v-if="header.value === 'storagePath'">
              <a v-if="item.storagePath" :href="damUrl + 'asset-process/' + item.id + '?token=' + token">{{ item.fileName ? item.fileName : 'file.bin' }}</a>
            </template>
          </td>
        </tr>
      </template>
      </v-data-table>
      <v-row class="justify-end"><v-btn text @click="activeOptionsUpdate(activeOptionsRef);finishedOptionsUpdate(finishedOptionsRef)" class="mr-5" v-text="$t('DataTable.Refresh')"></v-btn></v-row>

      <v-data-table @update:options="finishedOptionsUpdate"
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
                    dense
                    class="mt-2 ml-5 mr-5 mb-0">
        <template v-slot:item="{ item, headers }">
          <tr class="zebra">
            <td v-for="(header, i) in headers" :key="i" class="truncate p-1">
              <template v-if="header.value === 'createdAt'">{{dateFormat(item[header.value], DATE_FORMAT)}}</template>
              <template v-if="header.value === 'finishTime'">{{item.finishTime ? dateFormat(item.finishTime, DATE_FORMAT) : ''}}</template>
              <template v-if="header.value == 'title' || header.value == 'status'">{{item[header.value]}}</template>
              <template v-if="header.value === 'log'">
                <v-row><v-col cols="7">{{item.log.length >  7 ? item.log.substring(0, 7) + '...' : item.log}}</v-col>
                  <v-col cols="5"><v-tooltip top v-if="item.log.length > 20">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="showLog(item.log)"><v-icon>mdi-message-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('ExecutionsTable.ViewDetails') }}</span>
                  </v-tooltip></v-col></v-row>
              </template>
              <template v-if="header.value === 'storagePath'">
                <a v-if="item.storagePath" :href="damUrl + 'asset-process/' + item.id + '?token=' + token">{{ item.fileName ? item.fileName : 'file.bin' }}</a>
              </template>
            </td>
          </tr>
        </template>
      </v-data-table>

    </v-navigation-drawer>
    <v-main>
      <v-container class="fill-height" fluid>
        <router-view :export="isExportSearch"></router-view>
      </v-container>
    </v-main>
    <UserDialog :show="userDialogRef"  @on-hide="handleUserDialogHide"/>
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
    </v-layout>
  </v-app>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useDisplay } from 'vuetify'

import ErrorBox from '../components/ErrorBox'
import AppHeader from '../components/AppHeader.vue'
import Resizer from '../components/common/Resizer'
import UserDialog from '../components/common/UserDialog'
import * as userStore from '../store/users'
import * as channelsStore from '../store/channels'
import * as rolesStore from '../store/roles'
import * as dashStore from '../store/dashboards'
import * as procStore from '../store/processes'
import i18n from '../i18n'
import eventBus from '../eventBus'
import dateFormat from 'dateformat'

export default {
  components: { AppHeader, ErrorBox, Resizer, UserDialog },
  props: {
    export: {
      type: Boolean,
      required: true
    }
  },
  setup (props) {
    const {
      loadAllRoles
    } = rolesStore.useStore()

    const {
      currentUserRef,
      canViewConfig,
      hasAccess
    } = userStore.useStore()

    const {
      loadAllChannels
    } = channelsStore.useStore()

    const {
      loadAllDashboards,
      getDashboardsForCurrentUser
    } = dashStore.useStore()

    const {
      loadActiveProcesses,
      loadFinishedProcesses
    } = procStore.useStore()

    const drawer = ref(null)
    const drawerRight = ref(false)
    const drawerRef = ref(null)
    const defWidth = localStorage.getItem('drawerWidth') || '250'
    const drawerWidth = ref(parseInt(defWidth))
    const activeBottom = ref(1)

    const userDialogRef = ref(false)

    const hasConfigRef = ref(false)
    const hasChannelsRef = ref(false)

    const hasSearchAccess = ref(false)

    const hasDashboards = ref(false)

    const activeProcesses = ref({ count: 0, rows: [] })
    const activeOptionsRef = ref({ page: 1, itemsPerPage: 5, sortBy: ['createdAt'], sortDesc: [true] })
    const activeLoadingRef = ref(false)
    const logDialogRef = ref(null)
    const logRef = ref(null)
    const finishedProcesses = ref({ count: 0, rows: [] })
    const finishedOptionsRef = ref({ page: 1, itemsPerPage: 5, sortBy: ['createdAt'], sortDesc: [true] })
    const finishedLoadingRef = ref(false)

    const handleResize = (size) => {
      drawerWidth.value = size
      localStorage.setItem('drawerWidth', size)
    }

    const handleUserDialogHide = () => {
      userDialogRef.value = false
    }

    const handleUserDialogShow = () => {
      userDialogRef.value = true
    }

    const handleDrawerTrigger = (val) => {
      drawer.value = val
    }

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
            ? i18n.t('Process.Finished2', { name: lastProcess.title, href: damUrl + 'asset-process/' + lastProcess.id + '?token=' + token, file: lastProcess.fileName || 'file.bin' })
            : i18n.t('Process.Finished1', { name: lastProcess.title })
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
      loadAllRoles().then(() => {
        timer = setInterval(checkFinishedProcesses, 60000)
        loadAllDashboards().then(() => {
          hasDashboards.value = getDashboardsForCurrentUser().length > 0
        })
        hasSearchAccess.value = hasAccess('search') || hasAccess('searchRelations')
        if (currentUserRef.value.tenantId !== '0') {
          loadAllChannels().then(channels => {
            if (channels && channels.length > 0) hasChannelsRef.value = true
          })
          hasConfigRef.value = canViewConfig('types') || canViewConfig('attributes') || canViewConfig('relations') || canViewConfig('users') || canViewConfig('roles') || canViewConfig('languages') || canViewConfig('lovs') || canViewConfig('actions') || canViewConfig('dashboards') || canViewConfig('channels')
        }
      })
    })

    const display = ref(useDisplay())
      eventBus.on('drawer_triggered_right', val => {
        drawerRight.value = val
      })


    onUnmounted(() => {
      clearInterval(timer)
    })

    return {
      drawer,
      drawerRight,
      drawerRef,
      drawerWidth,
      activeBottom,
      userDialogRef,
      currentUserRef,
      hasConfigRef,
      hasChannelsRef,
      isExportSearch: props.export,
      hasSearchAccess,
      hasDashboards,
      activeProcesses,
      activeOptionsRef,
      activeLoadingRef,
      activeOptionsUpdate,
      activeHeaders: [
        { text: i18n.t('Process.Header.Title'), value: 'title', width: '40%' },
        { text: i18n.t('Process.Header.Status'), value: 'status', width: '15%' },
        { text: i18n.t('Process.Header.Log'), value: 'log', sortable: false, width: '15%' },
        { text: i18n.t('Process.Header.File'), value: 'storagePath', width: '15%' },
        { text: i18n.t('Process.Header.StartedAt'), value: 'createdAt', width: '15%' }
      ],
      finishedProcesses,
      finishedOptionsRef,
      finishedLoadingRef,
      finishedOptionsUpdate,
      finishedHeaders: [
        { text: i18n.t('Process.Header.Title'), value: 'title', width: '25%' },
        { text: i18n.t('Process.Header.Status'), value: 'status', width: '15%' },
        { text: i18n.t('Process.Header.Log'), value: 'log', sortable: false, width: '15%' },
        { text: i18n.t('Process.Header.File'), value: 'storagePath', width: '15%' },
        { text: i18n.t('Process.Header.StartedAt'), value: 'createdAt', width: '15%' },
        { text: i18n.t('Process.Header.FinishedAt'), value: 'finishTime', width: '15%' }
      ],
      nameRules: [
        v => !!v || i18n.t('Config.Users.Error.NameRequired')
      ],
      display,
      handleResize,
      handleUserDialogHide,
      handleUserDialogShow,
      handleDrawerTrigger,
      dateFormat,
      DATE_FORMAT: process.env.VUE_APP_DATE_FORMAT,
      logDialogRef,
      logRef,
      showLog,
      damUrl: damUrl,
      token: token
    }
  }
}
</script>
<style>
.copyright-link, .copyright-link:visited, .copyright-link:hover, .copyright-link:active {
  color: gray;
  text-align: center;
  font-size:x-small;
}

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

.nav {
  box-shadow: 0 2px 4px -1px rgb(0 0 0 / 20%), 0 4px 5px 0 rgb(0 0 0 / 14%), 0 1px 10px 0 rgb(0 0 0 / 12%);
  padding: 4px;
}

.btn-nav {
  border-radius: 0;
}

.btn-nav .v-btn__content {
  flex-direction: column;
}

.btn-nav .v-btn__content span{
  text-transform: initial;
  font-size: 0.75rem;
}

</style>
