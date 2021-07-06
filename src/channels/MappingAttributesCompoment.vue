<template>
  <div>
          <v-simple-table dense class="mb-4" v-if="channelAttributes && channelAttributes.length > 0">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left" style="width:30%">{{$t('MappingConfigComponent.Table.ChannelAttribute')}}</th>
                    <th class="text-left" style="width:30%">{{$t('MappingConfigComponent.Table.Attribute')}}</th>
                    <th class="text-left">{{$t('MappingConfigComponent.Table.Expression')}}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(elem, i) in attributes" :key="i" :set="attr = getAttribute(elem.id)">
                    <td class="pa-1">
                      <v-tooltip bottom v-if="attr.description" color="blue-grey darken-4">
                        <template v-slot:activator="{ on }">
                          <v-icon v-on="on" class="mr-2">mdi-information-outline</v-icon>
                        </template>
                        <span>{{ attributeByIndex(i).description }}</span>
                      </v-tooltip>

                      <span v-on="on" :class="attr.required ? 'font-weight-bold' : ''">{{ attr.name }}</span>

                      <v-tooltip bottom v-if="attr.dictionaryLink">
                        <template v-slot:activator="{ on }">
                          <v-btn icon v-on="on" @click="openWindow(i)"><v-icon>mdi-arrow-top-right</v-icon></v-btn>
                        </template>
                        <span>{{ $t('MappingConfigComponent.Table.DictionaryLink') + ' - ' + attr.dictionaryLink}}</span>
                      </v-tooltip>
                    </td>
                    <td class="pa-1">
                      <v-autocomplete dense :readonly="readonly" v-model="attributes[i].attrIdent" :items="pimAttributes" clearable></v-autocomplete>
                    </td>
                    <td class="pa-1">
                      <v-text-field v-model="attributes[i].expr" dense :readonly="readonly" class="ml-3 mr-3" append-outer-icon="mdi-message-outline" @click:append-outer="showExpression(attributes[i])" />
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
    <template>
      <v-row justify="center" v-if="exprAttrRef">
        <v-dialog v-model="exprDialogRef" persistent max-width="90%">
          <v-card>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-textarea :rows="15" :readonly="readonly" v-model="exprAttrRef.expr"></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="exprDialogRef = false">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
  </div>
</template>
<script>
import { ref } from '@vue/composition-api'

export default {
  props: {
    attributes: {
      required: true
    },
    pimAttributes: {
      required: true
    },
    channelAttributes: {
      required: true
    }
  },
  setup (props, { root }) {
    const exprAttrRef = ref(null)
    const exprDialogRef = ref(null)

    function getAttribute (id) {
      return props.channelAttributes.find(elem => elem.id === id)
    }

    function openWindow (i) {
      const attr = props.channelAttributes[i]
      if (!attr.dictionaryLinkPost) {
        window.open(attr.dictionaryLink, '_blank').focus()
      } else {
        fetch(attr.dictionaryLink, {
          method: 'POST',
          headers: attr.dictionaryLinkPost.headers,
          body: JSON.stringify(attr.dictionaryLinkPost.body)
        }).then(response => response.json()).then(json => {
          const newWin = window.open('', '_blank')
          newWin.document.write('<pre>' + JSON.stringify(json, null, 2) + '</pre>')
          newWin.focus()
        })
      }
    }

    function attributeByIndex (i) {
      return props.channelAttributes[i]
    }

    function showExpression (attr) {
      exprAttrRef.value = attr
      exprDialogRef.value = true
    }

    return {
      getAttribute,
      openWindow,
      attributeByIndex,
      showExpression,
      exprDialogRef,
      exprAttrRef
    }
  }
}
</script>
