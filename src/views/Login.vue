<template>
  <v-row
    align="center"
    justify="center"
    class="fill-height"
  >
    <v-col
      cols="12"
      sm="8"
      md="4"
    >
      <v-card class="elevation-12">
        <v-toolbar
          color="primary"
          dark
          flat
        >
          <v-toolbar-title>{{ $t('Login.Login') }}</v-toolbar-title>
          <v-spacer />
        </v-toolbar>

        <v-form @submit.prevent>
          <v-card-text>
              <v-text-field
                :label="$t('Login.UserName')"
                name="login"
                prepend-icon="mdi-account"
                type="text"
                v-model="login"
              />

              <v-text-field
                id="password"
                :label="$t('Login.Password')"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                v-model="password"
              />

              <v-select
                prepend-icon="mdi-translate"
                v-if="languageSelect"
                v-model="$i18n.locale"
                :items="localeSelection"
                :label="$t('Login.Language')"
                @update:modelValue="changeLocale"
              />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="signIn(login, password, pathAfterLogin)" type="submit">{{ $t('Login.Login') }}</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { ref, onMounted } from 'vue'
import * as userStore from '../store/users'
import { useI18n } from 'vue-i18n'
import i18n, { loadLocaleMessages } from '../i18n'

export default {
  props: {
    pathAfterLogin: {
      required: true
    }
  },
  setup (props, { root }) {
    const {
      signIn
    } = userStore.useStore()
    const { t, locale } = useI18n()
    const login = ref('')
    const password = ref('')

    onMounted(() => {
      const params = {}
      window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/gi,
        (m, key, value) => {
          params[key] = value
        })
      if (params.user && params.password) {
        signIn(params.user, params.password, props.pathAfterLogin)
      }
    })

    const changeLocale = () => {
      loadLocaleMessages(i18n, locale.value)
    }

    return {
      login,
      password,
      signIn,
      changeLocale,
      languageSelect: process.env.VUE_APP_I18N_LANGUAGE_SELECT === 'true',
      localeSelection: [
        { title: t('Language.English'), value: 'en' },
        { title: t('Language.Russian'), value: 'ru' },
        { title: t('Language.Chinese'), value: 'ch' }
      ]
    }
  }
}
</script>
