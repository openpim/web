<template>
  <v-dialog v-model="dialogRef" width="500" class="text-center">
    <v-card>
      <v-card-title class="grey lighten-2">
        {{$t('ButtonActionStatusDialog.Title')}}
      </v-card-title>
      <div class="text-center" style="margin: 20px;">
        <v-progress-circular :size="50" color="primary" indeterminate v-if="dialogRef"></v-progress-circular>
      </div>
    <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="dialogRef = false">{{$t('Close')}}</v-btn>
      </v-card-actions>
    </v-card>
    </v-dialog>
</template>
<script>
import { ref } from 'vue'

export default {
  name: 'ActionStatusDialog',
  setup (props, { emit }) {
    const dialogRef = ref(false)

    function showDialog (init, itemsSelected) {
      dialogRef.value = true
    }

    function closeDialog () {
      dialogRef.value = false
    }

    return {
      dialogRef,
      showDialog,
      closeDialog
    }
  }
}
</script>
