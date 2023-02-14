<template>
      <div>
        <v-text-field v-model="searchRef" @input="clearSelection" :label="$t('Filter')" flat hide-details clearable clear-icon="mdi-close-circle-outline" class="ml-5 mr-5"></v-text-field>
        <v-list nav dense expand>
          <v-list-group :value="true" no-action>
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>{{ $t('Collections.MainCollections') }}</v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item-group v-model="itemRef" color="primary">
              <v-list-item v-for="(item, i) in colFiltered" :key="i">
                <v-list-item-icon><v-icon>mdi-bookmark-outline</v-icon></v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list-group>
          <v-list-group>
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>{{ $t('Collections.AnotherCollections') }}</v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item-group v-model="itemRef" color="primary">
              <v-list-item v-for="(item, i) in colFiltered" :key="i">
                <v-list-item-icon><v-icon>mdi-bookmark-outline</v-icon></v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list-group>
        </v-list>
      </div>
</template>
<script>
import * as langStore from '../store/languages'
import * as collectionsStore from '../store/collections'
import router from '../router'
import { ref, watch, onMounted, computed } from '@vue/composition-api'
import { useRouter } from '../router/useRouter'

export default {
  setup () {
    const { route } = useRouter()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadAllCollections,
      getCollections
    } = collectionsStore.useStore()

    const itemRef = ref(null)
    const collectionsRef = ref(null)

    const searchRef = ref('')
    const colFiltered = computed(() => {
      let arr = collectionsRef.value
      if (!arr) return []
      if (searchRef.value) {
        const s = searchRef.value.toLowerCase()
        arr = collectionsRef.value.filter(item => item.identifier.toLowerCase().indexOf(s) > -1 || (item.name && Object.values(item.name).find(val => val.toLowerCase().indexOf(s) > -1)))
      }
      return arr.sort((a, b) => {
        console.log(arr)
        if (a.name[defaultLanguageIdentifier.value] && b.name[defaultLanguageIdentifier.value]) {
          return a.name[defaultLanguageIdentifier.value].localeCompare(b.name[defaultLanguageIdentifier.value])
        } else {
          return 0
        }
      })
    })
    function clearSelection () {
      itemRef.value = null
    }

    watch(itemRef, (selected, previous) => {
      if (selected == null) {
        if (previous != null) router.push('/collections')
        return
      }
      if (selected < colFiltered.value.length) {
        const selectedCollection = colFiltered.value[selected]
        if (selectedCollection.internalId !== 0 && selectedCollection.identifier) {
          router.push('/collections/' + selectedCollection.identifier)
        } else {
          router.push('/collections')
        }
      }
    })

    onMounted(() => {
      loadAllCollections().then(() => {
        clearSelection()
        collectionsRef.value = getCollections()
        if (route.value && route.value.params && route.value.params.id) {
          itemRef.value = collectionsRef.value.findIndex(elem => elem.identifier === route.value.params.id)
        }
      })
    })

    return {
      itemRef,
      currentLanguage,
      defaultLanguageIdentifier,
      collectionsRef,
      colFiltered,
      clearSelection,
      searchRef
    }
  }
}
</script>
