<template>
<div>
  <v-snackbar
      :value="hasError"
      top
      :multi-line="true"
      :timeout="0"
    >
    {{ error }}
    <v-btn
      color="error"
      @click="clearError"
    >
      {{ $t('Close') }}
    </v-btn>
  </v-snackbar>
  <v-snackbar
      :value="hasInfo"
      color="teal"
      bottom=""
      :multi-line="true"
      :timeout="0"
    >
    {{ info }}
    <v-btn
      color="info"
      @click="clearInfo"
    >
      {{ $t('Close') }}
    </v-btn>
  </v-snackbar>
</div>

</template>
<script>
import * as errorStore from '../store/error'

export default {
  setup () {
    const {
      state: { error, hasError, info, hasInfo },
      clearError,
      clearInfo
    } = errorStore.useStore()

    return {
      error,
      hasError,
      info,
      hasInfo,
      clearError,
      clearInfo
    }
  }
}
</script>
