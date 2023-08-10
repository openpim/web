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
                  <td><div class="teal--text mt-2">{{ getTitle(name) }}:</div></td>
                  <td>{{value}}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </template>
        <template v-if="!isObjectEmpty(item.data.changed)">
          <h4 class="indigo--text mt-2">{{ $t('HistoryTable.Changed') }}</h4>
          <v-simple-table dense>
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
                  <td><div class="indigo--text mt-2">{{ getTitle(name) }}:</div></td>
                  <td>{{value}}</td>
                  <td>{{item.data.old.values[name]}}</td>
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
// import * as attrStore from '../store/attributes'
import dateFormat from 'dateformat'
import i18n from '../i18n'
import { ref, onMounted, watch } from '@vue/composition-api'

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

    // const {
    //  findByIdentifier
    // } = attrStore.useStore()

    const { showError } = errorStore.useStore()

    const itemsRef = ref([])
    const totalItemsRef = ref(0)
    const optionsRef = ref({ page: 1, itemsPerPage: 10, sortBy: ['changedAt'], sortDesc: [true] })
    const loadingRef = ref(false)
    const headersRef = ref([{ identifier: 'operation', text: i18n.t('HistoryTable.Operation'), align: 'start', sortable: true, filterable: false, value: 'operation' },
      { identifier: 'user', text: i18n.t('HistoryTable.User'), align: 'start', sortable: false, filterable: false, value: 'user' },
      { identifier: 'changedAt', text: i18n.t('HistoryTable.ChangedAt'), align: 'start', sortable: true, filterable: false, value: 'changedAt' },
      { text: '', value: 'data-table-expand' }])

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
        // finding attribute can be very long if we have a lot of them, disable this temporary
        // const tst = findByIdentifier(name)?.item
        // return tst ? tst.name[currentLanguage.value.identifier] || tst.name[defaultLanguageIdentifier.value] : name
        return name
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
      dateFormat,
      DATE_FORMAT: process.env.VUE_APP_DATE_FORMAT
    }
  }
}
</script>
