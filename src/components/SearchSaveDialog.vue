<template>
  <v-dialog v-model="dialogRef" persistent width="80%">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('SearchSaveDialog.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container v-if="selectedRef">
          <v-row>
            <v-col cols="6">
            <v-list nav dense style="max-height: 300px" class="overflow-y-auto">
              <v-list-item-group v-model="indexlInListRef" color="primary">
                <v-list-item v-for="(item, i) in searchesRef" :key="i">
                  <v-list-item-icon><v-icon>mdi-magnify</v-icon></v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title v-text="item.name[currentLanguage.identifier]"></v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
            </v-col>
            <v-col cols="6">
              <v-form ref="formRef" lazy-validation class="ml-7">
                <div class="d-inline-flex align-center">
                  <v-text-field style="min-width: 100%" v-model="selectedRef.identifier" :disabled="!creationRef" :error-messages="identifierErrors" :rules="identifierRules" :label="$t('SearchSaveDialog.Identifier')" required></v-text-field>
                  <SystemInformation :data="selectedRef" v-if="selectedRef.id !== 0"></SystemInformation>
                </div>

                <LanguageDependentField :values="selectedRef.name" v-model="selectedRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('SearchSaveDialog.Name')"></LanguageDependentField>
                <v-checkbox v-model="selectedRef.public" :label="$t('SearchSaveDialog.Public')" required></v-checkbox>
              </v-form>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
        <v-btn color="blue darken-1" text @click="saveSearch">{{ $t('Save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { ref, watch } from '@vue/composition-api'
import i18n from '../i18n'
import * as langStore from '../store/languages'
import * as searchStore from '../store/search'
import SystemInformation from './SystemInformation'
import LanguageDependentField from './LanguageDependentField'
import router from '../router'

export default {
  name: 'SaveSearchDialog',
  components: { SystemInformation, LanguageDependentField },
  setup () {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadSearches,
      identifierExists,
      save,
      searchEntityRef
    } = searchStore.useStore()

    const creationRef = ref(false)
    let initialIndex
    const formRef = ref(null)
    const indexlInListRef = ref(0)
    const selectedRef = ref(null)
    const dialogRef = ref(false)
    const searchesRef = ref([])
    const identifierErrors = ref([])

    watch(indexlInListRef, (selected, previous) => {
      if (previous && selected !== initialIndex) {
        if (confirm(i18n.t('SearchSaveDialog.OverrideConfirmation'))) {
          const data = searchesRef.value[selected]
          selectedRef.value.identifier = data.identifier
          selectedRef.value.entity = data.entity
          selectedRef.value.name = data.name
          searchesRef.value.splice(-1, 1)
          creationRef.value = false
        } else {
          indexlInListRef.value = previous
        }
      }
    })

    function saveSearch () {
      if (formRef.value.validate()) {
        if (creationRef.value) {
          identifierExists(selectedRef.value.identifier).then((val) => {
            if (val) {
              identifierErrors.value = [i18n.t('SearchSaveDialog.IdentifierNotUnique')]
              return
            }
            save(selectedRef.value).then(() => {
              dialogRef.value = false
              router.push('/search/' + selectedRef.value.identifier)
            })
          })
        } else {
          save(selectedRef.value).then(() => {
            dialogRef.value = false
            router.push('/search/' + selectedRef.value.identifier)
          })
        }
      }
    }

    function showDialog (selected) {
      dialogRef.value = true
      selectedRef.value = selected
      loadSearches(true).then(arr => {
        searchesRef.value = arr
        const idx = searchesRef.value.findIndex(elem => elem.identifier === selected.identifier)
        if (idx !== -1) {
          creationRef.value = false
          const data = searchesRef.value[idx]
          data.name = selected.name
          data.entity = searchEntityRef.value
          data.extended = selected.extended
          data.filters = selected.filters
          data.whereClause = selected.whereClause
          indexlInListRef.value = idx
        } else {
          creationRef.value = true
          searchesRef.value.push(selected)
          indexlInListRef.value = searchesRef.value.length - 1
        }
        initialIndex = indexlInListRef.value
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
        return i18n.t('SearchSaveDialog.IdentifierRequired')
      }
      return true
    }

    return {
      formRef,
      dialogRef,
      selectedRef,
      creationRef,
      showDialog,
      closeDialog,
      saveSearch,
      searchesRef,
      indexlInListRef,
      currentLanguage,
      defaultLanguageIdentifier,
      identifierErrors,
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('SearchSaveDialog.NameRequired')
      ]
    }
  }
}
</script>
