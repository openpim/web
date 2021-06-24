<template>
  <v-dialog v-model="dialogRef" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('FileUploadDialog.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-form ref="formRef" lazy-validation class="ml-7">
                <v-file-input chips multiple show-size v-model="fileRef" :label="$t('FileUploadDialog.NewFile')"></v-file-input>
                <v-select v-model="relationRef" :items="relationsWithFiles" :label="$t('FileUploadDialog.FileType')"></v-select>
                <div class="d-inline-flex align-center">
                  <div v-if="selectedParentRef">
                    <router-link :to="'/item/' + selectedParentRef.identifier">{{ selectedParentRef.identifier }}</router-link><span class="ml-2">- {{ selectedParentRef.name[currentLanguage.identifier] || '[' + selectedParentRef.name[defaultLanguageIdentifier] + ']' }}</span>
                  </div>
                  <v-btn color="blue darken-1" text @click="itemSelectionDialogRef.showDialog()">{{ $t('FileUploadDialog.SelectParent.Button') }}</v-btn>
                </div>
              </v-form>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="closeDialog">{{ $t('Cancel') }}</v-btn>
        <v-btn color="blue darken-1" text @click="upload" :disabled="!fileRef || !relationRef || !selectedParentRef">{{ $t('ItemView.Upload') }}</v-btn>
      </v-card-actions>
    </v-card>
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="parentSelected"/>
  </v-dialog>
</template>
<script>
import { ref, computed } from '@vue/composition-api'
import * as typesStore from '../store/types'
import * as relStore from '../store/relations'
import * as langStore from '../store/languages'
import * as itemStore from '../store/item'
import * as errorStore from '../store/error'
import ItemsSelectionDialog from './ItemsSelectionDialog'
import i18n from '../i18n'

export default {
  name: 'FileUploadDialog',
  props: {
    typeId: {
      required: true
    }
  },
  components: { ItemsSelectionDialog },
  setup (props, { emit }) {
    const { showError } = errorStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      findType
    } = typesStore.useStore()

    const {
      relations
    } = relStore.useStore()

    const {
      loadItemsByIds
    } = itemStore.useStore()

    const formRef = ref(null)
    const dialogRef = ref(false)
    const fileRef = ref(null)
    const relationRef = ref(0)
    const itemSelectionDialogRef = ref(null)
    const selectedParentRef = ref(null)
    let initiator
    let fileItemTypeId

    const relationsWithFiles = computed(() => {
      const arr = []
      const typeId = parseInt(props.typeId)
      relations.forEach(relation => {
        if (relation.sources.includes(typeId)) {
          for (let i = 0; i < relation.targets.length; i++) {
            const targetTypeId = relation.targets[i]
            const targetType = findType(targetTypeId).node
            if (targetType && targetType.file) {
              arr.push({ value: relation.id, text: relation.name[currentLanguage.value.identifier] || '[' + relation.name[defaultLanguageIdentifier.value] + ']' })
              break
            }
          }
        }
      })
      return arr
    })

    // TODO: potential bug, if user change relation selection after parent selection fileItemType will be old one
    function parentSelected (id) {
      loadItemsByIds([id], false).then(items => {
        const parent = items[0]
        const parentType = findType(parent.typeId).node

        const relation = relations.find(relation => relation.id === relationRef.value)

        fileItemTypeId = relation.targets.find(typeId => findType(typeId).node.file)
        const fileItemType = findType(fileItemTypeId).node
        const tstType = parentType.children.find(elem => (elem.identifier === fileItemType.identifier) || (elem.link === fileItemType.id))
        if (tstType) {
          itemSelectionDialogRef.value.closeDialog()
          selectedParentRef.value = parent
        } else {
          showError(i18n.t('FileUploadDialog.SelectParent.WrongParent'))
        }
      })
    }

    function upload () {
      const arr = fileRef.value.map(fileRef => { return { file: fileRef, fileItemTypeId: fileItemTypeId, parentId: selectedParentRef.value.id, relationId: relationRef.value } })
      emit('upload', arr, initiator)
    }

    function showDialog (init, selected) {
      initiator = init
      dialogRef.value = true

      fileItemTypeId = null
      const tst = localStorage.getItem('upload_relation')
      relationRef.value = tst ? parseInt(tst) : relationsWithFiles.value[0].value
      fileRef.value = null
      selectedParentRef.value = null
      const tstParent = localStorage.getItem('upload_parent')
      if (tstParent) {
        parentSelected(parseInt(tstParent))
      }
    }

    function closeDialog () {
      if (relationRef.value) {
        localStorage.setItem('upload_relation', relationRef.value)
      }
      if (selectedParentRef.value) {
        localStorage.setItem('upload_parent', selectedParentRef.value.id)
      }
      dialogRef.value = false
    }

    return {
      formRef,
      dialogRef,
      fileRef,
      upload,
      relationsWithFiles,
      relationRef,
      itemSelectionDialogRef,
      selectedParentRef,
      parentSelected,
      showDialog,
      closeDialog,
      currentLanguage,
      defaultLanguageIdentifier
    }
  }
}
</script>
