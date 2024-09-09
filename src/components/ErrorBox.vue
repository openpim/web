<template>
<div>
  <v-snackbar
      :value="hasError"
      top
      :multi-line="true"
      :timeout="-1"
    >
    <span v-html="error"></span>
    <v-btn
      class="ml-5"
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
      :timeout="-1"
    >
    <span v-html="info"></span>
    <v-btn
      class="ml-5"
      color="info"
      @click="clearInfo"
    >
      {{ $t('Close') }}
    </v-btn>
  </v-snackbar>
  <v-snackbar
      :value="hasInformation"
      color="white"
      top
      :multi-line="true"
      :timeout="-1"
    >
    <div class="d-flex justify-space-between align-center" style="width: 100%;">
      <span v-html="information" style="color: black"></span>
      <v-btn
        class="ml-5"
        color="info"
        @click="clearInformation"
      >
        {{ $t('Close') }}
      </v-btn>
    </div>
  </v-snackbar>
</div>

</template>
<script>
import * as errorStore from '../store/error'

export default {
  setup () {
    const {
      state: { error, hasError, info, hasInfo, information, hasInformation },
      clearError,
      clearInfo,
      clearInformation
    } = errorStore.useStore()

    return {
      error,
      hasError,
      info,
      hasInfo,
      information,
      hasInformation,
      clearError,
      clearInfo,
      clearInformation
    }
  }
}
</script>
