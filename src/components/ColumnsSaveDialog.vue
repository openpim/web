<template>
  <v-dialog v-model="dialogRef" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('ColumnsSaveDialog.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="6">
            <v-list nav dense style="max-height: 300px" class="overflow-y-auto">
              <v-list-item-group v-model="indexlInListRef" color="primary">
                <v-list-item v-for="(item, i) in columnsRef" :key="i">
                  <v-list-item-content>
                    <v-list-item-title v-text="item.name[currentLanguage.identifier]"></v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
            </v-col>
            <v-col cols="6">
              <v-form ref="formRef" lazy-validation class="ml-7" v-if="selectedRef">
                <div class="d-inline-flex align-center">
                  <v-text-field style="min-width: 100%" v-model="selectedRef.identifier" :disabled="selectedRef.id !== -1" :error-messages="identifierErrors" :rules="identifierRules" :label="$t('ColumnsSaveDialog.Identifier')" required></v-text-field>
                </div>

                <LanguageDependentField :values="selectedRef.name" v-model="selectedRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('ColumnsSaveDialog.Name')"></LanguageDependentField>
                <v-checkbox v-model="selectedRef.public" :label="$t('ColumnsSaveDialog.Public')" required></v-checkbox>
              </v-form>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="addColumns">{{ $t('Add') }}</v-btn>
        <v-btn color="blue darken-1" text :disabled="!selectedRef || selectedRef.id === -1" @click="removeColumnsHandler">{{ $t('Remove') }}</v-btn>
        <v-btn color="blue darken-1" text :disabled="!selectedRef" @click="saveColumnsHandler">{{ $t('Save') }}</v-btn>
        <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { ref, watch } from '@vue/composition-api'
import i18n from '../i18n'
import * as langStore from '../store/languages'
import * as searchStore from '../store/search'
import * as itemsStore from '../store/item'
import LanguageDependentField from './LanguageDependentField'

export default {
  name: 'SaveColumnsDialog',
  components: { LanguageDependentField },
  setup () {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const { nextId } = itemsStore.useStore()

    const {
      columnsIdentifierExists,
      saveColumns,
      loadColumns,
      removeColumns
    } = searchStore.useStore()

    const formRef = ref(null)
    const indexlInListRef = ref(null)
    const selectedRef = ref(null)
    const dialogRef = ref(false)
    const columnsRef = ref([])
    const identifierErrors = ref([])
    let columnsConfig = null

    watch(indexlInListRef, (selected, previous) => {
      if (selected != null) {
        selectedRef.value = columnsRef.value[selected]
        selectedRef.value.columns = columnsConfig
      } else {
        selectedRef.value = null
      }
    })

    function addColumns () {
      nextId().then(id => {
        const name = {}
        name[currentLanguage.value.identifier] = i18n.t('ColumnsSaveDialog.NameNew')
        const newOne = { id: -1, identifier: 'columns' + id, name: name, public: false, columns: columnsConfig }
        columnsRef.value.push(newOne)
        indexlInListRef.value = columnsRef.value.length - 1
      })
    }

    function removeColumnsHandler () {
      if (confirm(i18n.t('ColumnsSaveDialog.Confirm.Remove'))) {
        removeColumns(selectedRef.value.identifier).then(() => {
          columnsRef.value.splice(indexlInListRef.value, 1)
          indexlInListRef.value = null
          selectedRef.value = null
        })
      }
    }

    function saveColumnsHandler () {
      if (formRef.value.validate()) {
        if (selectedRef.value.id === -1) {
          columnsIdentifierExists(selectedRef.value.identifier).then((val) => {
            if (val) {
              identifierErrors.value = [i18n.t('ColumnsSaveDialog.IdentifierNotUnique')]
              return
            }
            saveColumns(selectedRef.value).then(() => {
              dialogRef.value = false
            })
          })
        } else {
          saveColumns(selectedRef.value).then(() => {
            dialogRef.value = false
          })
        }
      }
    }

    function showDialog (columns) {
      selectedRef.value = null
      indexlInListRef.value = null
      columnsConfig = columns
      dialogRef.value = true
      loadColumns(true).then(arr => {
        columnsRef.value = arr
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
        return i18n.t('ColumnsSaveDialog.IdentifierRequired')
      }
      return true
    }

    return {
      formRef,
      dialogRef,
      selectedRef,
      showDialog,
      closeDialog,
      removeColumnsHandler,
      addColumns,
      saveColumnsHandler,
      columnsRef,
      indexlInListRef,
      currentLanguage,
      defaultLanguageIdentifier,
      identifierErrors,
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('ColumnsSaveDialog.NameRequired')
      ]
    }
  }
}
</script>
