<template>
  <div style="width: 100%;">
    <v-container
      v-if="importConfigRef && hasImportConfigLicense(importConfigRef.type)">
      <v-row no-gutters>
        <v-col cols="12">
          <v-card class="mx-auto mb-1" outlined>
            <v-card-title>
              <v-row dense>
                <v-col cols="6">
                  <span class="mr-0">{{ importConfigRef.name[currentLanguage.identifier] || '[' +
                    importConfigRef.name[defaultLanguageIdentifier] + ']' }}</span>
                  <SystemInformation :data="importConfigRef"></SystemInformation>
                </v-col>
                <v-col cols="6">
                  <span class="ml-3">{{ $t('ImportConfig.FileType') }}:</span> {{ fileType }}
                </v-col>
              </v-row>
            </v-card-title>
            <v-card-text>
              <v-simple-table v-if="(importConfigRef.type === 1 || importConfigRef.type === 2) && importConfigCSVLicenceExist">
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
                      <td><a :href="damUrl + 'import-config-template/' + importConfigRef.id + '?token=' + token">{{
                        importConfigRef.filedata.info.fileName ? importConfigRef.filedata.info.fileName : 'file.xls'
                      }}</a></td>
                    </tr>
                    <template
                      v-if="importConfigRef.type !== 2 || !importConfigRef.config || !importConfigRef.config.sheets || !importConfigRef.config.sheets.length">
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
                        <td>{{ importConfigRef.config.noHeadersChecked ? $t('ImportConfig.Yes') : $t('ImportConfig.No')
                        }}</td>
                      </tr>
                      <tr>
                        <td>{{ $t('ImportConfig.DataLineNumber') }}</td>
                        <td>{{ importConfigRef.config.dataLineNumber }}</td>
                      </tr>
                      <tr>
                        <td>{{ $t('ImportConfig.Limit') }}</td>
                        <td>{{ importConfigRef.config.limit ? importConfigRef.config.limit :
                          $t('ImportConfig.ImportAllRows') }}</td>
                      </tr>
                    </template>
                  </tbody>
                </template>
              </v-simple-table>
              <v-expansion-panels
                v-if="importConfigRef.type === 2 && importConfigRef.config && importConfigRef.config.sheets && importConfigRef.config.sheets.length"
                multiple focusable class="mt-2">
                <v-expansion-panel v-for="(sheet, sheetIndex) in importConfigRef.config.sheets"
                  :key="'sheet-config-' + sheetIndex">
                  <v-expansion-panel-header>{{ $t('ImportConfig.SelectedTab') }} {{ sheetIndex + 1 }}: {{
                    sheet.selectedTab
                  }}</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-simple-table dense>
                      <template v-slot:default>
                        <tbody>
                          <tr>
                            <td class="text-left">{{ $t('ImportConfig.HeadersLineNumber') }}</td>
                            <td>{{ sheet.headerLineNumber }}</td>
                          </tr>
                          <tr>
                            <td class="text-left">{{ $t('ImportConfig.NoHeader') }}</td>
                            <td>{{ sheet.noHeadersChecked ? $t('ImportConfig.Yes') : $t('ImportConfig.No') }}</td>
                          </tr>
                          <tr>
                            <td class="text-left">{{ $t('ImportConfig.DataLineNumber') }}</td>
                            <td>{{ sheet.dataLineNumber }}</td>
                          </tr>
                          <tr>
                            <td class="text-left">{{ $t('ImportConfig.Limit') }}</td>
                            <td>{{ sheet.limit ? sheet.limit : $t('ImportConfig.ImportAllRows') }}</td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
              <v-expansion-panels multiple focusable class="mt-3">
                <v-expansion-panel key="1">
                  <v-expansion-panel-header>{{ importConfigRef.type === 4 ? $t('BulkUpload.ConfigPreviewTitle') : 'Mappings' }}</v-expansion-panel-header>
                  <v-expansion-panel-content v-if="importConfigRef.type === 4 && importConfigBulkLicenceExist">
                    <div class="bulk-preview-block">
                      <div class="d-flex align-center mb-2">
                        <div class="text-subtitle-2">{{ $t('BulkUpload.MappingSection') }}</div>
                        <v-spacer />
                        <v-chip x-small label outlined>{{ importConfigRef.mappings.length }}</v-chip>
                      </div>
                      <v-simple-table dense class="bulk-preview-table">
                        <template v-slot:default>
                          <thead>
                            <tr>
                              <th class="text-left">{{ $t('ImportConfig.OptionsTable.Attribute') }}</th>
                              <th class="text-left">{{ $t('BulkUpload.FileField') }}</th>
                              <th class="text-left">{{ $t('ImportConfig.OptionsTable.Expression') }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(elem, j) in importConfigRef.mappings" :key="'bulk-mapping-' + j">
                              <td class="pa-1 pr-6">{{ elem.attribute || '-' }}</td>
                              <td class="pa-1 pr-6">{{ getBulkFileFieldLabel(elem.column) }}</td>
                              <td class="pa-1 pr-6"><span class="bulk-code-cell">{{ formatPreviewValue(elem.expression) }}</span></td>
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>

                      <div v-if="bulkConfigRelations.length" class="mt-4">
                        <div class="d-flex align-center mb-2">
                          <div class="text-subtitle-2">{{ $t('BulkUpload.RelationsSection') }}</div>
                          <v-spacer />
                          <v-chip x-small label outlined>{{ bulkConfigRelations.length }}</v-chip>
                        </div>
                        <v-simple-table dense class="bulk-preview-table">
                          <template v-slot:default>
                            <thead>
                              <tr>
                                <th class="text-left">{{ $t('BulkUpload.FileField') }}</th>
                                <th class="text-left">{{ $t('BulkUpload.RelationType') }}</th>
                                <th class="text-left">{{ $t('BulkUpload.RelationIdentifier') }}</th>
                                <th class="text-left">{{ $t('BulkUpload.Source') }}</th>
                                <th class="text-left">{{ $t('BulkUpload.Target') }}</th>
                                <th class="text-left">{{ $t('BulkUpload.Values') }}</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(relation, idx) in bulkConfigRelations" :key="'bulk-relation-' + idx">
                                <td class="pa-1 pr-6">{{ getBulkFileFieldLabel(relation.column) }}</td>
                                <td class="pa-1 pr-6"><span class="bulk-code-cell">{{ formatPreviewValue(relation.relationIdentifierExpression || relation.relationIdentifier) }}</span></td>
                                <td class="pa-1 pr-6"><span class="bulk-code-cell">{{ formatPreviewValue(relation.identifierExpression || relation.identifier) }}</span></td>
                                <td class="pa-1 pr-6"><span class="bulk-code-cell">{{ formatPreviewValue(relation.sourceExpression) }}</span></td>
                                <td class="pa-1 pr-6"><span class="bulk-code-cell">{{ formatPreviewValue(relation.targetIdentifierExpression) }}</span></td>
                                <td class="pa-1 pr-6"><span class="bulk-code-cell">{{ formatPreviewValue(relation.valuesExpression || relation.values) }}</span></td>
                              </tr>
                            </tbody>
                          </template>
                        </v-simple-table>
                      </div>
                    </div>
                  </v-expansion-panel-content>
                  <v-expansion-panel-content v-else-if="importConfigRef.type !== 3 && hasImportConfigLicense(importConfigRef.type)">
                    <template
                      v-if="importConfigRef.type === 2 && importConfigRef.config && importConfigRef.config.sheets && importConfigRef.config.sheets.length">
                      <div v-for="(sheet, sheetIndex) in importConfigRef.config.sheets" :key="'mapping-' + sheetIndex"
                        class="mb-4">
                        <div class="text-subtitle-2 mb-2">{{ $t('ImportConfig.SelectedTab') }} {{ sheetIndex + 1 }}: {{
                          sheet.selectedTab }}</div>
                        <v-simple-table dense>
                          <template v-slot:default>
                            <thead>
                              <tr>
                                <th class="text-left">{{ $t('ImportConfig.OptionsTable.Attribute') }}</th>
                                <th class="text-left">{{ $t('ImportConfig.OptionsTable.Column') }}</th>
                                <th class="text-left">{{ $t('ImportConfig.OptionsTable.Expression') }}</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="(elem, j) in (sheet.mappings && sheet.mappings.length ? sheet.mappings : importConfigRef.mappings)"
                                :key="j">
                                <td class="pa-1 pr-10">{{ elem.attribute }}</td>
                                <td class="pa-1 pr-10">{{ elem.column }}</td>
                                <td class="pa-1 pr-10">{{ elem.expression }}</td>
                              </tr>
                            </tbody>
                          </template>
                        </v-simple-table>
                      </div>
                    </template>
                    <v-simple-table v-else dense>
                      <template v-slot:default>
                        <thead>
                          <tr>
                            <th class="text-left">{{ $t('ImportConfig.OptionsTable.Attribute') }}</th>
                            <th class="text-left">{{ $t('ImportConfig.OptionsTable.Column') }}</th>
                            <th class="text-left">{{ $t('ImportConfig.OptionsTable.Expression') }}</th>
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
                      <v-tab>{{ $t('ImportConfig.YML.Categories') }}</v-tab>
                      <v-tab>{{ $t('ImportConfig.YML.Offers') }}</v-tab>
                    </v-tabs>
                    <v-tabs-items v-model="tabRef" style="width: 100%;">
                      <v-tab-item style="width: 100%;">
                        <v-simple-table dense>
                          <template v-slot:default>
                            <thead>
                              <tr>
                                <th class="text-left">{{ $t('ImportConfig.OptionsTable.Attribute') }}</th>
                                <th class="text-left">{{ $t('ImportConfig.OptionsTable.Column') }}</th>
                                <th class="text-left">{{ $t('ImportConfig.OptionsTable.Expression') }}</th>
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
                                <th class="text-left">{{ $t('ImportConfig.OptionsTable.Attribute') }}</th>
                                <th class="text-left">{{ $t('ImportConfig.OptionsTable.Column') }}</th>
                                <th class="text-left">{{ $t('ImportConfig.OptionsTable.Expression') }}</th>
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
            <v-alert v-if="isUploadDisabled()" border="bottom" colored-border type="error" elevation="2" class="mt-6">{{
              $t('ImportConfig.IncorrectMappingNotification') }}</v-alert>
            <v-card-actions v-if="importConfigRef.type === 4" class="d-block pa-4 pt-0">
              <div class="bulk-run-layout">
                <div class="bulk-summary-row">
                  <v-chip small label outlined class="mr-2 mb-2">{{ $t('BulkUpload.SummaryFiles') }}: {{ bulkDisplayFileCount }}</v-chip>
                  <v-chip small label outlined class="mr-2 mb-2">{{ $t('BulkUpload.SummarySize') }}: {{ formatSize(bulkDisplayTotalSize) }}</v-chip>
                  <v-chip small label outlined class="mr-2 mb-2">{{ $t('BulkUpload.SummaryLimit') }}: {{ bulkSessionLimit }}</v-chip>
                  <v-chip small label outlined class="mr-2 mb-2">{{ $t('BulkUpload.SummaryProcess') }}: {{ bulkProcessId || $t('BulkUpload.ProcessNotStarted') }}</v-chip>
                  <v-chip small label outlined class="mr-2 mb-2">{{ $t('BulkUpload.SummaryLogMode') }}: {{ bulkLogModeLabel }}</v-chip>
                </div>

                <v-card outlined class="bulk-run-panel">
                  <v-card-text class="pa-4">
                    <div class="bulk-toolbar">
                      <v-file-input
                        v-model="bulkFiles"
                        multiple
                        counter
                        dense
                        filled
                        hide-details="auto"
                        truncate-length="24"
                        class="bulk-file-input"
                        :label="$t('BulkUpload.SelectFiles')"
                        :disabled="bulkBusy"
                        :rules="[
                          v => !v || !v.length || v.length <= bulkSessionLimit || $t('BulkUpload.TooManyFiles', { max: bulkSessionLimit })
                        ]"
                        prepend-icon="mdi-paperclip"
                      >
                        <template v-slot:selection="{ text, index }">
                          <v-chip v-if="index < 3" x-small label class="mr-1 mb-1">{{ text }}</v-chip>
                          <span v-else-if="index === 3" class="text-caption grey--text text--darken-1">
                            {{ $t('BulkUpload.MoreSelected', { count: bulkFiles.length - 3 }) }}
                          </span>
                        </template>
                      </v-file-input>

                      <v-btn
                        color="primary"
                        class="bulk-upload-btn"
                        :disabled="!bulkFiles.length || bulkBusy"
                        :loading="bulkBusy"
                        @click="startBulkUpload"
                      >
                        {{ $t('ImportConfig.UploadFile') }} ({{ bulkFiles.length }})
                      </v-btn>
                    </div>

                    <div class="bulk-stage-stack">
                      <div class="bulk-stage-row">
                        <div class="bulk-stage-head">
                          <div class="text-body-2 font-weight-medium">{{ $t('BulkUpload.UploadStage') }}</div>
                          <div class="text-caption grey--text text--darken-1">
                            {{ formatSize(bulkUploadLoadedBytes) }} / {{ formatSize(bulkUploadTotalBytes) }}
                          </div>
                        </div>
                        <div class="bulk-stage-body">
                          <v-progress-linear :value="bulkUploadPercent" :color="bulkUploadColor" height="18" rounded>
                            {{ Math.round(bulkUploadPercent) }}%
                          </v-progress-linear>
                          <div class="d-flex justify-space-between text-caption mt-1">
                            <span>{{ $t('BulkUpload.FilesUploaded', { uploaded: bulkUploadUploadedFiles, total: bulkUploadTotalFiles }) }}</span>
                            <span v-if="bulkUploadProgress && bulkUploadProgress.currentChunk">{{ $t('BulkUpload.CurrentChunk') }} {{ bulkUploadProgress.currentChunk }} / {{ bulkUploadProgress.totalChunks }}</span>
                          </div>
                          <div class="text-caption grey--text text--darken-1 mt-1" v-if="bulkUploadProgress && bulkUploadProgress.currentChunkLabel">
                            {{ bulkUploadProgress.currentChunkLabel }}
                          </div>
                          <div class="text-caption grey--text text--darken-1 mt-1" v-if="bulkProcessingStarting">
                            {{ $t('BulkUpload.StartingProcessing') }}
                          </div>
                        </div>
                      </div>

                      <div class="bulk-stage-row">
                        <div class="bulk-stage-head">
                          <div class="text-body-2 font-weight-medium">{{ $t('BulkUpload.ProcessingStage') }}</div>
                          <div class="text-caption grey--text text--darken-1">
                            {{ bulkFinishedCount }} / {{ bulkProcessingTotal }}
                            <template v-if="bulkStatus && bulkStatus.failed > 0">
                              ({{ $t('BulkUpload.Failed') }}: {{ bulkStatus.failed }})
                            </template>
                          </div>
                        </div>
                        <div class="bulk-stage-body">
                          <v-progress-linear :value="bulkProcessingPercent" :color="bulkProcessingColor" height="18" rounded>
                            {{ bulkFinishedCount }} / {{ bulkProcessingTotal }}
                          </v-progress-linear>
                          <div class="d-flex justify-space-between text-caption mt-1">
                            <span v-if="bulkProcessStatus">{{ bulkProcessStatus }}</span>
                            <span v-if="bulkCurrentProcessingFile">{{ $t('BulkUpload.CurrentFile') }}: {{ bulkCurrentProcessingFile }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="bulkFileStatuses.length" class="mt-4">
                      <div class="d-flex align-center mb-2">
                        <div class="text-subtitle-2">{{ $t('BulkUpload.ResultsTitle') }}</div>
                        <v-spacer />
                        <div class="text-caption grey--text text--darken-1">{{ bulkFinishedCount }} / {{ bulkProcessingTotal }}</div>
                      </div>
                      <v-data-table
                        :items="bulkFileStatuses"
                        :headers="bulkHeaders"
                        dense
                        class="bulk-results-table"
                        :items-per-page="20"
                        :footer-props="{ 'items-per-page-options': [10, 20, 50] }"
                      >
                        <template v-slot:item.status="{ item }">
                          <v-chip x-small label :color="statusColor(item.status)">
                            {{ $t('BulkUpload.Status.' + item.status) }}
                          </v-chip>
                        </template>
                        <template v-slot:item.size="{ item }">
                          {{ formatSize(item.size) }}
                        </template>
                        <template v-slot:item.error="{ item }">
                          <span v-if="item.error" class="red--text">{{ item.error }}</span>
                          <span v-else class="grey--text text--darken-1">-</span>
                        </template>
                        <template v-slot:item.resultIdentifier="{ item }">
                          <span v-if="item.resultIdentifier">{{ item.resultIdentifier }}</span>
                          <span v-else class="grey--text text--darken-1">-</span>
                        </template>
                      </v-data-table>
                    </div>

                    <v-expansion-panels flat accordion class="mt-3">
                      <v-expansion-panel>
                        <v-expansion-panel-header class="py-2 px-0">
                          <div class="d-flex align-center">
                            <span class="text-subtitle-2">{{ $t('BulkUpload.TechnicalLogTitle') }}</span>
                            <span v-if="bulkLogLines.length" class="text-caption grey--text text--darken-1 ml-2">
                              {{ $t('BulkUpload.TechnicalLogSummary', { count: bulkLogLines.length }) }}
                            </span>
                          </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content class="px-0">
                          <div class="bulk-log-panel">
                            <pre class="bulk-log-text">{{ bulkLogText || $t('BulkUpload.TechnicalLogEmpty') }}</pre>
                          </div>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-card-text>
                </v-card>
              </div>
            </v-card-actions>
            <v-card-actions v-else>
              <v-file-input :disabled="isUploadDisabled()" show-size v-model="fileRef"
                :label="$t('ImportConfig.SelectFile')"></v-file-input>
              <v-btn class="d-inline" color="primary" :disabled="!fileRef" text @click="upload">{{
                $t('ImportConfig.UploadFile')
              }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, computed } from '@vue/composition-api'
import * as langStore from '@/store/languages'
import * as errorStore from '@/store/error'
import * as importConfigsStore from '@/store/importConfigs'
import * as channelsStore from '@/store/channels'
import { useRouter } from '@/router/useRouter'
import i18n from '@/i18n'
import SystemInformation from '@/components/SystemInformation'
import { serverFetch } from '@/store/utils'

const BULK_CHUNK_SIZE = 3

export default {
  components: { SystemInformation },
  setup () {
    const tabRef = ref(null)

    const { route } = useRouter()
    const fileRef = ref(null)
    const store = importConfigsStore.useStore()
    const { importConfigs, loadAllImportConfigs, uploadImportFile } = store
    const { showInfo, showError } = errorStore.useStore()

    const importConfigCSVLicenceExist = ref(false)
    const importConfigYMLLicenceExist = ref(false)
    const importConfigBulkLicenceExist = ref(false)

    const {
      channelTypes,
      loadAllChannelTypes
    } = channelsStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const importConfigRef = ref(null)
    const bulkFiles = ref([])
    const bulkProcessId = ref(null)
    const bulkStatus = ref(null)
    const bulkFileStatuses = ref([])
    const bulkUploadProgress = ref(null)
    const bulkProcessingStarting = ref(false)
    const bulkProcessStatus = ref('')
    const bulkUploading = ref(false)
    const bulkPolling = ref(null)
    const bulkProcessLog = ref('')

    const bulkBusy = computed(() => bulkUploading.value || bulkProcessingStarting.value || bulkPolling.value !== null)
    const bulkUploadPercent = computed(() => {
      const progress = bulkUploadProgress.value
      if (!progress) return 0
      if (progress.totalBytes > 0) {
        return Math.min((progress.loadedBytes / progress.totalBytes) * 100, 100)
      }
      if (progress.totalFiles > 0) {
        return Math.min((progress.uploadedFiles / progress.totalFiles) * 100, 100)
      }
      return 0
    })
    const bulkFinishedCount = computed(() => {
      if (!bulkStatus.value) return 0
      return (bulkStatus.value.completed || 0) + (bulkStatus.value.failed || 0) + (bulkStatus.value.skipped || 0)
    })
    const bulkProcessingPercent = computed(() => {
      if (!bulkStatus.value || !bulkStatus.value.total) return 0
      return Math.min((bulkFinishedCount.value / bulkStatus.value.total) * 100, 100)
    })
    const bulkCurrentProcessingFile = computed(() => {
      const currentFile = bulkFileStatuses.value.find(item => item.status === 'processing')
      return currentFile ? currentFile.originalName : ''
    })
    const bulkSelectedFiles = computed(() => Array.isArray(bulkFiles.value) ? bulkFiles.value : [])
    const bulkDisplayFileCount = computed(() => {
      if (bulkUploadProgress.value && bulkUploadProgress.value.totalFiles) return bulkUploadProgress.value.totalFiles
      if (bulkFileStatuses.value.length) return bulkFileStatuses.value.length
      return bulkSelectedFiles.value.length
    })
    const bulkDisplayTotalSize = computed(() => {
      if (bulkUploadProgress.value && bulkUploadProgress.value.totalBytes) return bulkUploadProgress.value.totalBytes
      if (bulkFileStatuses.value.length) return sumFileSizes(bulkFileStatuses.value)
      return sumFileSizes(bulkSelectedFiles.value)
    })
    const bulkSessionLimit = computed(() => (importConfigRef.value && importConfigRef.value.config && importConfigRef.value.config.maxFiles) || 100)
    const bulkUploadLoadedBytes = computed(() => bulkUploadProgress.value ? bulkUploadProgress.value.loadedBytes : 0)
    const bulkUploadTotalBytes = computed(() => bulkUploadProgress.value ? bulkUploadProgress.value.totalBytes : bulkDisplayTotalSize.value)
    const bulkUploadUploadedFiles = computed(() => bulkUploadProgress.value ? bulkUploadProgress.value.uploadedFiles : 0)
    const bulkUploadTotalFiles = computed(() => bulkUploadProgress.value ? bulkUploadProgress.value.totalFiles : bulkDisplayFileCount.value)
    const bulkUploadColor = computed(() => {
      if (!bulkUploadProgress.value) return 'grey'
      return bulkUploadPercent.value >= 100 ? 'success' : 'primary'
    })
    const bulkProcessingTotal = computed(() => bulkStatus.value && bulkStatus.value.total ? bulkStatus.value.total : bulkFileStatuses.value.length)
    const bulkProcessingColor = computed(() => {
      if (bulkStatus.value && bulkStatus.value.failed > 0) return 'warning'
      if (bulkProcessingTotal.value > 0 && bulkFinishedCount.value >= bulkProcessingTotal.value) return 'success'
      if (bulkProcessStatus.value || bulkProcessingStarting.value) return 'primary'
      return 'grey'
    })
    const bulkConfigRelations = computed(() => {
      if (!importConfigRef.value || !importConfigRef.value.config) return []
      if (Array.isArray(importConfigRef.value.config.relations)) return importConfigRef.value.config.relations
      return importConfigRef.value.config.relation ? [importConfigRef.value.config.relation] : []
    })
    const bulkLogMode = computed(() => (importConfigRef.value && importConfigRef.value.config && importConfigRef.value.config.logMode) || 'info')
    const bulkLogModeLabel = computed(() => i18n.t('BulkUpload.LogMode.' + bulkLogMode.value))
    const bulkLogText = computed(() => String(bulkProcessLog.value || ''))
    const bulkLogLines = computed(() => {
      return bulkLogText.value
        .split('\n')
        .filter(line => line.trim().length > 0)
    })

    const bulkHeaders = [
      { text: '#', value: 'idx', width: '50px' },
      { text: i18n.t('BulkUpload.FileName'), value: 'originalName' },
      { text: i18n.t('BulkUpload.Size'), value: 'size', width: '100px' },
      { text: i18n.t('BulkUpload.Status'), value: 'status', width: '120px' },
      { text: i18n.t('BulkUpload.ResultIdentifier'), value: 'resultIdentifier' },
      { text: i18n.t('BulkUpload.Error'), value: 'error' }
    ]

    function createBulkFileStatus (file, idx) {
      return {
        idx,
        originalName: file.name || file.originalFilename || `file_${idx}`,
        size: file.size || 0,
        status: 'pending',
        error: null,
        resultIdentifier: null
      }
    }

    function getBulkFileName (file) {
      return file.name || file.originalFilename || file.originalName || ''
    }

    function formatFileBatchLabel (files) {
      const names = files.map(getBulkFileName).filter(Boolean)
      if (!names.length) return ''
      if (names.length <= 2) return names.join(', ')
      return names.slice(0, 2).join(', ') + ' +' + (names.length - 2)
    }

    function getBulkFileFieldLabel (value) {
      const labels = {
        $fileName: i18n.t('BulkUpload.FileColumn.fileName'),
        $fileNameFull: i18n.t('BulkUpload.FileColumn.fileNameFull'),
        $fileExt: i18n.t('BulkUpload.FileColumn.fileExt'),
        $fileMimeType: i18n.t('BulkUpload.FileColumn.fileMimeType'),
        $fileSize: i18n.t('BulkUpload.FileColumn.fileSize'),
        $fileIndex: i18n.t('BulkUpload.FileColumn.fileIndex')
      }
      return labels[value] || value || '-'
    }

    function formatPreviewValue (value) {
      if (value == null || value === '') return '-'
      if (typeof value === 'object') return JSON.stringify(value)
      return '' + value
    }

    function sumFileSizes (files) {
      return files.reduce((sum, file) => sum + (file && file.size ? file.size : 0), 0)
    }

    function setBulkFileStatusRange (startIndex, count, status, error = null) {
      bulkFileStatuses.value = bulkFileStatuses.value.map((item, idx) => {
        if (idx < startIndex || idx >= startIndex + count) return item
        return {
          ...item,
          status,
          error
        }
      })
    }

    function importConfigSelected (selected) {
      importConfigRef.value = selected
      fileRef.value = null
      stopPolling()
      bulkFiles.value = []
      bulkProcessId.value = null
      bulkStatus.value = null
      bulkFileStatuses.value = []
      bulkUploadProgress.value = null
      bulkProcessingStarting.value = false
      bulkProcessStatus.value = ''
      bulkProcessLog.value = ''
      bulkUploading.value = false
    }

    const fileType = computed(() => {
      if (!importConfigRef.value) return ''
      if (importConfigRef.value.type === 1) {
        return '.CSV'
      } else if (importConfigRef.value.type === 2) {
        return 'Excel'
      } else if (importConfigRef.value.type === 3) {
        return 'Yandex'
      } else if (importConfigRef.value.type === 4) {
        return 'BulkFiles'
      }
      return ''
    })

    function hasImportConfigLicense (type) {
      if (type === 1 || type === 2) return importConfigCSVLicenceExist.value
      if (type === 3) return importConfigYMLLicenceExist.value
      if (type === 4) return importConfigBulkLicenceExist.value
      return false
    }

    function upload () {
      uploadImportFile(importConfigRef.value.id, fileRef.value).then(() => {
        showInfo(i18n.t('ImportConfig.ProcessStarted'))
      })
    }

    watch(route, (current) => {
      if (current && current.params && current.params.id) {
        importConfigSelected(importConfigs.find(elem => elem.identifier === current.params.id))
      } else {
        importConfigRef.value = null
      }
    })

    watch(bulkFiles, () => {
      if (bulkBusy.value) return
      bulkProcessId.value = null
      bulkStatus.value = null
      bulkFileStatuses.value = []
      bulkUploadProgress.value = null
      bulkProcessingStarting.value = false
      bulkProcessStatus.value = ''
      bulkProcessLog.value = ''
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
        const importConfigBulkLicence = channelTypes.find(el => el === 1002)
        if (importConfigBulkLicence) {
          importConfigBulkLicenceExist.value = true
        }
      })
    })

    function isUploadDisabled () {
      if (!importConfigRef.value) return true
      if (importConfigRef.value.type === 3) return false
      if (importConfigRef.value.type === 4) return false
      const identifierMapping = importConfigRef.value.mappings.find(el => el.attribute === 'identifier')
      if (importConfigRef.value.type !== 3 && importConfigRef.value.filedata.info.fileName && identifierMapping && (identifierMapping.column || (identifierMapping.expression && identifierMapping.expression.length))) {
        return false
      }
      if (importConfigRef.value.type === 3 && identifierMapping && (identifierMapping.column || (identifierMapping.expression && identifierMapping.expression.length))) {
        return false
      }
      return true
    }

    function statusColor (status) {
      switch (status) {
        case 'completed': return 'success'
        case 'failed': return 'error'
        case 'processing': return 'info'
        case 'uploading': return 'info'
        case 'uploaded': return 'primary'
        case 'skipped': return 'grey'
        case 'pending': return 'grey'
        default: return 'default'
      }
    }

    function formatSize (bytes) {
      if (bytes === 0) return '0 B'
      if (!bytes) return ''
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    async function startBulkUpload () {
      const files = Array.isArray(bulkFiles.value) ? bulkFiles.value : []
      if (!files.length) return

      bulkUploading.value = true
      bulkProcessId.value = null
      bulkStatus.value = null
      bulkProcessStatus.value = ''
      bulkProcessingStarting.value = false
      bulkProcessLog.value = ''
      bulkFileStatuses.value = files.map((file, idx) => createBulkFileStatus(file, idx))
      bulkUploadProgress.value = {
        totalFiles: files.length,
        totalBytes: sumFileSizes(files),
        uploadedFiles: 0,
        loadedBytes: 0,
        currentChunk: 0,
        totalChunks: Math.ceil(files.length / BULK_CHUNK_SIZE),
        currentChunkBytes: 0,
        currentChunkLoadedBytes: 0,
        currentChunkLabel: ''
      }

      try {
        const configId = importConfigRef.value.id
        const language = currentLanguage.value.identifier
        const totalBytes = bulkUploadProgress.value.totalBytes
        let processId = null

        for (let i = 0; i < files.length; i += BULK_CHUNK_SIZE) {
          const chunk = files.slice(i, i + BULK_CHUNK_SIZE)
          const chunkIndex = Math.floor(i / BULK_CHUNK_SIZE) + 1
          const chunkBytes = sumFileSizes(chunk)
          const chunkStartBytes = sumFileSizes(files.slice(0, i))
          const chunkLabel = formatFileBatchLabel(chunk)

          setBulkFileStatusRange(i, chunk.length, 'uploading')
          bulkUploadProgress.value = {
            ...bulkUploadProgress.value,
            currentChunk: chunkIndex,
            currentChunkBytes: chunkBytes,
            currentChunkLoadedBytes: 0,
            currentChunkLabel: chunkLabel,
            uploadedFiles: i,
            loadedBytes: chunkStartBytes
          }

          try {
            const result = await store.uploadBulkFiles(configId, chunk, processId, (event) => {
              const chunkRatio = event && event.lengthComputable && event.total
                ? Math.min(event.loaded / event.total, 1)
                : 0
              const currentChunkLoadedBytes = Math.round(chunkBytes * chunkRatio)
              bulkUploadProgress.value = {
                ...bulkUploadProgress.value,
                currentChunk: chunkIndex,
                currentChunkBytes: chunkBytes,
                currentChunkLoadedBytes,
                currentChunkLabel: chunkLabel,
                uploadedFiles: i,
                loadedBytes: Math.min(chunkStartBytes + currentChunkLoadedBytes, totalBytes)
              }
            })
            processId = result.processId
          } catch (e) {
            setBulkFileStatusRange(i, chunk.length, 'failed', e?.message || '' + e)
            throw e
          }

          setBulkFileStatusRange(i, chunk.length, 'uploaded')
          bulkUploadProgress.value = {
            ...bulkUploadProgress.value,
            currentChunk: chunkIndex,
            currentChunkBytes: chunkBytes,
            currentChunkLoadedBytes: chunkBytes,
            currentChunkLabel: chunkLabel,
            uploadedFiles: i + chunk.length,
            loadedBytes: Math.min(chunkStartBytes + chunkBytes, totalBytes)
          }
        }

        bulkUploading.value = false
        bulkProcessId.value = processId
        bulkProcessStatus.value = i18n.t('BulkUpload.StartingProcessing')
        bulkProcessingStarting.value = true

        await store.startBulkProcessing(processId, language)
        showInfo(i18n.t('ImportConfig.ProcessStarted'))

        const isActive = await pollBulkStatus()
        if (isActive) {
          startPolling()
        } else {
          bulkProcessingStarting.value = false
        }
      } catch (e) {
        bulkProcessStatus.value = ''
        bulkProcessingStarting.value = false
        showError(e?.message || '' + e)
      } finally {
        bulkUploading.value = false
      }
    }

    async function pollBulkStatus () {
      if (!bulkProcessId.value) return false
      try {
        const data = await serverFetch(`{
          getProcesses(
            where: { id: ${bulkProcessId.value} }
            offset: 0
            limit: 1
          ) {
            count
            rows {
              id
              active
              status
              log
              runtime
            }
          }
        }`)
        const proc = data.getProcesses && data.getProcesses.rows && data.getProcesses.rows[0]
        if (!proc) return false

        bulkProcessStatus.value = proc.status || ''
        bulkProcessLog.value = proc.log || ''
        if (proc.runtime) {
          bulkStatus.value = proc.runtime.stats || null
          bulkFileStatuses.value = proc.runtime.files || []
        }
        bulkProcessingStarting.value = false
        if (!proc.active) {
          stopPolling()
        }
        return !!proc.active
      } catch (e) {
        console.error('Polling error:', e)
        return false
      }
    }

    function startPolling () {
      stopPolling()
      bulkPolling.value = setInterval(async () => {
        await pollBulkStatus()
      }, 3000)
    }

    function stopPolling () {
      if (bulkPolling.value) {
        clearInterval(bulkPolling.value)
        bulkPolling.value = null
      }
    }

    onUnmounted(() => {
      stopPolling()
    })

    return {
      fileType,
      fileRef,
      importConfigRef,
      importConfigCSVLicenceExist,
      importConfigYMLLicenceExist,
      importConfigBulkLicenceExist,
      hasImportConfigLicense,
      currentLanguage,
      defaultLanguageIdentifier,
      importConfigSelected,
      upload,
      damUrl: window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/',
      token: localStorage.getItem('token'),
      isUploadDisabled,
      tabRef,
      bulkFiles,
      bulkStatus,
      bulkFileStatuses,
      bulkUploadProgress,
      bulkUploading,
      bulkProcessingStarting,
      bulkProcessStatus,
      bulkProcessId,
      bulkBusy,
      bulkUploadPercent,
      bulkFinishedCount,
      bulkProcessingPercent,
      bulkCurrentProcessingFile,
      bulkDisplayFileCount,
      bulkDisplayTotalSize,
      bulkSessionLimit,
      bulkUploadLoadedBytes,
      bulkUploadTotalBytes,
      bulkUploadUploadedFiles,
      bulkUploadTotalFiles,
      bulkUploadColor,
      bulkProcessingTotal,
      bulkProcessingColor,
      bulkConfigRelations,
      bulkLogModeLabel,
      bulkLogText,
      bulkLogLines,
      bulkHeaders,
      getBulkFileFieldLabel,
      formatPreviewValue,
      statusColor,
      formatSize,
      startBulkUpload
    }
  }
}
</script>

<style scoped>
.bulk-preview-block {
  width: 100%;
}

.bulk-preview-table .bulk-code-cell {
  display: inline-block;
  max-width: 420px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 12px;
}

.bulk-run-layout {
  width: 100%;
}

.bulk-summary-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.bulk-run-panel {
  border-color: rgba(0, 0, 0, 0.12);
}

.bulk-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
}

.bulk-file-input {
  flex: 1 1 520px;
}

.bulk-upload-btn {
  flex: 0 0 auto;
}

.bulk-stage-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.bulk-stage-row {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.bulk-stage-body {
  min-width: 0;
}

.bulk-results-table ::v-deep .v-chip {
  font-weight: 500;
}

.bulk-log-panel {
  max-height: 320px;
  overflow: auto;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  background: #fafafa;
}

.bulk-log-text {
  margin: 0;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 960px) {
  .bulk-stage-row {
    grid-template-columns: 1fr;
  }

  .bulk-upload-btn {
    width: 100%;
  }
}
</style>
