<template>
  <v-dialog v-model="showAttributesDialogRef" persistent fullscreen>
    <v-card>
      <v-card-text>
        <Attributes v-if="currentItem" :item=currentItem :type="typeRef" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="showAttributesDialogRef = false">{{ $t('Close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import Attributes from '../views/config/Attributes'
import { ref } from 'vue'

export default {
  components: { Attributes },
  name: 'ShowAttributesDialog',
  setup () {
    const showAttributesDialogRef = ref(null)
    const currentItem = ref(null)
    const typeRef = ref(null)

    function showDialog (item, type) {
      currentItem.value = item
      typeRef.value = type
      showAttributesDialogRef.value = true
    }

    return {
      currentItem,
      typeRef,
      showDialog,
      showAttributesDialogRef
    }
  }
}
</script>
