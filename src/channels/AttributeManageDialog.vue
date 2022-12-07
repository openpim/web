<template>
  <v-row justify="center">
    <v-dialog v-model="dialogRef" persistent width="80%">
      <v-card v-if="attrRef">
        <v-card-title>
          <span :class="initialGroups && initialGroups.length > 0 ? 'headline indigo--text' : 'headline pink--text'">
            {{ initialGroups && initialGroups.length > 0 ? $t('AttributeManageDialog.TitleExisting') : $t('AttributeManageDialog.TitleNew') }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-container style="max-height: 500px" class="overflow-y-auto">
            <v-row>
              <v-col cols="12">
                <v-form ref="formRef" lazy-validation>
                  <v-autocomplete chips deletable-chips :multiple="initialGroups && initialGroups.length > 0" :readonly="initialGroups && initialGroups.length > 0" :clearable="!initialGroups" item-text="text" item-value='id' v-model="groupRef" :items="groupsSelectionRef" :label="$t('AttributeManageDialog.Group')"/>
                  <AttributeViewComponent :attr="attrRef" :canEditConfig="true" />
                </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
          <v-btn color="blue darken-1" text @click="manage" :disabled="!groupRef || groupRef.length === 0">{{ $t('Execute') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { ref, onMounted } from 'vue'
import AttributeViewComponent from '../components/AttributeViewComponent.vue'
import * as attrStore from '../store/attributes'
import * as langStore from '../store/languages'

export default {
  components: { AttributeViewComponent },
  setup (props, { emit }) {
    const {
      groups,
      loadAllAttributes
    } = attrStore.useStore()

    const {
      currentLanguage,
      loadAllLanguages
    } = langStore.useStore()

    const dialogRef = ref(false)
    const attrRef = ref(null)
    const groupRef = ref([])
    const groupsSelectionRef = ref([])
    const initialGroups = ref(null)
    const formRef = ref(null)
    let mapping = null

    function showDialog (attr, groups, attrMapping) {
      mapping = attrMapping
      initialGroups.value = groups
      groupRef.value = groups || []
      attrRef.value = attr
      dialogRef.value = true
    }

    function closeDialog () {
      dialogRef.value = false
    }

    function manage () {
      if (formRef.value.validate()) {
        emit('manage', { attr: attrRef.value, groups: groupRef.value, attrMapping: mapping })
      }
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
      formRef,
      attrRef,
      showDialog,
      closeDialog,
      manage,
      groupRef,
      groupsSelectionRef,
      currentLanguage,
      initialGroups
    }
  }
}
</script>
