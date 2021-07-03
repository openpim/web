<template>
  <v-container v-if="itemRef" class="pa-0">
    <v-row no-gutters>
      <v-col cols="12">
        <v-card class="mx-auto mb-1" outlined>
          <v-card-title class="pt-0 pb-0">
            <v-breadcrumbs v-if="parents.length > 0" class="pa-1" dense :items="parents"></v-breadcrumbs>
            <v-container fluid class="pt-0 pb-0">
              <v-row dense>
                <v-col v-if="mainImage" cols="1">
                  <v-img :src="damUrl + 'asset/' + mainImage.id + '/thumb?token=' + token" contain max-width="100" max-height="100"></v-img>
                </v-col>
                <v-col :cols="mainImage ? 11: 12">
                    <span class="mr-0">{{ itemRef.name[currentLanguage.identifier] || '[' + itemRef.name[defaultLanguageIdentifier] + ']' }}</span>
                    <SystemInformation :data="itemRef"></SystemInformation>
                    <div class="caption">
                      {{$t('Item.type')}}: <router-link :to="'/config/types/' + itemType.identifier">{{ itemType.identifier }}</router-link><span class="ml-0"> ({{ itemType.name[currentLanguage.identifier] || '[' + itemType.name[defaultLanguageIdentifier] + ']' }})</span>
                    </div>
                </v-col>
              </v-row>
            </v-container>
          </v-card-title>
          <v-card-actions>
            <v-btn v-if="canEditSelected" text @click="save" v-text="$t('Save')"></v-btn>
            <v-btn v-if="canEditSelected" text @click="move" v-text="$t('Move')"></v-btn>
            <v-btn v-if="canEditSelected" text @click="duplicate" v-text="$t('Duplicate')"></v-btn>
            <v-btn v-if="canEditSelected" text @click="remove" v-text="$t('Remove')"></v-btn>
            <v-btn v-if="hasChannels" text @click="submit" v-text="$t('Submit')"></v-btn>
            <template v-if="canEditSelected">
              <v-btn text @click="executeAction(trigger.itemButton)" v-for="(trigger, i) in buttonActions" :key="i">{{trigger.itemButton}}</v-btn>
            </template>
            <AfterButtonsComponent></AfterButtonsComponent>
            <v-spacer></v-spacer>
            <v-btn v-if="!itemRef.typeFile && canEditSelected && hasFileUpload" text @click="fileUploadDialogRef.showDialog()" v-text="$t('ItemView.UploadFile')"></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-tabs v-model="tabRef">
          <FirstTabsComponent></FirstTabsComponent>
          <v-tab v-text="$t('ItemView.Tab.Attributes')"></v-tab>
          <v-tab v-if="itemRef.typeFile" v-text="$t('ItemView.Tab.File')"></v-tab>
          <v-tab v-if="!itemRef.typeFile && filesRef.length > 0" v-text="$t('ItemView.Tab.MediaFiles')"></v-tab>
          <v-tab v-if="hasSources" v-text="$t('ItemView.Tab.LinksFrom')"></v-tab>
          <v-tab v-if="hasTargets" v-text="$t('ItemView.Tab.LinksTo')"></v-tab>
          <v-tab v-if="totalChildrenRef === -1 || totalChildrenRef > 0">{{$t('ItemView.Tab.Children') + (totalChildrenRef > 0 ? ' (' + totalChildrenRef + ')' : '')}}</v-tab>
          <v-tab v-if="hasChannels" v-text="$t('ItemView.Tab.Channels')"></v-tab>
          <v-tab v-if="hasAccess('audit') && auditEnabled" v-text="$t('ItemView.Tab.Audit')"></v-tab>
          <LastTabsComponent></LastTabsComponent>
        </v-tabs>
        <v-tabs-items v-model="tabRef">
          <FirstTabsItemComponent></FirstTabsItemComponent>
          <v-tab-item> <!-- Attributes -->
            <v-text-field class="pt-4 pb-0 pr-5 pl-5" v-model="itemRef.identifier" readonly :label="$t('ItemCreationDialog.Identifier')" required></v-text-field>
            <LanguageDependentField class="pb-0 pr-5 pl-5" @input="nameInput" :values="itemRef.name" v-model="itemRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('ItemCreationDialog.Name')"></LanguageDependentField>
            <v-card flat>
              <v-card-text class="pt-2 pl-0 pr-0">

                <BeforeAttributesComponent></BeforeAttributesComponent>

                <v-expansion-panels popout multiple focusable>
                  <v-expansion-panel v-for="(group,i) in attrGroups" :key="i">
                    <v-expansion-panel-header>{{ group.name[currentLanguage.identifier] || '[' + group.name[defaultLanguageIdentifier] + ']' }}</v-expansion-panel-header>
                    <v-expansion-panel-content>
                       <v-container class="pa-0">
                        <v-row no-gutters>
                          <template v-for="(attr,i) in group.itemAttributes">
                            <v-col :key="i" :cols="getOption(attr, 'cols', 12)" :class="getOption(attr, 'class', '')" :offset="getOption(attr, 'offset', '')" :style="getOption(attr, 'style', '')">
                              <AttributeValue @input="attrInput" :ref="el => { attributeValues[i] = el }" :item="itemRef" :attr="attr" :values="itemRef.values" :dense="false"></AttributeValue>
                            </v-col>
                            <v-col :key="i+1000" v-if="getOption(attr, 'space', null)" :cols="getOption(attr, 'space', null)">
                            </v-col>
                            </template>
                        </v-row>
                       </v-container>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>

                <AfterAttributesComponent></AfterAttributesComponent>

              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item v-if="itemRef.typeFile">  <!-- File -->
            <v-card flat :key="imageKeyRef">
              <v-card-title>
                <v-col cols="8">
                  <v-file-input v-if="canEditSelected" show-size v-model="fileRef" :label="$t('ItemView.NewFile')"></v-file-input>
                </v-col>
                <v-col cols="4">
                  <v-btn class="d-inline" v-if="canEditSelected" :disabled="!fileRef" text @click="upload" v-text="$t('ItemView.Upload')"></v-btn>
                </v-col>
              </v-card-title>
              <v-card-text>
                <v-card v-if="isImage" flat>
                  <v-card-text>
                    <a target="_blank" :href="damUrl + 'asset/' + itemRef.id + '?key='+imageKeyRef+'&token=' + token"><v-img v-if="isImage" :src="damUrl + 'asset/' + itemRef.id + '?key='+imageKeyRef+'&token=' + token" contain max-width="500" max-height="500"></v-img></a>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn v-if="canEditSelected" text @click="removeFile" v-text="$t('Remove')"></v-btn>
                  </v-card-actions>
                </v-card>
                <v-card v-if="isFile">
                  <v-card-title><a :href="damUrl + 'asset/' + itemRef.id + '?key='+imageKeyRef+'&token=' + token">{{itemRef.fileOrigName}}</a></v-card-title>
                  <v-card-actions>
                    <v-btn v-if="canEditSelected" text @click="removeFile" v-text="$t('Remove')"></v-btn>
                  </v-card-actions>
                </v-card>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item v-if="!itemRef.typeFile && filesRef.length > 0">  <!-- MediaFiles -->
            <v-carousel height="500" show-arrows-on-hover>
              <v-carousel-item v-for="(file, i) in filesRef" :key="i">
                <v-card v-if="file.image" class="ma-4" flat style="background: white">
                  <v-card-text>
                    <router-link :to="'/item/' + file.identifier">
                      <div>({{file.identifier}}) {{ file.name[currentLanguage.identifier] || '[' + file.name[defaultLanguageIdentifier] + ']' }}</div>
                    </router-link>
                    <v-img :src="damUrl + 'asset/' + file.id + '?token=' + token" contain max-width="500" max-height="600"></v-img>
                  </v-card-text>
                </v-card>
                <v-card v-if="!file.image" class="ma-4" style="background: white;border:1px solid grey">
                  <v-card-title>
                    <a :href="damUrl + 'asset/' + file.id + '?token=' + token">{{ file.name[currentLanguage.identifier] || '[' + file.name[defaultLanguageIdentifier] + ']' }}</a>
                    <v-btn :to="'/item/' + file.identifier" icon color="black" class="ml-4"><v-icon>mdi-arrow-right-bold-circle-outline</v-icon></v-btn>
                  </v-card-title>
                </v-card>
              </v-carousel-item>
            </v-carousel>
          </v-tab-item>
          <v-tab-item v-if="hasSources" eager>  <!-- Links from -->
            <ItemRelationsList :item="itemRef" componentType="source" @dataLoaded="sourcesLoaded"></ItemRelationsList>
          </v-tab-item>
          <v-tab-item v-if="hasTargets" eager>  <!-- Links to -->
            <ItemRelationsList :item="itemRef" componentType="target" @dataLoaded="targetsLoaded"></ItemRelationsList>
          </v-tab-item>
          <v-tab-item v-if="totalChildrenRef === -1 || totalChildrenRef > 0" eager>  <!-- Children -->
            <ItemsDataTable ref="itemsDataTableRef" :loadData="loadDataFunction" @dataLoaded="childrenLoaded" :export="false"></ItemsDataTable>
          </v-tab-item>
          <v-tab-item v-if="hasChannels" eager>  <!-- Channels -->
            <div v-for="(channel, i) in awailableChannelsRef" :key="i">
              <v-card v-if="itemRef.channels && itemRef.channels[channel.identifier]">
                <v-card-title class="text-subtitle-2">{{ channel.name[currentLanguage.identifier] || '[' + channel.name[defaultLanguageIdentifier] + ']' }}</v-card-title>
                <v-card-text class="text-body-1">
                  <v-row no-gutters>
                    <v-col cols="3">
                      <div>{{$t('ItemView.Channels.Status')}}: <v-chip class="ma-2" :color="itemRef.channels[channel.identifier].status === 1 ? '' : itemRef.channels[channel.identifier].status === 2 ? 'green' : 'red'"
                        :text-color="itemRef.channels[channel.identifier].status === 1 ? 'black' : 'white'">
                        {{ itemRef.channels[channel.identifier].status === 1 ? $t('ItemView.Channels.Submitted') : itemRef.channels[channel.identifier].status === 2 ? $t('ItemView.Channels.Synced') : $t('ItemView.Channels.Error') }}</v-chip>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div>{{$t('ItemView.Channels.SubmittedAt')}}: {{ dateFormat(new Date(itemRef.channels[channel.identifier].submittedAt), DATE_FORMAT) }}</div>
                    </v-col>
                    <v-col cols="3">
                      <div>{{$t('ItemView.Channels.SubmittedBy')}}: {{ itemRef.channels[channel.identifier].submittedBy }}</div>
                    </v-col>
                    <v-col cols="3">
                      <div>{{$t('ItemView.Channels.SyncedAt')}}: {{ itemRef.channels[channel.identifier].syncedAt ? dateFormat(new Date(itemRef.channels[channel.identifier].syncedAt), DATE_FORMAT) : '' }}</div>
                    </v-col>
                    <v-col cols="12" v-if="itemRef.channels[channel.identifier].message">
                      <div>{{$t('ItemView.Channels.Message')}}: {{itemRef.channels[channel.identifier].message}}</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </div>
          </v-tab-item>
          <v-tab-item v-if="hasAccess('audit') && auditEnabled">  <!-- History -->
            <HistoryTable ref="historyTableRef" :item="itemRef" componentType="item"></HistoryTable>
          </v-tab-item>
          <LastTabsItemComponent></LastTabsItemComponent>
        </v-tabs-items>
      </v-col>
    </v-row>
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemToMoveSelected"/>
    <FileUploadDialog ref="fileUploadDialogRef" :typeId="itemRef.typeId" @upload="linkNewFile"/>
    <ItemDuplicationDialog ref="itemDuplicationDialogRef" @duplicated="itemDuplicated"/>
    <ChannelsSelectionDialog ref="chanSelectionDialogRef" :multiselect="true" :editAccessOnly="true" @selected="channelsSelected"/>
  </v-container>
</template>

<script>
import { ref, onMounted, watch, computed, onBeforeUpdate, onUnmounted } from '@vue/composition-api'
import { useRouter } from '../router/useRouter'
import * as itemStore from '../store/item'
import * as attrStore from '../store/attributes'
import * as errorStore from '../store/error'
import * as userStore from '../store/users'
import * as typesStore from '../store/types'
import * as actionsStore from '../store/actions'
import * as relStore from '../store/relations'
import * as auditStore from '../store/audit'
import * as channelsStore from '../store/channels'
import i18n from '../i18n'
import * as langStore from '../store/languages'
import AttributeValue from '../components/AttributeValue'
import ItemRelationsList from '../components/ItemRelationsList'
import SystemInformation from '../components/SystemInformation'
import LanguageDependentField from '../components/LanguageDependentField'
import ItemsDataTable from '../components/ItemsDataTable'
import router from '../router'
import AttributeType from '../constants/attributeTypes'
import ItemsSelectionDialog from '../components/ItemsSelectionDialog'
import FileUploadDialog from '../components/FileUploadDialog'
import ItemDuplicationDialog from '../components/ItemDuplicationDialog'
import ChannelsSelectionDialog from '../components/ChannelsSelectionDialog'
import HistoryTable from '../components/HistoryTable'

import AfterButtonsComponent from '../_customizations/item/afterButtons/AfterButtonsComponent'
import FirstTabsComponent from '../_customizations/item/tabs/firstTabs/TabsComponent'
import FirstTabsItemComponent from '../_customizations/item/tabs/firstTabs/TabsItemComponent'
import LastTabsComponent from '../_customizations/item/tabs/lastTabs/TabsComponent'
import LastTabsItemComponent from '../_customizations/item/tabs/lastTabs/TabsItemComponent'

import BeforeAttributesComponent from '../_customizations/item/beforeAttributes/BeforeAttributesComponent'
import AfterAttributesComponent from '../_customizations/item/afterAttributes/AfterAttributesComponent'

import eventBus from '../eventBus'
import dateFormat from 'dateformat'

export default {
  components: {
    AttributeValue,
    ItemRelationsList,
    SystemInformation,
    LanguageDependentField,
    ItemsDataTable,
    ItemsSelectionDialog,
    FileUploadDialog,
    ItemDuplicationDialog,
    HistoryTable,
    AfterButtonsComponent,
    FirstTabsComponent,
    FirstTabsItemComponent,
    LastTabsComponent,
    LastTabsItemComponent,
    BeforeAttributesComponent,
    AfterAttributesComponent,
    ChannelsSelectionDialog
  },
  name: 'Home',
  setup (params, context) {
    const { route } = useRouter()

    const { showInfo, showError } = errorStore.useStore()

    const { currentUserRef, currentRoles, canEditItem, hasAccess } = userStore.useStore()

    const { checkAuditEnabled, auditEnabled } = auditStore.useStore()

    const { loadAllChannels, getAwailableChannels, submitItem } = channelsStore.useStore()

    const {
      findType,
      loadAllTypes
    } = typesStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadItemByIdentifier,
      loadItemsByIds,
      updateItem,
      moveItem,
      createItem,
      removeItem,
      uploadFile,
      uploadAndCreateFile,
      removeItemFile,
      loadAssets,
      loadChildren,
      hasRelations
    } = itemStore.useStore()

    const {
      loadAllAttributes,
      getAttributesForItem
    } = attrStore.useStore()

    const {
      loadAllActions,
      actions,
      executeButtonAction
    } = actionsStore.useStore()

    const {
      loadAllRelations,
      relations
    } = relStore.useStore()

    const itemsDataTableRef = ref(null)
    const historyTableRef = ref(null)
    const itemRef = ref(null)
    const tabRef = ref(null)
    const attrGroups = ref([])
    const itemPathRef = ref([])
    const fileRef = ref(null)
    const imageKeyRef = ref(1)
    const filesRef = ref([])
    const totalChildrenRef = ref(-1)
    const hasSources = ref(true)
    const hasTargets = ref(true)
    const itemSelectionDialogRef = ref(null)
    const fileUploadDialogRef = ref(null)
    const itemDuplicationDialogRef = ref(null)
    const chanSelectionDialogRef = ref(null)
    const awailableChannelsRef = ref([])

    const attributeValues = ref([])
    onBeforeUpdate(() => {
      attributeValues.value = []
    })

    const itemType = computed(() => {
      if (itemRef.value) {
        return findType(itemRef.value.typeId).node
      } else {
        return null
      }
    })
    const isImage = computed(() => {
      return itemRef.value.mimeType && (
        (itemRef.value.mimeType === 'image/jpeg') ||
        (itemRef.value.mimeType === 'image/png') ||
        (itemRef.value.mimeType === 'image/bmp') ||
        (itemRef.value.mimeType === 'image/tiff') ||
        (itemRef.value.mimeType === 'image/gif'))
    })

    const isFile = computed(() => {
      return itemRef.value.mimeType && !(
        (itemRef.value.mimeType === 'image/jpeg') ||
        (itemRef.value.mimeType === 'image/png') ||
        (itemRef.value.mimeType === 'image/bmp') ||
        (itemRef.value.mimeType === 'image/tiff') ||
        (itemRef.value.mimeType === 'image/gif'))
    })

    const hasFileUpload = computed(() => {
      if (itemRef.value) {
        let found = false
        const typeId = parseInt(itemRef.value.typeId)
        relations.forEach(relation => {
          if (relation.sources.includes(typeId)) {
            relation.targets.forEach(targetTypeId => {
              const targetType = findType(targetTypeId).node
              if (targetType && targetType.file) found = true
            })
          }
        })
        return found
      } else {
        return false
      }
    })

    const buttonActions = computed(() => {
      if (itemRef.value) {
        const pathArr = itemRef.value.path.split('.').map(elem => parseInt(elem))
        const arr = []

        actions.forEach(action => {
          for (let i = 0; i < action.triggers.length; i++) {
            const trigger = action.triggers[i]

            const result = parseInt(trigger.type) === 3 && // button
                  parseInt(itemRef.value.typeId) === parseInt(trigger.itemType) &&
                  pathArr.includes(parseInt(trigger.itemFrom))
            if (result) {
              arr.push(trigger)
            }
          }
        })

        return arr
      } else {
        return []
      }
    })

    function childrenLoaded (rows, total) {
      totalChildrenRef.value = total || 0
    }

    function sourcesLoaded (links) {
      hasSources.value = links && Object.keys(links).length > 0
    }

    function targetsLoaded (links) {
      hasTargets.value = links && Object.keys(links).length > 0
    }

    function upload () {
      uploadFile(itemRef.value.id, fileRef.value).then((ok) => {
        if (ok) {
          itemRef.value.mimeType = fileRef.value.type
          itemRef.value.fileOrigName = fileRef.value.name
          imageKeyRef.value++
          fileRef.value = null
        }
      })
    }

    function linkNewFile (filesData) {
      fileUploadDialogRef.value.closeDialog()
      let result = true
      for (let i = 0; i < filesData.length; i++) {
        const fileData = filesData[i]
        uploadAndCreateFile(itemRef.value.id, fileData.file, fileData.fileItemTypeId, fileData.parentId, fileData.relationId, currentLanguage.value.identifier).then((ok) => {
          if (!ok) result = false
        })
      }
      if (result) {
        showInfo(i18n.t('Saved'))
        loadAssets(itemRef.value.id).then(arr => {
          filesRef.value = arr
        })
      }
    }

    function removeFile () {
      if (confirm(i18n.t('ItemView.RemoveFile'))) {
        removeItemFile(itemRef.value.internalId).then(() => {
          itemRef.value.mimeType = ''
          itemRef.value.fileOrigName = ''
          imageKeyRef.value++
          fileRef.value = null
        })
      }
    }

    const mainImage = computed(() => {
      return filesRef.value.find(elem => elem.mainImage)
    })

    const canEditSelected = computed(() => {
      if (itemRef.value) {
        return canEditItem(itemRef.value.typeId, itemRef.value.path)
      } else {
        return true
      }
    })

    const parents = computed(() => {
      const arr = itemPathRef.value.map(elem => { return { disabled: false, to: '/item/' + elem.identifier, text: elem.name[currentLanguage.value.identifier] || '[' + elem.name[defaultLanguageIdentifier.value] + ']' } })
      // arr.push({ disabled: true, text: itemRef.value.name[currentLanguage.value.identifier] || '[' + itemRef.value.name[defaultLanguageIdentifier.value] + ']' })
      return arr
    })

    function nameInput () {
      router.dataChanged(itemRef.value.identifier + '_name', i18n.t('Router.Changed.Name'))
    }

    function attrInput () {
      router.dataChanged(itemRef.value.identifier, i18n.t('Router.Changed.Attribute'))
    }

    function save () {
      // TODO !!! not working yet https://composition-api.vuejs.org/api.html#template-refs
      for (let i = 0; i < attributeValues.value.length; i++) {
        const attrVal = attributeValues.value[i]
        if (!attrVal.isValid()) return
      }
      updateItem(itemRef.value).then(() => {
        router.clearDataChanged(itemRef.value.identifier + '_name')
        router.clearDataChanged(itemRef.value.identifier)
        showInfo(i18n.t('Saved'))
      })
    }

    function duplicate () {
      itemDuplicationDialogRef.value.showDialog(itemRef.value)
    }

    function itemDuplicated (itemCopy) {
      itemDuplicationDialogRef.value.closeDialog()
      const parent = itemPathRef.value.length > 0 ? itemPathRef.value[itemPathRef.value.length - 1] : null

      createItem(itemCopy, parent, true).then(() => {
        router.push('/item/' + itemCopy.identifier)
        eventBus.emit('item_selected', itemCopy)
      })
    }

    function move () {
      loadChildren(itemRef.value.internalId, { page: 1, itemsPerPage: 1 }).then(data => {
        if (data.count > 0) {
          showError(i18n.t('ItemView.Move.HasChildrenError'))
        } else {
          itemSelectionDialogRef.value.showDialog()
        }
      })
    }

    function itemToMoveSelected (id) {
      itemSelectionDialogRef.value.closeDialog()
      loadItemsByIds([id], false).then(items => {
        const parent = items[0]
        const parentType = findType(parent.typeId).node
        const tstType = parentType.children.find(elem => (elem.identifier === itemType.value.identifier) || (elem.link === itemType.value.id))
        if (tstType) {
          moveItem(itemRef.value, id).then(() => {
            itemPathRef.value = []
            loadItemPath(itemRef.value.path)
            showInfo(i18n.t('Saved'))
          })
        } else {
          showError(i18n.t('ItemView.Move.WrongParent'))
        }
      })
    }

    function remove () {
      if (confirm(i18n.t('ItemView.RemoveItem'))) {
        loadChildren(itemRef.value.internalId, { page: 1, itemsPerPage: 1 }).then(data => {
          if (data.count > 0) {
            showError(i18n.t('ItemView.Remove.HasChildrenError'))
          } else {
            hasRelations(itemRef.value.internalId).then(res => {
              if (res) {
                showError(i18n.t('ItemView.Remove.HasRelationsError'))
              } else {
                removeItem(itemRef.value.internalId).then(() => {
                  router.push('/')
                })
              }
            })
          }
        })
      }
    }

    function itemSelected (item) {
      totalChildrenRef.value = -1
      hasSources.value = true
      hasTargets.value = true

      loadAssets(item.internalId).then(arr => {
        filesRef.value = arr
      })

      const arr = getAttributesForItem(item.typeId, item.path)

      attrGroups.value = arr.filter(group => {
        const expr = getOption(group, 'visible', null)
        if (expr) {
          try {
            // eslint-disable-next-line no-new-func
            const func = new Function('item', 'group', 'user', 'roles', '"use strict"; return (' + expr + ')')
            return func(item, group, currentUserRef.value, currentRoles)
          } catch (err) {
            console.error('Failed to evaluate expression: "' + expr + '" for group: ' + group.identifier, err)
            return false
          }
        } else {
          return true
        }
      })

      if (!item.values) item.values = {}
      attrGroups.value.forEach(group => {
        group.itemAttributes.forEach(attr => {
          let attrValue = getOption(attr, 'default', null)
          if (attrValue && attr.lov) attrValue = parseInt(attrValue)

          if (!item.values[attr.identifier]) {
            if (attr.languageDependent) {
              item.values[attr.identifier] = {}
              item.values[attr.identifier][currentLanguage.value.identifier] = attrValue
            } else {
              item.values[attr.identifier] = attrValue
            }
          } else if (attr.languageDependent && typeof item.values[attr.identifier] !== 'object') {
            // attr was changed to languageDependent and it has old data that must be cleared
            item.values[attr.identifier] = {}
            item.values[attr.identifier][currentLanguage.value.identifier] = attrValue
          } else if (!attr.languageDependent && !Array.isArray(item.values[attr.identifier]) && typeof item.values[attr.identifier] === 'object') {
            // attr was changed to NOT languageDependent and it has old data that must be cleared
            item.values[attr.identifier] = null
          }

          if (attr.type === AttributeType.URL) {
            if (!item.values[attr.identifier + '_text']) {
              if (attr.languageDependent) {
                item.values[attr.identifier + '_text'] = {}
                item.values[attr.identifier + '_text'][currentLanguage.value.identifier] = ''
              } else {
                item.values[attr.identifier + '_text'] = ''
              }
            } else if (attr.languageDependent && typeof item.values[attr.identifier + '_text'] !== 'object') {
              // attr was changed to languageDependent and it has old data that must be cleared
              item.values[attr.identifier + '_text'] = {}
              item.values[attr.identifier + '_text'][currentLanguage.value.identifier] = ''
            } else if (!attr.languageDependent && typeof item.values[attr.identifier + '_text'] === 'object') {
              // attr was changed to NOT languageDependent and it has old data that must be cleared
              item.values[attr.identifier + '_text'] = null
            }
          }
        })
      })
      itemRef.value = item
      if (itemsDataTableRef.value) itemsDataTableRef.value.DataChanged()
    }

    function loadItemPath (path) {
      const arr = path.split('.')
      if (arr.length > 1) {
        arr.pop()
        loadItemsByIds(arr, true).then((data) => { itemPathRef.value = data })
      }
    }

    function executeAction (button) {
      executeButtonAction(itemRef.value.internalId, button).then((result) => {
        if (result.compileError) {
          showError('Compile error: ' + result.compileError)
        } else if (result.error) {
          showError(result.error)
        } else if (result.message) {
          showInfo(result.message)
        } else {
          showInfo(i18n.t('Started'))
        }
      })
    }

    function getOption (attr, name, defaultValue) {
      if (attr.options) {
        const tst = attr.options.find(elem => elem.name === name)
        if (tst) {
          if (tst.value === 'null') return null
          if (tst.value === 'true') return true
          if (tst.value === 'false') return false
          return tst.value
        }
      }
      return defaultValue
    }

    watch(route, (current, previous) => {
      if (previous && current && current.params && current.params.id) {
        itemPathRef.value = []
        loadItemByIdentifier(current.params.id).then((item) => {
          loadItemPath(item.path)
          itemSelected(item)
        })
      } else {
        itemRef.value = null
      }
    })

    function submit () {
      chanSelectionDialogRef.value.showDialog()
    }

    function channelsSelected (arr) {
      chanSelectionDialogRef.value.closeDialog()
      if (arr.length === 0) return
      submitItem(itemRef.value.internalId, itemRef.value.typeId, itemRef.value.path, arr).then(() => {
        showInfo(i18n.t('Submitted'))
      })
    }

    const hasChannels = computed(() => {
      if (itemRef.value) {
        const pathArr = itemRef.value.path.split('.')

        for (let i = 0; i < awailableChannelsRef.value.length; i++) {
          const channel = awailableChannelsRef.value[i]
          const result = channel.valid.includes(itemRef.value.typeId) && channel.visible.find(elem => pathArr.includes(elem))
          if (result) return true
        }
      }
      return false
    })

    onMounted(() => {
      window.addEventListener('keydown', hotkey)
      loadAllChannels().then(() => {
        awailableChannelsRef.value = getAwailableChannels(false)
      })
      checkAuditEnabled()
      loadAllActions()
      loadAllAttributes()
      loadAllRelations()
      loadAllTypes().then(() => {
        if (route.value && route.value.params && route.value.params.id) {
          itemPathRef.value = []
          loadItemByIdentifier(route.value.params.id).then((item) => {
            loadItemPath(item.path)
            itemSelected(item)
          })
        }
      })
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', hotkey)
    })

    function hotkey (event) {
      if ((event.ctrlKey || event.metaKey) && !(event.altKey) && (event.keyCode === 83 || event.keyCode === 115)) { // CTRL-S
        if (canEditSelected.value) {
          event.preventDefault()
          save()
        }
      }
    }

    function loadDataFunction (options) {
      return new Promise((resolve, reject) => {
        loadChildren(itemRef.value.id, options).then(data => resolve(data))
      })
    }

    return {
      executeAction,
      buttonActions,
      itemRef,
      parents,
      tabRef,
      attrGroups,
      nameInput,
      attrInput,
      save,
      move,
      duplicate,
      remove,
      isImage,
      isFile,
      currentLanguage,
      defaultLanguageIdentifier,
      canEditSelected,
      attributeValues,
      fileRef,
      removeFile,
      upload,
      imageKeyRef,
      filesRef,
      mainImage,
      damUrl: window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/',
      token: localStorage.getItem('token'),
      loadDataFunction,
      itemsDataTableRef,
      itemType,
      hasSources,
      hasTargets,
      totalChildrenRef,
      childrenLoaded,
      sourcesLoaded,
      targetsLoaded,
      itemSelectionDialogRef,
      itemToMoveSelected,
      fileUploadDialogRef,
      linkNewFile,
      hasFileUpload,
      itemDuplicationDialogRef,
      itemDuplicated,
      auditEnabled,
      getOption,
      historyTableRef,
      hasAccess,
      awailableChannelsRef,
      hasChannels,
      submit,
      chanSelectionDialogRef,
      channelsSelected,
      dateFormat,
      DATE_FORMAT: process.env.VUE_APP_DATE_FORMAT,
      nameRules: [
        v => !!v || i18n.t('ItemCreationDialog.NameRequired')
      ]
    }
  }
}
</script>
