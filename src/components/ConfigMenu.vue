<template>
      <v-list density="compact">
        <v-list-item link to="/config/types" v-if="canViewConfig('types')">
          <template v-slot:prepend>
            <v-icon>mdi-animation-outline</v-icon>
          </template>
          <v-list-item-title>{{ $t('Config.Types') }}</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/config/attributes"  v-if="canViewConfig('attributes')">
          <template v-slot:prepend>
            <v-icon>mdi-format-list-bulleted-type</v-icon>
          </template>
          <v-list-item-title>{{ $t('Config.Attributes') }}</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/config/relations" v-if="canViewConfig('relations')">
          <template v-slot:prepend>
            <v-icon>mdi-vector-line</v-icon>
          </template>
          <v-list-item-title>{{ $t('Config.Relations') }}</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/config/lovs" v-if="canViewConfig('lovs')">
          <template v-slot:prepend>
            <v-icon>mdi-view-headline</v-icon>
          </template>
          <v-list-item-title>{{ $t('Config.LOVs') }}</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/config/channels" v-if="canViewConfig('channels')">
          <template v-slot:prepend>
            <v-icon>mdi-access-point</v-icon>
          </template>
         <v-list-item-title>{{ $t('Config.Channels') }}</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/config/actions" v-if="canViewConfig('actions')">
          <template v-slot:prepend>
            <v-icon>mdi-file-code-outline</v-icon>
          </template>
          <v-list-item-title>{{ $t('Config.Actions') }}</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/config/users" v-if="canViewConfig('users')">
          <template v-slot:prepend>
            <v-icon>mdi-account</v-icon>
          </template>
          <v-list-item-title>{{ $t('Config.Users') }}</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/config/roles" v-if="canViewConfig('roles')">
          <template v-slot:prepend>
            <v-icon>mdi-account-check</v-icon>
          </template>
          <v-list-item-title>{{ $t('Config.Roles') }}</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/config/dashboards" v-if="canViewConfig('dashboards')">
          <template v-slot:prepend>
            <v-icon>mdi-view-dashboard-outline</v-icon>
          </template>
          <v-list-item-title>{{ $t('Config.Dashboard') }}</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/config/languages" v-if="canViewConfig('languages')">
          <template v-slot:prepend>
            <v-icon>mdi-web</v-icon>
          </template>
          <v-list-item-title>{{ $t('Config.Languages') }}</v-list-item-title>
        </v-list-item>
      </v-list>
</template>
<script>
import * as userStore from '../store/users'

export default {
  setup () {
    const {
      canViewConfig
    } = userStore.useStore()

    return {
      canViewConfig
    }
  }
}
</script>
