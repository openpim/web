<template>
  <v-container fluid fill-height>
    <ErrorBox />
    <router-view></router-view>
  </v-container>
</template>

<script>
import ErrorBox from '../components/ErrorBox'

export default {
  name: 'Empty',
  components: { ErrorBox }
}
</script>

<style>
</style>
