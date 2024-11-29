<template>
  <div style="width: 100%;">
    <v-container v-if="importConfigRef && ((importConfigRef.type !== 3 && importConfigCSVLicenceExist) || (importConfigRef.type === 3 && importConfigYMLLicenceExist))">
      <v-row no-gutters>
        <v-col cols="12">
          <v-card class="mx-auto mb-1" outlined>
            <v-card-title>
                <v-row dense>
                  <v-col cols="6">
                    <span class="mr-0">{{ importConfigRef.name[currentLanguage.identifier] || '[' + importConfigRef.name[defaultLanguageIdentifier] + ']' }}</span>
                    <SystemInformation :data="importConfigRef"></SystemInformation>
                  </v-col>
                  <v-col cols="6">
                    <span class="ml-3">{{$t('ImportConfig.FileType')}}:</span> {{ fileType }}
                  </v-col>
                </v-row>
              </v-card-title>
              <v-card-text>
                <v-simple-table v-if="importConfigRef.type !== 3 && importConfigCSVLicenceExist">
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left" style="width: 50%;">{{ $t('ImportConfig.ConfigurationParameter') }}</th>
                        <th class="text-left">{{ $t('ImportConfig.ConfigurationParameterValue') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{{ $t('ImportConfig.SelectedTemplateFile') }}</td>
                        <td><a :href="damUrl + 'import-config-template/' + importConfigRef.id + '?token=' + token">{{ importConfigRef.filedata.info.fileName ? importConfigRef.filedata.info.fileName : 'file.xls' }}</a></td>
                      </tr>
                      <tr v-if="importConfigRef.type === 2">
                        <td>{{ $t('ImportConfig.SelectedTab') }}</td>
                        <td>{{ importConfigRef.config.selectedTab }}</td>
                      </tr>
                      <tr>
                        <td>{{ $t('ImportConfig.HeadersLineNumber') }}</td>
                        <td>{{ importConfigRef.config.headerLineNumber }}</td>
                      </tr>
                      <tr>
                        <td>{{ $t('ImportConfig.NoHeader') }}</td>
                        <td>{{ importConfigRef.config.noHeadersChecked ? $t('ImportConfig.Yes') : $t('ImportConfig.No') }}</td>
                      </tr>
                      <tr>
                        <td>{{ $t('ImportConfig.DataLineNumber') }}</td>
                        <td>{{ importConfigRef.config.dataLineNumber }}</td>
                      </tr>
                      <tr>
                        <td>{{ $t('ImportConfig.Limit') }}</td>
                        <td>{{ importConfigRef.config.limit ? importConfigRef.config.limit : $t('ImportConfig.ImportAllRows')  }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
                <v-expansion-panels multiple focusable class="mt-3">
                  <v-expansion-panel key="1">
                    <v-expansion-panel-header>Mappings</v-expansion-panel-header>
                    <v-expansion-panel-content v-if="importConfigRef.type !== 3 && importConfigCSVLicenceExist">
                      <v-simple-table dense>
                        <template v-slot:default>
                          <thead>
                            <tr>
                              <th class="text-left">{{$t('ImportConfig.OptionsTable.Attribute')}}</th>
                              <th class="text-left">{{$t('ImportConfig.OptionsTable.Column')}}</th>
                              <th class="text-left">{{$t('ImportConfig.OptionsTable.Expression')}}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(elem, j) in importConfigRef.mappings" :key="j">
                              <td class="pa-1 pr-10">{{ elem.attribute }}</td>
                              <td class="pa-1 pr-10">{{ elem.column }}</td>
                              <td class="pa-1 pr-10">{{ elem.expression }}</td>
                            </tr>
                          </tbody>
                        </template>
                    </v-simple-table>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content v-else-if="importConfigRef.type === 3 && importConfigYMLLicenceExist">
                      <v-tabs v-model="tabRef">
                        <v-tab v-text="$t('ImportConfig.YML.Categories')"></v-tab>
                        <v-tab v-text="$t('ImportConfig.YML.Offers')"></v-tab>
                      </v-tabs>
                      <v-tabs-items v-model="tabRef" style="width: 100%;">
                        <v-tab-item style="width: 100%;">
                          <v-simple-table dense>
                              <template v-slot:default>
                                <thead>
                                  <tr>
                                    <th class="text-left">{{$t('ImportConfig.OptionsTable.Attribute')}}</th>
                                    <th class="text-left">{{$t('ImportConfig.OptionsTable.Column')}}</th>
                                    <th class="text-left">{{$t('ImportConfig.OptionsTable.Expression')}}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="(elem, j) in importConfigRef.mappings.categories" :key="j">
                                    <td class="pa-1 pr-10">{{ elem.attribute }}</td>
                                    <td class="pa-1 pr-10">{{ elem.column }}</td>
                                    <td class="pa-1 pr-10">{{ elem.expression }}</td>
                                  </tr>
                                </tbody>
                              </template>
                          </v-simple-table>
                        </v-tab-item>
                        <v-tab-item style="width: 100%;">
                          <v-simple-table dense>
                                <template v-slot:default>
                                  <thead>
                                    <tr>
                                      <th class="text-left">{{$t('ImportConfig.OptionsTable.Attribute')}}</th>
                                      <th class="text-left">{{$t('ImportConfig.OptionsTable.Column')}}</th>
                                      <th class="text-left">{{$t('ImportConfig.OptionsTable.Expression')}}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr v-for="(elem, j) in importConfigRef.mappings.offers" :key="j">
                                      <td class="pa-1 pr-10">{{ elem.attribute }}</td>
                                      <td class="pa-1 pr-10">{{ elem.column }}</td>
                                      <td class="pa-1 pr-10">{{ elem.expression }}</td>
                                    </tr>
                                  </tbody>
                                </template>
                          </v-simple-table>
                        </v-tab-item>
                      </v-tabs-items>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>
              <v-alert v-if="isUploadDisabled()" border="bottom" colored-border type="error" elevation="2" class="mt-6">{{ $t('ImportConfig.IncorrectMappingNotification') }}</v-alert>
              <v-card-actions>
                <v-file-input :disabled="isUploadDisabled()" show-size v-model="fileRef" :label="$t('ImportConfig.SelectFile')"></v-file-input>
                <v-btn class="d-inline" color="primary" :disabled="!fileRef" text @click="upload">{{ $t('ImportConfig.UploadFile') }}</v-btn>
              </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from '@vue/composition-api'
import * as langStore from '@/store/languages'
import * as errorStore from '@/store/error'
import * as importConfigsStore from '@/store/importConfigs'
import * as channelsStore from '@/store/channels'
import { useRouter } from '@/router/useRouter'
import i18n from '@/i18n'
import SystemInformation from '@/components/SystemInformation'

export default {
  components: { SystemInformation },
  setup (params, context) {
    const tabRef = ref(null)

    const { route } = useRouter()
    const fileRef = ref(null)
    const { importConfigs, loadAllImportConfigs, uploadImportFile } = importConfigsStore.useStore()
    const { showInfo } = errorStore.useStore()

    const importConfigCSVLicenceExist = ref(false)
    const importConfigYMLLicenceExist = ref(false)

    const {
      channelTypes,
      loadAllChannelTypes
    } = channelsStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const importConfigRef = ref(null)

    function importConfigSelected (selected) {
      importConfigRef.value = selected
      fileRef.value = null
    }

    const fileType = computed(() => {
      if (importConfigRef.value.type === 1) {
        return '.CSV'
      } else if (importConfigRef.value.type === 2) {
        return 'Excel'
      } else if (importConfigRef.value.type === 3) {
        return 'Yandex'
      }
      return ''
    })

    function upload () {
      uploadImportFile(importConfigRef.value.id, fileRef.value).then((item) => {
        showInfo(i18n.t('ImportConfig.ProcessStarted'))
      })
    }

    watch(route, (current, previous) => {
      if (current && current.params && current.params.id) {
        importConfigSelected(importConfigs.find(elem => elem.identifier === current.params.id))
      } else {
        importConfigRef.value = null
      }
    })

    onMounted(() => {
      Promise.all([loadAllImportConfigs(), loadAllChannelTypes()]).then(() => {
        if (route.value && route.value.params && route.value.params.id) {
          importConfigSelected(importConfigs.find(elem => elem.identifier === route.value.params.id))
        }
        const importConfigCSVLicence = channelTypes.find(el => el === 1000)
        if (importConfigCSVLicence) {
          importConfigCSVLicenceExist.value = true
        }
        const importConfigYMLLicence = channelTypes.find(el => el === 1001)
        if (importConfigYMLLicence) {
          importConfigYMLLicenceExist.value = true
        }
      })
    })

    function isUploadDisabled () {
      if (importConfigRef.value.type === 3) return false
      const identifierMapping = importConfigRef.value.mappings.find(el => el.attribute === 'identifier')
      if (importConfigRef.value.type !== 3 && importConfigRef.value.filedata.info.fileName && identifierMapping && (identifierMapping.column || (identifierMapping.expression && identifierMapping.expression.length))) {
        return false
      }
      if (importConfigRef.value.type === 3 && identifierMapping && (identifierMapping.column || (identifierMapping.expression && identifierMapping.expression.length))) {
        return false
      }
      return true
    }

    return {
      fileType,
      fileRef,
      importConfigRef,
      importConfigCSVLicenceExist,
      importConfigYMLLicenceExist,
      currentLanguage,
      defaultLanguageIdentifier,
      importConfigSelected,
      upload,
      damUrl: window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/',
      token: localStorage.getItem('token'),
      isUploadDisabled,
      tabRef
    }
  }
}
</script>
