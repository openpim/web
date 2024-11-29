<template>
      <v-list dense>
        <v-list-item link to="/config/types" v-if="canViewConfig('types')">
          <v-list-item-icon><v-icon>mdi-animation-outline</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>{{ $t('Config.Types') }}</v-list-item-title></v-list-item-content>
        </v-list-item>
        <v-list-item link to="/config/attributes"  v-if="canViewConfig('attributes')">
          <v-list-item-icon><v-icon>mdi-format-list-bulleted-type</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>{{ $t('Config.Attributes') }}</v-list-item-title></v-list-item-content>
        </v-list-item>
        <v-list-item link to="/config/relations" v-if="canViewConfig('relations')">
          <v-list-item-icon><v-icon>mdi-vector-line</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>{{ $t('Config.Relations') }}</v-list-item-title></v-list-item-content>
        </v-list-item>
        <v-list-item link to="/config/lovs" v-if="canViewConfig('lovs')">
          <v-list-item-icon><v-icon>mdi-view-headline</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>{{ $t('Config.LOVs') }}</v-list-item-title></v-list-item-content>
        </v-list-item>
        <v-list-item link to="/config/channels" v-if="canViewConfig('channels')">
          <v-list-item-icon><v-icon>mdi-access-point</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>{{ $t('Config.Channels') }}</v-list-item-title></v-list-item-content>
        </v-list-item>
        <v-list-item link to="/config/actions" v-if="canViewConfig('actions')">
          <v-list-item-icon><v-icon>mdi-file-code-outline</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>{{ $t('Config.Actions') }}</v-list-item-title></v-list-item-content>
        </v-list-item>
        <v-list-item link to="/config/imports" v-if="canViewConfig('importConfigs') && (importConfigCSVLicenceExist || importConfigYMLLicenceExist)">
          <v-list-item-icon><v-icon>mdi-file-cog-outline</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>{{ $t('Config.ImportConfigs') }}</v-list-item-title></v-list-item-content>
        </v-list-item>
        <v-list-item link to="/config/users" v-if="canViewConfig('users')">
          <v-list-item-icon><v-icon>mdi-account</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>{{ $t('Config.Users') }}</v-list-item-title></v-list-item-content>
        </v-list-item>
        <v-list-item link to="/config/roles" v-if="canViewConfig('roles')">
          <v-list-item-icon><v-icon>mdi-account-check</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>{{ $t('Config.Roles') }}</v-list-item-title></v-list-item-content>
        </v-list-item>
        <v-list-item link to="/config/dashboards" v-if="canViewConfig('dashboards')">
          <v-list-item-icon><v-icon>mdi-view-dashboard-outline</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>{{ $t('Config.Dashboard') }}</v-list-item-title></v-list-item-content>
        </v-list-item>
        <v-list-item link to="/config/languages" v-if="canViewConfig('languages')">
          <v-list-item-icon><v-icon>mdi-web</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>{{ $t('Config.Languages') }}</v-list-item-title></v-list-item-content>
        </v-list-item>
      </v-list>
</template>
<script>
import { ref, onMounted } from '@vue/composition-api'
import * as userStore from '../store/users'
import * as channelsStore from '../store/channels'

export default {
  setup () {
    const {
      canViewConfig
    } = userStore.useStore()

    const {
      channelTypes,
      loadAllChannelTypes
    } = channelsStore.useStore()

    const importConfigCSVLicenceExist = ref(false)
    const importConfigYMLLicenceExist = ref(false)
    onMounted(() => {
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
    })

    return {
      importConfigCSVLicenceExist,
      importConfigYMLLicenceExist,
      canViewConfig
    }
  }
}
</script>
