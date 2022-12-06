<template>
  <v-dialog v-model="selectionDialogRef" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('Relations.SelectionDialog.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
            <v-list nav dense>
              <v-list-item-group v-model="selectedRolesRef" color="primary" :multiple="multiselect">
                <v-list-item v-for="(item, i) in roles" :key="i">
                  <v-list-item-icon><v-icon>mdi-account-check</v-icon></v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{item.name}}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="selectionDialogRef = false">{{ $t('Cancel') }}</v-btn>
        <v-btn color="blue darken-1" text @click="selected">{{ $t('Select') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { ref } from 'vue'
import * as rolesStore from '../store/roles'

export default {
  name: 'RolesSelection',
  props: {
    multiselect: {
      type: Boolean,
      required: true
    }
  },
  setup (props, { emit }) {
    const {
      roles,
      loadAllRoles
    } = rolesStore.useStore()

    const selectedRolesRef = ref([])
    const selectionDialogRef = ref(false)
    let initiator

    function selected () {
      const arr = selectedRolesRef.value.map(idx => roles[idx].internalId)
      emit('selected', arr, initiator)
    }

    function showDialog (init, selected) {
      initiator = init
      if (roles.length === 0) {
        loadAllRoles().then(() => {
          selectionDialogRef.value = true
          const arr = selected ? selected.map(id => roles.findIndex(role => role.id === id || role.internalId === id)) : []
          selectedRolesRef.value = arr
        })
      } else {
        selectionDialogRef.value = true
        const arr = selected ? selected.map(id => roles.findIndex(role => role.id === id || role.internalId === id)) : []
        selectedRolesRef.value = arr
      }
    }

    function closeDialog () {
      selectionDialogRef.value = false
    }

    return {
      roles,
      selectionDialogRef,
      selected,
      selectedRolesRef,
      showDialog,
      closeDialog
    }
  }
}
</script>
