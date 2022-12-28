<template>
<div>
  <v-text-field
    @blur="valueBlur"
    :readonly="readonly"
    :value="value"
    @input="handleInput"
    :rules="rules"
    :label="label"
    required
    :error-messages="errors"
    :set="desc = getTextOption('description', '')"
    density="compact"
    variant="underlined"
  >
    <template v-slot:append-inner>
      <v-menu v-model="showMenuRef">
        <template v-slot:activator="{ props }">
          <v-btn @click="showAllValues" v-if="languages.length > 1" v-bind="props" variant="plain"><v-icon>mdi-web-box</v-icon></v-btn>
        </template>
        <v-list>
          <v-list-item v-for="(item, index) in availableValues" :key="index">
            <v-list-item-title>{{ item }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
        <template v-slot:activator="{ on }">
          <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
        </template>
        <p v-html="desc.replaceAll('\n', '<br>')"/>
      </v-tooltip>
    </template>
  </v-text-field>
</div>
</template>
<script>
import * as langStore from '../store/languages'
import { ref, computed } from 'vue'

export default {
  props: {
    attr: {
      required: false
    },
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
    // TODO: fix desc???

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

    function showAllValues (e) {
      e.preventDefault()
      showMenuRef.value = true
      /* root.$nextTick(() => {
        showMenuRef.value = true
      }) */
    }

    const availableValues = computed(() => {
      return languages.map(lang => lang.identifier + ': ' + (props.values[lang.identifier] || ''))
    })

    function getTextOption (name, defaultValue) {
      if (props.attr && props.attr.options) {
        const tst = props.attr.options.find(elem => elem.name === name)
        if (tst) return tst.value
      }
      return props.attr && name === 'description' ? props.attr.identifier : defaultValue
    }

    function showAlert (text) {
      alert(text)
    }

    return {
      languages,
      getTextOption,
      showAllValues,
      handleInput,
      valueBlur,
      showMenuRef,
      availableValues,
      showAlert
    }
  }
}
</script>
