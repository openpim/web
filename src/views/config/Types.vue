<template>
  <v-container v-if="canViewConfigRef">
    <v-row no-gutters>
      <v-col cols="5">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ $t('Config.Types.ObjectType') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip bottom v-if="canEditConfigRef">
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" @click="add" :disabled="selectedRef.internalId == 0"><v-icon>mdi-plus</v-icon></v-btn>
            </template>
            <span>{{ $t('Add') }}</span>
          </v-tooltip>
        </v-toolbar>
        <v-treeview dense activatable hoverable :items="typesTree" @update:active="activeChanged" :active="activeRef" :open="openRef">
          <template v-slot:prepend="{ item }">
            <v-icon v-if="item.icon" :color="item.iconColor">mdi-{{ item.icon }}</v-icon>
          </template>
          <template v-slot:label="{ item }">
            <div :class="item.link !== 0 ? 'font-italic font-weight-light': ''">{{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }} </div>
          </template>
        </v-treeview>
      </v-col>
      <v-col cols="7">
        <v-form ref="formRef" lazy-validation class="ml-7" v-if="selectedRef.id != -1">
          <div v-if="selectedRef.link === 0">
            <div class="d-inline-flex align-center">
              <v-text-field style="min-width: 100%" v-model="selectedRef.identifier" :disabled="selectedRef.internalId !== 0" :rules="identifierRules" :label="$t('Config.Types.ObjectType.Identifier')" required></v-text-field>
              <SystemInformation :data="selectedRef"></SystemInformation>
            </div>

            <LanguageDependentField :values="selectedRef.name" v-model="selectedRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('Config.Types.ObjectType.Name')"></LanguageDependentField>
            <v-text-field v-model="selectedRef.icon" :label="$t('Config.Types.ObjectType.Icon')" required></v-text-field>
            <v-text-field v-model="selectedRef.iconColor" :label="$t('Config.Types.ObjectType.IconColor')" required></v-text-field>
            <v-checkbox v-model="selectedRef.file" :label="$t('Config.Types.ObjectType.File')"></v-checkbox>

              <v-card class="mb-5 mt-2">
                <v-card-title class="subtitle-2 font-weight-bold" >
                  <div style="width:80%">{{ $t('Config.Types.ObjectType.ImageRelations') }}</div>
                  <v-tooltip bottom v-if="canEditConfigRef">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="editRelations"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Edit') }}</span>
                  </v-tooltip>
                  <v-tooltip bottom v-if="canEditConfigRef">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="setMainImage" :disabled="!(relSelectedRef || relSelectedRef === 0)"><v-icon>mdi-picture-in-picture-top-right</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Config.Types.Set.MainImage') }}</span>
                  </v-tooltip>
                </v-card-title>
                <v-divider></v-divider>
                <v-list dense class="pt-0 pb-0">
                  <v-list-item-group v-model="relSelectedRef" color="primary">
                    <v-list-item v-for="(item, i) in imageRelations" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
                      <router-link :to="'/config/relations/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }} {{ item.id === parseInt(selectedRef.mainImage) ? '('+$t('Config.Types.MainImage')+')' : ''}}</span>
                    </v-list-item-content></v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-card>

            <v-btn class="mr-4" v-if="canEditConfigRef" @click="save">{{ $t('Save') }}</v-btn>
            <v-btn class="mr-4" v-if="canEditConfigRef" @click="link">{{ $t('Config.Types.Link') }}</v-btn>
            <v-btn class="mr-4" v-if="canEditConfigRef" @click="remove" :disabled="selectedRef.children && selectedRef.children.length > 0">{{ $t('Remove') }}</v-btn>
          </div>
          <div v-else>
            <a @click="toLink"> {{ $t('Config.Types.LinkTo', {identifier: linkParent.identifier, name: linkParent.name[currentLanguage.identifier]}) }} </a><br>
            <div class="d-inline-flex align-center">
              <v-text-field  class="mt-4" v-model="linkParent.identifier" readonly :label="$t('Config.Types.ObjectType.Identifier')" required></v-text-field>
              <SystemInformation :data="selectedRef"></SystemInformation>
            </div>

            <LanguageDependentField :values="linkParent.name" v-model="linkParent.name[currentLanguage.identifier]" :label="$t('Config.Types.ObjectType.Name')"></LanguageDependentField>
            <v-text-field v-model="linkParent.icon" readonly :label="$t('Config.Types.ObjectType.Icon')" required></v-text-field>
            <v-text-field v-model="linkParent.iconColor" readonly :label="$t('Config.Types.ObjectType.IconColor')" required></v-text-field>
            <v-btn  v-if="canEditConfigRef" class="mr-4" @click="remove">{{ $t('Remove') }}</v-btn>
          </div>
        </v-form>
      </v-col>
    </v-row>
    <TypeSelectionDialog ref="typeSelectionDialogRef" :multiselect="false" @selected="typesSelected"/>
    <RelationsSelectionDialog ref="relSelectionDialogRef" :multiselect="true" @selected="relationsSelected"/>
  </v-container>
</template>

<script>
import TypeSelectionDialog from '../../components/TypeSelectionDialog'

import { ref, computed, onMounted } from '@vue/composition-api'
import * as errorStore from '../../store/error'
import * as typesStore from '../../store/types'
import i18n from '../../i18n'
import router from '../../router'
import * as langStore from '../../store/languages'
import LanguageDependentField from '../../components/LanguageDependentField'
import * as userStore from '../../store/users'
import * as relStore from '../../store/relations'
import RelationsSelectionDialog from '../../components/RelationsSelectionDialog'
import SystemInformation from '../../components/SystemInformation'

export default {
  components: { TypeSelectionDialog, LanguageDependentField, RelationsSelectionDialog, SystemInformation },
  setup () {
    const { canViewConfig, canEditConfig } = userStore.useStore()

    const {
      showInfo
    } = errorStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      typesTree,
      loadAllTypes,
      findType,
      findTypeByIdentifier,
      addType,
      linkType,
      removeType,
      saveType
    } = typesStore.useStore()

    const {
      relations,
      loadAllRelations
    } = relStore.useStore()

    const canViewConfigRef = ref(false)
    const canEditConfigRef = ref(false)

    const formRef = ref(null)
    const typeSelectionDialogRef = ref(null)
    const relSelectionDialogRef = ref(null)
    const selectedRef = ref({ id: -1 })
    const activeRef = ref([])
    const openRef = ref([])
    const relSelectedRef = ref(null)

    const imageRelations = computed(() => {
      if (selectedRef.value.images) {
        return selectedRef.value.images.map(id => relations.find(rel => rel.id === id || rel.internalId === id))
      } else {
        return []
      }
    })

    function editRelations () {
      relSelectionDialogRef.value.showDialog('', selectedRef.value.images)
    }

    function relationsSelected (arr) {
      relSelectionDialogRef.value.closeDialog()
      selectedRef.value.images = arr
    }

    function setMainImage () {
      selectedRef.value.mainImage = imageRelations.value[relSelectedRef.value].internalId
    }

    const linkParent = computed(() => {
      if (selectedRef.value.link === 0) {
        return selectedRef.value
      } else {
        return findType(selectedRef.value.link).node
      }
    })

    function link () {
      typeSelectionDialogRef.value.showDialog()
    }

    function activeChanged (active) {
      if (active.length !== 0) {
        if (selectedRef.value.internalId === 0 && active[0] !== selectedRef.value.id) {
          showInfo(i18n.t('Config.NotSaved'))
        }

        if (active[0] !== selectedRef.value.id) {
          activeRef.value[0] = active[0]
          selectedRef.value = findType(active[0]).node
          router.push('/config/types' + (selectedRef.value.identifier ? '/' + selectedRef.value.identifier : ''))
        }
      } else {
        selectedRef.value = { id: -1 }
        router.push('/config/types')
      }
    }

    function add () {
      const parent = selectedRef.value.id
      selectedRef.value = addType(selectedRef.value.id)
      if (parent !== -1) openRef.value.push(parent)
      activeRef.value.pop()
      activeRef.value.push(selectedRef.value.id)
    }

    function remove () {
      if (confirm(i18n.t('Config.Types.Confirm.Delete', { name: selectedRef.value.name[currentLanguage.value.identifier] }))) {
        activeRef.value.pop()
        removeType(selectedRef.value.id)
        selectedRef.value = { id: -1 }
        router.push('/config/types')
      }
    }

    function save () {
      if (formRef.value.validate()) {
        router.push('/config/types/' + selectedRef.value.identifier)
        saveType(selectedRef.value).then(() => {
          showInfo(i18n.t('Saved'))
        })
      }
    }

    function typesSelected (arr) {
      typeSelectionDialogRef.value.closeDialog()

      const parentId = arr[0]
      const parent = findType(parentId).node
      const tst = parent.children.findIndex((item) => item.link === selectedRef.value.id)
      if (tst === -1) { // if we do not have such link already
        linkType(parentId, selectedRef.value.id, selectedRef.value.internalId).then((newType) => {
          selectedRef.value = newType
          openRef.value.push(parent)
          activeRef.value.pop()
          activeRef.value.push(selectedRef.value.id)
        })
      }
    }

    function toLink () {
      activeRef.value = [selectedRef.value.link]
    }

    onMounted(() => {
      loadAllRelations()
      loadAllTypes().then(() => {
        canViewConfigRef.value = canViewConfig('types')
        canEditConfigRef.value = canEditConfig('types')

        const id = router.currentRoute.params.id
        if (id) {
          const result = findTypeByIdentifier(id)
          if (result.node) {
            selectedRef.value = result.node
            activeRef.value.push(result.node.id)
            openRef.value = result.path
          } else {
            router.push('/config/types')
          }
        }
      })
    })

    function identifierValidation (v) {
      if (!/^[A-Za-z0-9_-]*$/.test(v)) {
        return i18n.t('Wrong.Identifier')
      }
      return (selectedRef.value.internalId !== 0 || findTypeByIdentifier(v).node.internalId === 0) || i18n.t('Config.Types.Error.IdentifierNotUnique')
    }

    return {
      canViewConfigRef,
      canEditConfigRef,
      formRef,
      typesTree,
      selectedRef,
      activeRef,
      openRef,
      add,
      remove,
      save,
      link,
      activeChanged,
      typesSelected,
      typeSelectionDialogRef,
      linkParent,
      toLink,
      currentLanguage,
      defaultLanguageIdentifier,
      editRelations,
      relationsSelected,
      imageRelations,
      relSelectionDialogRef,
      relSelectedRef,
      setMainImage,
      identifierRules: [
        v => !!v || i18n.t('Config.Types.Error.IdentifierRequired'),
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('Config.Types.Error.NameRequired')
      ]
    }
  }
}
</script>
