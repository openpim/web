<template>
  <v-dialog v-model="selectionDialogRef" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('Roles.SelectionDialog.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
            <v-list nav dense>
              <v-list-group v-for="group in roleTree.groups" :key="group.id">
                <template v-slot:activator>
                  <v-list-item-action class="mr-3">
                    <v-checkbox :input-value="isGroupSelected(group)" :indeterminate="isGroupIndeterminate(group)"
                      @click.stop="toggleGroup(group)"></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-icon class="my-0 mr-3 align-self-center" style="min-width: 24px">
                    <v-icon>mdi-folder</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title v-text="group.name"></v-list-item-title>
                  </v-list-item-content>
                </template>
                <v-list-item v-for="role in group.children" :key="role.id" @click="toggleSelection(roleId(role))">
                  <v-list-item-action class="ml-6 mr-3">
                    <v-checkbox :input-value="isSelected(roleId(role))" @click.stop="toggleSelection(roleId(role))"></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title v-text="role.name"></v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-group>

              <v-list-item v-for="role in roleTree.singles" :key="role.id" @click="toggleSelection(roleId(role))">
                <v-list-item-action class="mr-3">
                  <v-checkbox :input-value="isSelected(roleId(role))" @click.stop="toggleSelection(roleId(role))"></v-checkbox>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title v-text="role.name"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
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
import { computed, ref } from '@vue/composition-api'
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
      roleId,
      sameId,
      buildRoleTree,
      expandRoleIds,
      loadAllRoles
    } = rolesStore.useStore()

    const selectedRolesRef = ref([])
    const selectionDialogRef = ref(false)
    let initiator

    function selected () {
      emit('selected', expandRoleIds(selectedRolesRef.value), initiator)
    }

    function showDialog (init, selected) {
      initiator = init
      if (roles.length === 0) {
        loadAllRoles().then(() => {
          selectionDialogRef.value = true
          selectedRolesRef.value = expandRoleIds(selected || [])
        })
      } else {
        selectionDialogRef.value = true
        selectedRolesRef.value = expandRoleIds(selected || [])
      }
    }

    function closeDialog () {
      selectionDialogRef.value = false
    }

    const roleTree = computed(() => buildRoleTree(roles))

    function isSelected (id) {
      return selectedRolesRef.value.some(selectedId => sameId(selectedId, id))
    }

    function toggleSelection (id) {
      const index = selectedRolesRef.value.findIndex(selectedId => sameId(selectedId, id))
      if (index === -1) {
        if (!props.multiselect) selectedRolesRef.value = []
        selectedRolesRef.value.push(id)
      } else {
        selectedRolesRef.value.splice(index, 1)
      }
    }

    function isGroupSelected (group) {
      return group.children.length > 0 && group.children.every(role => isSelected(roleId(role)))
    }

    function isGroupIndeterminate (group) {
      const selectedCount = group.children.filter(role => isSelected(roleId(role))).length
      return selectedCount > 0 && selectedCount < group.children.length
    }

    function toggleGroup (group) {
      const select = !isGroupSelected(group)
      group.children.forEach(role => {
        const id = roleId(role)
        if (select && !isSelected(id)) toggleSelection(id)
        if (!select && isSelected(id)) toggleSelection(id)
      })
    }

    return {
      roles,
      roleId,
      roleTree,
      selectionDialogRef,
      selected,
      selectedRolesRef,
      showDialog,
      closeDialog,
      isSelected,
      toggleSelection,
      isGroupSelected,
      isGroupIndeterminate,
      toggleGroup
    }
  }
}
</script>
