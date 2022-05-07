<template>
  <v-container v-if="canViewConfigRef">
    <v-row no-gutters>
      <v-col cols="4">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ $t('Config.Users.Users') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip bottom v-if="canEditConfigRef">
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" @click="add"><v-icon>mdi-plus</v-icon></v-btn>
            </template>
            <span>{{ $t('Add') }}</span>
          </v-tooltip>
        </v-toolbar>
        <v-text-field v-model="searchRef" @input="clearSelection" :label="$t('Filter')" flat hide-details clearable clear-icon="mdi-close-circle-outline" class="ml-5 mr-5"></v-text-field>
        <v-list nav dense>
          <v-list-item-group v-model="itemRef" color="primary">
            <v-list-item v-for="(item, i) in userFiltered" :key="i">
              <v-list-item-icon><v-icon>mdi-account</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{item.login + ' - ' + item.name}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col cols="8">
        <v-form ref="formRef" lazy-validation class="ml-7" v-if="selectedRef && selectedRef.id != -1">
          <div class="d-inline-flex align-center">
            <v-text-field style="min-width: 100%" v-model="selectedRef.login" :error-messages="loginErrors" :disabled="selectedRef.internalId !== 0" :rules="loginRules" :label="$t('Config.Users.Login')" required></v-text-field>
            <SystemInformation :data="selectedRef"></SystemInformation>
          </div>

          <v-text-field v-model="selectedRef.name" :label="$t('Config.Users.Name')" :rules="nameRules" required></v-text-field>

          <v-card class="mb-5 mt-2">
            <v-card-title class="subtitle-2 font-weight-bold" >
              <div style="width:90%">{{ $t('Config.Users.Roles') }}</div>
              <v-tooltip bottom v-if="canEditConfigRef">
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on" @click="editRoles"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                </template>
                <span>{{ $t('Edit') }}</span>
              </v-tooltip>
            </v-card-title>
            <v-divider></v-divider>
            <v-list dense class="pt-0 pb-0">
              <v-list-item v-for="(item, i) in userRoles" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
                <router-link :to="'/config/roles/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name }}</span>
              </v-list-item-content></v-list-item>
            </v-list>
          </v-card>

          <v-text-field v-model="selectedRef.email" :label="$t('Config.Users.Email')" required></v-text-field>
          <v-text-field type="password" v-if="canEditConfigRef" :error-messages="passwordErrors" v-model="selectedRef.password1" :label="$t('Config.Users.Password1')" required></v-text-field>
          <v-text-field type="password" v-if="canEditConfigRef" :error-messages="passwordErrors" v-model="selectedRef.password2" :label="$t('Config.Users.Password2')" required></v-text-field>

          <OptionsTable :options="selectedRef.options" @changed="optionsChanged" />

          <v-btn class="mr-4" v-if="canEditConfigRef" @click="save">{{ $t('Save') }}</v-btn>
          <v-btn class="mr-4" v-if="canEditConfigRef" @click.stop="remove">{{ $t('Remove') }}</v-btn>
        </v-form>
      </v-col>
    </v-row>
    <RolesSelectionDialog ref="rolesSelectionDialogRef" :multiselect="true" @selected="rolesSelected"/>
  </v-container>
</template>

<script>
import { computed, ref, watch, onMounted } from '@vue/composition-api'
import * as errorStore from '../../store/error'
import * as usersStore from '../../store/users'
import * as rolesStore from '../../store/roles'
import i18n from '../../i18n'
import router from '../../router'
import RolesSelectionDialog from '../../components/RolesSelectionDialog'
import SystemInformation from '../../components/SystemInformation'
import OptionsTable from '../../components/OptionsTable'

export default {
  components: { RolesSelectionDialog, SystemInformation, OptionsTable },
  setup () {
    const {
      showInfo
    } = errorStore.useStore()

    const {
      roles,
      loadAllRoles
    } = rolesStore.useStore()

    const {
      users,
      addUser,
      saveUser,
      loadAllUsers,
      removeUser,
      hasLogin,
      canViewConfig,
      canEditConfig
    } = usersStore.useStore()

    const canViewConfigRef = ref(false)
    const canEditConfigRef = ref(false)

    const empty = { id: -1 }
    const formRef = ref(null)
    const selectedRef = ref(empty)
    const itemRef = ref(0)
    const rolesSelectionDialogRef = ref(null)
    const loginErrors = ref([])
    const passwordErrors = ref([])

    watch(itemRef, (selected, previous) => {
      if (selected == null) {
        selectedRef.value = empty
        router.push('/config/users')
        return
      }
      if (selected < userFiltered.value.length) {
        if (previous && userFiltered.value[previous].internalId === 0) {
          showInfo(i18n.t('Config.NotSaved'))
        }
        selectedRef.value = userFiltered.value[selected]
        if (selectedRef.value.internalId !== 0 && selectedRef.value.login) {
          router.push('/config/users/' + selectedRef.value.login)
        } else {
          router.push('/config/users')
        }
      }
    })

    function add () {
      selectedRef.value = addUser()
      itemRef.value = users.length - 1
    }

    function save () {
      if (formRef.value.validate()) {
        if (selectedRef.value.internalId === 0) {
          if (!selectedRef.value.password1 || !selectedRef.value.password2) {
            passwordErrors.value = [i18n.t('Config.Users.Error.PasswordRequired')]
            return
          }
          if (selectedRef.value.password1 !== selectedRef.value.password2) {
            passwordErrors.value = [i18n.t('Config.Users.Error.PasswordsNotEquals')]
            return
          }
          hasLogin(selectedRef.value.login).then(result => {
            if (result) {
              loginErrors.value = [i18n.t('Config.Users.Error.LoginNotUnique')]
            } else {
              passwordErrors.value = []
              loginErrors.value = []
              saveUser(selectedRef.value).then(() => {
                router.push('/config/users/' + selectedRef.value.login)
                showInfo(i18n.t('Saved'))
              })
            }
          })
        } else {
          if ((selectedRef.value.password1 || selectedRef.value.password2) && selectedRef.value.password1 !== selectedRef.value.password2) {
            passwordErrors.value = [i18n.t('Config.Users.Error.PasswordsNotEquals')]
            return
          }
          passwordErrors.value = []
          loginErrors.value = []
          saveUser(selectedRef.value).then(() => {
            router.push('/config/users/' + selectedRef.value.login)
            showInfo(i18n.t('Saved'))
          })
        }
      }
    }

    function remove () {
      if (confirm(i18n.t('Config.Users.Confirm.Delete', { name: selectedRef.value.name }))) {
        removeUser(selectedRef.value.id)
        selectedRef.value = empty
        router.push('/config/users')
      }
    }

    const userRoles = computed(() => {
      if (selectedRef.value.roles) {
        return selectedRef.value.roles.map(id => roles.find(role => role.id === id || role.internalId === id))
      } else {
        return []
      }
    })

    function editRoles () {
      rolesSelectionDialogRef.value.showDialog('', selectedRef.value.roles)
    }

    function rolesSelected (arr) {
      rolesSelectionDialogRef.value.closeDialog()
      selectedRef.value.roles = arr
    }

    function optionsChanged (val) {
      selectedRef.value.options = val
    }

    const searchRef = ref('')
    const userFiltered = computed(() => {
      let arr = users
      if (searchRef.value) {
        const s = searchRef.value.toLowerCase()
        arr = users.filter(item => item.login.toLowerCase().indexOf(s) > -1 || item.name.toLowerCase().indexOf(s) > -1)
      }
      return arr.sort((a, b) => {
        if (a.name && b.name) {
          return a.name.localeCompare(b.name)
        } else {
          return 0
        }
      })
    })
    function clearSelection () {
      selectedRef.value = null
      itemRef.value = null
    }

    onMounted(() => {
      loadAllRoles()
      loadAllUsers().then(() => {
        canViewConfigRef.value = canViewConfig('users')
        canEditConfigRef.value = canEditConfig('users')

        const id = router.currentRoute.params.id
        if (id) {
          const idx = users.findIndex((elem) => elem.login === id)
          if (idx !== -1) {
            selectedRef.value = users[idx]
            itemRef.value = idx
          } else {
            router.push('/config/users')
          }
        } else {
          if (users.length > 0) {
            selectedRef.value = users[0]
          }
        }
      })
    })

    function loginValidation (v) {
      if (!/^[@.A-Za-z0-9_]*$/.test(v)) {
        return i18n.t('Config.Users.Error.WrongLogin')
      }
      if (!v) {
        return i18n.t('Config.Users.Error.LoginRequired')
      }
      return true
    }

    return {
      formRef,
      users,
      selectedRef,
      itemRef,
      add,
      remove,
      save,
      userRoles,
      rolesSelectionDialogRef,
      editRoles,
      rolesSelected,
      loginErrors,
      passwordErrors,
      canViewConfigRef,
      canEditConfigRef,
      searchRef,
      optionsChanged,
      userFiltered,
      clearSelection,
      loginRules: [
        v => loginValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('Config.Users.Error.NameRequired')
      ]
    }
  }
}
</script>
