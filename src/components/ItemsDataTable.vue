<template>
<div>
  <v-toolbar dense elevation="1" class="mt-2">
      <v-spacer></v-spacer>
      <v-btn icon @click="editHeaders"><v-icon>mdi-table-settings</v-icon></v-btn>
    </v-toolbar>
  <v-data-table @update:options="optionsUpdate"
      :options.sync="optionsRef"
      :server-items-length="totalItemsRef"
      :loading="loadingRef"
      :headers="headersRef"
      :items="itemsRef"
      :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50] }"
      class="elevation-1">
    <template v-slot:item="{ item, headers }">
      <tr>
        <td v-for="(header, i) in headers" :key="i">
          <router-link v-if="header.identifier === 'identifier'" :to="'/item/' + item.identifier">{{ item.identifier }}</router-link>

          <v-img v-if="header.identifier === '#thumbnail#' && getThumbnail(item.id)" :src="damUrl + 'asset/' + getThumbnail(item.id).id + '/thumb?token=' + token" contain max-width="50" max-height="50"></v-img>

          <span v-if="header.identifier !== 'identifier' &&  header.identifier !== '#thumbnail#'">{{ getValue(item, header.value) }}</span>
        </td>
      </tr>
    </template>
  </v-data-table>
  <ColumnsSelectionDialog ref="columnsSelectionDialogRef" @selected="columnsSelected"/>

</div>
</template>
<script>
import * as langStore from '../store/languages'
import * as itemStore from '../store/item'
import { ref, onMounted } from '@vue/composition-api'
import ColumnsSelectionDialog from './ColumnsSelectionDialog'

export default {
  components: { ColumnsSelectionDialog },
  props: {
    loadData: {
      required: true
    }
  },
  setup (props, { emit, root }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadThumbnails
    } = itemStore.useStore()

    const columnsSelectionDialogRef = ref(null)

    const itemsRef = ref([])
    const totalItemsRef = ref(0)
    const optionsRef = ref({ page: 1, itemsPerPage: 10, sortBy: [], sortDesc: [] })
    const loadingRef = ref(false)
    const headersRef = ref([{ identifier: '#thumbnail#', text: 'Thumbnail', align: 'start', sortable: false, filterable: false, value: '#thumbnail#' },
      { identifier: 'identifier', text: 'Identifier', align: 'start', sortable: false, filterable: false, value: 'identifier' },
      { identifier: 'name_en', text: 'Name (English)', align: 'start', sortable: false, filterable: false, value: ['name', 'en'] }])
    const thumbnailsRef = ref([])

    function editHeaders () {
      columnsSelectionDialogRef.value.showDialog([...headersRef.value])
    }

    function columnsSelected (arr) {
      columnsSelectionDialogRef.value.closeDialog()
      headersRef.value = arr
      localStorage.setItem('item_headers', JSON.stringify(arr))
    }

    function optionsUpdate (options) {
      loadingRef.value = true
      totalItemsRef.value = 0
      props.loadData(options).then(data => {
        itemsRef.value = data.rows
        totalItemsRef.value = data.count
        loadingRef.value = false

        const ids = data.rows.map(elem => elem.id)
        loadThumbnails(ids).then(arr => { thumbnailsRef.value = arr })
      })
    }

    function DataChanged () {
      loadingRef.value = true
      totalItemsRef.value = 0
      props.loadData(optionsRef.value).then(data => {
        itemsRef.value = data.rows
        totalItemsRef.value = data.count
        loadingRef.value = false

        const ids = data.rows.map(elem => elem.id)
        loadThumbnails(ids).then(arr => { thumbnailsRef.value = arr })
      })
    }

    function getThumbnail (id) {
      return thumbnailsRef.value.find(elem => elem.itemId === ('' + id))
    }

    function getValue (item, headerValue) {
      if (Array.isArray(headerValue)) {
        return getDeepValue(headerValue, item)
      } else {
        return item[headerValue]
      }
    }
    // https://medium.com/javascript-inside/safely-accessing-deeply-nested-values-in-javascript-99bf72a0855a
    const getDeepValue = (path, obj) => path.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, obj)

    onMounted(() => {
      const tst = localStorage.getItem('item_headers')
      if (tst) headersRef.value = JSON.parse(tst)
      DataChanged()
    })

    return {
      columnsSelectionDialogRef,
      itemsRef,
      totalItemsRef,
      headersRef,
      currentLanguage,
      defaultLanguageIdentifier,
      DataChanged,
      getValue,
      optionsUpdate,
      optionsRef,
      loadingRef,
      editHeaders,
      columnsSelected,
      damUrl: window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : '/',
      token: localStorage.getItem('token'),
      getThumbnail
    }
  }
}
</script>
