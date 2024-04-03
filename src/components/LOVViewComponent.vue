<template>
    <div v-if="lov">
      <v-form ref="formRef" lazy-validation class="ml-7" v-if="lov.id != -1">
            <div class="d-inline-flex align-center">
              <v-text-field style="min-width: 100%" v-model="lov.identifier"  :disabled="lov.internalId !== 0" :rules="identifierRules" :label="$t('Config.Languages.Identifier')" required></v-text-field>
              <SystemInformation :data="lov"></SystemInformation>
            </div>
            <LanguageDependentField :values="lov.name" v-model="lov.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('Config.Languages.Name')"></LanguageDependentField>
          <v-simple-table dense  fixed-header height="60vh"  class="mb-4">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">
                      <v-tooltip top v-if="canEditConfig" class="ml-4">
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" class="pa-0" icon color="primary" @click="addValue"><v-icon dark>mdi-plus</v-icon></v-btn>
                        </template>
                        <span>{{ $t('Add') }}</span>
                      </v-tooltip>
                      {{ $t('Config.LOV.ID') }}
                    </th>
                    <th class="text-left">{{ $t('Config.LOV.Value') }}</th>
                    <th class="text-left" v-for="(channel, i) in availableChannelsRef" :key="i">{{ channel.name[currentLanguage.identifier] || '[' + channel.name[defaultLanguageIdentifier] + ']' }}</th>
                    <th class="text-left">{{ $t('Config.LOV.Level') }}</th>
                    <th class="text-left">{{ $t('Config.LOV.ForAttributes') }}</th>
                    <th class="text-left">{{ $t('Config.LOV.URL') }}</th>
                    <th class="text-left">
                      {{ $t('Config.LOV.Filter') }}<br>
                      <v-tooltip top v-if="canEditConfig" class="ml-4">
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" class="pa-0" icon color="primary" @click="addValue"><v-icon dark>mdi-plus</v-icon></v-btn>
                        </template>
                        <span>{{ $t('Add') }}</span>
                      </v-tooltip>
                      <v-tooltip topclass="ml-4">
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" class="pa-0" icon color="primary" @click="exportData"><v-icon dark>mdi-export</v-icon></v-btn>
                        </template>
                        <span>{{ $t('Config.LOV.Export') }}</span>
                      </v-tooltip>
                      <v-tooltip topclass="ml-4">
                        <template v-if="canEditConfig" v-slot:activator="{ on }">
                          <v-btn v-on="on" class="pa-0" icon color="primary" @click="importData"><v-icon dark>mdi-import</v-icon></v-btn>
                        </template>
                        <span>{{ $t('Config.LOV.Import') }}</span>
                      </v-tooltip>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(elem, j) in lov.values" :key="j">
                    <td class="pa-1">
                      <input v-model="elem.id" type="number" size="5" maxlength="5" :placeholder="$t('Config.LOV.ID')"/>
                    </td>
                    <td class="pa-1">
                      <input v-model="elem.value[currentLanguage.identifier]" size="50" :placeholder="$t('Config.LOV.Value')"/>
                    </td>
                    <td class="pa-1" v-for="(channel, i) in availableChannelsRef" :key="i">
                      <input v-model="elem[channel.identifier][currentLanguage.identifier]"/>
                    </td>
                    <td class="pa-1">
                      <v-chip @click="editLevels(elem)"><v-icon left>mdi-form-select</v-icon>{{ elem.level && elem.level.length > 0 ? '...' : '' }}</v-chip>
                    </td>
                    <td class="pa-1">
                      <v-chip @click="editAttributes(elem)"><v-icon left>mdi-form-select</v-icon>{{ elem.attrs && elem.attrs.length > 0 ? '...' : '' }}</v-chip>
                    </td>
                    <td class="pa-1">
                      <input v-model="elem.url" size="5" :placeholder="$t('Config.LOV.URL')"/>
                    </td>
                    <td class="pa-1">
                      <input v-model="elem.filter" type="number" :placeholder="$t('Config.LOV.Filter')"/>
                      <v-btn class="pa-0" icon color="primary" @click="removeValue(j)"><v-icon dark>mdi-close-circle-outline</v-icon></v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
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
                      <v-card-title class="subtitle-2 font-weight-bold" >
                        <div style="width:80%">{{ $t('Config.LOV.Visible') }}</div>
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
                      <v-card-title class="subtitle-2 font-weight-bold" >
                        <div style="width:80%">{{ $t('Config.LOV.ForAttributes') }}</div>
                        <v-tooltip bottom v-if="canEditConfig">
                          <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on" @click="addAttr"><v-icon>mdi-plus</v-icon></v-btn>
                          </template>
                          <span>{{ $t('Add') }}</span>
                        </v-tooltip>
                        <v-tooltip bottom v-if="canEditConfig">
                          <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on" @click="removeAttr" :disabled="attrSelectedRef == null"><v-icon>mdi-minus</v-icon></v-btn>
                          </template>
                          <span>{{ $t('Remove') }}</span>
                        </v-tooltip>
                      </v-card-title>
                      <v-divider></v-divider>
                      <v-list dense class="pt-0 pb-0">
                        <v-list-item-group v-model="attrSelectedRef" color="primary">
                          <v-list-item dense class="pt-0 pb-0"  v-for="(attr, i) in attrs" :key="i">
                            <v-list-item-content class="pt-0 pb-0" style="display: inline">
                            <router-link :to="'/config/attributes/' + attr.identifier">{{ attr.identifier }}</router-link><span class="ml-2">- {{ attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']' }}</span>
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
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemsSelected"/>
    <AttributeSelectionDialog ref="attrSelectionDialogRef" @selected="attrSelected"/>
    <template>
      <v-row justify="center">
        <v-dialog v-model="importDialogRef" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('Config.LOV.Import') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-textarea rows="7" v-model="importDataRef"></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="importDialogRef = false">{{ $t('Cancel') }}</v-btn>
              <v-btn color="blue darken-1" text @click="processImport">{{ $t('Execute') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
    </div>
</template>
<script>
import { onMounted, ref } from '@vue/composition-api'
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
  setup (props, { root }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages
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
      showInfo
    } = errorStore.useStore()

    const {
      getLOVsForSelect
    } = lovStore.useStore()

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

    function removeValue (idx) {
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
      props.lov.values.push(tmp)
    }

    /* generate a download */
    function s2ab (s) {
      var buf = new ArrayBuffer(s.length)
      var view = new Uint8Array(buf)
      for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
      return buf
    }

    function exportData () {
      const cols = ['identifier', 'name', 'id', 'value']
      const data = [cols]
      availableChannelsRef.value.forEach(channel => {
        cols.push(channel.name[defaultLanguageIdentifier.value])
      })
      props.lov.values.forEach(elem => {
        const row = [props.lov.identifier, props.lov.name[defaultLanguageIdentifier.value]]
        row.push(elem.id)
        for (const prop in elem.value) {
          row.push(elem.value[prop])
        }
        availableChannelsRef.value.forEach(channel => {
          for (const prop in elem[channel.identifier]) {
            row.push(elem[channel.identifier]?.[prop])
          }
        })
        data.push(row)
      })
      const ws = XLSX.utils.aoa_to_sheet(data)
      var wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data')
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
      saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'data.xlsx')
    }

    function importData () {
      importDataRef.value = ''
      importDialogRef.value = true
    }

    function processImport () {
      importDialogRef.value = false
      if (importDataRef.value) {
        const arr = importDataRef.value.split(/\r\n|\n|\r/)
        for (const str of arr) {
          addValue(str)
        }
      }
    }

    return {
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
      processImport,
      currentLanguage,
      defaultLanguageIdentifier,
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
