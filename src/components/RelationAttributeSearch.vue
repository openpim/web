<template>
    <v-autocomplete
      v-model="inputVal"
      :items="availableItemsForRelationAttr"
      :search-input="searchRef"
      :loading="loadingRef"
      clearable
      dense
    >
        <template v-slot:item="data" v-if="showThumbnail">
          <v-list-item-avatar tile>
            <img :src="data.item.imageUrl" v-if="data.item.imageUrl">
          </v-list-item-avatar>
          <v-list-item-content v-text="data.item.text" />
        </template>
    </v-autocomplete>
</template>
<script>
import * as langStore from '../store/languages'
import * as attrStore from '../store/attributes'
import { ref, watch, computed } from '@vue/composition-api'

export default {
  components: {},
  props: {
    attrIdentifier: {
      required: true
    },
    value: {
      required: true
    }
  },
  setup (props, { emit }) {
    const {
      getAvailableItemsForRelationAttr,
      findByIdentifier
    } = attrStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const searchRef = ref(null)
    const loadingRef = ref(false)
    const showThumbnail = ref(false)
    const availableItemsForRelationAttr = ref([])

    const inputVal = computed({
      get: () => {
        return props.value
      },
      set: (newValue) => {
        emit('input', newValue)
      }
    })

    let awaitingSearch = null
    watch(searchRef, (val) => {
      loadingRef.value = true
      if (awaitingSearch) {
        clearTimeout(awaitingSearch)
        awaitingSearch = null
      }
      if (!awaitingSearch) {
        awaitingSearch = setTimeout(async () => {
          await updateAvailableItemsForRelationAttr(val)
        }, 1000)
      }
    })

    watch(() => props.attrIdentifier, (val) => {
      setTimeout(async () => {
        await updateAvailableItemsForRelationAttr(props.value)
      }, 500)
    })

    const getDiplayValue = (item, displayValueOption) => {
      let result
      if (displayValueOption && displayValueOption.value && displayValueOption.value.startsWith('#')) {
        const fieldName = displayValueOption.value.substr(1)
        result = item[fieldName]
      } else if (displayValueOption && displayValueOption.value) {
        const displayAttr = displayValueOption ? findByIdentifier(displayValueOption.value) : null
        const langDependent = displayAttr && displayAttr.item && displayAttr.item.languageDependent
        if (langDependent) {
          result = item.values[displayValueOption.value] ? item.values[displayValueOption.value][currentLanguage.value.identifier] || item.values[displayValueOption.value][defaultLanguageIdentifier.value] : null
        } else {
          result = item.values[displayValueOption.value]
        }
      } else {
        result = item.name[currentLanguage.value.identifier] || item.name[defaultLanguageIdentifier.value]
      }
      return result
    }

    const updateAvailableItemsForRelationAttr = async (searchStr) => {
      loadingRef.value = true
      const attrNode = findByIdentifier(props.attrIdentifier)
      const displayValueOption = attrNode.item.options.find(el => el.name === 'displayValue')
      const data = await getAvailableItemsForRelationAttr(attrNode.item, [], searchStr, currentLanguage.value.identifier || defaultLanguageIdentifier.value, 100, 0, 'ASC')
      availableItemsForRelationAttr.value = data.getItemsForRelationAttribute.map(el => {
        const text = getDiplayValue(el, displayValueOption)
        const damUrl = window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/'
        const imageUrl = el.values.__imagedata && el.values.__imagedata.id ? damUrl + 'asset/' + el.values.__imagedata.id + '?inline=true&token=' + localStorage.getItem('token') : null
        return { identifier: el.identifier, value: el.id, text, imageUrl }
      })
      const showThumbnailOption = attrNode.item.options ? attrNode.item.options.find(el => el.name === 'showThumbnail') : null
      showThumbnail.value = showThumbnailOption && showThumbnailOption.value === 'true'
      loadingRef.value = false
    }

    return {
      currentLanguage,
      availableItemsForRelationAttr,
      searchRef,
      loadingRef,
      inputVal,
      showThumbnail
    }
  }
}
</script>
