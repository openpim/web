<template>
  <v-dialog v-model="dialogRef" persistent width="80%">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('FileUploadDialog.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form ref="formRef" lazy-validation class="ml-7">
            <v-row>
              <v-col cols="12">
                  <v-file-input @change="fileChanged" multiple chips show-size v-model="fileRef" :label="$t('FileUploadDialog.NewFile')"></v-file-input>
                  <v-select v-model="relationRef" :items="relationsWithFiles" :label="$t('FileUploadDialog.FileType')"></v-select>
                  <div class="d-inline-flex align-center">
                    <div v-if="selectedParentRef">
                      <router-link :to="'/item/' + selectedParentRef.identifier">{{ selectedParentRef.identifier }}</router-link><span class="ml-2">- {{ selectedParentRef.name[currentLanguage.identifier] || '[' + selectedParentRef.name[defaultLanguageIdentifier] + ']' }}</span>
                    </div>
                    <v-btn color="blue darken-1" text @click="itemSelectionDialogRef.showDialog()">{{ $t('FileUploadDialog.SelectParent.Button') }}</v-btn>
                  </div>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" class="pa-0">
                <v-expansion-panels flat focusable>
                  <v-expansion-panel :disabled="fileRef && fileRef.length > 1">
                    <v-expansion-panel-header>{{ $t('FileUploadDialog.Additionally') }}</v-expansion-panel-header>
                    <v-expansion-panel-content>
                       <v-container class="pa-0">
                        <v-row no-gutters>
                          <v-text-field class="pt-4 pb-0 pr-5 pl-5" v-model="identifierRef" :label="$t('FileUploadDialog.Identifier')" required></v-text-field>
                        </v-row>
                        <v-row no-gutters>
                          <v-text-field class="pt-4 pb-0 pr-5 pl-5" v-model="nameRef" :label="$t('FileUploadDialog.Name')" required></v-text-field>
                        </v-row>
                       </v-container>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="closeDialog">{{ $t('Cancel') }}</v-btn>
        <v-btn color="blue darken-1" text @click="upload" :disabled="!fileRef || fileRef.length === 0 || !relationRef || !selectedParentRef">{{ $t('ItemView.Upload') }}</v-btn>
      </v-card-actions>
    </v-card>
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="parentSelected"/>
  </v-dialog>
</template>
<script>
import { ref, computed, watch } from 'vue'
import * as typesStore from '../store/types'
import * as relStore from '../store/relations'
import * as langStore from '../store/languages'
import * as itemStore from '../store/item'
import * as userStore from '../store/users'
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

    const { canEditItemRelation } = userStore.useStore()

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
      loadItemsByIds,
      nextId
    } = itemStore.useStore()

    const formRef = ref(null)
    const dialogRef = ref(false)
    const fileRef = ref([])
    const relationRef = ref(0)
    const identifierRef = ref('')
    const nameRef = ref('')
    const itemSelectionDialogRef = ref(null)
    const selectedParentRef = ref(null)
    let initiator
    let fileItemTypeId
    let nextItemId = 0
    let fItemType

    const relationsWithFiles = computed(() => {
      const arr = []
      const typeId = parseInt(props.typeId)
      relations.forEach(relation => {
        if (relation.sources.includes(typeId) && canEditItemRelation(relation.id)) {
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
      if (!id) return
      loadItemsByIds([id], false).then(items => {
        if (!items || items.length === 0) return
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

    function fileChanged (file) {
      nameRef.value = file.length > 0 ? file[0].name : ''
    }

    async function upload () {
      const arr = await Promise.all(
        fileRef.value.map(async (file) => {
          return {
            file: file,
            fileItemTypeId: fileItemTypeId,
            parentId: selectedParentRef.value.id,
            relationId: relationRef.value,
            fileName: fileRef.value.length === 1 ? nameRef.value : file.name,
            fileIdentifier: fileRef.value.length === 1 ? identifierRef.value : fItemType.identifier + await nextId()
          }
        })
      )
      emit('upload', arr, initiator)
    }

    watch(relationRef, (selected) => {
      relationChanged(selected)
    })

    function relationChanged (selected) {
      const rel = relations.find(rel => rel.id === selected)
      if (rel) {
        const defOption = rel.options.find(option => option.name === 'defaultParentId')
        if (defOption && !isNaN(parseInt(defOption.value))) parentSelected(parseInt(defOption.value))

        const fItemTypeId = rel.targets.find(typeId => findType(typeId).node.file)
        fItemType = findType(fItemTypeId).node
        identifierRef.value = fItemType.identifier + nextItemId
      }
    }

    function showDialog (init, selected) {
      nextId().then(id => {
        identifierRef.value = ''
        nameRef.value = ''

        nextItemId = id

        initiator = init
        dialogRef.value = true

        const tstParent = localStorage.getItem('upload_parent')
        if (tstParent) {
          parentSelected(parseInt(tstParent))
        }

        fileItemTypeId = null
        const tst = localStorage.getItem('upload_relation')
        relationRef.value = tst ? parseInt(tst) : relationsWithFiles.value[0].value
        relationChanged(relationRef.value)

        fileRef.value = null
        selectedParentRef.value = null
      })
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
      identifierRef,
      nameRef,
      itemSelectionDialogRef,
      selectedParentRef,
      parentSelected,
      showDialog,
      closeDialog,
      fileChanged,
      currentLanguage,
      defaultLanguageIdentifier
    }
  }
}
</script>
