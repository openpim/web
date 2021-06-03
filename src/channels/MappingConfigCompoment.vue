<template>
  <div>
    <v-row>
      <v-col cols="11">
        <v-select v-model="categoryIdRef" @change="categoryChanged" :items="mappedCategories" item-text="name" item-value="id" :label="$t('MappingConfigComponent.Category')"></v-select>
        <ValidVisibleComponent :elem="categoryRef" :canEditConfig="!readonly"/>
      </v-col>
      <v-col cols="1">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="add"><v-icon>mdi-plus</v-icon></v-btn>
          </template>
          <span>{{ $t('Add') }}</span>
        </v-tooltip>
      </v-col>
    </v-row>
    <template>
      <v-row justify="center">
        <v-dialog v-model="dialogRef" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('MappingConfigComponent.Add.Title') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-autocomplete dense v-model="newCategoryIdRef" :items="availableCategories" item-text="name" item-value="id" :label="$t('MappingConfigComponent.Add.Category')"></v-autocomplete>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
              <v-btn color="blue darken-1" text @click="addCategory">{{ $t('Select') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
  </div>
</template>
<script>
import { ref, watch, onMounted, computed } from '@vue/composition-api'
import * as channelsStore from '../store/channels'
import ValidVisibleComponent from '../components/ValidVisibleComponent'

export default {
  props: {
    channel: {
      required: true
    },
    readonly: {
      type: Boolean,
      required: true
    }
  },
  components: { ValidVisibleComponent },
  setup (props, { root }) {
    const {
      getChannelCategories
    } = channelsStore.useStore()

    watch(() => props.channel, (chan, previousValue) => {
      // loadCategories(chan)
    })

    const mappedCategories = computed(() => {
      if (props.channel && props.channel.mappings) {
        return Object.values(props.channel.mappings)
      } else {
        return []
      }
    })

    const availableCategories = computed(() => {
      return categoriesRef.value.filter(elem => !mappedCategories.value.find(cat => elem.id === cat.id))
    })

    const dialogRef = ref(null)
    const categoriesRef = ref([])
    const categoryIdRef = ref(null)
    const newCategoryIdRef = ref(null)
    const categoryRef = ref(null)

    function loadCategories () {
      if (props.channel) {
        getChannelCategories(props.channel.internalId).then(data => { categoriesRef.value = data })
      }
    }

    function add () {
      newCategoryIdRef.value = null
      dialogRef.value = true
    }

    function addCategory () {
      dialogRef.value = false
      const newCat = categoriesRef.value.find(elem => elem.id === newCategoryIdRef.value)
      categoryRef.value = { id: newCat.id, name: newCat.name, valid: props.channel.valid || [], visible: [] }
      root.$set(props.channel.mappings, newCat.id, categoryRef.value)
      categoryIdRef.value = newCat.id
    }

    function categoryChanged () {
      categoryRef.value = mappedCategories.value.find(elem => elem.id === categoryIdRef.value)
    }

    onMounted(() => {
      loadCategories()
    })

    return {
      mappedCategories,
      availableCategories,
      categoryRef,
      categoryIdRef,
      newCategoryIdRef,
      dialogRef,
      addCategory,
      categoryChanged,
      add
    }
  }
}
</script>
