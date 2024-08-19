<template>
  <v-container v-if="canViewConfigRef" style="background-color:white">
    <v-row no-gutters>
      <v-col cols="3" lg="2" xl="2">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ $t('Config.Channels.Channels') }}</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-tooltip bottom v-if="canEditConfigRef">
            <template v-slot:activator="{ }">
              <v-menu
                :close-on-content-click="false"
                offset-y
                transition="slide-y-transition"
              >
                <template v-slot:activator="{ on: menuOn }">
                  <v-btn icon v-on="menuOn">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item @click="add('group')">
                    <v-list-item-title>{{ $t('Config.Channels.NewGroupName') }}</v-list-item-title>
                  </v-list-item>

                  <v-list-item @click="add('channel')">
                    <v-list-item-title>{{ $t('Config.Channels.NewName') }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
            <span>{{ $t('Add') }}</span>
          </v-tooltip>
        </v-toolbar>
        <v-text-field v-model="searchRef" @input="clearSelection" :label="$t('Filter')" flat hide-details clearable clear-icon="mdi-close-circle-outline" class="ml-5 mr-5"></v-text-field>
        <v-list nav dense>
          <v-list-group v-for="group in groupedChannels" :key="group.id" prepend-icon="mdi-folder"
            @click="itemRef = group.id">
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>
                  {{ group.name[currentLanguage.identifier] || `[${group.name[defaultLanguage]}]` }}
                </v-list-item-title>
              </v-list-item-content>
            </template>
            <v-row>
              <v-col cols="1"></v-col>
              <v-col>
                <v-list-item v-for="child in group.children" :key="child.id"
                  @click="itemRef = (itemRef === child.id ? null : child.id)"
                  :class="{ 'v-item--active': itemRef === child.id, 'v-list-item--active': itemRef === child.id }">
                  <v-list-item-icon>
                    <v-icon>mdi-access-point</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ child.name[currentLanguage.identifier] || `[${child.name[defaultLanguage]}]` }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-col>
            </v-row>
          </v-list-group>

          <v-list-item v-for="chan in singleChannels" :key="chan.id"
            @click="itemRef = (itemRef === chan.id ? null : chan.id)"
            :class="{ 'v-item--active': itemRef === chan.id, 'v-list-item--active': itemRef === chan.id, 'primary--text': itemRef === chan.id }">
            <v-list-item-icon>
              <v-icon>mdi-access-point</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ chan.name[currentLanguage.identifier] || `[${chan.name[defaultLanguage]}]` }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col cols="9" lg="10" xl="10">
        <v-form ref="formRef" lazy-validation class="ml-7" v-if="selectedRef && selectedRef.id != -1">
          <div class="d-inline-flex align-center">
            <v-text-field style="min-width: 100%" v-model="selectedRef.identifier" :disabled="selectedRef.internalId !== 0" :rules="identifierRules" :label="$t('Config.Channels.Identifier')" required></v-text-field>
            <SystemInformation :data="selectedRef"></SystemInformation>
          </div>

          <LanguageDependentField :values="selectedRef.name" v-model="selectedRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('Config.Channels.Name')"></LanguageDependentField>

          <v-text-field v-model="selectedRef.order" type="number" :label="$t('Config.Channels.Order')" required></v-text-field>

            <div v-if="!selectedRef.group">
            <v-tabs v-model="tabRef">
              <v-tab v-text="$t('Config.Channels.TabProperties')"></v-tab>
              <v-tab v-text="$t('Config.Channels.TabConfiguration')"></v-tab>
            </v-tabs>
            <v-tabs-items v-model="tabRef">
            <v-tab-item>
              <v-checkbox :readonly="!canEditConfigRef" v-model="selectedRef.active" :label="$t('Config.Channels.Active')" required></v-checkbox>
              <v-select v-model="selectedRef.type" :items="types" :readonly="!canEditConfigRef" :label="$t('Config.Channels.Type')"></v-select>

              <v-radio-group v-model="selectedRef.config.start" :readonly="!canEditConfigRef">
                <v-radio :label="$t('Config.Channels.StartManual')" :value="1"></v-radio>

                <v-radio :label="$t('Config.Channels.StartInterval')" :value="2"></v-radio>
                <div v-if="selectedRef.config.start === 2">
                  <input :readonly="!canEditConfigRef" class="ml-5" v-model="selectedRef.config.interval" type="number" :placeholder="$t('Config.Channels.Interval')"/> {{$t('Config.Channels.IntervalUOM')}}
                </div>

                <v-radio :label="$t('Config.Channels.StartAt')" :value="3"></v-radio>
                <template v-if="selectedRef.config.start === 3">
                  <v-menu ref="timeMenuRef" :disabled="!canEditConfigRef" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
                    <template v-slot:activator="{ on }">
                      <v-text-field  class="ml-5" v-model="selectedRef.config.time" :label="$t('Config.Channels.Time')" prepend-icon="mdi-clock-outline" readonly v-on="on"></v-text-field>
                    </template>
                    <v-time-picker v-if="timeMenu" v-model="selectedRef.config.time" format="24hr" full-width @click:minute="timeMenuRef.save(time)"></v-time-picker>
                  </v-menu>
                </template>

                <v-radio :label="$t('Config.Channels.StartCron')" :value="4"></v-radio>
                <template v-if="selectedRef.config.start === 4">
                  <input :readonly="!canEditConfigRef" class="ml-5" v-model="selectedRef.config.cron" :placeholder="$t('Config.Channels.Cron')"/>
                </template>
              </v-radio-group>

              <v-radio-group v-if="channelFactory.hasSync" v-model="selectedRef.config.syncStart" :readonly="!canEditConfigRef">
                <v-radio :label="$t('Config.Channels.SyncStartManual')" :value="1"></v-radio>

                <v-radio :label="$t('Config.Channels.SyncStartInterval')" :value="2"></v-radio>
                <div v-if="selectedRef.config.syncStart === 2">
                  <input :readonly="!canEditConfigRef" class="ml-5" v-model="selectedRef.config.syncInterval" type="number" :placeholder="$t('Config.Channels.Interval')"/> {{$t('Config.Channels.IntervalUOM')}}
                </div>

                <v-radio :label="$t('Config.Channels.SyncStartAt')" :value="3"></v-radio>
                <template v-if="selectedRef.config.syncStart === 3">
                  <v-menu ref="timeMenuRef2" :disabled="!canEditConfigRef" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
                    <template v-slot:activator="{ on }">
                      <v-text-field  class="ml-5" v-model="selectedRef.config.syncTime" :label="$t('Config.Channels.Time')" prepend-icon="mdi-clock-outline" readonly v-on="on"></v-text-field>
                    </template>
                    <v-time-picker v-if="timeMenu" v-model="selectedRef.config.syncTime" format="24hr" full-width @click:minute="timeMenuRef2.save(time)"></v-time-picker>
                  </v-menu>
                </template>
                <v-radio :label="$t('Config.Channels.SyncStartCron')" :value="4"></v-radio>
                <template v-if="selectedRef.config.syncStart === 4">
                  <input :readonly="!canEditConfigRef" class="ml-5" v-model="selectedRef.config.syncCron" :placeholder="$t('Config.Channels.Cron')"/>
                </template>
              </v-radio-group>

              <v-select v-if="(selectedRef.config.start && selectedRef.config.start != 1) || (selectedRef.config.syncStart && selectedRef.config.syncStart != 1)" v-model="selectedRef.config.language" :items="languages" :readonly="!canEditConfigRef" :label="$t('Config.Channels.Language')" item-text="name.ru" item-value='identifier' clearable></v-select>

              <ValidVisibleComponent :elem="selectedRef" :canEditConfig="canEditConfigRef"/>

              <v-checkbox class="ml-2" v-model="selectedRef.config.statusOnHead" :label="$t('Config.Channels.StatusOnHead')" required></v-checkbox>
              <v-checkbox class="ml-2 mt-0" v-model="selectedRef.config.showRemoveButton" :label="$t('Config.Channels.ShowRemoveButton')" required></v-checkbox>
            </v-tab-item>
            <v-tab-item>
              <component v-if="channelFactory.getConfigCompoment()" :is="channelFactory.getConfigCompoment()" :channel="selectedRef" :readonly="!canEditConfigRef" ></component>
            </v-tab-item>
          </v-tabs-items>
          </div>
          <OptionsTable v-if="selectedRef.config.options" :options="selectedRef.config.options" @changed="optionsChanged" />

          <v-btn class="mr-4" v-if="canEditConfigRef" @click="save">{{ $t('Save') }}</v-btn>
          <v-menu :close-on-content-click="false" offset-y v-if="canEditConfigRef && !selectedRef.group">
            <template v-slot:activator="{ on }"><v-btn class="mr-4" v-on="on"> {{ $t('Move') }}</v-btn></template>
            <v-card class="pa-4">
              <v-autocomplete v-model="grpId" item-value="id" :items="connectGroups" :item-text="'name.' + currentLanguage.identifier || 'name.' + defaultLanguageIdentifier" clearable clear-icon="mdi-close-circle-outline"></v-autocomplete>
              <div class="text-end"><v-btn @click="move(grpId)"> {{ $t('Move') }}</v-btn></div>
            </v-card>
          </v-menu>
          <v-btn class="mr-4" v-if="canEditConfigRef" @click.stop="remove" :disabled="(selectedRef.attributes && selectedRef.attributes.length > 0) || (selectedRef.group && selectedRef.group.length > 0) || (selectedRef.group && selectedRef.group.length > 0) || (selectedRef.group && selectedRef.children && selectedRef.children.length > 0)">{{ $t('Remove') }}</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, watch, onMounted, computed } from '@vue/composition-api'
import * as langStore from '../../store/languages'
import * as channelsStore from '../../store/channels'
import * as errorStore from '../../store/error'
import i18n from '../../i18n'
import LanguageDependentField from '../../components/LanguageDependentField'
import * as userStore from '../../store/users'
import SystemInformation from '../../components/SystemInformation'
import router from '../../router'
import getChannelFactory from '../../channels'
import ValidVisibleComponent from '../../components/ValidVisibleComponent'

import ExtConfigCompoment from '../../channels/ext/ExtConfigCompoment'
import WBConfigCompoment from '../../channels/wb/WBConfigCompoment'
import OzonConfigCompoment from '../../channels/ozon/OzonConfigCompoment'
import YMConfigCompoment from '../../channels/ym/YMConfigCompoment'
import ExtMapConfigCompoment from '../../channels/extmap/ExtMapConfigCompoment'
import MDMConfigCompoment from '../../channels/mdm/MDMConfigComponent'
import MDMExtConfigCompoment from '../../channels/mdmExt/MDMExtConfigComponent'
import XLSTemplConfigCompoment from '../../channels/xlsTemplate/XLSTemplConfigCompoment.vue'
import OptionsTable from '../../components/OptionsTable'

export default {
  components: { LanguageDependentField, SystemInformation, ExtConfigCompoment, WBConfigCompoment, ValidVisibleComponent, OzonConfigCompoment, YMConfigCompoment, ExtMapConfigCompoment, MDMConfigCompoment, MDMExtConfigCompoment, XLSTemplConfigCompoment, OptionsTable },
  setup (props, { root }) {
    const { canViewConfig, canEditConfig } = userStore.useStore()
    const {
      showInfo
    } = errorStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages,
      languages
    } = langStore.useStore()

    const {
      channels,
      channelTypes,
      addChannel,
      saveChannel,
      removeChannel,
      loadAllChannelsWithMapping,
      loadAllChannelTypes
    } = channelsStore.useStore()

    const canViewConfigRef = ref(false)
    const canEditConfigRef = ref(false)

    const tabRef = ref(null)
    const empty = { id: -1 }
    const formRef = ref(null)
    const selectedRef = ref(empty)
    const itemRef = ref(null)

    const timeMenu = ref(false)
    const timeMenuRef = ref(null)
    const time = ref(null)

    const oldChannel = ref(null)
    const searchRef = ref('')
    const channelsRef = ref(channels)

    function filteredChannels () {
      let arr = channelsRef.value
      const result = []
      const chanMap = {}

      if (searchRef.value) {
        const searchTerm = searchRef.value.toLowerCase()
        arr = arr.filter(item => {
          const identifierMatch = item.identifier.toLowerCase().includes(searchTerm)
          const nameMatch = item.name && Object.values(item.name).some(val => val.toLowerCase().includes(searchTerm))
          return identifierMatch || nameMatch
        })
      }

      arr.forEach(chan => {
        chanMap[chan.id] = { ...chan, children: [] }
      })

      arr.forEach(chan => {
        if (chan.parentId) {
          const parent = chanMap[chan.parentId]
          if (parent) {
            parent.children.push(chanMap[chan.id])
          }
        } else if (chan.group || (chan.parentId === 0 && !chan.group)) {
          result.push(chanMap[chan.id])
        }
      })

      result.forEach(group => {
        if (group.children.length > 0) {
          group.children.sort((a, b) => a.order - b.order)
        }
      })
      return result
    }

    const groupedChannels = computed(() => {
      return filteredChannels().filter(item => item.group).sort((a, b) => a.order - b.order)
    })

    const singleChannels = computed(() => {
      return filteredChannels().filter(item => !item.group).sort((a, b) => a.order - b.order)
    })

    function clearSelection () {
      selectedRef.value = null
      itemRef.value = null
    }

    watch(itemRef, (selected, previous) => {
      if (selected == null) {
        selectedRef.value = empty
        return
      }

      let val

      val = groupedChannels.value.find(item => item.id === selected)

      if (!val) {
        for (const group of groupedChannels.value) {
          val = group.children.find(child => child.id === selected)
          if (val) break
        }
      }

      if (!val) {
        val = singleChannels.value.find(item => item.id === selected)
      }

      if (val) {
        if (previous) {
          let prevVal = groupedChannels.value.find(item => item.id === previous)

          if (!prevVal) {
            for (const group of groupedChannels.value) {
              prevVal = group.children.find(child => child.id === previous)
              if (prevVal) break
            }
          }

          if (!prevVal) {
            prevVal = singleChannels.value.find(item => item.id === previous)
          }

          if (prevVal && prevVal.internalId === 0) {
            showInfo(i18n.t('Config.NotSaved'))
          }
        }

        if (!val.config.options) { root.$set(val.config, 'options', []) }

        oldChannel.value = JSON.parse(JSON.stringify(val))
        selectedRef.value = val
        if (selectedRef.value.internalId !== 0 && selectedRef.value.identifier) {
          router.push('/config/channels/' + selectedRef.value.identifier)
        } else {
          router.push('/config/channels')
        }
      }
    })

    const channelFactory = computed(() => {
      return getChannelFactory(selectedRef.value.type)
    })

    function add (group) {
      const parentId = selectedRef.value && selectedRef.value.group ? (selectedRef.value.internalId === 0 ? selectedRef.value.id : selectedRef.value.internalId) : 0
      group === 'group' ? selectedRef.value = addChannel(true) : selectedRef.value = addChannel(false, parentId)
      itemRef.value = selectedRef.value.id
      oldChannel.value = JSON.parse(JSON.stringify(selectedRef.value))
    }

    const connectGroups = computed(() => {
      const filteredGroups = groupedChannels.value.filter(group => parseInt(group.id) !== selectedRef.value.parentId)
      if (filteredGroups && selectedRef.value.parentId) {
        filteredGroups.push({ id: 0, name: { ru: 'Убрать из группы', en: 'Remove from the group' } })
      }
      return filteredGroups
    })

    const grpId = ref(null)

    function move (grpId) {
      selectedRef.value.parentId = grpId
      channelsRef.value.find(chan => chan.id === selectedRef.value.id).parentId = grpId || 0
      if (formRef.value.validate()) {
        findChanges(oldChannel.value, selectedRef.value)
        saveChannel(selectedRef.value).then(() => {
          showInfo(i18n.t('Saved'))
          const readingTime = new Date().toISOString()
          updateCategories(selectedRef.value, readingTime)
        })
        oldChannel.value = JSON.parse(JSON.stringify(selectedRef.value))
      }
    }

    function findChanges (oldChannel, changesChannel) {
      Object.keys(oldChannel.mappings).forEach(mapping => {
        if (Object.prototype.hasOwnProperty.call(changesChannel.mappings, mapping)) {
          if (JSON.stringify(oldChannel.mappings[mapping]) !== JSON.stringify(changesChannel.mappings[mapping])) {
            // changed
            changesChannel.mappings[mapping].changed = true
          }
        } else {
          // removed
          changesChannel.mappings[mapping].changed = true
        }
      })

      Object.keys(changesChannel.mappings).forEach(mapping => {
        if (!Object.prototype.hasOwnProperty.call(oldChannel.mappings, mapping)) {
          // added
          changesChannel.mappings[mapping].changed = true
        }
      })
    }

    function updateCategories (channel, readingTime) {
      Object.keys(channel.mappings).forEach(mapping => {
        const category = channel.mappings[mapping]
        if (Object.prototype.hasOwnProperty.call(category, 'changed')) {
          delete category.changed
          category.readingTime = readingTime
        }
      })
    }

    function save () {
      selectedRef.value.parentId = selectedRef.value.parentId ? selectedRef.value.parentId : 0
      if (formRef.value.validate()) {
        findChanges(oldChannel.value, selectedRef.value)
        saveChannel(selectedRef.value).then(() => {
          showInfo(i18n.t('Saved'))
          const readingTime = new Date().toISOString()
          updateCategories(selectedRef.value, readingTime)
          const selectedChannel = channelsRef.value.find(chan => chan.id === selectedRef.value.id)
          if (selectedChannel) {
            selectedChannel.identifier = selectedRef.value.identifier
            selectedChannel.id = selectedRef.value.internalId
            selectedChannel.internalId = selectedRef.value.internalId
            selectedChannel.order = selectedRef.value.order
          }
        })
        oldChannel.value = JSON.parse(JSON.stringify(selectedRef.value))
      }
    }

    function remove () {
      if (selectedRef.value.group) {
        if (confirm(i18n.t('Config.Channels.Confirm.DeleteGroup', { name: selectedRef.value.name }))) {
          removeChannel(selectedRef.value.id)
          selectedRef.value = empty
        }
      } else {
        if (confirm(i18n.t('Config.Channels.Confirm.Delete', { name: selectedRef.value.name }))) {
          removeChannel(selectedRef.value.id)
          selectedRef.value = empty
        }
      }
    }

    const types = ref([
      { value: 1, text: i18n.t('Channels.Type.External') },
      { value: 2, text: i18n.t('Channels.Type.WB') },
      { value: 3, text: i18n.t('Channels.Type.Ozon') },
      { value: 4, text: i18n.t('Channels.Type.YM') },
      { value: 5, text: i18n.t('Channels.Type.ExternalWithMapping') },
      { value: 6, text: i18n.t('Channels.Type.MDM') },
      { value: 7, text: i18n.t('Channels.Type.ExcelTemplate') },
      { value: 8, text: i18n.t('Channels.Type.MDM.External') }
    ])

    function optionsChanged (val) {
      selectedRef.value.config.options = val
    }

    onMounted(() => {
      canViewConfigRef.value = canViewConfig('channels')
      canEditConfigRef.value = canEditConfig('channels')
      Promise.all([loadAllLanguages(), loadAllChannelTypes(), loadAllChannelsWithMapping()]).then(() => {
        clearSelection()
        types.value = types.value.filter(elem => channelTypes.includes(elem.value))

        const id = router.currentRoute.params.id
        if (id) {
          const channel = channelsRef.value.find((elem) => elem.identifier === id)
          if (channel) {
            if (!channel.config.options) root.$set(channel.config, 'options', [])
            selectedRef.value = channel
            oldChannel.value = JSON.parse(JSON.stringify(channel))
            itemRef.value = channel.id
          } else {
            router.push('/config/channels')
          }
        }
      })
    })

    function identifierValidation (v) {
      if (!v) {
        return i18n.t('Config.Channels.Error.IdentifierRequired')
      }
      if (!/^[A-Za-z0-9_]*$/.test(v)) {
        return i18n.t('Wrong.Identifier')
      }
      if (v && selectedRef.value.internalId === 0) {
        const found = channelsRef.value.find((lang) => lang.identifier === v)
        if (found && found.internalId !== 0) {
          return i18n.t('Config.Channels.Error.IdentifierNotUnique')
        }
      }
      return true
    }

    return {
      singleChannels,
      groupedChannels,
      filteredChannels,
      connectGroups,
      grpId,
      canViewConfigRef,
      canEditConfigRef,
      formRef,
      channels,
      selectedRef,
      itemRef,
      add,
      remove,
      move,
      save,
      currentLanguage,
      defaultLanguageIdentifier,
      types,
      channelFactory,
      timeMenuRef,
      timeMenu,
      time,
      tabRef,
      languages,
      searchRef,
      oldChannel,
      findChanges,
      updateCategories,
      clearSelection,
      optionsChanged,
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('Config.Channels.Error.NameRequired')
      ]
    }
  }
}
</script>
