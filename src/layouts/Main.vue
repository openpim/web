<template>
  <v-app>
    <v-layout>
    <ErrorBox />
    <AppHeader
      :export="isExportSearch"
      :drawer="drawer"
      :drawerRight="drawerRight"
      @on-show-user="handleUserDialogShow"
      @on-trigger-drawer="handleDrawerTrigger"
      @on-trigger-drawer-right="handleDrawerRightTrigger"
    />

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
        <v-btn to="/collections" v-if="hasCollectionsRef">
            <span>{{ $t('Main.Collections') }}</span>
            <v-icon>mdi-bookmark-outline</v-icon>
        </v-btn>
        <v-btn to="/channels" v-if="hasChannelsRef">
            <span>{{ $t('Main.Channels') }}</span>
            <v-icon>mdi-access-point</v-icon>
        </v-btn>
        <v-btn to="/config/home" v-if="hasConfigRef" class="btn-nav" variant="text">
          <v-icon>mdi-cog-outline</v-icon>
          <span>{{ $t('Main.Settings') }}</span>
        </v-btn>
      </div>
      <a class="copyright-link d-flex flex-row-reverse mr-2" href="https://openpim.org" target="_blank">&copy; OpenPIM</a>
      <Resizer :left="drawerWidth" @on-resize="handleResize"/>
    </v-navigation-drawer>
    <v-navigation-drawer v-model="drawerRight" absolute location="right" clipped width="650">
      <Processes v-if="drawerRight" />
    </v-navigation-drawer>
    <v-main>
      <v-container class="fill-height" fluid>
        <router-view :export="isExportSearch"></router-view>
      </v-container>
    </v-main>
    <UserDialog :show="userDialogRef"  @on-hide="handleUserDialogHide"/>
    </v-layout>
  </v-app>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useDisplay } from 'vuetify'

import ErrorBox from '../components/ErrorBox'
import AppHeader from '../components/AppHeader.vue'
import Resizer from '../components/common/Resizer'
import UserDialog from '../components/common/UserDialog'
import Processes from '../components/common/Processes'
import * as userStore from '../store/users'
import * as channelsStore from '../store/channels'
import * as collectionsStore from '../store/collections'
import * as rolesStore from '../store/roles'
import * as dashStore from '../store/dashboards'

export default {
  components: { AppHeader, ErrorBox, Resizer, UserDialog, Processes },
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
      loadAllCollections
    } = collectionsStore.useStore()

    const {
      loadAllDashboards,
      getDashboardsForCurrentUser
    } = dashStore.useStore()

    const drawer = ref(null)
    const drawerRight = ref(false)
    const drawerRef = ref(null)
    const defWidth = localStorage.getItem('drawerWidth') || '250'
    const drawerWidth = ref(parseInt(defWidth))
    const activeBottom = ref(1)

    const userDialogRef = ref(false)

    const hasConfigRef = ref(false)
    const hasChannelsRef = ref(false)
    const hasCollectionsRef = ref(false)

    const hasSearchAccess = ref(false)

    const hasDashboards = ref(false)

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

    const handleDrawerRightTrigger = (val) => {
      drawerRight.value = val
    }

    onMounted(() => {
      loadAllRoles().then(() => {
        loadAllDashboards().then(() => {
          hasDashboards.value = getDashboardsForCurrentUser().length > 0
        })
        hasSearchAccess.value = hasAccess('search') || hasAccess('searchRelations')
        if (currentUserRef.value.tenantId !== '0') {
          loadAllChannels().then(channels => {
            if (channels && channels.length > 0) hasChannelsRef.value = true
          })
          loadAllCollections().then(collections => {
            if (collections && collections.length > 0) hasCollectionsRef.value = true
          })
          hasConfigRef.value = canViewConfig('types') || canViewConfig('attributes') || canViewConfig('relations') || canViewConfig('users') || canViewConfig('roles') || canViewConfig('languages') || canViewConfig('lovs') || canViewConfig('actions') || canViewConfig('dashboards') || canViewConfig('channels')
        }
      })
    })

    const display = ref(useDisplay())

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
      hasCollectionsRef,
      isExportSearch: props.export,
      hasSearchAccess,
      hasDashboards,
      display,
      handleResize,
      handleUserDialogHide,
      handleUserDialogShow,
      handleDrawerTrigger,
      handleDrawerRightTrigger
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
