<template>
        <v-row
          align="center"
          justify="center"
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
              <v-card-text>
                <v-form>
                  <v-text-field
                    v-if="!disableWebLogin"
                    :label="$t('Login.UserName')"
                    name="login"
                    prepend-icon="mdi-account"
                    type="text"
                    v-model="login"
                  />

                  <v-text-field
                    v-if="!disableWebLogin"
                    id="password"
                    :label="$t('Login.Password')"
                    name="password"
                    prepend-icon="mdi-lock"
                    type="password"
                    v-model="password"
                  />

                  <v-select prepend-icon="mdi-translate" v-if="languageSelect" v-model="i18n.locale" :items="localeSelection" :label="$t('Login.Language')"></v-select>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn v-if="!disableWebLogin" color="primary" :disabled="!login || !password" @click="signIn(login, password, pathAfterLogin)">{{ $t('Login.Login') }}</v-btn>
                <template v-if="authProvidersRef.length > 0">
                  <v-btn v-for="(auth, i) in authProvidersRef" :key="i" color="primary" @click="signInThrough(auth)">{{ $t('Login.Through') + auth.name }}</v-btn>
                </template>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
</template>

<script>
import { ref, onMounted, onUnmounted } from '@vue/composition-api'
import * as userStore from '../store/users'
import * as rolesStore from '../store/roles'
import * as authStore from '../store/auth'
import i18n from '../i18n'

export default {
  props: {
    pathAfterLogin: {
      required: true
    }
  },
  setup (props, { root }) {
    const {
      signIn,
      getServerConfig
    } = userStore.useStore()

    const {
      loadAllRoles
    } = rolesStore.useStore()

    const {
      authOpenID
    } = authStore.useStore()

    const login = ref('')
    const password = ref('')
    const authProvidersRef = ref([])
    const disableWebLogin = ref(false)

    async function signInKeyListener (e) {
      if (e.key === 'Enter') {
        await signIn(login.value, password.value, props.pathAfterLogin)
        await loadAllRoles()
      }
    }

    async function signInThrough (auth) {
      if (auth.IssuerURL) {
        const resAuth = await authOpenID(auth.id, window.location.origin)
        window.location.href = resAuth.data.auth
      }
    }

    onMounted(async () => {
      const params = {}
      window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/gi,
        (m, key, value) => {
          params[key] = value
        })
      if (params.user && params.password) signIn(params.user, params.password, props.pathAfterLogin)
      document.addEventListener('keypress', signInKeyListener)

      const serverConfig = await getServerConfig()
      if (serverConfig.auth) {
        serverConfig.auth.forEach(elem => {
          authProvidersRef.value.push(elem)
        })
        if (serverConfig.disableWebLogin && !params.WebLogin) disableWebLogin.value = true
      }
    })

    onUnmounted(() => {
      document.removeEventListener('keypress', signInKeyListener)
    })

    return {
      login,
      password,
      authProvidersRef,
      signIn,
      signInThrough,
      disableWebLogin,
      i18n,
      languageSelect: process.env.VUE_APP_I18N_LANGUAGE_SELECT === 'true',
      localeSelection: [
        { text: i18n.t('Language.English'), value: 'en' },
        { text: i18n.t('Language.Russian'), value: 'ru' },
        { text: i18n.t('Language.Chinese'), value: 'ch' }
      ]
    }
  }
}
</script>
