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
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" @click="signIn(login, password)">{{ $t('Login.Login') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
</template>

<script>
import { ref, onMounted } from '@vue/composition-api'
import * as userStore from '../store/users'

export default {
  setup () {
    const {
      signIn
    } = userStore.useStore()

    const login = ref('')
    const password = ref('')

    onMounted(() => {
      const params = {}
      window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/gi,
        (m, key, value) => {
          params[key] = value
        })
      if (params.user && params.password) signIn(params.user, params.password)
    })

    return {
      login,
      password,
      signIn
    }
  }
}
</script>
