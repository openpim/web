<template>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card>
              <v-card-title>{{$t('UserSelect.Title')}}</v-card-title>
              <v-card-text>
                <v-form>
                  <v-select v-model="selectedTenantRef" @change="tenantChanged" :items="tenantsRef" :label="$t('UserSelect.Tenant')"></v-select>
                  <v-autocomplete v-model="selectedUserRef" :items="usersRef" :label="$t('UserSelect.User')"></v-autocomplete>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" @click="signInAs(selectedUserRef)" :disabled="!selectedTenantRef || !selectedUserRef">{{ $t('Select') }}</v-btn>
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
      signInAs,
      getTenants,
      getTenantUsers
    } = userStore.useStore()

    const selectedTenantRef = ref(null)
    const tenantsRef = ref([])
    const selectedUserRef = ref(null)
    const usersRef = ref([])

    function tenantChanged (tenantId) {
      getTenantUsers(tenantId).then(arr => {
        usersRef.value = arr.map(user => {
          return { value: user.id, text: user.login + ' (' + (user.name || 'Нет имени') + ') ' }
        })
      })
    }

    onMounted(() => {
      getTenants().then(arr => { tenantsRef.value = arr })
    })

    return {
      selectedTenantRef,
      tenantsRef,
      selectedUserRef,
      usersRef,
      tenantChanged,
      signInAs
    }
  }
}
</script>
