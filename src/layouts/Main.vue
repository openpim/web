<template>
  <div>
    <ErrorBox />
    <v-navigation-drawer :width="drawerWidth" v-model="drawer" ref="drawerRef" :clipped="$vuetify.breakpoint.lgAndUp" app v-if="currentUserRef.tenantId !== '0'">
      <router-view name="menu"></router-view>

      <v-bottom-navigation grow height="55" class="mt-2 mb-1" v-model="activeBottom" v-if="!isExportSearch">
        <v-btn to="/" v-if="hasDashboards">
            <span>{{ $t('Main.Dashboards') }}</span>
            <v-icon>mdi-sitemap</v-icon>
        </v-btn>
        <v-btn to="/">
            <span>{{ $t('Main.Work') }}</span>
            <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-btn to="/search" v-if="hasSearchAccess">
            <span>{{ $t('Main.Search') }}</span>
            <v-icon>mdi-magnify</v-icon>
        </v-btn>
        <v-btn to="/collections">
            <span>{{ $t('Main.Collections') }}</span>
            <v-icon>mdi-bookmark-outline</v-icon>
        </v-btn>
        <v-btn to="/imports" v-if="hasImportsAccess && (importConfigCSVLicenceExist || importConfigYMLLicenceExist)">
            <span>{{ $t('Main.Imports') }}</span>
            <v-icon>mdi-file-outline</v-icon>
        </v-btn>
        <v-btn to="/channels" v-if="hasChannelsRef">
            <span>{{ $t('Main.Channels') }}</span>
            <v-icon>mdi-access-point</v-icon>
        </v-btn>
        <v-btn to="/config/home" v-if="hasConfigRef">
            <span>{{ $t('Main.Settings') }}</span>
            <v-icon>mdi-cog-outline</v-icon>
        </v-btn>
      </v-bottom-navigation>
      <a class="copyright-link d-flex flex-row-reverse mr-2" href="https://openpim.org" target="_blank">&copy; OpenPIM</a>
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
              <v-row>
              <v-col><v-tooltip top v-if="item">
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on" @click="showLog(item)"><v-icon>mdi-message-outline</v-icon></v-btn>
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
              <v-row>
              <v-col><v-tooltip top v-if="item">
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on" @click="showLog(item)"><v-icon>mdi-message-outline</v-icon></v-btn>
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

    <AppHeader :export="isExportSearch" :drawer="drawer" :drawerRight="drawerRight"/>

    <v-content>
      <v-container class="fill-height pa-2 ma-0 width:100%" fluid>
        <router-view :export="isExportSearch"></router-view>
      </v-container>
    </v-content>
    <v-dialog v-model="userDialogRef" persistent max-width="600px">
      <v-card v-if="currentUserRef">
        <v-card-title>
          <span class="headline">{{ $t('User.Details') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-form ref="formRef" lazy-validation>
                  <v-text-field v-model="currentUserRef.login" disabled :label="$t('Config.Users.Login')" required></v-text-field>
                  <v-text-field v-model="currentUserRef.name" :label="$t('Config.Users.Name')" :rules="nameRules" required></v-text-field>
                  <v-text-field v-model="currentUserRef.email" :label="$t('Config.Users.Email')" required></v-text-field>

                  <template v-if="currentUserRef.external">
                    {{$t('Config.Users.External')}}
                  </template>
                  <template v-else>
                    <v-text-field v-if="currentUserRef.login !== 'demo'" type="password" :disabled="!getUserOption('passwordChange', true)" :error-messages="passwordErrors" v-model="currentUserRef.password1" :label="$t('Config.Users.Password1')" required></v-text-field>
                    <v-text-field v-if="currentUserRef.login !== 'demo'" type="password" :disabled="!getUserOption('passwordChange', true)" :error-messages="passwordErrors" v-model="currentUserRef.password2" :label="$t('Config.Users.Password2')" required></v-text-field>
                  </template>
                  <v-row>
                    <v-col cols="12" class="pa-0" v-if="isUserAdmin">
                      <v-expansion-panels flat focusable>
                        <v-expansion-panel>
                          <v-expansion-panel-header>{{ $t('User.Additionally') }}</v-expansion-panel-header>
                          <v-expansion-panel-content>
                            <v-container class="pa-0">
                              <v-row no-gutters>
                                <v-checkbox class="pt-4 pb-0 pr-5 pl-5" v-model="currentUserRef.startClean" :label="$t('User.StartTheCleaningProcedure')" required></v-checkbox>
                              </v-row>
                              <v-row no-gutters>
                                <v-text-field class="pt-4 pb-0 pr-5 pl-5" v-model="currentUserRef.cron" :label="$t('User.CronPattern')" :placeholder="$t('Config.Channels.Cron')" required></v-text-field>
                              </v-row>
                              <v-row no-gutters>
                                <v-text-field class="pt-4 pb-0 pr-5 pl-5" v-model="currentUserRef.daysToSaveDeleted" :label="$t('User.NumberOfDaysToSaveDeletedData')" type="number" required></v-text-field>
                              </v-row>
                            </v-container>
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </v-col>
                  </v-row>
                </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary darken-1" text @click="logout">{{ $t('Config.Users.Exit') }}</v-btn>
          <v-btn v-if="isUserAdmin" color="primary darken-1" text @click="reload">{{ $t('Config.Users.ReloadModel') }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-1" text @click="userDialogRef = false">{{ $t('Close') }}</v-btn>
          <v-btn color="primary darken-1" text @click="save" v-if="currentUserRef.login !== 'demo'">{{ $t('Save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="logDialogRef" persistent width="90%">
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
          <v-btn color="primary darken-1" text v-if="logRef" @click="logDialogRef = false; logRef = null">{{ $t('Close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from '@vue/composition-api'
import ErrorBox from '../components/ErrorBox'
import AppHeader from '../components/AppHeader.vue'
import * as userStore from '../store/users'
import * as errorStore from '../store/error'
import * as channelsStore from '../store/channels'
import * as rolesStore from '../store/roles'
import * as dashStore from '../store/dashboards'
import * as procStore from '../store/processes'
import i18n from '../i18n'
import router from '../router'
import eventBus from '../eventBus'
import dateFormat from 'dateformat'

export default {
  components: { AppHeader, ErrorBox },
  props: {
    export: {
      type: Boolean,
      required: true
    }
  },
  setup (props) {
    const {
      showInfo
    } = errorStore.useStore()

    const {
      loadAllRoles
    } = rolesStore.useStore()

    const {
      currentUserRef,
      saveUser,
      canViewConfig,
      reloadModel,
      isAdmin,
      hasAccess
    } = userStore.useStore()

    const {
      channelTypes,
      loadAllChannelTypes,
      loadAllChannels
    } = channelsStore.useStore()

    const {
      loadAllDashboards,
      getDashboardsForCurrentUser
    } = dashStore.useStore()

    const {
      loadActiveProcesses,
      loadFinishedProcesses,
      loadProcessesByFilter
    } = procStore.useStore()

    const drawer = ref(null)
    const drawerRight = ref(false)
    const drawerRef = ref(null)
    const drawerWidth = ref(localStorage.getItem('drawerWidth') || '25%')
    const activeBottom = ref(0)
    const userDialogRef = ref(null)
    const passwordErrors = ref([])
    const formRef = ref(null)
    const hasConfigRef = ref(false)
    const hasChannelsRef = ref(false)

    const hasSearchAccess = ref(false)
    const hasImportsAccess = ref(false)
    const importConfigCSVLicenceExist = ref(false)
    const importConfigYMLLicenceExist = ref(false)
    const isUserAdmin = ref(false)

    const hasDashboards = ref(false)

    const activeProcesses = ref({ count: 0, rows: [] })
    const activeOptionsRef = ref({ page: 1, itemsPerPage: 5, sortBy: ['createdAt'], sortDesc: [true] })
    const activeLoadingRef = ref(false)
    const logDialogRef = ref(null)
    const logRef = ref(null)
    const finishedProcesses = ref({ count: 0, rows: [] })
    const finishedOptionsRef = ref({ page: 1, itemsPerPage: 5, sortBy: ['createdAt'], sortDesc: [true] })
    const finishedLoadingRef = ref(false)

    function reload () {
      reloadModel().then(() => logout())
    }

    function logout () {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push(props.export ? '/export_login' : '/login')
      location.reload()
    }

    function save () {
      if (formRef.value.validate()) {
        if ((currentUserRef.value.password1 || currentUserRef.value.password2) && currentUserRef.value.password1 !== currentUserRef.value.password2) {
          passwordErrors.value = [i18n.t('Config.Users.Error.PasswordsNotEquals')]
          return
        }
        userDialogRef.value = false
        passwordErrors.value = []
        currentUserRef.value.props = { cron: currentUserRef.value.cron || '', daysToSaveDeleted: currentUserRef.value.daysToSaveDeleted ? parseInt(currentUserRef.value.daysToSaveDeleted) : -1, startClean: currentUserRef.value.startClean || false }
        saveUser(currentUserRef.value).then(() => {
          localStorage.setItem('user', JSON.stringify(currentUserRef.value))
          currentUserRef.value.password1 = ''
          currentUserRef.value.password2 = ''
          showInfo(i18n.t('Saved'))
        })
      }
    }

    function setBorderWidth () {
      if (!drawerRef.value) return
      const i = drawerRef.value.$el.querySelector(
        '.v-navigation-drawer__border'
      )
      i.style.width = '3px'
      i.style.cursor = 'ew-resize'
    }

    function setResizeEvents () {
      if (!drawerRef.value) return
      const el = drawerRef.value.$el
      const drawerBorder = el.querySelector('.v-navigation-drawer__border')
      const direction = el.classList.contains('v-navigation-drawer--right')
        ? 'right'
        : 'left'

      function resize (e) {
        if (e.screenX < 30) return

        document.body.style.cursor = 'ew-resize'
        const f = direction === 'right'
          ? document.body.scrollWidth - e.clientX
          : e.clientX
        el.style.width = f + 'px'
      }

      drawerBorder.addEventListener(
        'mousedown',
        function (e) {
          if (e.offsetX < 30) {
            el.style.transition = 'initial'; document.addEventListener('mousemove', resize, false)
          }
        },
        false
      )

      document.addEventListener(
        'mouseup',
        function () {
          el.style.transition = ''
          drawerWidth.value = el.style.width
          localStorage.setItem('drawerWidth', el.style.width)
          document.body.style.cursor = ''
          document.removeEventListener('mousemove', resize, false)
        },
        false
      )
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

    async function showLog (process) {
      try {
        const options = {
          page: 1,
          itemsPerPage: 1,
          sortBy: ['createdAt'],
          sortDesc: [true]
        }
        const where = { id: process.id }

        logDialogRef.value = true
        const result = await loadProcessesByFilter(options, where)
        logRef.value = result.rows[0]?.log || 'Лог отсутствует'
      } catch (error) {
        console.error('Ошибка загрузки логов:', error)
      }
    }

    const damUrl = window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/'
    const token = localStorage.getItem('token')
    let lastProcess
    async function checkFinishedProcesses () {
      const data = await loadFinishedProcesses({ page: 1, itemsPerPage: 1, sortBy: ['id'], sortDesc: [true] })
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
      setBorderWidth()
      setResizeEvents()
      loadAllRoles().then(() => {
        timer = setInterval(checkFinishedProcesses, 60000)
        loadAllDashboards().then(() => {
          hasDashboards.value = getDashboardsForCurrentUser().length > 0
        })
        isUserAdmin.value = isAdmin()
        hasSearchAccess.value = hasAccess('search') || hasAccess('searchRelations')
        hasImportsAccess.value = hasAccess('imports')

        loadAllChannelTypes().then(() => {
          const importConfigCSVLicence = channelTypes.find(el => el === 1000)
          if (importConfigCSVLicence) {
            importConfigCSVLicenceExist.value = true
          }
          const importConfigYMLLicence = channelTypes.find(el => el === 1001)
          if (importConfigYMLLicence) {
            importConfigYMLLicenceExist.value = true
          }
        })

        if (currentUserRef.value.tenantId !== '0') {
          loadAllChannels().then(channels => {
            if (channels && channels.length > 0) hasChannelsRef.value = true
          })
          hasConfigRef.value = canViewConfig('types') || canViewConfig('attributes') || canViewConfig('relations') || canViewConfig('users') || canViewConfig('roles') || canViewConfig('languages') || canViewConfig('lovs') || canViewConfig('actions') || canViewConfig('dashboards') || canViewConfig('channels')
        }
      })

      eventBus.on('drawer_triggered', val => {
        drawer.value = val
      })

      eventBus.on('drawer_triggered_right', val => {
        drawerRight.value = val
      })

      eventBus.on('userDialogRef_triggered', val => {
        userDialogRef.value = val
      })
    })

    onUnmounted(() => {
      clearInterval(timer)
    })

    function getUserOption (name, defaultValue) {
      if (currentUserRef.value && currentUserRef.value.options) {
        const tst = currentUserRef.value.options.find(elem => elem.name === name)
        if (tst) return tst.value === 'true'
      }
      return defaultValue
    }

    return {
      logout,
      reload,
      drawer,
      drawerRight,
      drawerRef,
      drawerWidth,
      activeBottom,
      userDialogRef,
      currentUserRef,
      passwordErrors,
      save,
      formRef,
      hasConfigRef,
      hasChannelsRef,
      isExportSearch: props.export,
      hasSearchAccess,
      hasImportsAccess,
      importConfigCSVLicenceExist,
      importConfigYMLLicenceExist,
      isUserAdmin,
      hasDashboards,
      activeProcesses,
      activeOptionsRef,
      activeLoadingRef,
      activeOptionsUpdate,
      getUserOption,
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

.v-bottom-navigation {
  overflow-y: hidden;
  overflow-x: auto;
}
.container {
   margin: 0!important;
   max-width: 99%!important;
}
</style>
