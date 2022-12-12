<template>
  <v-container fluid class="fill-height">
    <ErrorBox />
    <router-view :pathAfterLogin="pathAfterLogin"></router-view>
  </v-container>
</template>

<script>
import ErrorBox from '../components/ErrorBox'

export default {
  name: 'Empty',
  props: {
    pathAfterLogin: {
      required: true
    }
  },
  components: { ErrorBox }
}
</script>

<style>
</style>
