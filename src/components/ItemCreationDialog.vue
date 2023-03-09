<template>
  <v-row justify="center">
    <v-dialog v-model="dialogRef" persistent width="50%">
      <v-card v-if="newItemRef">
        <v-card-title>
          <span class="headline">{{ $t('ItemCreationDialog.Title') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-form ref="formRef" lazy-validation>
                <v-radio-group v-model="typeSelectedRef" v-for="(item, i) in typesToCreate" :key="i" class="mt-0 mb-0 pt-0 pb-0">
                  <v-radio
                    :label="item.identifier + ' - ' + item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'"
                    :value="item.internalId"
                    class="mt-0 mb-0 pt-0 pb-0"
                  ></v-radio>
                </v-radio-group>
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
          <v-btn color="blue darken-1" text :disabled="!typeSelectedRef" @click="create">{{ $t('Create') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import * as typesStore from '../store/types'
import * as itemsStore from '../store/item'
import { ref, computed, watch } from 'vue'
import * as langStore from '../store/languages'
import * as errorStore from '../store/error'
import * as userStore from '../store/users'
import { useI18n } from 'vue-i18n'

export default {
  name: 'ItemCreation',
  setup (props, { emit }) {
    const { typesTree, findType } = typesStore.useStore()
    const { identifierExists, nextId } = itemsStore.useStore()
    const { showError } = errorStore.useStore()
    const { canEditItem } = userStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const { t } = useI18n()

    const dialogRef = ref(false)
    const empty = { id: -1 }
    const selectedItemRef = ref(empty)
    const typeSelectedRef = ref(null)
    const newItemRef = ref(null)
    const formRef = ref(null)
    const identifierErrors = ref([])
    let newId

    watch(typeSelectedRef, (val) => {
      if (val) {
        const type = findType(val).node
        if (!newItemRef.value.identifier || !newItemRef.value.identifier.startsWith(type.identifier)) {
          newItemRef.value.identifier = type.identifier + newId
        }
      }
    })

    const typesToCreate = computed(() => {
      if (selectedItemRef.value.id === -1) {
        return typesTree.filter(type => canEditItem(type.id))
      } else {
        const type = findType(selectedItemRef.value.typeId).node
        const types = type.children.map((type) => type.link !== 0 ? findType(type.link).node : type)
        return types.filter(type => canEditItem(type.id, selectedItemRef.value.path))
      }
    })

    function create () {
      formRef.value.resetValidation()
      if (formRef.value.validate()) {
        identifierExists(newItemRef.value.identifier).then((val) => {
          if (val) {
            identifierErrors.value = [t('Config.Attributes.Error.IdentifierNotUnique')]
            return
          }
          const newItem = newItemRef.value

          let type = findType(typeSelectedRef.value).node
          if (type.link && type.link !== 0) type = findType(type.link).node
          newItem.typeIcon = type.icon
          newItem.typeIconColor = type.iconColor
          newItem.typeId = type.internalId
          emit('created', newItem)
        })
      }
    }

    function showDialog (itemSelected) {
      nextId().then(id => {
        newId = id
        const name = {}
        name[currentLanguage.value.identifier] = ''
        newItemRef.value = { id: Date.now(), internalId: 0, children: [], name, identifier: '' }
        selectedItemRef.value = itemSelected
        typeSelectedRef.value = null

        if (typesToCreate.value.length > 0) {
          dialogRef.value = true
        } else {
          if (itemSelected.id === -1) {
            showError(t('ItemCreationDialog.NoChildrenRoot'))
          } else {
            showError(t('ItemCreationDialog.NoChildren',
              { typeName: (itemSelected.name[currentLanguage.value.identifier] || '[' + itemSelected.name[defaultLanguageIdentifier.value] + ']') }))
          }
        }
      })
    }

    function closeDialog () {
      dialogRef.value = false
    }

    function identifierValidation (v) {
      if (!/^[A-Za-z0-9_-]*$/.test(v)) {
        return t('Wrong.Identifier')
      }
      if (!v) {
        return t('ItemCreationDialog.IdentifierRequired')
      }
      return true
    }

    return {
      formRef,
      typesToCreate,
      selectedItemRef,
      dialogRef,
      create,
      showDialog,
      closeDialog,
      typeSelectedRef,
      newItemRef,
      identifierErrors,
      currentLanguage,
      defaultLanguageIdentifier,
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || t('ItemCreationDialog.NameRequired')
      ]
    }
  }
}
</script>
