<template>
  <v-row justify="center">
    <v-dialog v-model="dialogRef" persistent width="80%">
      <v-card v-if="attrRef">
        <v-card-title>
          <span class="headline">{{ $t('AttributeManageDialog.Title') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container style="max-height: 500px" class="overflow-y-auto">
            <v-row>
              <v-col cols="12">
                <v-form ref="formRef" lazy-validation>
                  <v-autocomplete item-text="text" item-value='id' v-model="groupRef" :items="groupsSelectionRef" :label="$t('AttributeManageDialog.Group')" clearable/>
                  <AttributeViewComponent :attr="attrRef" :canEditConfig="true" />
                </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
          <v-btn color="blue darken-1" text @click="manage" :disabled="!groupRef">{{ $t('Create') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { ref, onMounted } from '@vue/composition-api'
import AttributeViewComponent from '../components/AttributeViewComponent.vue'
import * as attrStore from '../store/attributes'
import * as langStore from '../store/languages'

export default {
  components: { AttributeViewComponent },
  setup (props, { emit }) {
    const {
      groups,
      loadAllAttributes
      /* findById,
      findByIdentifier,
      checkIdentifier,
      saveData,
      assignData,
      removeGroup,
      removeAttribute */
    } = attrStore.useStore()

    const {
      currentLanguage,
      loadAllLanguages
    } = langStore.useStore()

    const dialogRef = ref(false)
    const attrRef = ref(null)
    const groupRef = ref(null)
    const groupsSelectionRef = ref([])

    function showDialog (attr) {
      groupRef.value = null
      attrRef.value = attr
      dialogRef.value = true
    }

    function manage () {
      // emit('created', triggerRef.value)
    }

    onMounted(() => {
      loadAllLanguages()
      loadAllAttributes().then(() => {
        groupsSelectionRef.value = groups.map(group => {
          return { text: group.name[currentLanguage.value.identifier], id: group.id }
        })
      })
    })

    return {
      dialogRef,
      attrRef,
      showDialog,
      manage,
      groupRef,
      groupsSelectionRef,
      currentLanguage
    }
  }
}
</script>
