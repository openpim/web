<template>
  <v-container v-if="canViewConfigRef">
    <v-row no-gutters>
      <v-col cols="3" lg="2" xl="2">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ $t('Config.Channels.Channels') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip bottom v-if="canEditConfigRef">
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" @click="add"><v-icon>mdi-plus</v-icon></v-btn>
            </template>
            <span>{{ $t('Add') }}</span>
          </v-tooltip>
        </v-toolbar>
        <v-list nav dense>
          <v-list-item-group v-model="itemRef" color="primary">
            <v-list-item v-for="(item, i) in channels" :key="i">
              <v-list-item-icon><v-icon>mdi-access-point</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col cols="9" lg="10" xl="10">
        <v-form ref="formRef" lazy-validation class="ml-7" v-if="selectedRef.id != -1">
          <div class="d-inline-flex align-center">
            <v-text-field style="min-width: 100%" v-model="selectedRef.identifier"  :disabled="selectedRef.internalId !== 0" :rules="identifierRules" :label="$t('Config.Channels.Identifier')" required></v-text-field>
            <SystemInformation :data="selectedRef"></SystemInformation>
          </div>

          <LanguageDependentField :values="selectedRef.name" v-model="selectedRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('Config.Channels.Name')"></LanguageDependentField>

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
              </v-radio-group>

              <ValidVisibleComponent :elem="selectedRef" :canEditConfig="canEditConfigRef"/>
            </v-tab-item>
            <v-tab-item>
              <component v-if="configComponent" :is="configComponent" :channel="selectedRef" :readonly="!canEditConfigRef" ></component>
            </v-tab-item>
          </v-tabs-items>

          <v-btn class="mr-4" v-if="canEditConfigRef" @click="save">{{ $t('Save') }}</v-btn>
          <v-btn class="mr-4" v-if="canEditConfigRef" @click.stop="remove" :disabled="selectedRef.attributes && selectedRef.attributes.length > 0">{{ $t('Remove') }}</v-btn>
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

export default {
  components: { LanguageDependentField, SystemInformation, ExtConfigCompoment, WBConfigCompoment, ValidVisibleComponent, OzonConfigCompoment, YMConfigCompoment },
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
      channels,
      addChannel,
      saveChannel,
      removeChannel,
      loadAllChannels
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

    watch(itemRef, (selected, previous) => {
      if (selected == null) {
        selectedRef.value = empty
        return
      }
      if (selected < channels.length) {
        if (previous && channels[previous].internalId === 0) {
          showInfo(i18n.t('Config.NotSaved'))
        }
        selectedRef.value = channels[selected]
        if (selectedRef.value.internalId !== 0 && selectedRef.value.identifier) {
          router.push('/config/channels/' + selectedRef.value.identifier)
        } else {
          router.push('/config/channels')
        }
      }
    })

    const configComponent = computed(() => {
      return getChannelFactory(selectedRef.value.type).getConfigCompoment()
    })

    function add () {
      selectedRef.value = addChannel()
      itemRef.value = channels.length - 1
    }

    function save () {
      if (formRef.value.validate()) {
        saveChannel(selectedRef.value).then(() => {
          showInfo(i18n.t('Saved'))
        })
      }
    }

    function remove () {
      if (confirm(i18n.t('Config.Channels.Confirm.Delete', { name: selectedRef.value.name }))) {
        removeChannel(selectedRef.value.id)
        selectedRef.value = empty
      }
    }

    let types = [
      { value: 1, text: i18n.t('Channels.Type.External') },
      { value: 2, text: i18n.t('Channels.Type.WB') },
      { value: 3, text: i18n.t('Channels.Type.Ozon') },
      { value: 4, text: i18n.t('Channels.Type.YM') }
    ]
    if (process.env.VUE_APP_CHANNELS) {
      const arr = process.env.VUE_APP_CHANNELS.split(',').map(elem => parseInt(elem))
      types = types.filter(elem => arr.includes(elem.value))
    }

    onMounted(() => {
      canViewConfigRef.value = canViewConfig('channels')
      canEditConfigRef.value = canEditConfig('channels')
      loadAllChannels().then(() => {
        const id = router.currentRoute.params.id
        if (id) {
          const idx = channels.findIndex((elem) => elem.identifier === id)
          if (idx !== -1) {
            selectedRef.value = channels[idx]
            itemRef.value = idx
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
        const found = channels.find((lang) => lang.identifier === v)
        if (found && found.internalId !== 0) {
          return i18n.t('Config.Channels.Error.IdentifierNotUnique')
        }
      }
      return true
    }

    return {
      canViewConfigRef,
      canEditConfigRef,
      formRef,
      channels,
      selectedRef,
      itemRef,
      add,
      remove,
      save,
      currentLanguage,
      defaultLanguageIdentifier,
      types,
      configComponent,
      timeMenuRef,
      timeMenu,
      time,
      tabRef,
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
