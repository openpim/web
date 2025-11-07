<template>
  <div v-if="lov">
    <v-form ref="formRef" lazy-validation class="ml-7" v-if="lov.id != -1">
      <div class="d-inline-flex align-center">
        <v-text-field style="min-width: 100%" v-model="lov.identifier" :disabled="lov.internalId !== 0"
          :rules="identifierRules" :label="$t('Config.Languages.Identifier')" required></v-text-field>
        <SystemInformation :data="lov"></SystemInformation>
      </div>
      <LanguageDependentField :values="lov.name" v-model="lov.name[currentLanguage && currentLanguage.identifier]"
        :rules="nameRules" :label="$t('Config.Languages.Name')"></LanguageDependentField>
      <v-alert v-if="loadingRef" type="info">{{ $t('Config.LOV.Loading') }}</v-alert>
      <v-data-table :headers="headers" :items="filteredValues" hide-default-header dense :page.sync="currentPage"
        :items-per-page="itemsPerPage">
        <template v-slot:top>
          <div class="d-flex align-items-center justify-content-between">
            <v-text-field type="text" class="pa-0" v-model="search" append-icon="mdi-magnify" :label="$t('Search')"
              single-line></v-text-field>
            <div class="d-flex align-items-center">
              <v-tooltip top v-if="canEditConfig" class="ml-4">
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" class="pa-0" icon color="primary" @click="addValue">
                    <v-icon dark>mdi-plus</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('Add') }}</span>
              </v-tooltip>

              <v-tooltip top class="ml-4">
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" class="pa-0" icon color="primary" @click="exportData">
                    <v-icon dark>mdi-export</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('Config.LOV.Export') }}</span>
              </v-tooltip>

              <v-tooltip top class="ml-4">
                <template v-if="canEditConfig" v-slot:activator="{ on }">
                  <v-btn v-on="on" class="pa-0" icon color="primary" @click="importData">
                    <v-icon dark>mdi-import</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('Config.LOV.Import') }}</span>
              </v-tooltip>
            </div>
          </div>
        </template>
        <template v-slot:header="{ props }">
          <tr v-sticky-columns>
            <th v-for="header in props.headers" :key="header.value"
              style="cursor:pointer; user-select:none; background-color: white; border-bottom: 1px solid #e0e0e0;"
              @click="toggleSort(header.value)">
              <span
                style="display: table-cell; text-align: start !important; color: rgba(0, 0, 0, 0.6); font-size: 0.75rem;"
                class="pl-4 pr-4">
                {{ header.text }}
                <span v-if="sortBy === header.value">
                  <v-icon small v-if="!sortDesc">mdi-arrow-up</v-icon>
                  <v-icon small v-else>mdi-arrow-down</v-icon>
                </span>
              </span>
            </th>
          </tr>
        </template>
        <template v-slot:item="{ item }">
          <tr v-sticky-columns>
            <td class="pa-1" style="background-color: white;">
              <input v-model="item.id" type="number" size="5" maxlength="5" :placeholder="$t('Config.LOV.ID')" />
            </td>
            <td class="pa-1" style="background-color: white; border-right: 1px solid #e0e0e0;">
              <input v-model="item.value[currentLanguage && currentLanguage.identifier]" size="50"
                :placeholder="$t('Config.LOV.Value')" />
            </td>
            <td class="pa-1" v-for="(channel, i) in availableChannelsRef" :key="i">
              <input v-model="item[channel.identifier][currentLanguage && currentLanguage.identifier]" />
            </td>
            <td class="pa-1" v-for="(customField, i) in lovCustomFields(lov.identifier)" :key="'cf_' + i">
              <input :type="customField.type == 'bool' ? 'checkbox' : 'text'"
                v-model="item[customField.identifier][currentLanguage && currentLanguage.identifier]"
                :readonly="customField.readonly" />
            </td>
            <td class="pa-1">
              <v-chip @click="editLevels(item)">
                <v-icon left>mdi-form-select</v-icon>{{ item.level && item.level.length > 0 ? '...' : '' }}
              </v-chip>
            </td>
            <td class="pa-1">
              <v-chip @click="editAttributes(item)">
                <v-icon left>mdi-form-select</v-icon>{{ item.attrs && item.attrs.length > 0 ? '...' : '' }}
              </v-chip>
            </td>
            <td class="pa-1">
              <input v-model="item.url" size="5" :placeholder="$t('Config.LOV.URL')" />
            </td>
            <td class="pa-1">
              <input v-model="item.filter" :placeholder="$t('Config.LOV.Filter')" />
              <v-btn class="pa-0" icon color="primary" @click="removeValue(item.id)">
                <v-icon dark>mdi-close-circle-outline</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
      <br />
    </v-form>
    <template>
      <v-row justify="center">
        <v-dialog v-model="dialogRef" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('Config.LOV.Level') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-card class="mb-5">
                      <v-card-title class="subtitle-2 font-weight-bold">
                        <div style="width:80%">{{ $t('Config.LOV.Visible') }}</div>
                        <v-tooltip bottom v-if="canEditConfig">
                          <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on" @click="addVisible"><v-icon>mdi-plus</v-icon></v-btn>
                          </template>
                          <span>{{ $t('Add') }}</span>
                        </v-tooltip>
                        <v-tooltip bottom v-if="canEditConfig">
                          <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on" @click="removeVisible"
                              :disabled="visibleSelectedRef == null"><v-icon>mdi-minus</v-icon></v-btn>
                          </template>
                          <span>{{ $t('Remove') }}</span>
                        </v-tooltip>
                      </v-card-title>
                      <v-divider></v-divider>
                      <v-list dense class="pt-0 pb-0">
                        <v-list-item-group v-model="visibleSelectedRef" color="primary">
                          <v-list-item dense class="pt-0 pb-0" v-for="(item, i) in visible" :key="i">
                            <v-list-item-content class="pt-0 pb-0" style="display: inline">
                              <router-link :to="'/item/' + item.identifier">{{ item.identifier }}</router-link><span
                                class="ml-2">- {{
                                  item.name[currentLanguage && currentLanguage.identifier] || '[' +
                                  item.name[defaultLanguageIdentifier] +
                                  ']' }}</span>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list-item-group>
                      </v-list>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialogClose">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
      <v-row justify="center">
        <v-dialog v-model="dialogAttrRef" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('Config.LOV.ForAttributes') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-card class="mb-5">
                      <v-card-title class="subtitle-2 font-weight-bold">
                        <div style="width:80%">{{ $t('Config.LOV.ForAttributes') }}</div>
                        <v-tooltip bottom v-if="canEditConfig">
                          <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on" @click="addAttr"><v-icon>mdi-plus</v-icon></v-btn>
                          </template>
                          <span>{{ $t('Add') }}</span>
                        </v-tooltip>
                        <v-tooltip bottom v-if="canEditConfig">
                          <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on" @click="removeAttr"
                              :disabled="attrSelectedRef == null"><v-icon>mdi-minus</v-icon></v-btn>
                          </template>
                          <span>{{ $t('Remove') }}</span>
                        </v-tooltip>
                      </v-card-title>
                      <v-divider></v-divider>
                      <v-list dense class="pt-0 pb-0">
                        <v-list-item-group v-model="attrSelectedRef" color="primary">
                          <v-list-item dense class="pt-0 pb-0" v-for="(attr, i) in attrs" :key="i">
                            <v-list-item-content class="pt-0 pb-0" style="display: inline">
                              <router-link :to="'/config/attributes/' + attr.identifier">{{ attr.identifier
                              }}</router-link><span class="ml-2">- {{ attr.name[currentLanguage &&
                                  currentLanguage.identifier] || '[' +
                                  attr.name[defaultLanguageIdentifier] + ']' }}</span>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list-item-group>
                      </v-list>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialogAttrClose">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemsSelected" />
    <AttributeSelectionDialog ref="attrSelectionDialogRef" @selected="attrSelected" />
    <template>
      <v-row justify="center">
        <v-dialog v-model="excelDialogRef" persistent width="80%">
          <v-card>
            <v-card-title>
              <span class="headline">{{ excelDialogTitleRef }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-progress-linear v-model="excelDialogProgressRef" color="primary" height="25">
                      <template v-slot:default="{ value }">
                        <strong>{{ Math.ceil(value) }}%</strong>
                      </template>
                    </v-progress-linear>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="excelDialogClose">{{ $t('Cancel') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
    <template>
      <v-row justify="center">
        <v-dialog v-model="importFinishedDialogRef" persistent width="500px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('DataTable.ExcelImport.Finished') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" class="d-flex justify-center align-center">
                    {{ $t('DataTable.ExcelImport.FinishedText', { count: importFinishedLogRef.length - 1 }) }}
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="d-flex justify-center align-center">
                    <v-btn color="blue darken-1" text @click="downloadImportFinishedLog">{{
                      $t('DataTable.ExcelImport.Report') }}</v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="importFinishedDialogRef = false">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
    <template>
      <v-row justify="center">
        <v-dialog v-model="importConfigDialogRef" persistent width="80%">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('DataTable.ExcelImport.Config') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-file-input chips show-size v-model="fileUploadRef"
                      :label="$t('DataTable.ExcelImport.FileUpload')"></v-file-input>
                    <v-select v-model="importModeRef" :items="importModes"
                      :label="$t('DataTable.ExcelImport.ImportMode')"></v-select>
                    <v-checkbox v-model="importStopOnErrorRef" :label="$t('DataTable.ExcelImport.ErrorStop')"
                      required></v-checkbox>
                    <v-checkbox v-model="importEmptyValuesRef" :label="$t('DataTable.ExcelImport.EmptyValues')"
                      required></v-checkbox>
                    <v-text-field type="number" v-model="importPageSizeRef"
                      :label="$t('DataTable.ExcelImport.PageSize')" required></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="fileUploadRef = null; importConfigDialogRef = false">{{
                $t('Cancel')
              }}</v-btn>
              <v-btn color="blue darken-1" text @click="importExcel"
                :disabled="!fileUploadRef || importPageSizeRef <= 0">{{ $t('DataTable.ExcelImport.Start') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
  </div>
</template>
<script>
import { onMounted, ref, computed, watch } from '@vue/composition-api'
import i18n from '../i18n'
import AttributeType from '../constants/attributeTypes'
import * as attrStore from '../store/attributes'
import * as langStore from '../store/languages'
import * as relStore from '../store/relations'
import * as lovStore from '../store/lovs'
import * as errorStore from '../store/error'
import * as itemStore from '../store/item'
import * as channelsStore from '../store/channels'
import XLSX from 'xlsx'
import { saveAs } from 'file-saver'

import SystemInformation from '../components/SystemInformation'
import LanguageDependentField from '../components/LanguageDependentField'
import ItemsSelectionDialog from '../components/ItemsSelectionDialog'
import AttributeSelectionDialog from '../components/AttributeSelectionDialog'
import lovCustomFields from '../_customizations/lovs/lovCustomFields.js'

const stickyColumns = {
  inserted (el) {
    function update () {
      const ths = el.querySelectorAll('th')
      const tds = el.querySelectorAll('td')

      if (ths.length) {
        ths[0].style.position = 'sticky'
        ths[0].style.left = '0px'
        ths[0].style.zIndex = 1
      }
      if (tds.length) {
        tds[0].style.position = 'sticky'
        tds[0].style.left = '0px'
        tds[0].style.zIndex = 1
      }

      if (ths.length > 1) {
        ths[1].style.position = 'sticky'
        ths[1].style.left = ths[0].offsetWidth + 'px'
        ths[1].style.zIndex = 1
      }
      if (tds.length > 1) {
        tds[1].style.position = 'sticky'
        tds[1].style.left = tds[0].offsetWidth + 'px'
        tds[1].style.zIndex = 1
      }
    }

    update()
    window.addEventListener('resize', update)
    setTimeout(update, 350)
  }
}

export default {
  components: { SystemInformation, LanguageDependentField, ItemsSelectionDialog, AttributeSelectionDialog },
  props: {
    lov: {
      required: true
    },
    canEditConfig: {
      required: true
    }
  },
  directives: { stickyColumns },
  setup (props, { root }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages,
      languages
    } = langStore.useStore()

    const {
      checkIdentifier,
      findByInternalId
    } = attrStore.useStore()

    const {
      relations,
      loadAllRelations
    } = relStore.useStore()

    const {
      showInfo,
      showError
    } = errorStore.useStore()

    const lovStoreInstance = lovStore.useStore()
    const {
      getLOVsForSelect,
      getLOVData,
      loadAllLOVs,
      saveLOV,
      addLOV
    } = lovStoreInstance

    const lovsRef = lovStoreInstance.lovs

    const { loadItemsByIds } = itemStore.useStore()

    const { loadAllChannels, getAvailableChannels } = channelsStore.useStore()

    const lovSelection = ref([])
    const formRef = ref(null)
    const tabRef = ref(null)
    const relSelectionDialogRef = ref(null)
    const rels = ref([])

    const dialogRef = ref(false)
    const dialogAttrRef = ref(false)
    const visible = ref([])
    const attrs = ref([])
    const availableChannelsRef = ref([])
    let dialogElem = null
    let dialogAttrElem = null

    const itemSelectionDialogRef = ref(null)
    const attrSelectionDialogRef = ref(null)
    const visibleSelectedRef = ref(null)
    const attrSelectedRef = ref(null)

    const importDialogRef = ref(null)
    const importDataRef = ref('')
    const importConfigDialogRef = ref(false)
    const fileUploadRef = ref(null)
    const importModeRef = ref('UPDATE_ONLY')
    const importStopOnErrorRef = ref(false)
    const importEmptyValuesRef = ref(false)
    const importPageSizeRef = ref(100)
    const excelDialogRef = ref(false)
    const excelDialogProgressRef = ref(0)
    const excelDialogTitleRef = ref('')
    const importFinishedDialogRef = ref(false)
    const importFinishedLogRef = ref([])
    const importModes = [
      { text: i18n.t('DataTable.ExcelImport.CREATE_ONLY'), value: 'CREATE_ONLY' },
      { text: i18n.t('DataTable.ExcelImport.UPDATE_ONLY'), value: 'UPDATE_ONLY' },
      { text: i18n.t('DataTable.ExcelImport.CREATE_UPDATE'), value: 'CREATE_UPDATE' }
    ]

    const itemsPerPage = ref(10)
    const currentPage = ref(1)
    const search = ref('')
    const loadingRef = ref(false)

    const headers = computed(() => {
      if (!props.lov.values || !availableChannelsRef.value.length || !currentLanguage.value) return []

      const dynamicHeaders = availableChannelsRef.value.map(channel => ({
        text: channel.name[currentLanguage.value.identifier] || `[${channel.name[defaultLanguageIdentifier]}]`,
        value: channel.identifier
      }))

      const customFields = lovCustomFields(props.lov.identifier).map(field => ({ text: field.name, value: field.name }))

      return [
        { text: i18n.t('Config.LOV.ID'), value: 'id' },
        { text: i18n.t('Config.LOV.Value'), value: 'value' },
        ...dynamicHeaders,
        ...customFields,
        { text: i18n.t('Config.LOV.Level'), value: 'level' },
        { text: i18n.t('Config.LOV.ForAttributes'), value: 'attrs' },
        { text: i18n.t('Config.LOV.URL'), value: 'url' },
        { text: i18n.t('Config.LOV.Filter'), value: 'filter' }
      ]
    })

    const sortBy = ref(null)
    const sortDesc = ref(false)

    function getCellValue (item, column) {
      if (column === 'id' || column === 'url' || column === 'filter') return item[column]

      if (column === 'value') return item.value[currentLanguage.value.identifier] || ''

      if (availableChannelsRef.value.some(ch => ch.identifier === column)) {
        return item[column]?.[currentLanguage.value.identifier] || ''
      }

      const custom = lovCustomFields(props.lov.identifier).find(f => f.name === column || f.identifier === column)
      if (custom) return item[custom.identifier]?.[currentLanguage.value.identifier] || ''

      if (column === 'level') return item.level?.length || 0
      if (column === 'attrs') return item.attrs?.length || 0

      return ''
    }

    function toggleSort (headerValue) {
      if (sortBy.value !== headerValue) {
        sortBy.value = headerValue
        sortDesc.value = false
      } else if (!sortDesc.value) {
        sortDesc.value = true
      } else {
        sortBy.value = null
        sortDesc.value = false
      }
    }

    const filteredValues = computed(() => {
      if (!props.lov.values) return []
      let arr = props.lov.values
      if (search.value) {
        const searchTerm = search.value.toLowerCase()
        arr = arr.filter(item => {
          if (
            item.id.toString().includes(searchTerm) ||
            item.value[currentLanguage.value.identifier]?.toLowerCase().includes(searchTerm) ||
            (item.url && item.url.toLowerCase().includes(searchTerm)) ||
            (item.filter && item.filter.toString().includes(searchTerm))
          ) {
            return true
          }
          return availableChannelsRef.value.some(channel => {
            const channelData = item[channel.identifier][currentLanguage.value.identifier]
            return channelData && channelData.toLowerCase().includes(searchTerm)
          })
        })
      }
      if (sortBy.value !== null) {
        return [...arr].sort((a, b) => {
          const valA = getCellValue(a, sortBy.value)
          const valB = getCellValue(b, sortBy.value)
          if (valA == null && valB == null) return 0
          if (valA == null) return sortDesc.value ? 1 : -1
          if (valB == null) return sortDesc.value ? -1 : 1
          if (typeof valA === 'number' && typeof valB === 'number') {
            return sortDesc.value ? valB - valA : valA - valB
          }
          return sortDesc.value
            ? valB.toString().localeCompare(valA.toString())
            : valA.toString().localeCompare(valB.toString())
        })
      } else {
        return arr
      }
    })

    function goToLastPage () {
      currentPage.value = Math.ceil(props.lov.values.length / itemsPerPage.value)
    }

    function addVisible () {
      itemSelectionDialogRef.value.showDialog()
    }

    function editLevels (elem) {
      dialogElem = elem
      if (elem.level.length === 0) {
        visible.value = []
      } else {
        const ids = elem.level.map(path => {
          const arr = path.split('.')
          return parseInt(arr[arr.length - 1])
        })
        loadItemsByIds(ids, false).then(items => {
          visible.value = items
        })
      }
      dialogRef.value = true
    }

    function itemsSelected (id) {
      itemSelectionDialogRef.value.closeDialog()
      loadItemsByIds([id], false).then(items => {
        visible.value.push(items[0])
      })
    }

    function removeVisible () {
      visible.value.splice(visibleSelectedRef.value, 1)
      visibleSelectedRef.value = null
    }

    function dialogClose () {
      dialogRef.value = false
      dialogElem.level = visible.value.map(item => item.path)
    }

    function removeValue (id) {
      const idx = props.lov.values.findIndex(el => el.id === id)
      props.lov.values.splice(idx, 1)
    }

    function editAttributes (elem) {
      dialogAttrElem = elem
      if (!elem.attrs || elem.attrs.length === 0) {
        attrs.value = []
      } else {
        attrs.value = elem.attrs.map(attrId => findByInternalId(attrId)?.item)
      }
      dialogAttrRef.value = true
    }

    function dialogAttrClose () {
      dialogAttrRef.value = false
      dialogAttrElem.attrs = attrs.value.map(attr => attr.internalId)
    }

    function addAttr () {
      attrSelectionDialogRef.value.showDialog()
    }

    function attrSelected (attr) {
      attrSelectionDialogRef.value.closeDialog()
      attrs.value.push(attr)
    }

    function removeAttr () {
      attrs.value.splice(attrSelectedRef.value, 1)
      attrSelectedRef.value = null
    }

    watch(() => props.lov, async (val, prevValue) => {
      if (val && val.id !== prevValue?.id && props.lov.values.length === 0) {
        loadingRef.value = true
        const data = await getLOVData(props.lov.id)
        loadingRef.value = false
        for (const row of data) props.lov.values.push(row)
        props.lov.values.forEach(elem => {
          if (!elem.filter) root.$set(elem, 'filter', null)
          if (!elem.level) root.$set(elem, 'level', [])
          availableChannelsRef.value.forEach(channel => {
            if (!elem[channel.identifier]) root.$set(elem, channel.identifier, {})
          })
          lovCustomFields(props.lov.identifier).forEach(customField => {
            if (!elem[customField.identifier]) root.$set(elem, customField.identifier, {})
          })
        })
      }
    })

    onMounted(() => {
      loadAllRelations().then(() => {
        rels.value = relations
      })
      loadAllLanguages().then(() =>
        getLOVsForSelect().then((arr) => {
          lovSelection.value = arr
        })
      )
      loadAllChannels().then(() => {
        availableChannelsRef.value = getAvailableChannels(true)
        props.lov.values.forEach(elem => {
          if (!elem.filter) root.$set(elem, 'filter', null)
          if (!elem.level) root.$set(elem, 'level', [])
          availableChannelsRef.value.forEach(channel => {
            if (!elem[channel.identifier]) root.$set(elem, channel.identifier, {})
          })
        })
      })
    })

    function identifierValidation (v) {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(v)) {
        return i18n.t('Wrong.Attribute.Identifier')
      }
      if (!v) {
        return i18n.t('Config.Attributes.Error.IdentifierRequired')
      }
      if (v && props.lov.internalId === 0) {
        const found = checkIdentifier(v)
        if (found) {
          return i18n.t('Config.Attributes.Error.IdentifierNotUnique')
        }
      }
      return true
    }

    function addValue (text) {
      const val = {}
      val[currentLanguage.value.identifier] = text && typeof text === 'string' ? text : ''
      let max = props.lov.values.reduce((accumulator, currentValue) => Math.max(accumulator, currentValue.id), 0)
      if (!max) max = 0
      const tmp = { id: ++max, value: val, filter: null, level: [] }
      availableChannelsRef.value.forEach(channel => {
        tmp[channel.identifier] = {}
      })
      lovCustomFields(props.lov.identifier).forEach(customField => {
        tmp[customField.identifier] = {}
      })
      props.lov.values.push(tmp)
      goToLastPage()
    }

    /* generate a download */
    function s2ab (s) {
      var buf = new ArrayBuffer(s.length)
      var view = new Uint8Array(buf)
      for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
      return buf
    }

    function langDisplayName (lang) {
      return lang.name?.[currentLanguage.value.identifier] || `[${lang.identifier}]`
    }

    function buildDisplayHeaderForValue (lang) {
      return 'value' + ' [' + langDisplayName(lang) + ']'
    }

    function buildDisplayHeaderForLovName (lang) {
      return (i18n.t('Config.LOV.Name')) + ' [' + langDisplayName(lang) + ']'
    }

    function buildDisplayHeaderForChannel (channel, lang) {
      const chName = channel.name?.[currentLanguage.value.identifier] || `[${channel.identifier}]`
      return chName + ' [' + langDisplayName(lang) + ']'
    }

    function buildDisplayHeaderForCustomField (customField, lang) {
      const cfName = customField.name || customField.identifier
      return cfName + ' [' + langDisplayName(lang) + ']'
    }

    const DISPLAY_HEADERS = {
      lovIdentifier: i18n.t('Config.LOV.Identifier'),
      lovName: i18n.t('Config.LOV.Name'),
      id: 'ID',
      url: 'URL',
      filter: i18n.t('Config.LOV.Filter'),
      level: i18n.t('Config.LOV.Level'),
      attrs: i18n.t('Config.LOV.ForAttributes'),
      delete: '#delete#'
    }

    function resolveHeaderKeyByDisplay (text, ctx) {
      if (!text) return null
      for (const [k, v] of Object.entries(DISPLAY_HEADERS)) {
        if (v === text) return k
      }
      for (const lang of ctx.languages) {
        if (text === buildDisplayHeaderForValue(lang)) return 'value_' + lang.identifier
      }
      for (const lang of ctx.languages) {
        if (text === buildDisplayHeaderForLovName(lang)) return 'lovName_' + lang.identifier
      }
      for (const ch of ctx.availableChannels) {
        for (const lang of ctx.languages) {
          if (text === buildDisplayHeaderForChannel(ch, lang)) {
            return 'channel_' + ch.identifier + '_' + lang.identifier
          }
        }
      }
      for (const cf of ctx.customFields) {
        for (const lang of ctx.languages) {
          if (text === buildDisplayHeaderForCustomField(cf, lang)) {
            return 'custom_' + cf.identifier + '_' + lang.identifier
          }
        }
      }
      return null
    }

    function exportData (allLovs = null) {
      excelDialogTitleRef.value = i18n.t('DataTable.ExcelDialog.TitleExport')
      excelDialogRef.value = true
      excelDialogProgressRef.value = 0

      const lovsToExport = allLovs && Array.isArray(allLovs) ? allLovs : [props.lov]
      const allChannels = availableChannelsRef.value

      let customFieldsUnion = []
      if (lovsToExport.length > 1) {
        const set = new Map()
        for (const lov of lovsToExport) {
          const cfs = lovCustomFields(lov.identifier)
          for (const cf of cfs) set.set(cf.identifier, cf)
        }
        customFieldsUnion = [...set.values()]
      } else {
        const cfs = lovCustomFields(lovsToExport[0].identifier)
        customFieldsUnion = cfs
      }

      const cols = [
        DISPLAY_HEADERS.lovIdentifier,
        ...languages.map(lang => buildDisplayHeaderForLovName(lang)),
        DISPLAY_HEADERS.id,
        ...languages.map(lang => buildDisplayHeaderForValue(lang)),
        ...allChannels.flatMap(ch => languages.map(lang => buildDisplayHeaderForChannel(ch, lang))),
        ...customFieldsUnion.flatMap(cf => languages.map(lang => buildDisplayHeaderForCustomField(cf, lang))),
        DISPLAY_HEADERS.url,
        DISPLAY_HEADERS.filter,
        DISPLAY_HEADERS.level,
        DISPLAY_HEADERS.attrs
      ]

      const ws = XLSX.utils.aoa_to_sheet([cols])
      ws['!cols'] = Array(cols.length).fill({ wch: 24 })
      ws['!cols'][0] = { wch: 24 }

      let c = 0
      function mark (cellKey) {
        const cell = ws[XLSX.utils.encode_cell({ c, r: 0 })]
        if (!cell) return
        cell.c = []
        cell.c.hidden = true
        cell.c.push({ a: 'OpenPIM', t: cellKey })
        c++
      }
      mark('lovIdentifier')
      for (const lang of languages) mark('lovName_' + lang.identifier)
      mark('id')
      for (const lang of languages) mark('value_' + lang.identifier)
      for (const ch of allChannels) for (const lang of languages) mark(`channel_${ch.identifier}_${lang.identifier}`)
      for (const cf of customFieldsUnion) for (const lang of languages) mark(`custom_${cf.identifier}_${lang.identifier}`)
      mark('url')
      mark('filter')
      mark('level')
      mark('attrs')

      let total = 0
      for (const lov of lovsToExport) total += lov.values.length
      let processed = 0

      for (const lov of lovsToExport) {
        for (const elem of lov.values) {
          const row = [
            lov.identifier,
            ...languages.map(lang => (lov.name?.[lang.identifier] || '')),
            elem.id,
            ...languages.map(lang => elem.value?.[lang.identifier] || ''),
            ...allChannels.flatMap(ch => languages.map(lang => (elem[ch.identifier]?.[lang.identifier]) || '')),
            ...customFieldsUnion.flatMap(cf => languages.map(lang => (elem[cf.identifier]?.[lang.identifier]) || '')),
            elem.url || '',
            elem.filter || '',
            elem.level && elem.level.length ? elem.level.join(',') : '',
            elem.attrs && elem.attrs.length ? elem.attrs.join(',') : ''
          ]
          XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 })
          excelDialogProgressRef.value = (++processed) * 100 / Math.max(total, 1)
        }
      }

      const range = XLSX.utils.decode_range(ws['!ref'])
      ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) }

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data')
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
      saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), (lovsToExport.length > 1 ? 'lov_all' : 'lov_' + props.lov.identifier) + '.xlsx')
      excelDialogRef.value = false
    }

    function importData () {
      fileUploadRef.value = null
      importConfigDialogRef.value = true
    }

    function excelDialogClose () {
      excelDialogRef.value = false
    }

    function downloadImportFinishedLog () {
      const ws = XLSX.utils.aoa_to_sheet(importFinishedLogRef.value)
      var wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data')
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
      saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'log.xlsx')
    }

    async function importExcel () {
      importConfigDialogRef.value = false
      excelDialogTitleRef.value = i18n.t('DataTable.ExcelDialog.TitleImport')
      const pageSize = parseInt(importPageSizeRef.value)

      const file = fileUploadRef.value
      if (!file) return

      const log = [['lov', 'id', 'result', 'errors', 'warnings']]
      const modifiedLovs = new Set()

      excelDialogProgressRef.value = 0
      excelDialogRef.value = true
      var reader = new FileReader()
      reader.onload = async function (evt) {
        const data = evt.target.result

        try {
          const wb = XLSX.read(data, { type: 'binary' })

          let totalRows = 0
          for (const sheetName of wb.SheetNames) {
            const ws = wb.Sheets[sheetName]
            const range = XLSX.utils.decode_range(ws['!ref'])
            totalRows += range.e.r
          }

          let currentRow = 0

          const allLovIds = new Set()
          for (const sheetName of wb.SheetNames) {
            const ws0 = wb.Sheets[sheetName]
            if (!ws0 || !ws0['!ref']) continue
            const range0 = XLSX.utils.decode_range(ws0['!ref'])
            let lovCol = -1
            for (let c = range0.s.c; c <= range0.e.c; c++) {
              const cell = ws0[XLSX.utils.encode_cell({ r: 0, c })]
              if (!cell) continue
              const commentKey = (cell.c && cell.c[0] && cell.c[0].t) ? cell.c[0].t : null
              const displayKey = cell.v
              if (commentKey === 'lovIdentifier' || displayKey === (i18n.t('Config.LOV.Identifier'))) {
                lovCol = c
                break
              }
            }
            if (lovCol === -1) continue
            for (let r = range0.s.r + 1; r <= range0.e.r; r++) {
              const v = ws0[XLSX.utils.encode_cell({ r, c: lovCol })]
              if (v && v.v != null && String(v.v).trim() !== '') {
                allLovIds.add(String(v.v).trim())
              }
            }
          }

          const customFieldsUnion = []
          const seenCF = new Set()
          for (const id of allLovIds) {
            try {
              const lov = await findLovMeta(id)
              if (!lov) continue
              for (const cf of lovCustomFields(lov.identifier)) {
                if (!seenCF.has(cf.identifier)) {
                  seenCF.add(cf.identifier)
                  customFieldsUnion.push(cf)
                }
              }
            } catch { }
          }

          const ctx = {
            languages,
            availableChannels: availableChannelsRef.value,
            customFields: customFieldsUnion
          }

          for (const sheetName of wb.SheetNames) {
            const ws = wb.Sheets[sheetName]
            const range = XLSX.utils.decode_range(ws['!ref'])
            const headers = []

            for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
              const cell = ws[XLSX.utils.encode_cell({ r: 0, c: colNum })]
              if (!cell) { headers.push(null); continue }
              const commentKey = (cell.c && cell.c[0] && cell.c[0].t) ? cell.c[0].t : null
              if (commentKey) {
                headers.push(commentKey)
                continue
              }
              const display = cell.v
              const fallback = resolveHeaderKeyByDisplay(display, ctx)
              headers.push(fallback)
            }

            const rowsBatch = []
            let firstRow = true

            for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
              if (firstRow) { firstRow = false; continue }
              if (!excelDialogRef.value) return

              const item = {}
              const rowCtx = { lovIdentifier: null }
              let hasData = false

              for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
                const key = headers[colNum]
                if (!key) continue
                const cell = ws[XLSX.utils.encode_cell({ r: rowNum, c: colNum })]

                switch (true) {
                  case key === 'lovIdentifier':
                    rowCtx.lovIdentifier = cell?.v ? String(cell.v).trim() : null
                    break
                  case key === 'id':
                    if (cell?.v) { item.id = parseInt(cell.v); hasData = true }
                    break
                  case key.startsWith?.('value_'): {
                    const lang = key.substring(6)
                    item.value = item.value || {}
                    if (cell || importEmptyValuesRef.value) {
                      item.value[lang] = cell ? String(cell.v ?? '') : ''
                      hasData = true
                    }
                    break
                  }
                  case key.startsWith?.('channel_'): {
                    const rest = key.substring(8)
                    const lastUnderscore = rest.lastIndexOf('_')
                    if (lastUnderscore !== -1) {
                      const channelId = rest.substring(0, lastUnderscore)
                      const lang = rest.substring(lastUnderscore + 1)
                      item[channelId] = item[channelId] || {}
                      if (cell || importEmptyValuesRef.value) {
                        item[channelId][lang] = cell ? String(cell.v ?? '') : ''
                        hasData = true
                      }
                    }
                    break
                  }
                  case key.startsWith?.('custom_'): {
                    const rest = key.substring(7)
                    const lastUnderscore = rest.lastIndexOf('_')
                    if (lastUnderscore !== -1) {
                      const cfId = rest.substring(0, lastUnderscore)
                      const lang = rest.substring(lastUnderscore + 1)
                      item[cfId] = item[cfId] || {}
                      if (cell || importEmptyValuesRef.value) {
                        item[cfId][lang] = cell ? String(cell.v ?? '') : ''
                        hasData = true
                      }
                    }
                    break
                  }
                  case key.startsWith?.('lovName_'): {
                    const lang = key.substring('lovName_'.length)
                    item.__lovName = item.__lovName || {}
                    if (cell || importEmptyValuesRef.value) {
                      item.__lovName[lang] = cell ? String(cell.v ?? '') : ''
                    }
                    break
                  }
                  case key === 'lovName': {
                    const def = defaultLanguageIdentifier.value
                    item.__lovName = item.__lovName || {}
                    if (cell || importEmptyValuesRef.value) {
                      item.__lovName[def] = cell ? String(cell.v ?? '') : ''
                    }
                    break
                  }
                  case key === 'url':
                    if (cell || importEmptyValuesRef.value) { item.url = cell ? String(cell.v ?? '') : ''; hasData = true }
                    break
                  case key === 'filter':
                    if (cell || importEmptyValuesRef.value) { item.filter = cell ? (cell.v ? parseInt(cell.v) : null) : null; hasData = true }
                    break
                  case key === 'level':
                    if (cell && cell.v != null) {
                      const raw = String(cell.v)
                      item.level = raw.split(/[;,]/).map(s => s.trim()).filter(Boolean)
                      hasData = hasData || item.level.length > 0
                    } else {
                      item.level = []
                    }
                    break
                  case key === 'attrs':
                    item.attrs = cell?.v ? String(cell.v).split(',').map(a => parseInt(a.trim())).filter(a => !isNaN(a)) : []
                    if (item.attrs.length) hasData = true
                    break
                  case key === '#delete#':
                  case key === 'delete':
                    if (cell?.v) item.delete = cell.v
                    break
                }
              }

              if (hasData && item.id) {
                rowsBatch.push({ lovIdentifier: rowCtx.lovIdentifier || props.lov.identifier, item })
              }

              if (rowsBatch.length >= pageSize) {
                await importRowsMulti(rowsBatch, log, modifiedLovs)
                rowsBatch.length = 0
              }

              excelDialogProgressRef.value = (++currentRow) * 100 / Math.max(totalRows, 1)
            }

            if (rowsBatch.length) await importRowsMulti(rowsBatch, log, modifiedLovs)
          }

          // Сохраняем все измененные LOV
          if (modifiedLovs.size > 0) {
            excelDialogProgressRef.value = 95
            try {
              for (const lov of modifiedLovs) {
                await saveLOV(lov)
              }
            } catch (err) {
              console.error('Error saving LOVs', err)
              showError(i18n.t('Config.LOV.Import.SaveError') || 'Error saving LOVs: ' + err.message)
            }
          }

          excelDialogProgressRef.value = 100
          setTimeout(() => {
            importFinishedDialogRef.value = true
            importFinishedLogRef.value = log
          }, 500)
          excelDialogRef.value = false
        } catch (err) {
          console.error('Error opening file', err)
          showError(err.message)
          excelDialogRef.value = false
        }
      }
      reader.readAsBinaryString(file)
      fileUploadRef.value = null
    }

    async function importRowsMulti (rows, log, modifiedLovs) {
      const errors = []

      for (const { lovIdentifier, item } of rows) {
        try {
          let targetLov = await findLovWithValues(lovIdentifier)

          if (!targetLov) {
            if (importModeRef.value === 'UPDATE_ONLY') {
              const msg = i18n.t('Config.LOV.Import.UnknownLOV') || 'Unknown LOV'
              log.push([lovIdentifier || '?', item.id || '?', 'SKIPPED', msg, ''])
              if (importStopOnErrorRef.value) errors.push(msg + ': ' + (lovIdentifier || '?'))
              continue
            }

            if (!lovIdentifier) {
              log.push([lovIdentifier || '?', item.id || '?', 'ERROR', i18n.t('Config.LOV.Error.IdentifierRequired'), ''])
              if (importStopOnErrorRef.value) errors.push(i18n.t('Config.LOV.Error.IdentifierRequired'))
              continue
            }

            if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(lovIdentifier)) {
              const msg = i18n.t('Wrong.Attribute.Identifier')
              log.push([lovIdentifier || '?', item.id || '?', 'ERROR', msg, ''])
              if (importStopOnErrorRef.value) errors.push(msg + ': ' + lovIdentifier)
              continue
            }

            const existingLov = lovsRef.find(l => l.identifier === lovIdentifier)
            if (existingLov) {
              const msg = i18n.t('Config.LOV.Error.IdentifierNotUnique')
              log.push([lovIdentifier || '?', item.id || '?', 'ERROR', msg, ''])
              if (importStopOnErrorRef.value) errors.push(msg + ': ' + lovIdentifier)
              continue
            }

            targetLov = addLOV()
            targetLov.identifier = lovIdentifier
            targetLov.name = {}
            targetLov.values = []

            if (item.__lovName) {
              Object.assign(targetLov.name, item.__lovName)
            } else {
              const name = {}
              name[currentLanguage.value.identifier] = lovIdentifier
              targetLov.name = name
            }

            modifiedLovs.add(targetLov)
          }

          const existingIdx = targetLov.values.findIndex(el => el.id === item.id)
          const existing = existingIdx !== -1 ? targetLov.values[existingIdx] : null

          if (item.delete) {
            if (existingIdx !== -1) {
              targetLov.values.splice(existingIdx, 1)
              modifiedLovs.add(targetLov)
              log.push([lovIdentifier, item.id, 'DELETED', '', ''])
            } else {
              log.push([lovIdentifier, item.id, 'ERROR', i18n.t('Config.LOV.Import.NotFound'), ''])
              if (importStopOnErrorRef.value) errors.push('Not found: ' + item.id)
            }
            continue
          }

          if (importModeRef.value === 'CREATE_ONLY' && existing) {
            log.push([lovIdentifier, item.id, 'SKIPPED', i18n.t('Config.LOV.Import.AlreadyExists'), ''])
            continue
          }
          if (importModeRef.value === 'UPDATE_ONLY' && !existing) {
            log.push([lovIdentifier, item.id, 'SKIPPED', i18n.t('Config.LOV.Import.NotFound'), ''])
            continue
          }

          const out = existing || { id: item.id, value: {}, filter: null, level: [], attrs: [], url: '' }

          if (item.value) Object.assign(out.value, item.value)

          availableChannelsRef.value.forEach(ch => {
            if (item[ch.identifier]) {
              out[ch.identifier] = out[ch.identifier] || {}
              Object.assign(out[ch.identifier], item[ch.identifier])
            }
          })

          lovCustomFields(targetLov.identifier).forEach(cf => {
            if (item[cf.identifier]) {
              out[cf.identifier] = out[cf.identifier] || {}
              Object.assign(out[cf.identifier], item[cf.identifier])
            }
          })

          if (item.url !== undefined) out.url = item.url || ''
          if (item.filter !== undefined) out.filter = item.filter
          if (item.level !== undefined) out.level = item.level || []
          if (item.attrs !== undefined) out.attrs = item.attrs || []

          if (!out.filter) root.$set(out, 'filter', null)
          if (!out.level) root.$set(out, 'level', [])
          availableChannelsRef.value.forEach(ch => { if (!out[ch.identifier]) root.$set(out, ch.identifier, {}) })
          lovCustomFields(targetLov.identifier).forEach(cf => { if (!out[cf.identifier]) root.$set(out, cf.identifier, {}) })

          if (!existing) targetLov.values.push(out)

          if (item.__lovName) {
            targetLov.name = targetLov.name || {}
            Object.assign(targetLov.name, item.__lovName)
          }

          modifiedLovs.add(targetLov)
          log.push([lovIdentifier, item.id, 'OK', '', ''])
        } catch (err) {
          const msg = err.message || String(err)
          log.push([lovIdentifier || '?', item.id || '?', 'ERROR', msg, ''])
          if (importStopOnErrorRef.value) errors.push(msg)
        }
      }
      if (importStopOnErrorRef.value && errors.length) {
        showError(errors.join('; '))
        excelDialogRef.value = false
      }
    }

    async function findLovMeta (identifier) {
      if (!identifier) return null
      let lov = lovsRef.find(l => l.identifier === identifier)
      if (!lov) {
        await loadAllLOVs()
        lov = lovsRef.find(l => l.identifier === identifier)
      }
      return lov || null
    }

    async function findLovWithValues (identifier) {
      const lov = await findLovMeta(identifier)
      if (!lov) return null
      if (lov.internalId !== 0 && (!Array.isArray(lov.values) || lov.values.length === 0)) {
        const data = await getLOVData(lov.id)
        if (Array.isArray(data) && data.length) lov.values.push(...data)
      }
      return lov
    }

    return {
      search,
      headers,
      filteredValues,
      currentPage,
      itemsPerPage,
      itemsSelected,
      addValue,
      removeValue,
      dialogRef,
      dialogClose,
      editLevels,
      removeVisible,
      addVisible,
      editAttributes,
      dialogAttrRef,
      attrs,
      dialogAttrClose,
      removeAttr,
      attrSelectedRef,
      addAttr,
      attrSelectionDialogRef,
      attrSelected,
      itemSelectionDialogRef,
      visibleSelectedRef,
      visible,
      formRef,
      exportData,
      showInfo,
      relSelectionDialogRef,
      availableChannelsRef,
      tabRef,
      AttributeType,
      lovSelection,
      importDialogRef,
      importDataRef,
      importData,
      importConfigDialogRef,
      fileUploadRef,
      importModeRef,
      importModes,
      importStopOnErrorRef,
      importEmptyValuesRef,
      importPageSizeRef,
      importExcel,
      excelDialogRef,
      excelDialogProgressRef,
      excelDialogTitleRef,
      excelDialogClose,
      importFinishedDialogRef,
      importFinishedLogRef,
      downloadImportFinishedLog,
      currentLanguage,
      defaultLanguageIdentifier,
      loadingRef,
      lovCustomFields,
      toggleSort,
      getCellValue,
      sortBy,
      sortDesc,
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('Config.Attributes.Error.NameRequired')
      ]
    }
  }
}
</script>
