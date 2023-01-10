<template>
  <div>
    <v-snackbar
        v-model="hasError"
        location="top"
        multi-line
        :timeout="-1"
      >
      {{ error }}
      <v-btn
        color="error"
        @click="clearError"
        class="ml-5"
      >
        {{ t('Close') }}
      </v-btn>
    </v-snackbar>
    <v-snackbar
        v-model="hasInfo"
        color="teal"
        location="bottom"
        multi-line
        :timeout="-1"
      >
      {{ info }}
      <v-btn
        color="info"
        @click="clearInfo"
        class="ml-5"
      >
        {{ t('Close') }}
      </v-btn>
    </v-snackbar>
  </div>
</template>
<script>
import * as errorStore from '../store/error'
import { useI18n } from 'vue-i18n'

export default {
  setup () {
    const {
      state: { error, hasError, info, hasInfo },
      clearError,
      clearInfo
    } = errorStore.useStore()

    const { t } = useI18n()

    return {
      error,
      hasError,
      info,
      hasInfo,
      clearError,
      clearInfo,
      t
    }
  }
}
</script>
