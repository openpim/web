<template>
  <v-row justify="center">
    <v-dialog v-model="dialogRef" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ $t('Config.Actions.Triggers.Dialog.Title') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-form ref="formRef" lazy-validation class="ml-7" v-if="triggerRef">
                  <v-select v-model="typeRef" :items="typeSelection" :label="$t('Config.Actions.Triggers.Type')"></v-select>
                  <template v-if="triggerRef.type === 1"> <!-- item -->
                    <v-radio-group v-model="triggerRef.event">
                      <v-radio :label="$t('Config.Actions.Triggers.Event.BeforeCreate')" value="1"></v-radio>
                      <v-radio :label="$t('Config.Actions.Triggers.Event.AfterCreate')" value="2"></v-radio>
                      <v-radio :label="$t('Config.Actions.Triggers.Event.BeforeUpdate')" value="3"></v-radio>
                      <v-radio :label="$t('Config.Actions.Triggers.Event.AfterUpdate')" value="4"></v-radio>
                      <v-radio :label="$t('Config.Actions.Triggers.Event.BeforeDelete')" value="5"></v-radio>
                      <v-radio :label="$t('Config.Actions.Triggers.Event.AfterDelete')" value="6"></v-radio>
                    </v-radio-group>
                    <div><div class="d-inline-flex align-center">
                      <div v-if="selectedType">
                        <router-link :to="'/config/types/' + selectedType.identifier">{{ selectedType.identifier }}</router-link><span class="ml-2">- {{ selectedType.name[currentLanguage.identifier] || '[' + selectedType.name[defaultLanguageIdentifier] + ']' }}</span>
                      </div>
                      <v-btn color="blue darken-1" text @click="typeSelectionDialogRef.showDialog()">{{ $t('Config.Actions.Triggers.SelectType.Button') }}</v-btn>
                    </div></div>
                    <div class="d-inline-flex align-center">
                      <div v-if="selectedItemRef">
                        <router-link :to="'/item/' + selectedItemRef.identifier">{{ selectedItemRef.identifier }}</router-link><span class="ml-2">- {{ selectedItemRef.name[currentLanguage.identifier] || '[' + selectedItemRef.name[defaultLanguageIdentifier] + ']' }}</span>
                      </div>
                      <v-btn color="blue darken-1" text @click="itemSelectionDialogRef.showDialog()">{{ $t('Config.Actions.Triggers.SelectItem.Button') }}</v-btn>
                    </div>
                  </template>
                  <template v-if="triggerRef.type === 2"> <!-- item rel -->
                    <v-radio-group v-model="triggerRef.event">
                      <v-radio :label="$t('Config.Actions.Triggers.Event.BeforeCreate')" value="1"></v-radio>
                      <v-radio :label="$t('Config.Actions.Triggers.Event.AfterCreate')" value="2"></v-radio>
                      <v-radio :label="$t('Config.Actions.Triggers.Event.BeforeUpdate')" value="3"></v-radio>
                      <v-radio :label="$t('Config.Actions.Triggers.Event.AfterUpdate')" value="4"></v-radio>
                      <v-radio :label="$t('Config.Actions.Triggers.Event.BeforeDelete')" value="5"></v-radio>
                      <v-radio :label="$t('Config.Actions.Triggers.Event.AfterDelete')" value="6"></v-radio>
                    </v-radio-group>
                    <div class="d-inline-flex align-center">
                      <div v-if="selectedRelation">
                        <router-link :to="'/config/relations/' + selectedRelation.identifier">{{ selectedRelation.identifier }}</router-link><span class="ml-2">- {{ selectedRelation.name[currentLanguage.identifier] || '[' + selectedRelation.name[defaultLanguageIdentifier] + ']' }}</span>
                      </div>
                      <v-btn color="blue darken-1" text @click="relSelectionDialogRef.showDialog()">{{ $t('Config.Actions.Triggers.SelectRel.Button') }}</v-btn>
                    </div>

                  </template>
                  <template v-if="triggerRef.type === 3"> <!-- button -->
                    <v-text-field v-model="triggerRef.itemButton" :label="$t('Config.Actions.Triggers.ButtonText')" required></v-text-field>
                    <div><div class="d-inline-flex align-center">
                      <div v-if="selectedType">
                        <router-link :to="'/config/types/' + selectedType.identifier">{{ selectedType.identifier }}</router-link><span class="ml-2">- {{ selectedType.name[currentLanguage.identifier] || '[' + selectedType.name[defaultLanguageIdentifier] + ']' }}</span>
                      </div>
                      <v-btn color="blue darken-1" text @click="typeSelectionDialogRef.showDialog()">{{ $t('Config.Actions.Triggers.SelectType.Button') }}</v-btn>
                    </div></div>
                    <div class="d-inline-flex align-center">
                      <div v-if="selectedItemRef">
                        <router-link :to="'/item/' + selectedItemRef.identifier">{{ selectedItemRef.identifier }}</router-link><span class="ml-2">- {{ selectedItemRef.name[currentLanguage.identifier] || '[' + selectedItemRef.name[defaultLanguageIdentifier] + ']' }}</span>
                      </div>
                      <v-btn color="blue darken-1" text @click="itemSelectionDialogRef.showDialog()">{{ $t('Config.Actions.Triggers.SelectItem.Button') }}</v-btn>
                    </div>
                  </template>
                </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
          <v-btn color="blue darken-1" text :disabled="!createEnabled" @click="create">{{ $t('Create') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <TypeSelectionDialog ref="typeSelectionDialogRef" :multiselect="false" @selected="typeSelected"/>
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemSelected"/>
    <RelationsSelectionDialog ref="relSelectionDialogRef" :multiselect="false" @selected="relationSelected"/>
  </v-row>
</template>
<script>
import { ref, computed, watch } from '@vue/composition-api'
import * as langStore from '../store/languages'
import * as typesStore from '../store/types'
import * as itemStore from '../store/item'
import * as relStore from '../store/relations'
import i18n from '../i18n'
import TypeSelectionDialog from './TypeSelectionDialog'
import ItemsSelectionDialog from './ItemsSelectionDialog'
import RelationsSelectionDialog from './RelationsSelectionDialog'

export default {
  name: 'ItemCreation',
  components: { TypeSelectionDialog, ItemsSelectionDialog, RelationsSelectionDialog },
  setup (props, { emit }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      findType
    } = typesStore.useStore()

    const {
      loadItemsByIds
    } = itemStore.useStore()

    const {
      relations
    } = relStore.useStore()

    const dialogRef = ref(false)
    const formRef = ref(null)
    const typeSelectionDialogRef = ref(null)
    const itemSelectionDialogRef = ref(null)
    const relSelectionDialogRef = ref(null)
    const typeRef = ref(0)
    const triggerRef = ref(null)
    const selectedItemRef = ref(null)

    watch(typeRef, (val) => {
      if (!val) return

      triggerRef.value.type = val
      if (val === 1) {
        triggerRef.value.relation = 0
        triggerRef.value.itemButton = ''
      } else if (val === 2) {
        triggerRef.value.itemType = 0
        triggerRef.value.itemFrom = 0
        triggerRef.value.itemButton = ''
        selectedItemRef.value = null
      } else {
        triggerRef.value.event = 0
        triggerRef.value.relation = 0
        selectedItemRef.value = null
      }
    })

    function create () {
      formRef.value.resetValidation()
      if (formRef.value.validate()) {
        emit('created', triggerRef.value)
      }
    }

    function showDialog () {
      typeRef.value = 0
      triggerRef.value = { type: 0, event: 0, itemType: 0, itemFrom: 0, relation: 0, itemButton: '' }
      selectedItemRef.value = null
      dialogRef.value = true
    }

    function closeDialog () {
      dialogRef.value = false
    }

    const createEnabled = computed(() => {
      if (typeRef.value === 1) {
        return triggerRef.value.event && triggerRef.value.itemType && triggerRef.value.itemFrom
      } else if (typeRef.value === 2) {
        return triggerRef.value.event && triggerRef.value.relation
      } else if (typeRef.value === 3) {
        return triggerRef.value.itemButton && triggerRef.value.itemType && triggerRef.value.itemFrom
      } else {
        return false
      }
    })

    const selectedType = computed(() => {
      if (triggerRef.value.itemType) {
        const type = findType(triggerRef.value.itemType).node
        return type
      } else {
        return null
      }
    })

    const selectedRelation = computed(() => {
      if (triggerRef.value.relation) {
        return relations.find(rel => rel.id === triggerRef.value.relation)
      } else {
        return null
      }
    })

    function typeSelected (arr) {
      typeSelectionDialogRef.value.closeDialog()
      triggerRef.value.itemType = arr[0]
    }

    function itemSelected (id) {
      itemSelectionDialogRef.value.closeDialog()
      triggerRef.value.itemFrom = id
      loadItemsByIds([id], false).then(items => {
        selectedItemRef.value = items[0]
      })
    }

    function relationSelected (arr) {
      relSelectionDialogRef.value.closeDialog()
      triggerRef.value.relation = arr[0]
    }

    return {
      createEnabled,
      typeRef,
      selectedRelation,
      relationSelected,
      relSelectionDialogRef,
      selectedItemRef,
      selectedType,
      itemSelected,
      typeSelected,
      typeSelectionDialogRef,
      itemSelectionDialogRef,
      triggerRef,
      formRef,
      dialogRef,
      create,
      showDialog,
      closeDialog,
      currentLanguage,
      defaultLanguageIdentifier,
      typeSelection: [
        { text: i18n.t('Config.Actions.Triggers.Type.Item'), value: 1 },
        { text: i18n.t('Config.Actions.Triggers.Type.ItemRel'), value: 2 },
        { text: i18n.t('Config.Actions.Triggers.Type.Button'), value: 3 }
      ]
    }
  }
}
</script>
