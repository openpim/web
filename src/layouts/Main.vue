<template>
  <v-app>
    <v-layout>
    <ErrorBox />
    <AppHeader :export="isExportSearch" :drawer="drawer" />

    <v-navigation-drawer :width="drawerWidth" v-model="drawer" ref="drawerRef" :clipped="display.lgAndUp" app v-if="currentUserRef.tenantId !== '0'">
      <router-view name="menu"></router-view>

      <div class="mt-2 mb-1" v-if="!isExportSearch && activeBottom">
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
<!--      <div class="resizer" :style="{left: drawerWidth+'px'}" @mousedown="startDrag"></div>-->
    </v-navigation-drawer>

    <v-main>
      <v-container class="fill-height" fluid>
        <router-view :export="isExportSearch"></router-view>
      </v-container>
    </v-main>
    <h1>==={{drawerWidth}}=====</h1>
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
                    <v-text-field v-if="currentUserRef.login !== 'demo'" type="password" :error-messages="passwordErrors" v-model="currentUserRef.password1" :label="$t('Config.Users.Password1')" required></v-text-field>
                    <v-text-field v-if="currentUserRef.login !== 'demo'" type="password" :error-messages="passwordErrors" v-model="currentUserRef.password2" :label="$t('Config.Users.Password2')" required></v-text-field>
                  </template>
                </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="logout">{{ $t('Config.Users.Exit') }}</v-btn>
          <v-btn v-if="isUserAdmin" color="blue darken-1" text @click="reload">{{ $t('Config.Users.ReloadModel') }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="userDialogRef = false">{{ $t('Close') }}</v-btn>
          <v-btn color="blue darken-1" text @click="save" v-if="currentUserRef.login !== 'demo'">{{ $t('Save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    </v-layout>
  </v-app>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useDisplay } from 'vuetify'

import ErrorBox from '../components/ErrorBox'
import AppHeader from '../components/AppHeader.vue'
import * as userStore from '../store/users'
import * as errorStore from '../store/error'
import * as channelsStore from '../store/channels'
import * as rolesStore from '../store/roles'
import * as dashStore from '../store/dashboards'
import i18n from '../i18n'
import router from '../router'
import eventBus from '../eventBus'

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
      loadAllChannels
    } = channelsStore.useStore()

    const {
      loadAllDashboards,
      getDashboardsForCurrentUser
    } = dashStore.useStore()

    const drawer = ref(null)
    const drawerRef = ref(null)
    const defWidth = localStorage.getItem('drawerWidth') || '250'
    const drawerWidth = ref(parseInt(defWidth))
    const activeBottom = ref(1)
    const userDialogRef = ref(null)
    const passwordErrors = ref([])
    const formRef = ref(null)
    const hasConfigRef = ref(false)
    const hasChannelsRef = ref(false)

    const hasSearchAccess = ref(false)
    const isUserAdmin = ref(false)

    const hasDashboards = ref(false)

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
        saveUser(currentUserRef.value).then(() => {
          localStorage.setItem('user', JSON.stringify(currentUserRef.value))
          currentUserRef.value.password1 = ''
          currentUserRef.value.password2 = ''
          showInfo(i18n.t('Saved'))
        })
      }
    }

    function setBorderWidth () {
      // TODO: fix
      /*
      const el = drawerRef.value.$el.querySelector(
        '.v-navigation-drawer__border'
      )
      el.style.width = '3px'
      el.style.cursor = 'ew-resize'
       */
    }

    function setResizeEvents () {
      // TODO: fix
      /*
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
       */
    }

    const startDrag = (e) => {
      console.log('startDrag')
    }

    onMounted(() => {
      setBorderWidth()
      setResizeEvents()
      loadAllRoles().then(() => {
        loadAllDashboards().then(() => {
          hasDashboards.value = getDashboardsForCurrentUser().length > 0
        })
        isUserAdmin.value = isAdmin()
        hasSearchAccess.value = hasAccess('search') || hasAccess('searchRelations')
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

      eventBus.on('userDialogRef_triggered', val => {
        userDialogRef.value = val
      })
    })

    const display = ref(useDisplay())

    return {
      logout,
      reload,
      drawer,
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
      isUserAdmin,
      hasDashboards,
      nameRules: [
        v => !!v || i18n.t('Config.Users.Error.NameRequired')
      ],
      display,
      startDrag
    }
  },
  onMounted () {
    this.setBorderWidth()
    this.setResizeEvents()
  }
}
</script>
<style>
.copyright-link, .copyright-link:visited, .copyright-link:hover, .copyright-link:active {
  color: gray;
  text-align: center;
  font-size:x-small;
}

.btn-nav .v-btn__content {
  flex-direction: column;
}

.resizer {
  width: 3px;
  cursor: ew-resize;
  position: absolute;
  top: 0;
  bottom: 0;
  background: red;
}
</style>
