<template>
<div>
  <v-text-field @blur="valueBlur" :readonly="readonly" :append-icon="languages.length > 1 ? 'mdi-web-box' : ''" @click:append="showAllValues" :value="value" @input="handleInput" :rules="rules" :label="label" required  :error-messages="errors"></v-text-field>
   <v-menu v-model="showMenuRef" offset-y :position-x="xRef" :position-y="yRef" absolute>
      <v-list>
        <v-list-item v-for="(item, index) in availableValues" :key="index">
          <v-list-item-title>{{ item }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
</div>
</template>
<script>
import * as langStore from '../store/languages'
import { ref, computed } from '@vue/composition-api'

export default {
  props: {
    value: {
      required: true
    },
    values: {
      required: true
    },
    label: {
      required: true
    },
    rules: {
      required: false
    },
    readonly: {
      required: false,
      default: false
    },
    errors: {
      required: false
    }
  },
  setup (props, { emit, root }) {
    const {
      languages
    } = langStore.useStore()

    function handleInput (val) {
      emit('input', val)
    }

    function valueBlur (val) {
      emit('blur', val)
    }

    const showMenuRef = ref(false)
    const xRef = ref(0)
    const yRef = ref(0)

    function showAllValues (e) {
      e.preventDefault()
      xRef.value = e.clientX
      yRef.value = e.clientY
      showMenuRef.value = true
      /* root.$nextTick(() => {
        showMenuRef.value = true
      }) */
    }

    const availableValues = computed(() => {
      return languages.map(lang => lang.identifier + ': ' + (props.values[lang.identifier] || ''))
    })

    return {
      languages,
      showAllValues,
      handleInput,
      valueBlur,
      showMenuRef,
      availableValues,
      xRef,
      yRef
    }
  }
}
</script>
