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
                        <span>{{ attr.description }}</span>
                      </v-tooltip>
                      <span :class="attr.required ? 'font-weight-bold' : ''"  @click="showHelp(i)">{{ attr.name }}</span>
                      <v-tooltip bottom v-if="showValuesList">
                        <template v-slot:activator="{ on }">
                          <v-btn icon v-on="on" @click="showAttrValuesDialog(elem.value)"><v-icon>mdi-arrow-top-right</v-icon></v-btn>
                        </template>
                        <span>{{ 'Show values' }}</span>
                      </v-tooltip>
                      <v-tooltip bottom v-if="attr.dictionaryLink">
                        <template v-slot:activator="{ on }">
                          <v-btn icon v-on="on" @click="openWindow(i)"><v-icon>mdi-arrow-top-right</v-icon></v-btn>
                        </template>
                        <span>{{ $t('MappingConfigComponent.Table.DictionaryLink') + ' - ' + attr.dictionaryLink}}</span>
                      </v-tooltip>
                    </td>
                    <td class="pa-1">
                      <v-autocomplete dense :readonly="readonly" v-model="attributes[i].attrIdent" :items="pimAttributesAll" clearable :append-outer-icon="canManageAttributes ? 'mdi-format-list-bulleted-type' : ''" @click:append-outer="manageAttribute(i, attributes[i])"></v-autocomplete>
                    </td>
                    <td class="pa-1">
                      <v-text-field v-if="!canManageOrder" v-model="attributes[i].expr" dense :readonly="readonly" class="ml-3 mr-3" :prepend-icon="attr.dictionaryLink ? 'mdi-arrow-top-right' : ''" @click:prepend="showOptions(attributes[i])" append-outer-icon="mdi-message-outline" @click:append-outer="showExpression(attributes[i])" />
                      <template v-if="canManageOrder">
                        <v-text-field v-model="attributes[i].expr" dense :readonly="readonly" class="ml-3 mr-3 d-inline-flex" :prepend-icon="attr.dictionaryLink ? 'mdi-arrow-top-right' : ''" @click:prepend="showOptions(attributes[i])" append-outer-icon="mdi-message-outline" @click:append-outer="showExpression(attributes[i])" />
                        <v-btn icon @click="up(i)" class="d-inline-flex"><v-icon>mdi-arrow-up-circle-outline</v-icon></v-btn>
                        <v-btn icon @click="down(i)" class="d-inline-flex"><v-icon>mdi-arrow-down-circle-outline</v-icon></v-btn>
                        <v-btn icon @click="remove(i)" class="d-inline-flex"><v-icon>mdi-minus-circle-outline</v-icon></v-btn>
                      </template>
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
    <template>
      <v-row justify="center" v-if="optAttrRef">
        <v-dialog v-model="optDialogRef" persistent max-width="90%">
          <v-card>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <OptionsTable :options="optAttrRef.options" @changed="optionsChanged" />
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="optDialogRef = false">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
    <AttributeManageDialog ref="attrManageDialogRef" @manage="manageDialogClosed"/>
    <AttributeValuesDialog ref="attrValuesDialogRef" />
  </div>
</template>
<script>
import { ref, onMounted, computed } from '@vue/composition-api'
import * as langStore from '../store/languages'
import OptionsTable from '../components/OptionsTable.vue'
import AttributeManageDialog from './AttributeManageDialog.vue'
import AttributeValuesDialog from './AttributeValuesDialog.vue'
import i18n from '../i18n'
import AttributeType from '../constants/attributeTypes'
import * as attrStore from '../store/attributes'
import * as errorStore from '../store/error'
import * as lovStore from '../store/lovs'
import * as chanStore from '../store/channels'

export default {
  components: { OptionsTable, AttributeManageDialog, AttributeValuesDialog },
  props: {
    attributes: {
      required: true
    },
    pimAttributes: {
      required: true
    },
    channelAttributes: {
      required: true
    },
    channel: {
      required: true
    },
    readonly: {
      type: Boolean,
      required: true
    },
    canManageAttributes: {
      type: Boolean,
      default: false
    },
    canManageOrder: {
      type: Boolean,
      default: false
    },
    category: {
      required: false
    },
    showValuesList: {
      type: Boolean,
      required: false
    }
  },
  setup (props, { root }) {
    const {
      currentLanguage,
      loadAllLanguages
    } = langStore.useStore()

    const {
      groups,
      findByIdentifier,
      loadAllAttributes,
      saveData
      /* assignData,
      removeGroup,
      removeAttribute */
    } = attrStore.useStore()

    const {
      saveLOV,
      lovs,
      loadAllLOVs
    } = lovStore.useStore()
    const { showInfo, showError } = errorStore.useStore()

    const {
      getChannelAttributeValues
    } = chanStore.useStore()

    const exprAttrRef = ref(null)
    const exprDialogRef = ref(null)
    const optAttrRef = ref(null)
    const optDialogRef = ref(null)
    const attrManageDialogRef = ref(null)
    const attrValuesDialogRef = ref(null)

    function getAttribute (id) {
      return props.channelAttributes.find(elem => elem.id === id)
    }

    function openWindow (i) {
      const attr = props.channelAttributes[i]
      if (!attr.dictionaryLinkPost) {
        window.open(attr.dictionaryLink, '_blank').focus()
      } else {
        getChannelAttributeValues(props.channel.id, attr.category, attr.id)
          .then(json => {
            const newWin = window.open('', '_blank')
            newWin.document.write('<pre>' + JSON.stringify(json, null, 2) + '</pre>')
            newWin.focus()
          })
        /*
        fetch(attr.dictionaryLink, {
          method: 'POST',
          headers: attr.dictionaryLinkPost.headers,
          body: JSON.stringify(attr.dictionaryLinkPost.body)
        }).then(response => response.json()).then(json => {
          const newWin = window.open('', '_blank')
          newWin.document.write('<pre>' + JSON.stringify(json, null, 2) + '</pre>')
          newWin.focus()
        }) */
      }
    }

    function showHelp (i) {
      const attr = props.channelAttributes[i]
      if (attr.description) window.alert(attr.description)
    }

    function showExpression (attr) {
      exprAttrRef.value = attr
      exprDialogRef.value = true
    }

    function showAttrValuesDialog (identifier) {
      attrValuesDialogRef.value.showDialog(identifier)
    }

    function showOptions (attr) {
      if (!attr.options) {
        root.$set(attr, 'options', [])
      }
      optAttrRef.value = attr
      optDialogRef.value = true
    }

    function optionsChanged (val) {
      optAttrRef.value.options = val
    }

    function arrayMove (arr, fromIndex, toIndex) {
      var element = arr[fromIndex]
      arr.splice(fromIndex, 1)
      arr.splice(toIndex, 0, element)
    }

    function up (i) {
      if (i > 0) {
        arrayMove(props.attributes, i, i - 1)
        arrayMove(props.channelAttributes, i, i - 1)
      }
    }

    function down (i) {
      if (i < props.attributes.length) {
        arrayMove(props.attributes, i, i + 1)
        arrayMove(props.channelAttributes, i, i + 1)
      }
    }

    function remove (i) {
      if (confirm(i18n.t('Remove') + '?')) {
        props.attributes.splice(i, 1)
        props.channelAttributes.splice(i, 1)
      }
    }

    const pimAttributesAll = computed(() => {
      const missingAttrs = []
      for (let i = 0; i < props.attributes.length; i++) {
        const attr = props.attributes[i]
        if (attr.attrIdent && attr.attrIdent.length) {
          const found = props.pimAttributes.find(el => el.value === attr.attrIdent)
          if (!found) missingAttrs.push({ value: attr.attrIdent, text: `[[[ ${attr.attrIdent} ]]]` })
        }
      }
      return props.pimAttributes.concat(missingAttrs)
    })

    async function manageAttribute (i, attrMapping) {
      if (attrMapping.expr && !confirm(i18n.t('MappingConfigComponent.Attr.ConfirmExist'))) return

      const chanAttr = props.channelAttributes[i]

      const pimAttr = findByIdentifier(attrMapping.attrIdent)
      if (attrMapping.attrIdent && !attrMapping.expr && pimAttr) {
        const pimAttr = findByIdentifier(attrMapping.attrIdent)
        attrManageDialogRef.value.showDialog(pimAttr.item, pimAttr.groups.map(grp => grp.id), attrMapping)
      } else {
        // TODO: check if such attribute was already created 'channel' + props.channel.type + 'attribute'
        // check if necessary attribute was already created
        const check = 'channel' + props.channel.type + 'attribute'
        let found = null

        let catAttrId = chanAttr.id
        if (chanAttr.dictionary && chanAttr.dictionaryLink && chanAttr.dictionaryLinkPost) { // LOV
          catAttrId = chanAttr.category + '_' + chanAttr.id
        }

        // eslint-disable-next-line no-labels
        end:
        for (let i = 0; i < groups.length; i++) {
          const group = groups[i]
          for (let j = 0; j < group.attributes.length; j++) {
            const tst = group.attributes[j]
            if (tst.options.some(option => option.name === check && option.value === catAttrId)) {
              found = tst
              // eslint-disable-next-line no-labels
              break end
            }
          }
        }
        if (found) {
          showInfo(i18n.t('AttributeManageDialog.AttributeFound'))
          const pimAttr = findByIdentifier(found.identifier)
          attrManageDialogRef.value.showDialog(pimAttr.item, pimAttr.groups.map(grp => grp.id), attrMapping)
        } else {
          const name = {}
          name[currentLanguage.value.identifier] = chanAttr.name + (chanAttr.dictionary && chanAttr.dictionaryLink && chanAttr.dictionaryLinkPost && props.category ? ' - ' + props.category.name : '')
          const errorMessage = {}
          errorMessage[currentLanguage.value.identifier] = ''
          const pimAttr = { identifier: catAttrId, id: Date.now(), internalId: 0, type: AttributeType.Text, group: false, languageDependent: false, order: 0, visible: props.channel.visible, valid: props.channel.valid, relations: [], name: name, errorMessage: errorMessage, options: [] }

          if (chanAttr.description) {
            pimAttr.options.push({ name: 'description', value: chanAttr.description })
          }
          pimAttr.options.push({ name: 'channel' + props.channel.type + 'attribute', value: catAttrId })

          if (chanAttr.name.includes('(Integer)')) pimAttr.type = AttributeType.Integer
          else if (chanAttr.name.includes('(Decimal)')) pimAttr.type = AttributeType.Float
          else if (chanAttr.name.includes('(число)')) pimAttr.type = AttributeType.Float
          else if (chanAttr.name.includes('[число]')) pimAttr.type = AttributeType.Float

          // TODO now support ozon only, support wb also
          if (chanAttr.dictionary && chanAttr.dictionaryLink && chanAttr.dictionaryLinkPost) { // LOV
            const json = await getChannelAttributeValues(props.channel.id, chanAttr.category, chanAttr.id)
            if (json) {
              if (!json.has_next) {
                const tst = lovs.find(lov => lov.identifier === catAttrId)
                if (tst) {
                  pimAttr.type = AttributeType.LOV
                  pimAttr.lov = parseInt(tst.internalId || tst.id)
                } else if (confirm(i18n.t('AttributeManageDialog.ConfirmDictionary'))) {
                  const lov = { identifier: catAttrId, id: Date.now(), internalId: 0, name: name, values: [] }
                  json.result.forEach(elem => {
                    const val = {}
                    val[currentLanguage.value.identifier] = elem.value
                    lov.values.push({ id: elem.id, value: val })
                  })
                  await saveLOV(lov)
                  lovs.push(lov)
                  pimAttr.type = AttributeType.LOV
                  pimAttr.lov = lov.internalId
                }
              } else {
                showError(i18n.t('AttributeManageDialog.DictionaryTooBig'))
              }
            } else {
              showError(i18n.t('AttributeManageDialog.DictionaryFailed'))
              console.error('Failed to load dictionary: ' + JSON.stringify(chanAttr))
            }
          }
          attrManageDialogRef.value.showDialog(pimAttr, null, attrMapping)
        }
      }
    }

    function manageDialogClosed (data) {
      attrManageDialogRef.value.closeDialog()
      const newAttr = data.attr.internalId === 0
      saveData(data.attr, data.groups)
      if (newAttr) {
        props.pimAttributes.push({ value: data.attr.identifier, text: data.attr.name[currentLanguage.value.identifier] })
        const grp = groups.find(group => group.id === data.groups)
        grp.attributes.push(data.attr)
      }
      data.attrMapping.attrIdent = data.attr.identifier
    }

    onMounted(() => {
      loadAllLOVs()
      loadAllLanguages()
      loadAllAttributes()
    })

    return {
      getAttribute,
      openWindow,
      showExpression,
      showOptions,
      showHelp,
      exprDialogRef,
      exprAttrRef,
      optDialogRef,
      optAttrRef,
      optionsChanged,
      manageAttribute,
      attrManageDialogRef,
      attrValuesDialogRef,
      manageDialogClosed,
      showAttrValuesDialog,
      up,
      down,
      remove,
      pimAttributesAll
    }
  }
}
</script>
