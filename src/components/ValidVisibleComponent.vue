<template>
  <div v-if="elem && typesLoadedRef">
              <v-card class="mb-5 mt-2">
                <v-card-title class="subtitle-2 font-weight-bold" >
                  <div style="width:90%">{{ $t('Config.Attributes.Valid') }}</div>
                  <v-tooltip bottom v-if="canEditConfig">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="editValid"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Edit') }}</span>
                  </v-tooltip>
                </v-card-title>
                <v-divider></v-divider>
                <v-list dense class="pt-0 pb-0">
                  <v-list-item v-for="(item, i) in valid" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
                    <router-link :to="'/config/types/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
                  </v-list-item-content></v-list-item>
                </v-list>
              </v-card>

              <v-card class="mb-5">
                <v-card-title class="subtitle-2 font-weight-bold" >
                  <div style="width:80%">{{ $t('Config.Attributes.Visible') }}</div>
                  <v-tooltip bottom v-if="canEditConfig">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="addVisible"><v-icon>mdi-plus</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Add') }}</span>
                  </v-tooltip>
                  <v-tooltip bottom v-if="canEditConfig">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="removeVisible" :disabled="visibleSelectedRef == null"><v-icon>mdi-minus</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Remove') }}</span>
                  </v-tooltip>
                </v-card-title>
                <v-divider></v-divider>
                <v-list dense class="pt-0 pb-0">
                  <v-list-item-group v-model="visibleSelectedRef" color="primary">
                    <v-list-item dense class="pt-0 pb-0"  v-for="(item, i) in visible" :key="i">
                      <v-list-item-content class="pt-0 pb-0" style="display: inline">
                      <router-link :to="'/item/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-card>

    <TypeSelectionDialog ref="typeSelectionDialogRef" :multiselect="true" @selected="typesSelected"/>
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemsSelected"/>
  </div>
</template>
<script>
import { ref, computed, onMounted, watch } from '@vue/composition-api'
import * as typesStore from '../store/types'
import * as langStore from '../store/languages'
import * as itemStore from '../store/item'
import TypeSelectionDialog from './TypeSelectionDialog'
import ItemsSelectionDialog from './ItemsSelectionDialog'

export default {
  props: {
    elem: {
      required: true
    },
    canEditConfig: {
      required: true
    }
  },
  components: { TypeSelectionDialog, ItemsSelectionDialog },
  setup (props, { emit, root }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      findType,
      loadAllTypes
    } = typesStore.useStore()

    const {
      loadItemsByIds
    } = itemStore.useStore()

    const typesLoadedRef = ref(false)
    const typeSelectionDialogRef = ref(null)
    const itemSelectionDialogRef = ref(null)
    const visible = ref([])
    const visibleSelectedRef = ref(null)

    watch(() => props.elem, (elemNew, elemOld) => {
      visible.value = []
      if (elemNew && !elemNew.group && elemNew.visible && elemNew.visible.length > 0) {
        loadItemsByIds(elemNew.visible, false).then(items => {
          visible.value = items
        })
      }
    })

    const valid = computed(() => {
      if (typesLoadedRef.value && props.elem.valid) {
        return props.elem.valid.map((id) => findType(id).node)
      } else {
        return []
      }
    })

    function editValid () {
      typeSelectionDialogRef.value.showDialog('valid', props.elem.valid)
    }

    function typesSelected (arr) {
      typeSelectionDialogRef.value.closeDialog()
      props.elem.valid = arr
    }

    function addVisible () {
      itemSelectionDialogRef.value.showDialog('visible', props.elem.visible)
    }

    function itemsSelected (id) {
      itemSelectionDialogRef.value.closeDialog()
      const tst = props.elem.visible.find(elem => elem === id)
      if (!tst) {
        props.elem.visible.push(id)
        loadItemsByIds([id], false).then(items => {
          visible.value.push(items[0])
        })
      }
    }

    function removeVisible () {
      visible.value.splice(visibleSelectedRef.value, 1)
      props.elem.visible.splice(visibleSelectedRef.value, 1)
      visibleSelectedRef.value = null
    }

    onMounted(() => {
      loadAllTypes().then(() => { typesLoadedRef.value = true })
    })

    return {
      currentLanguage,
      defaultLanguageIdentifier,
      typeSelectionDialogRef,
      itemSelectionDialogRef,
      editValid,
      valid,
      typesSelected,
      addVisible,
      removeVisible,
      visible,
      visibleSelectedRef,
      itemsSelected,
      typesLoadedRef
    }
  }
}
</script>
