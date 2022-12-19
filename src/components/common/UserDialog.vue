<template>
    <v-dialog v-model="userDialogRef" persistent max-width="600px">
      <v-card v-if="currentUserRef">
        <v-card-title>
          <span class="headline">{{ $t('User.Details') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-form ref="formRef" lazy-validation>
                  <v-text-field
                    v-model="currentUserRef.login"
                    disabled
                    :label="$t('Config.Users.Login')"
                    required
                    variant="underlined"
                  ></v-text-field>
                  <v-text-field
                    v-model="currentUserRef.name"
                    :label="$t('Config.Users.Name')"
                    :rules="nameRules"
                    required
                    variant="underlined"
                  ></v-text-field>
                  <v-text-field
                    v-model="currentUserRef.email"
                    :label="$t('Config.Users.Email')"
                    required
                    variant="underlined"
                  ></v-text-field>

                  <div v-if="currentUserRef.external">
                    {{$t('Config.Users.External')}}
                  </div>
                  <template v-else>
                    <v-text-field
                      v-if="currentUserRef.login !== 'demo'"
                      type="password"
                      :error-messages="passwordErrors"
                      v-model="currentUserRef.password1"
                      :label="$t('Config.Users.Password1')"
                      required
                      variant="underlined"
                    ></v-text-field>
                    <v-text-field
                      v-if="currentUserRef.login !== 'demo'"
                      type="password"
                      :error-messages="passwordErrors"
                      v-model="currentUserRef.password2"
                      :label="$t('Config.Users.Password2')"
                      required
                      variant="underlined"
                    ></v-text-field>
                  </template>
                </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue-darken-1" text @click="logout">{{ $t('Config.Users.Exit') }}</v-btn>
          <v-btn v-if="isUserAdmin" color="blue-darken-1" text @click="reload">{{ $t('Config.Users.ReloadModel') }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" text @click="hide">{{ $t('Close') }}</v-btn>
          <v-btn color="blue-darken-1" text @click="save" v-if="currentUserRef.login !== 'demo'">{{ $t('Save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
import { ref, onMounted, onUpdated } from 'vue'

import * as userStore from '../../store/users'
import * as errorStore from '../../store/error'
import i18n from '../../i18n'

export default {
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  setup (props, { emit }) {
    const {
      showInfo
    } = errorStore.useStore()

    const {
      currentUserRef,
      saveUser,
      reloadModel,
      isAdmin
    } = userStore.useStore()

    const userDialogRef = ref(false)
    const passwordErrors = ref([])
    const formRef = ref(null)

    const isUserAdmin = ref(false)

    function hide () {
      emit('onHide')
      userDialogRef.value = false
    }

    function reload () {
      reloadModel().then(() => logout())
    }

    function logout () {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      location.reload()
    }

    function save () {
      if (formRef.value.validate()) {
        if ((currentUserRef.value.password1 || currentUserRef.value.password2) && currentUserRef.value.password1 !== currentUserRef.value.password2) {
          passwordErrors.value = [i18n.t('Config.Users.Error.PasswordsNotEquals')]
          return
        }
        hide()
        passwordErrors.value = []
        saveUser(currentUserRef.value).then(() => {
          localStorage.setItem('user', JSON.stringify(currentUserRef.value))
          currentUserRef.value.password1 = ''
          currentUserRef.value.password2 = ''
          showInfo(i18n.t('Saved'))
        })
      }
    }

    onMounted(() => {
      isUserAdmin.value = isAdmin()
    })

    onUpdated(() => {
      userDialogRef.value = props.show
    })

    return {
      logout,
      reload,
      userDialogRef,
      currentUserRef,
      passwordErrors,
      save,
      formRef,
      isUserAdmin,
      nameRules: [
        v => !!v || i18n.t('Config.Users.Error.NameRequired')
      ],
      hide
    }
  }
}
</script>
<style>

</style>
