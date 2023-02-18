<template>
  <v-container v-if="canViewConfigRef" style="background-color:white">
    <v-row no-gutters>
      <v-col cols="3">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ $t('Config.Roles.Roles') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip bottom v-if="canEditConfigRef">
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" @click="add"><v-icon>mdi-plus</v-icon></v-btn>
            </template>
            <span>{{ $t('Add') }}</span>
          </v-tooltip>
        </v-toolbar>
        <v-text-field v-model="searchRef" @input="clearSelection" :label="$t('Filter')" flat hide-details clearable clear-icon="mdi-close-circle-outline" class="ml-5 mr-5"></v-text-field>
        <v-list nav dense>
          <v-list-item-group v-model="itemRef" color="primary">
            <v-list-item v-for="(item, i) in rolesFiltered" :key="i">
              <v-list-item-icon><v-icon>mdi-account-check</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{item.identifier + ' - ' + item.name}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col cols="9">
        <v-form ref="formRef" lazy-validation class="ml-7" v-if="selectedRef && selectedRef.id != -1">
          <div class="d-inline-flex align-center">
            <v-text-field style="min-width: 100%" v-model="selectedRef.identifier" :disabled="selectedRef.internalId !== 0" :rules="identifierRules" :label="$t('Config.Roles.Identifier')" required></v-text-field>
            <SystemInformation :data="selectedRef"></SystemInformation>
          </div>

          <v-text-field v-model="selectedRef.name" :label="$t('Config.Roles.Name')" :rules="nameRules" required></v-text-field>

          <v-tabs v-model="tabRef">
            <v-tab v-text="$t('Config.Roles.Data')"></v-tab>
            <v-tab v-text="$t('Config.Roles.Relation')"></v-tab>
            <v-tab v-text="$t('Config.Roles.Configuration')"></v-tab>
            <v-tab v-text="$t('Config.Roles.Channels')"></v-tab>
            <v-tab v-text="$t('Config.Roles.Other')"></v-tab>
          </v-tabs>
          <v-tabs-items v-model="tabRef">
            <!-- Items restrictions -->
            <v-tab-item>
              <v-card class="mb-5 mt-2">
                <v-card-title class="subtitle-2 font-weight-bold" >
                  <div style="width:90%">{{ $t('Config.Roles.RestrictionsTypes') }}</div>
                  <v-tooltip bottom v-if="canEditConfigRef">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="editValid"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Edit') }}</span>
                  </v-tooltip>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                <v-list dense class="pt-0 pb-0">
                  <v-list-item  v-for="(item, i) in valid" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
                    <router-link :to="'/config/types/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
                  </v-list-item-content></v-list-item>
                </v-list>
                </v-card-text>

                <v-card-title class="subtitle-2 font-weight-bold" >
                  <div style="width:80%">{{ $t('Config.Roles.RestrictionsFromItems') }}</div>
                  <v-tooltip bottom v-if="canEditConfigRef">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="addFromItems"><v-icon>mdi-plus</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Add') }}</span>
                  </v-tooltip>
                  <v-tooltip bottom v-if="canEditConfigRef">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="removeFromItems" :disabled="fromItemsSelectedRef == null"><v-icon>mdi-minus</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Remove') }}</span>
                  </v-tooltip>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                <v-list dense class="pt-0 pb-0">
                  <v-list-item-group v-model="fromItemsSelectedRef" color="primary">
                    <v-list-item dense class="pt-0 pb-0"  v-for="(item, i) in fromItems" :key="i">
                      <v-list-item-content class="pt-0 pb-0" style="display: inline">
                      <router-link :to="'/item/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
                <v-select class="pr-2" :readonly="!canEditConfigRef" v-model="selectedRef.itemAccess.access" :items="configSelection" :label="$t('Config.Roles.Access')"></v-select>
                </v-card-text>

                <v-card-title class="subtitle-2 font-weight-bold" >
                  <div style="width:90%">{{ $t('Config.Roles.RestrictionsAttributes') }}</div>
                  <v-tooltip bottom v-if="canEditConfigRef">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="editAttrItem"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Edit') }}</span>
                  </v-tooltip>
                </v-card-title>
                <v-list dense class="pt-0 pb-0">
                  <v-list-item  v-for="(item, i) in groupsAccessItem" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0">
                    <v-container>
                      <v-row align="center" no-gutters>
                        <v-col cols="6">
                          <router-link :to="'/config/attributes/' + item.group.identifier">{{ item.group.identifier }}</router-link>
                          <span class="ml-2">- {{ item.group.name[currentLanguage.identifier] || '[' + item.group.name[defaultLanguageIdentifier] + ']' }}</span>
                        </v-col>
                        <v-col cols="6">
                          <v-select v-model="selectedRef.itemAccess.groups[i].access"  :readonly="!canEditConfigRef" :items="accessSelection" :label="$t('Config.Roles.Access')"></v-select>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-list-item-content></v-list-item>
                </v-list>
              </v-card>
            </v-tab-item>

            <!-- Relations restrictions -->
            <v-tab-item>
              <v-card class="mb-5 mt-2">
                <v-card-title class="subtitle-2 font-weight-bold" >
                  <div style="width:90%">{{ $t('Config.Roles.RestrictionsRelations') }}</div>
                  <v-tooltip bottom v-if="canEditConfigRef">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="editRelations"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Edit') }}</span>
                  </v-tooltip>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                <v-list dense class="pt-0 pb-4">
                  <v-list-item  v-for="item in roleRelations" :key="item.id" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0" style="display: inline">
                    <router-link :to="'/config/relations/' + item.identifier">{{ item.identifier }}</router-link><span class="ml-2">- {{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</span>
                  </v-list-item-content></v-list-item>
                </v-list>
                <v-select class="pr-2" :readonly="!canEditConfigRef" :disabled="roleRelations.length === 0" v-model="selectedRef.relAccess.access" :items="configSelection" :label="$t('Config.Roles.Access')"></v-select>
                </v-card-text>

                <v-card-title class="subtitle-2 font-weight-bold" >
                  <div style="width:90%">{{ $t('Config.Roles.RestrictionsAttributes') }}</div>
                  <v-tooltip bottom v-if="canEditConfigRef">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="editAttrRel"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Edit') }}</span>
                  </v-tooltip>
                </v-card-title>
                <v-list dense class="pt-0 pb-0">
                  <v-list-item v-for="(item, i) in groupsAccessRel" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0">
                    <v-container>
                      <v-row align="center" no-gutters>
                        <v-col cols="6">
                          <router-link :to="'/config/attributes/' + item.group.identifier">{{ item.group.identifier }}</router-link>
                          <span class="ml-2">- {{ item.group.name[currentLanguage.identifier] || '[' + item.group.name[defaultLanguageIdentifier] + ']' }}</span>
                        </v-col>
                        <v-col cols="6">
                          <v-select v-model="selectedRef.relAccess.groups[i].access" :items="accessSelection" :label="$t('Config.Roles.Access')"></v-select>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-list-item-content></v-list-item>
                </v-list>
              </v-card>
            </v-tab-item>

            <!-- system setup restrictions -->
            <v-tab-item>
              <v-select prepend-icon="mdi-animation-outline" :readonly="!canEditConfigRef" v-model="selectedRef.configAccess.types" :items="configSelection" :label="$t('Config.Roles.Config.Types')"></v-select>
              <v-select prepend-icon="mdi-format-list-bulleted-type" :readonly="!canEditConfigRef" v-model="selectedRef.configAccess.attributes" :items="configSelection" :label="$t('Config.Roles.Config.Attributes')"></v-select>
              <v-select prepend-icon="mdi-vector-line" :readonly="!canEditConfigRef" v-model="selectedRef.configAccess.relations" :items="configSelection" :label="$t('Config.Roles.Config.Relations')"></v-select>
              <v-select prepend-icon="mdi-view-headline" :readonly="!canEditConfigRef" v-model="selectedRef.configAccess.lovs" :items="configSelection" :label="$t('Config.Roles.Config.LOVs')"></v-select>
              <v-select prepend-icon="mdi-access-point" :readonly="!canEditConfigRef" v-model="selectedRef.configAccess.channels" :items="configSelection" :label="$t('Config.Roles.Config.Channels')"></v-select>
              <v-select prepend-icon="mdi-file-code-outline" :readonly="!canEditConfigRef" v-model="selectedRef.configAccess.actions" :items="configSelection" :label="$t('Config.Roles.Config.Actions')"></v-select>
              <v-select prepend-icon="mdi-file-cog-outline" :readonly="!canEditConfigRef" v-model="selectedRef.configAccess.importConfigs" :items="configSelection" :label="$t('Config.Roles.Config.ImportConfigs')"></v-select>
              <v-select prepend-icon="mdi-account" :readonly="!canEditConfigRef" v-model="selectedRef.configAccess.users" :items="configSelection" :label="$t('Config.Roles.Config.Users')"></v-select>
              <v-select prepend-icon="mdi-account-check" :readonly="!canEditConfigRef" v-model="selectedRef.configAccess.roles" :items="configSelection" :label="$t('Config.Roles.Config.Roles')"></v-select>
              <v-select prepend-icon="mdi-view-dashboard-outline" :readonly="!canEditConfigRef" v-model="selectedRef.configAccess.dashboards" :items="configSelection" :label="$t('Config.Roles.Config.Dashboards')"></v-select>
              <v-select prepend-icon="mdi-web" :readonly="!canEditConfigRef" v-model="selectedRef.configAccess.languages" :items="configSelection" :label="$t('Config.Roles.Config.Languages')"></v-select>
            </v-tab-item>

            <!-- channels restrictions -->
            <v-tab-item>
              <v-card class="mb-5 mt-2">
                <v-card-title class="subtitle-2 font-weight-bold" >
                  <div style="width:90%">{{ $t('Config.Roles.RestrictionsChannels') }}</div>
                  <v-tooltip bottom v-if="canEditChannels">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="editChannels"><v-icon>mdi-file-document-edit-outline</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Edit') }}</span>
                  </v-tooltip>
                </v-card-title>
                <v-list dense class="pt-0 pb-0">
                  <v-list-item v-for="(item, i) in channelAccess" :key="i" dense class="pt-0 pb-0"><v-list-item-content class="pt-0 pb-0">
                    <v-container>
                      <v-row align="center" no-gutters>
                        <v-col cols="6">
                          <router-link :to="'/config/channel/' + item.channel.identifier">{{ item.channel.identifier }}</router-link>
                          <span class="ml-2">- {{ item.channel.name[currentLanguage.identifier] || '[' + item.channel.name[defaultLanguageIdentifier] + ']' }}</span>
                        </v-col>
                        <v-col cols="6">
                          <v-select v-model="selectedRef.channelAccess[i].access" :items="accessSelection" :label="$t('Config.Roles.Access')"></v-select>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-list-item-content></v-list-item>
                </v-list>
              </v-card>
            </v-tab-item>

            <!-- other restrictions -->
            <v-tab-item>
              <div class="ml-4">
                <v-checkbox v-model="selectedRef.otherAccess.audit" :readonly="!canEditConfigRef" dense :label="$t('Config.Roles.Other.Audit')" required></v-checkbox>
                <v-checkbox v-model="selectedRef.otherAccess.search" :readonly="!canEditConfigRef" dense :label="$t('Config.Roles.Other.Search')" required></v-checkbox>
                <v-checkbox v-model="selectedRef.otherAccess.imports" :readonly="!canEditConfigRef" dense :label="$t('Config.Roles.Other.Imports')" required></v-checkbox>
                <v-checkbox v-model="selectedRef.otherAccess.exportCSV" :readonly="!canEditConfigRef" dense :label="$t('Config.Roles.Other.ExportSCV')" required></v-checkbox>
                <v-checkbox v-model="selectedRef.otherAccess.exportXLS" :readonly="!canEditConfigRef" dense :label="$t('Config.Roles.Other.ExportXLS')" required></v-checkbox>
                <v-checkbox v-model="selectedRef.otherAccess.importXLS" :readonly="!canEditConfigRef" dense :label="$t('Config.Roles.Other.ImportXLS')" required></v-checkbox>
                <v-checkbox v-model="selectedRef.otherAccess.searchRelations" :readonly="!canEditConfigRef" dense :label="$t('Config.Roles.Other.SearchRelations')" required></v-checkbox>
                <v-checkbox v-model="selectedRef.otherAccess.exportRelationsXLS" :readonly="!canEditConfigRef" dense :label="$t('Config.Roles.Other.ExportRelationsXLS')" required></v-checkbox>
                <v-checkbox v-model="selectedRef.otherAccess.importRelationsXLS" :readonly="!canEditConfigRef" dense :label="$t('Config.Roles.Other.ImportRelationsXLS')" required></v-checkbox>
              </div>
            </v-tab-item>
          </v-tabs-items>

          <OptionsTable :options="selectedRef.options" @changed="optionsChanged" />

          <v-btn class="mr-4" v-if="canEditConfigRef" @click="save" :disabled="selectedRef.identifier && selectedRef.identifier === 'admin'">{{ $t('Save') }}</v-btn>
          <v-btn class="mr-4" v-if="canEditConfigRef" @click.stop="remove" :disabled="selectedRef.identifier && selectedRef.identifier === 'admin'">{{ $t('Remove') }}</v-btn>
        </v-form>
      </v-col>
    </v-row>
    <RelationsSelectionDialog ref="relSelectionDialogRef" :multiselect="true" @selected="relationsSelected"/>
    <AttrGroupsSelectionDialog ref="attrSelectionDialogRef" :multiselect="true" @selected="attrSelected"/>
    <TypeSelectionDialog ref="typeSelectionDialogRef" :multiselect="true" @selected="typesSelected"/>
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemsSelected"/>
    <ChannelsSelectionDialog ref="chanSelectionDialogRef" :multiselect="true" @selected="channelsSelected"/>
  </v-container>
</template>

<script>
import { ref, watch, onMounted, computed } from '@vue/composition-api'
import * as errorStore from '../../store/error'
import * as rolesStore from '../../store/roles'
import i18n from '../../i18n'
import router from '../../router'
import * as userStore from '../../store/users'
import * as relStore from '../../store/relations'
import RelationsSelectionDialog from '../../components/RelationsSelectionDialog'
import AttrGroupsSelectionDialog from '../../components/AttrGroupsSelectionDialog'
import TypeSelectionDialog from '../../components/TypeSelectionDialog'
import ItemsSelectionDialog from '../../components/ItemsSelectionDialog'
import ChannelsSelectionDialog from '../../components/ChannelsSelectionDialog'
import * as langStore from '../../store/languages'
import * as attrStore from '../../store/attributes'
import * as typesStore from '../../store/types'
import * as itemStore from '../../store/item'
import * as channelsStore from '../../store/channels'
import SystemInformation from '../../components/SystemInformation'
import OptionsTable from '../../components/OptionsTable'

export default {
  components: { RelationsSelectionDialog, AttrGroupsSelectionDialog, TypeSelectionDialog, ItemsSelectionDialog, SystemInformation, ChannelsSelectionDialog, OptionsTable },
  setup () {
    const { canViewConfig, canEditConfig } = userStore.useStore()
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      showInfo
    } = errorStore.useStore()

    const {
      roles,
      addRole,
      saveRole,
      loadAllRoles,
      removeRole
    } = rolesStore.useStore()

    const {
      relations,
      loadAllRelations
    } = relStore.useStore()

    const {
      channels,
      loadAllChannels
    } = channelsStore.useStore()

    const {
      groups,
      loadAllAttributes
    } = attrStore.useStore()

    const {
      findType,
      loadAllTypes
    } = typesStore.useStore()

    const {
      loadItemsByIds
    } = itemStore.useStore()

    const canViewConfigRef = ref(false)
    const canEditConfigRef = ref(false)

    const empty = { id: -1 }
    const formRef = ref(null)
    const tabRef = ref(null)
    const selectedRef = ref(empty)
    const itemRef = ref(0)
    const relSelectionDialogRef = ref(null)
    const attrSelectionDialogRef = ref(null)
    const typeSelectionDialogRef = ref(null)
    const itemSelectionDialogRef = ref(null)
    const chanSelectionDialogRef = ref(null)

    watch(itemRef, (selected, previous) => {
      if (selected == null) {
        selectedRef.value = empty
        router.push('/config/roles')
        return
      }
      if (rolesFiltered && selected < rolesFiltered.value.length) {
        if (previous && rolesFiltered.value[previous].internalId === 0) {
          showInfo(i18n.t('Config.NotSaved'))
        }

        selectedRef.value = rolesFiltered.value[selected]
        if (selectedRef.value.itemAccess.fromItems) {
          loadItemsByIds(selectedRef.value.itemAccess.fromItems, false).then(items => {
            fromItems.value = items
          })
        }

        if (selectedRef.value.internalId !== 0 && selectedRef.value.identifier) {
          router.push('/config/roles/' + selectedRef.value.identifier)
        } else {
          router.push('/config/roles')
        }
      }
    })

    function add () {
      selectedRef.value = addRole()
      itemRef.value = roles.length - 1
    }

    function save () {
      if (formRef.value.validate()) {
        router.push('/config/roles/' + selectedRef.value.identifier)
        saveRole(selectedRef.value).then(() => {
          showInfo(i18n.t('Saved'))
        })
      }
    }

    function remove () {
      if (confirm(i18n.t('Config.Roles.Confirm.Delete', { name: selectedRef.value.name }))) {
        removeRole(selectedRef.value.id)
        selectedRef.value = empty
        router.push('/config/roles')
      }
    }

    function editValid () {
      typeSelectionDialogRef.value.showDialog('valid', selectedRef.value.itemAccess.valid)
    }

    function typesSelected (arr) {
      typeSelectionDialogRef.value.closeDialog()
      selectedRef.value.itemAccess.valid = arr
    }

    const valid = computed(() => {
      if (selectedRef.value.itemAccess && selectedRef.value.itemAccess.valid) {
        return selectedRef.value.itemAccess.valid.map((id) => {
          const tst = findType(id).node
          if (!tst) console.log('Failed to find type by id: ' + id)
          return tst
        }).filter(elem => elem)
      } else {
        return []
      }
    })

    function optionsChanged (val) {
      selectedRef.value.options = val
    }

    const fromItems = ref([])
    const fromItemsSelectedRef = ref(null)

    function addFromItems () {
      itemSelectionDialogRef.value.showDialog('visible')
    }

    function itemsSelected (id) {
      itemSelectionDialogRef.value.closeDialog()
      const tst = selectedRef.value.itemAccess.fromItems.find(elem => elem === id)
      if (!tst) {
        selectedRef.value.itemAccess.fromItems.push(id)
        loadItemsByIds([id], false).then(items => {
          fromItems.value.push(items[0])
        })
      }
    }

    function removeFromItems () {
      fromItems.value.splice(fromItemsSelectedRef.value, 1)
      selectedRef.value.itemAccess.fromItems.splice(fromItemsSelectedRef.value, 1)
      fromItemsSelectedRef.value = null
    }

    const roleRelations = computed(() => {
      if (selectedRef.value.relAccess.relations) {
        return selectedRef.value.relAccess.relations.map(id => {
          const tst = relations.find(rel => rel.id === id)
          if (!tst) console.log('Failed to find role by id: ' + id)
          return tst
        }).filter(elem => elem)
      } else {
        return []
      }
    })

    const groupsAccessRel = computed(() => {
      if (selectedRef.value.relAccess.groups) {
        return selectedRef.value.relAccess.groups.map(data => {
          const res = { groupId: data.groupId, access: data.access }
          res.group = groups.find(group => group.id === data.groupId)
          if (res.group) return res
          else {
            console.log('Failed to find group by id: ' + data.groupId)
            return null
          }
        }).filter(elem => elem)
      } else {
        return []
      }
    })

    const groupsAccessItem = computed(() => {
      if (selectedRef.value.itemAccess.groups) {
        return selectedRef.value.itemAccess.groups.map(data => {
          const res = { groupId: data.groupId, access: data.access }
          res.group = groups.find(group => group.internalId === data.groupId)
          if (res.group) return res
          else {
            console.log('Failed to find group by id: ' + data.groupId)
            return null
          }
        }).filter(elem => elem)
      } else {
        return []
      }
    })

    const channelAccess = computed(() => {
      if (selectedRef.value.channelAccess) {
        return selectedRef.value.channelAccess.map(data => {
          const res = { channelId: data.channelId, access: data.access }
          res.channel = channels.find(chan => chan.internalId === data.channelId)
          return res
        }).filter(elem => elem.channel)
      } else {
        return []
      }
    })

    function editRelations () {
      relSelectionDialogRef.value.showDialog('', selectedRef.value.relAccess.relations)
    }

    function relationsSelected (arr) {
      relSelectionDialogRef.value.closeDialog()
      selectedRef.value.relAccess.relations = arr
    }

    function editAttrRel () {
      attrSelectionDialogRef.value.showDialog('rel', selectedRef.value.relAccess.groups.map(data => data.groupId))
    }

    function editAttrItem () {
      attrSelectionDialogRef.value.showDialog('item', selectedRef.value.itemAccess.groups.map(data => data.groupId))
    }

    function attrSelected (arr, initiator) {
      attrSelectionDialogRef.value.closeDialog()
      if (initiator === 'item') {
        selectedRef.value.itemAccess.groups = selectedRef.value.itemAccess.groups.filter(data => arr.find(id => id === data.groupId))
        arr.forEach(id => {
          if (!selectedRef.value.itemAccess.groups.find(data => data.groupId === id)) {
            selectedRef.value.itemAccess.groups.push({ groupId: id, access: 0 })
          }
        })
      } else {
        selectedRef.value.relAccess.groups = selectedRef.value.relAccess.groups.filter(data => arr.find(id => id === data.groupId))
        arr.forEach(id => {
          if (!selectedRef.value.relAccess.groups.find(data => data.groupId === id)) {
            selectedRef.value.relAccess.groups.push({ groupId: id, access: 0 })
          }
        })
      }
    }

    function editChannels () {
      chanSelectionDialogRef.value.showDialog('', selectedRef.value.channelAccess.map(data => data.channelId))
    }

    function channelsSelected (arr) {
      chanSelectionDialogRef.value.closeDialog()
      selectedRef.value.channelAccess = selectedRef.value.channelAccess.filter(data => arr.find(id => id === data.channelId))
      arr.forEach(id => {
        if (!selectedRef.value.channelAccess.find(data => data.channelId === id)) {
          selectedRef.value.channelAccess.push({ channelId: id, access: 0 })
        }
      })
    }

    const searchRef = ref('')
    const rolesFiltered = computed(() => {
      let arr = roles
      if (searchRef.value) {
        const s = searchRef.value.toLowerCase()
        arr = roles.filter(item => item.identifier.toLowerCase().indexOf(s) > -1 || item.name.toLowerCase().indexOf(s) > -1)
      }
      return arr.sort((a, b) => {
        if (a.name[defaultLanguageIdentifier.value] && b.name[defaultLanguageIdentifier.value]) {
          return a.name[defaultLanguageIdentifier.value].localeCompare(b.name[defaultLanguageIdentifier.value])
        } else {
          return 0
        }
      })
    })
    function clearSelection () {
      selectedRef.value = null
      itemRef.value = null
    }

    onMounted(() => {
      loadAllChannels()
      loadAllTypes()
      loadAllAttributes()
      loadAllRelations().then(() => {
        loadAllRoles().then(() => {
          canViewConfigRef.value = canViewConfig('roles')
          canEditConfigRef.value = canEditConfig('roles')

          const id = router.currentRoute.params.id
          if (id) {
            const idx = roles.findIndex((elem) => elem.identifier === id)
            if (idx !== -1) {
              selectedRef.value = roles[idx]
              itemRef.value = idx
            } else {
              router.push('/config/roles')
            }
          } else {
            if (roles.length > 0) {
              selectedRef.value = roles[0]
            }
          }
        })
      })
    })

    function identifierValidation (v) {
      if (!/^[A-Za-z0-9_-]*$/.test(v)) {
        return i18n.t('Wrong.Identifier')
      }
      if (!v) {
        return i18n.t('Config.Roles.Error.IdentifierRequired')
      }
      if (v && selectedRef.value.internalId === 0) {
        const found = roles.find((rel) => rel.identifier === v)
        if (found && found.internalId !== 0) {
          return i18n.t('Config.Roles.Error.IdentifierNotUnique')
        }
      }
      return true
    }

    return {
      canViewConfigRef,
      canEditConfigRef,
      canViewChannels: canViewConfig('channels'),
      canEditChannels: canEditConfig('channels'),
      editChannels,
      chanSelectionDialogRef,
      channelsSelected,
      channelAccess,
      formRef,
      tabRef,
      roles,
      selectedRef,
      itemRef,
      add,
      remove,
      save,
      relSelectionDialogRef,
      roleRelations,
      editRelations,
      relationsSelected,
      currentLanguage,
      defaultLanguageIdentifier,
      attrSelectionDialogRef,
      editAttrItem,
      editAttrRel,
      attrSelected,
      groupsAccessRel,
      groupsAccessItem,
      valid,
      editValid,
      typesSelected,
      typeSelectionDialogRef,
      itemSelectionDialogRef,
      fromItems,
      fromItemsSelectedRef,
      addFromItems,
      itemsSelected,
      optionsChanged,
      removeFromItems,
      searchRef,
      rolesFiltered,
      clearSelection,
      configSelection: [
        { text: i18n.t('Config.Roles.Select.Config1'), value: 0 },
        { text: i18n.t('Config.Roles.Select.Config2'), value: 1 },
        { text: i18n.t('Config.Roles.Select.Config3'), value: 2 }
      ],
      accessSelection: [
        { text: i18n.t('Config.Roles.Select.Config1'), value: 0 },
        { text: i18n.t('Config.Roles.Select.Config2'), value: 1 },
        { text: i18n.t('Config.Roles.Select.Config3'), value: 2 }
      ],
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('Config.Roles.Error.NameRequired')
      ]
    }
  }
}
</script>
