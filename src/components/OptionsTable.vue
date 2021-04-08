<template>
      <div>
        <div class="mt-2">{{ $t('OptionsTable.Title') }}</div>
        <v-simple-table dense class="mb-4">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">{{$t('OptionsTable.Name')}}</th>
                  <th class="text-left">{{$t('OptionsTable.Value')}}</th>
                  <th class="text-left">
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" class="pa-0" icon color="primary" @click="addValue"><v-icon dark>mdi-plus</v-icon></v-btn>
                      </template>
                      <span>{{ $t('Add') }}</span>
                    </v-tooltip>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(elem, j) in options" :key="j">
                  <td class="pa-1">
                    <input v-model="elem.name" :placeholder="$t('OptionsTable.Name')">
                  </td>
                  <td class="pa-1" colspan="2">
                    <input v-model="elem.value" :placeholder="$t('OptionsTable.Name')">
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
      </div>
</template>
<script>
// import { ref } from '@vue/composition-api'

export default {
  props: {
    options: {
      required: true
    }
  },
  setup (props, { emit, root }) {
    function addValue () {
      props.options.push({ name: '', value: '' })
    }

    return {
      addValue
    }
  }
}
</script>
