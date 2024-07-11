<template>
  <v-row justify="center">
    <v-dialog v-model="dialogRef" persistent width="50%">
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

                    <div><div class="d-inline-flex align-center">
                      <div v-if="selectedType">
                        <router-link :to="'/config/types/' + selectedType.identifier">{{ selectedType.identifier }}</router-link><span class="ml-2">- {{ selectedType.name[currentLanguage.identifier] || '[' + selectedType.name[defaultLanguageIdentifier] + ']' }}</span>
                      </div>
                      <v-btn color="blue darken-1" text @click="typeSelectionDialogRef.showDialog()">{{ $t('ItemDuplicationDialog.AnotherType') }}</v-btn>
                    </div></div>

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
    <TypeSelectionDialog ref="typeSelectionDialogRef" :multiselect="false" @selected="typeSelected"/>
  </v-row>
</template>
<script>
import * as itemsStore from '../store/item'
import { ref } from '@vue/composition-api'
import * as langStore from '../store/languages'
import * as typesStore from '../store/types'
import * as attrStore from '../store/attributes'
import TypeSelectionDialog from './TypeSelectionDialog'
import i18n from '../i18n'
import newItemGenerator from '../_customizations/item/newItemGenerator'

export default {
  name: 'ItemCreation',
  components: { TypeSelectionDialog },
  setup (props, { emit }) {
    const { identifierExists, nextId, loadItemByIdentifier } = itemsStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      findType
    } = typesStore.useStore()

    const {
      getAllItemsAttributes
    } = attrStore.useStore()

    const dialogRef = ref(false)
    const empty = { id: -1 }
    const selectedItemRef = ref(empty)
    const newItemRef = ref(null)
    const formRef = ref(null)
    const identifierErrors = ref([])
    const selectedType = ref(null)
    const typeSelectionDialogRef = ref(null)

    function duplicate () {
      formRef.value.resetValidation()
      if (formRef.value.validate()) {
        identifierExists(newItemRef.value.identifier).then((val) => {
          if (val) {
            identifierErrors.value = [i18n.t('Config.Attributes.Error.IdentifierNotUnique')]
            return
          }
          const newItem = newItemRef.value

          if (!selectedType.value) {
            newItem.typeIcon = selectedItemRef.value.typeIcon
            newItem.typeIdentifier = selectedItemRef.value.typeIdentifier
            newItem.typeIconColor = selectedItemRef.value.typeIconColor
            newItem.typeFile = selectedItemRef.value.typeFile
            newItem.typeId = selectedItemRef.value.typeId
          } else {
            newItem.typeIcon = selectedType.value.icon
            newItem.typeIdentifier = selectedType.value.identifier
            newItem.typeIconColor = selectedType.value.iconColor
            newItem.typeFile = selectedType.value.file
            newItem.typeId = selectedType.value.id
          }

          emit('duplicated', newItem)
        })
      }
    }

    async function showDialog (itemSelected) {
      selectedType.value = null
      nextId().then(async id => {
        newItemRef.value = { id: Date.now(), identifier: itemSelected.typeIdentifier + id, internalId: 0, children: [], name: itemSelected.name, values: itemSelected.values }
        const parent = itemSelected.parentIdentifier ? await loadItemByIdentifier(itemSelected.parentIdentifier) : null
        const type = findType(itemSelected.typeId).node
        const obj = await newItemGenerator(nextId, id, type, newItemRef.value, parent)
        if (obj) {
          newItemRef.value.identifier = obj.identifier
          if (obj.name) newItemRef.value.name = obj.name
        }

        const attrs = getAllItemsAttributes()
        const attrsToFilter = attrs.filter(attr => attr.options.some(elem => elem.name === 'skipOnCopy' && elem.value === 'true'))
        attrsToFilter.forEach(attr => {
          delete newItemRef.value.values[attr.identifier]
        })

        selectedItemRef.value = itemSelected
        dialogRef.value = true
      })
    }

    function closeDialog () {
      dialogRef.value = false
    }

    function typeSelected (arr) {
      typeSelectionDialogRef.value.closeDialog()
      selectedType.value = findType(arr[0]).node
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
      selectedType,
      typeSelectionDialogRef,
      typeSelected,
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
