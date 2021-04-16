<template>
  <v-row justify="center">
    <v-dialog v-model="dialogRef" persistent max-width="600px">
      <v-card v-if="newItemRef">
        <v-card-title>
          <span class="headline">{{ $t('ItemDuplicationDialog.Title') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-form ref="formRef" lazy-validation>
                <v-text-field v-model="newItemRef.identifier" :error-messages="identifierErrors" :rules="identifierRules" :label="$t('ItemCreationDialog.Identifier')" required></v-text-field>
                <v-text-field v-model="newItemRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('ItemCreationDialog.Name')" required></v-text-field>
                </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
          <v-btn color="blue darken-1" text @click="duplicate">{{ $t('Duplicate') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import * as itemsStore from '../store/item'
import { ref } from '@vue/composition-api'
import * as langStore from '../store/languages'
import i18n from '../i18n'

export default {
  name: 'ItemCreation',
  setup (props, { emit }) {
    const { identifierExists, nextId } = itemsStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const dialogRef = ref(false)
    const empty = { id: -1 }
    const selectedItemRef = ref(empty)
    const newItemRef = ref(null)
    const formRef = ref(null)
    const identifierErrors = ref([])

    function duplicate () {
      formRef.value.resetValidation()
      if (formRef.value.validate()) {
        identifierExists(newItemRef.value.identifier).then((val) => {
          if (val) {
            identifierErrors.value = [i18n.t('Config.Attributes.Error.IdentifierNotUnique')]
            return
          }
          const newItem = newItemRef.value

          newItem.typeIcon = selectedItemRef.value.typeIcon
          newItem.typeIdentifier = selectedItemRef.value.typeIdentifier
          newItem.typeIconColor = selectedItemRef.value.typeIconColor
          newItem.typeFile = selectedItemRef.value.typeFile
          newItem.typeId = selectedItemRef.value.typeId

          emit('duplicated', newItem)
        })
      }
    }

    function showDialog (itemSelected) {
      nextId().then(id => {
        newItemRef.value = { id: Date.now(), identifier: itemSelected.typeIdentifier + id, internalId: 0, children: [], name: itemSelected.name, values: itemSelected.values }
        selectedItemRef.value = itemSelected
        dialogRef.value = true
      })
    }

    function closeDialog () {
      dialogRef.value = false
    }

    function identifierValidation (v) {
      if (!/^[A-Za-z0-9_-]*$/.test(v)) {
        return i18n.t('Wrong.Identifier')
      }
      if (!v) {
        return i18n.t('ItemCreationDialog.IdentifierRequired')
      }
      return true
    }

    return {
      formRef,
      selectedItemRef,
      dialogRef,
      duplicate,
      showDialog,
      closeDialog,
      newItemRef,
      identifierErrors,
      currentLanguage,
      defaultLanguageIdentifier,
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('ItemCreationDialog.NameRequired')
      ]
    }
  }
}
</script>
