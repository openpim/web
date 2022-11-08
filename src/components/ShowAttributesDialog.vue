<template>
  <v-dialog v-model="showAttributesDialogRef" persistent fullscreen>
    <v-card>
      <v-card-text>
        <Attributes v-if="currentItem" :item=currentItem />
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
import { ref } from '@vue/composition-api'
// import i18n from '../i18n'

export default {
  components: { Attributes },
  name: 'ShowAttributesDialog',
  setup () {
    const showAttributesDialogRef = ref(null)
    const currentItem = ref(null)

    function showDialog (item) {
      currentItem.value = item
      showAttributesDialogRef.value = true
    }

    return {
      currentItem,
      showDialog,
      showAttributesDialogRef
    }
  }
}
</script>
