<template>
  <v-app>
    <v-main>
      <router-view></router-view>
    </v-main>
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
