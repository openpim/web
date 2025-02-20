<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import initStores from './store'
import { onMounted } from '@vue/composition-api'
import * as userStore from './store/users'

export default {
  setup () {
    initStores()

    const {
      getServerConfig
    } = userStore.useStore()

    onMounted(async () => {
      const serverConfig = await getServerConfig()
      if (serverConfig.title) document.title = serverConfig.title
    })
  }
}
</script>
