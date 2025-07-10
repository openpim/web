<template>
<div>
  <v-data-table @update:options="optionsUpdate"
      :options.sync="optionsRef"
      :server-items-length="totalItemsRef"
      :loading="loadingRef"
      :headers="headersRef"
      :items="itemsRef"
      show-expand
      :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50] }"
      class="elevation-1">
    <template v-slot:item.operation="{ item, header }">
        <td>{{ item[header.value] === 1 ? $t('HistoryTable.Operation.Add'): $t('HistoryTable.Operation.Change') }}</td>
    </template>
    <template v-slot:item.changedAt="{ item, header }">
        <td>{{ dateFormat(new Date(Date.parse(item[header.value])), DATE_FORMAT) }}</td>
    </template>
    <template v-slot:expanded-item="{ headers, item }">
      <td :colspan="headers.length">
        <template v-if="!isObjectEmpty(item.data.added)">
          <h4 class="teal--text mt-2">{{ $t('HistoryTable.Added') }}</h4>
          <v-simple-table dense>
            <template v-slot:default>
              <thead>
                <tr><th style="width:50%" class="text-left teal--text">{{ $t('HistoryTable.Name') }}</th>
                <th style="width:50%" class="text-left teal--text">{{ $t('HistoryTable.Value') }}</th></tr>
              </thead>
              <tbody>
                <tr v-for="(value, name) in item.data.added" :key="name">
                  <template v-if="name != 'values'">
                  <td><div class="teal--text mt-2">{{ getTitle(name) }}:</div></td>
                  <td>{{value}}</td>
                  </template>
                </tr>
                <tr v-for="(value, name) in item.data.added.values" :key="name">
                  <td class="d-inline-flex">
                    <div class="teal--text mt-2">{{ getTitle(name) }}:</div>
                    <v-tooltip bottom v-if="hasValueButton(name)">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" @click="loadAttrValue(name, item.id, 'added')" icon><v-icon small>mdi-magnify</v-icon></v-btn>
                      </template>
                      <span>{{ $t('HistoryTable.ShowValue') }}</span>
                    </v-tooltip>
                  </td>
                  <td>
                    <span v-if="!item.data.loaded || !item.data.loaded.values[name]">{{value}}</span>
                    <span v-if="item.data.loaded && item.data.loaded.values[name]" class="font-weight-bold">{{item.data.loaded.values[name]}}</span>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </template>
        <template v-if="!isObjectEmpty(item.data.changed)">
          <h4 class="indigo--text mt-2">{{ $t('HistoryTable.Changed') }}</h4>
          <v-simple-table dense :key="keysRef[item.index]">
            <template v-slot:default>
              <thead>
                <tr><th style="width:30%" class="text-left indigo--text">{{ $t('HistoryTable.Name') }}</th>
                <th style="width:30%" class="text-left indigo--text">{{ $t('HistoryTable.Value') }}</th>
                <th style="width:30%" class="text-left indigo--text">{{ $t('HistoryTable.OldValue') }}</th></tr>
              </thead>
              <tbody>
                <tr v-for="(value, name) in item.data.changed" :key="name">
                  <template v-if="name != 'values'">
                  <td><div class="indigo--text mt-2">{{ getTitle(name) }}:</div></td>
                  <td>{{value}}</td>
                  <td>{{item.data.old[name]}}</td>
                  </template>
                </tr>
                <tr v-for="(value, name) in item.data.changed.values" :key="name">
                  <td class="d-inline-flex">
                    <span class="indigo--text mt-2">{{ getTitle(name) }}:</span>
                    <v-tooltip bottom v-if="hasValueButton(name)">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" @click="loadAttrValue(name, item.id, 'changed')" icon><v-icon small>mdi-magnify</v-icon></v-btn>
                      </template>
                      <span>{{ $t('HistoryTable.ShowValue') }}</span>
                    </v-tooltip>
                  </td>
                  <td>
                    <span v-if="!item.data.loaded || !item.data.loaded.values[name]">{{value}}</span>
                    <span v-if="item.data.loaded && item.data.loaded.values[name]" class="font-weight-bold">{{item.data.loaded.values[name]}}</span>
                  </td>
                  <td>
                    <span v-if="!item.data.loaded2 || !item.data.loaded2.values[name]">{{item.data.old.values[name]}}</span>
                    <span v-if="item.data.loaded2 && item.data.loaded2.values[name]" class="font-weight-bold">{{item.data.loaded2.values[name]}}</span>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </template>
        <template v-if="!isObjectEmpty(item.data.deleted)">
          <h4 class="red--text mt-2">{{ $t('HistoryTable.Deleted') }}</h4>
          <v-simple-table dense>
            <template v-slot:default>
              <thead>
                <tr><th style="width:50%" class="text-left red--text">{{ $t('HistoryTable.Name') }}</th>
                <th style="width:50%" class="text-left red--text">{{ $t('HistoryTable.Value') }}</th></tr>
              </thead>
              <tbody>
                <tr v-for="(value, name) in item.data.deleted" :key="name">
                  <template v-if="name != 'values'">
                  <td><div class="red--text mt-2">{{ getTitle(name) }}:</div></td>
                  <td>{{value}}</td>
                  </template>
                </tr>
                <tr v-for="(value, name) in item.data.deleted.values" :key="name">
                  <td class="d-inline-flex">
                    <div class="red--text mt-2">{{ getTitle(name) }}:</div>
                    <v-tooltip bottom v-if="hasValueButton(name)">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" @click="loadAttrValue(name, item.id, 'deleted')" icon><v-icon small>mdi-magnify</v-icon></v-btn>
                      </template>
                      <span>{{ $t('HistoryTable.ShowValue') }}</span>
                    </v-tooltip>
                  </td>
                  <td>
                    <span v-if="!item.data.loaded || !item.data.loaded.values[name]">{{value}}</span>
                    <span v-if="item.data.loaded && item.data.loaded.values[name]" class="font-weight-bold">{{item.data.loaded.values[name]}}</span>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </template>
      </td>
    </template>
  </v-data-table>

</div>
</template>
<script>
import * as langStore from '../store/languages'
import * as errorStore from '../store/error'
import * as auditStore from '../store/audit'
import * as attrStore from '../store/attributes'
import * as lovStore from '../store/lovs'
import dateFormat from 'dateformat'
import i18n from '../i18n'
import { ref, onMounted, watch } from '@vue/composition-api'
import AttributeType from '../constants/attributeTypes'

export default {
  props: {
    item: {
      required: true
    },
    componentType: { // item or itemRelation
      required: true
    }
  },
  setup (props, { emit, root }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadItemHistory,
      loadItemRelationHistory
    } = auditStore.useStore()

    const {
      findByIdentifier,
      getAvailableItemsForRelationAttr
    } = attrStore.useStore()

    const {
      getLOVData
    } = lovStore.useStore()

    const { showError } = errorStore.useStore()

    const itemsRef = ref([])
    const totalItemsRef = ref(0)
    const optionsRef = ref({ page: 1, itemsPerPage: 10, sortBy: ['changedAt'], sortDesc: [true] })
    const loadingRef = ref(false)
    const headersRef = ref([{ identifier: 'operation', text: i18n.t('HistoryTable.Operation'), align: 'start', sortable: true, filterable: false, value: 'operation' },
      { identifier: 'user', text: i18n.t('HistoryTable.User'), align: 'start', sortable: false, filterable: false, value: 'user' },
      { identifier: 'changedAt', text: i18n.t('HistoryTable.ChangedAt'), align: 'start', sortable: true, filterable: false, value: 'changedAt' },
      { text: '', value: 'data-table-expand' }])

    const keysRef = ref([])

    watch(() => props.item, (newItem, oldItem) => {
      optionsRef.value.page = 1
      totalItemsRef.value = 0
      optionsUpdate(optionsRef.value)
    })

    function optionsUpdate (options) {
      if (!props.item) return

      loadingRef.value = true
      if (props.componentType === 'item') {
        loadItemHistory(props.item.internalId, options).then(data => {
          if (!data) return
          keysRef.value = []
          data.rows.forEach((elem, idx) => {
            elem.index = idx
            keysRef.value.push(0)
          })
          itemsRef.value = data.rows
          totalItemsRef.value = data.count
          loadingRef.value = false
        }).catch((error) => {
          showError(error)
          loadingRef.value = false
        })
      } else {
        loadItemRelationHistory(props.item.id, options).then(data => {
          if (!data) return
          keysRef.value = []
          data.rows.forEach((elem, idx) => {
            elem.index = idx
            keysRef.value.push(0)
          })
          itemsRef.value = data.rows
          totalItemsRef.value = data.count
          loadingRef.value = false
        }).catch((error) => {
          showError(error)
          loadingRef.value = false
        })
      }
    }

    function isObjectEmpty (obj) {
      return !obj || Object.keys(obj).length === 0
    }

    const showAttributesName = process.env.VUE_APP_AUDIT_SHOW_ATTR_NAME === 'true'
    function getTitle (name) {
      if (name === 'typeIdentifier') return i18n.t('HistoryTable.typeIdentifier')
      else if (name === 'parentIdentifier') return i18n.t('HistoryTable.parentIdentifier')
      else if (name === 'mimeType') return i18n.t('HistoryTable.mimeType')
      else if (name === 'fileOrigName') return i18n.t('HistoryTable.fileOrigName')
      else if (name === 'relationIdentifier') return i18n.t('HistoryTable.relationIdentifier')
      else if (name === 'itemIdentifier') return i18n.t('HistoryTable.itemIdentifier')
      else if (name === 'targetIdentifier') return i18n.t('HistoryTable.targetIdentifier')
      else if (name === 'name') return i18n.t('HistoryTable.ObjName')
      else if (name === 'values') return i18n.t('HistoryTable.Values')
      else {
        if (showAttributesName) {
        // finding attribute can be very long if we have a lot of them
          const tst = findByIdentifier(name, true)?.item
          return tst ? name + ' - ' + (tst.name[currentLanguage.value.identifier] || tst.name[defaultLanguageIdentifier.value]) : name
        } else {
          return name
        }
      }
    }

    const notAttr = ['typeIdentifier', 'parentIdentifier', 'mimeType', 'fileOrigName', 'relationIdentifier', 'itemIdentifier', 'targetIdentifier', 'name', 'values']
    function hasValueButton (name) {
      if (showAttributesName && !notAttr.includes(name)) {
        const tst = findByIdentifier(name, true)?.item
        return tst && (tst.type === AttributeType.Relation || (tst.type === AttributeType.LOV && tst.lov))
      }
    }

    async function loadAttrValue (name, id, type) {
      const attr = findByIdentifier(name, true)?.item
      const row = itemsRef.value.find(elem => elem.id === id)
      if (!row.data.loaded) row.data.loaded = { values: {} }

      if (row.data[type].values[name]) {
        const val = Array.isArray(row.data[type].values[name]) ? row.data[type].values[name] : [row.data[type].values[name]]
        if (attr.type === AttributeType.Relation) {
          const res = await getAvailableItemsForRelationAttr(attr, val, '', currentLanguage.value.identifier || defaultLanguageIdentifier.value, 100, 0, 'ASC')
          res.getItemsForRelationAttribute.length = val.length
          row.data.loaded.values[name] = res.getItemsForRelationAttribute.map(elem => elem.name[currentLanguage.value.identifier || defaultLanguageIdentifier.value]).join(',')
        } else {
          row.data.loaded.values[name] = await getLOVValue(attr.lov, val)
        }
      }
      if (type === 'changed') {
        if (!row.data.loaded2) row.data.loaded2 = { values: {} }
        if (row.data.old.values[name]) {
          const val = Array.isArray(row.data.old.values[name]) ? row.data.old.values[name] : [row.data.old.values[name]]
          if (attr.type === AttributeType.Relation) {
            const res = await getAvailableItemsForRelationAttr(attr, val, '', currentLanguage.value.identifier || defaultLanguageIdentifier.value, 100, 0, 'ASC')
            res.getItemsForRelationAttribute.length = val.length
            row.data.loaded2.values[name] = res.getItemsForRelationAttribute.map(elem => elem.name[currentLanguage.value.identifier || defaultLanguageIdentifier.value]).join(',')
          } else {
            row.data.loaded2.values[name] = await getLOVValue(attr.lov, val)
          }
        }
      }

      const clone = [...keysRef.value]
      clone[row.index] = Date.now()
      keysRef.value = clone
    }

    const lovsMap = {}
    async function getLOVValue (lovId, attrValue) {
      let values = lovsMap[lovId]
      if (!values) {
        values = await getLOVData(lovId)
        lovsMap[lovId] = values
      }
      if (Array.isArray(attrValue)) { // multivalue attribute
        let result = ''
        for (let i = 0; i < attrValue.length; i++) {
          const val = attrValue[i]
          const elem = values.find(elem => elem.id === val)
          result += elem ? (elem.value[currentLanguage.value.identifier] || elem.value[defaultLanguageIdentifier.value]) : attrValue
          if (i !== attrValue.length - 1) result += ', '
        }
        return result
      } else {
        const elem = values.find(elem => elem.id === attrValue)
        return elem ? (elem.value[currentLanguage.value.identifier] || elem.value[defaultLanguageIdentifier.value]) : attrValue
      }
    }

    function isObject (obj) {
      return obj != null && obj.constructor.name === 'Object'
    }

    onMounted(() => {
      optionsUpdate(optionsRef.value)
    })

    return {
      itemsRef,
      totalItemsRef,
      headersRef,
      currentLanguage,
      defaultLanguageIdentifier,
      optionsUpdate,
      optionsRef,
      loadingRef,
      isObject,
      isObjectEmpty,
      getTitle,
      hasValueButton,
      loadAttrValue,
      keysRef,
      dateFormat,
      DATE_FORMAT: process.env.VUE_APP_DATE_FORMAT
    }
  }
}
</script>
