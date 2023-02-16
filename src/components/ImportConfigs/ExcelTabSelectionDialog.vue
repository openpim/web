<template>
  <v-dialog v-model="dialogRef">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('ColumnsSelection.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container class="pt-0">
          <v-row>
            <v-col class="pt-0">
              <v-select clearable v-model="selectedTabRef" :items="availableTabs" item-value="id" item-text="name" :label="$t('MappingConfigComponent.VisibleRelation')"></v-select>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="closeDialog">{{ $t('Cancel') }}</v-btn>
        <v-btn color="blue darken-1" text @click="selected">{{ $t('Select') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { ref } from '@vue/composition-api'

export default {
  name: 'ExcelTabeSelectionDialog',

  props: {
    tabs: {
      type: Array,
      required: true
    }
  },

  setup (props, { emit }) {
    const availableTabs = ref([])
    const selectedTabRef = ref(null)
    const dialogRef = ref(false)

    function selected () {
      emit('selected', selectedTabRef.value)
      dialogRef.value = false
    }

    function showDialog (selected) {
      availableTabs.value = props.tabs.map((el, indx) => ({ id: indx, name: el }))
      selectedTabRef.value = selected
      dialogRef.value = true
    }

    function closeDialog () {
      dialogRef.value = false
    }

    return {
      availableTabs,
      closeDialog,
      dialogRef,
      selected,
      selectedTabRef,
      showDialog
    }
  }
}
</script>
