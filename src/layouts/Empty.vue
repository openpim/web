<template>
  <v-container fluid fill-height>
    <ErrorBox />
    <v-card text="AAA"></v-card>
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
/* <router-view :pathAfterLogin="pathAfterLogin"></router-view> */
</style>
