<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import initStores from './store'

export default {
  setup () {
    initStores()
  }
}
</script>
