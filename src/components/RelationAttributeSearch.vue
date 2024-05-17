<template>
    <v-autocomplete
      v-model="inputVal"
      :items="availableItemsForRelationAttr"
      :search-input.sync="searchRef"
      :loading="loadingRef"
      clearable
      dense
    >
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

    const updateAvailableItemsForRelationAttr = async (searchStr) => {
      loadingRef.value = true
      const attrNode = findByIdentifier(props.attrIdentifier)
      const displayValue = attrNode.item.options ? attrNode.item.options.find(el => el.name === 'displayvalue') : null
      const displayAttr = displayValue ? findByIdentifier(displayValue.value) : null
      const langDependent = displayAttr?.item?.languageDependent
      const data = await getAvailableItemsForRelationAttr(attrNode.item, [], searchStr, currentLanguage.value.identifier || defaultLanguageIdentifier.value, 100, 0, 'ASC')
      availableItemsForRelationAttr.value = data.getItemsForRelationAttribute.map(el => {
        let text
        if (displayValue && displayValue.value) {
          if (langDependent) {
            text = el.values[displayValue.value] ? el.values[displayValue.value][currentLanguage.value.identifier] : null
          } else {
            text = el.values[displayValue.value]
          }
        } else {
          text = el.name[currentLanguage.value.identifier] || el.name[defaultLanguageIdentifier.value]
        }
        return { identifier: el.identifier, value: el.id, text }
      })
      loadingRef.value = false
    }

    return {
      currentLanguage,
      availableItemsForRelationAttr,
      searchRef,
      loadingRef,
      inputVal
    }
  }
}
</script>
