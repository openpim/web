<template>
  <v-row justify="center">
    <v-dialog v-model="dialogRef" persistent width="50%">
      <v-card v-if="newCollectionRef">
        <v-card-title>
          <span class="headline">{{ $t('CollectionCreationDialog.Title') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-form ref="formRef" lazy-validation>
                  <v-text-field v-model="newCollectionRef.identifier" :error-messages="identifierErrors" :rules="identifierRules" :label="$t('CollectionCreationDialog.Identifier')" required></v-text-field>
                  <v-text-field v-model="newCollectionRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('CollectionCreationDialog.Name')" required></v-text-field>
                  <v-checkbox v-model="newCollectionRef.public" :label="$t('Collections.collectionPublic')" flat hide-details></v-checkbox>
                </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
          <v-btn color="blue darken-1" text @click="create">{{ $t('Create') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { ref } from 'vue'
import * as langStore from '../store/languages'
import * as collectionsStore from '../store/collections'
import i18n from '../i18n'

export default {
  name: 'CollectionCreation',
  setup (props, { emit }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      checkIdentifier,
      saveCollection
    } = collectionsStore.useStore()

    const dialogRef = ref(false)
    const formRef = ref(null)
    const newCollectionRef = ref(null)
    const identifierErrors = ref([])

    function showDialog () {
      dialogRef.value = true
      const name = {}
      name[currentLanguage.value.identifier] = ''
      newCollectionRef.value = { id: Date.now(), internalId: 0, public: false, name, identifier: '' }
    }

    function closeDialog () {
      dialogRef.value = false
    }

    function create () {
      formRef.value.resetValidation()
      if (formRef.value.validate()) {
        checkIdentifier(newCollectionRef.value.identifier).then((val) => {
          if (val) {
            identifierErrors.value = [i18n.t('Config.Attributes.Error.IdentifierNotUnique')]
            return
          }
          saveCollection(newCollectionRef.value)
          emit('created', newCollectionRef.value)
        })
      }
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
      dialogRef,
      create,
      showDialog,
      closeDialog,
      newCollectionRef,
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
