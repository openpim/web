<template>
  <div>
          <v-simple-table dense class="mb-4" v-if="channelAttributes && channelAttributes.length > 0">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left" style="width:30%">{{$t('MappingConfigComponent.Table.ChannelAttribute')}}</th>
                    <th class="text-left" style="width:30%">{{$t('MappingConfigComponent.Table.Attribute')}}</th>
                    <th class="text-left">{{$t('MappingConfigComponent.Table.Expression')}}</th>
                    <th v-if="showUpdateFlag" class="text-left" style="width:10%">{{ updateFlagLabel }}</th>
                    <th class="text-right" style="width:1%"></th>
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
                      <v-tooltip bottom v-if="attr.allowCustomValues && attr.dictionaryLink" color="blue-grey darken-4">
                        <template v-slot:activator="{ on }">
                          <v-icon v-on="on" class="ml-0" small>mdi-plus-thick</v-icon>
                        </template>
                        <span>Можно посылать свои значения вместо стандартных</span>
                      </v-tooltip>
                      <v-tooltip bottom v-if="attr.filtering" color="blue-grey darken-4">
                        <template v-slot:activator="{ on }">
                          <v-icon v-on="on" class="ml-0" small>mdi-filter-outline</v-icon>
                        </template>
                        <span>Этот атрибут используется в фильтре на маркетплейсе</span>
                      </v-tooltip>
                    </td>
                    <td class="pa-1">
                      <v-row>
                        <v-autocomplete dense :readonly="readonly" v-model="attributes[i].attrIdent" :items="pimAttributesAll" clearable :append-outer-icon="canManageAttributes ? 'mdi-format-list-bulleted-type' : ''" @click:append-outer="manageAttribute(i, attributes[i])"></v-autocomplete>
                        <v-tooltip bottom v-if="supportMultiValues">
                          <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on" @click="addMapping(i)"><v-icon>mdi-plus</v-icon></v-btn>
                          </template>
                          <span>{{ $t('MappingConfigComponent.AddMapping') }}</span>
                        </v-tooltip>
                        <v-tooltip bottom v-if="supportMultiValues">
                          <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on" @click="removeMapping(i)"><v-icon>mdi-minus</v-icon></v-btn>
                          </template>
                          <span>{{ $t('MappingConfigComponent.RemoveMapping') }}</span>
                        </v-tooltip>
                      </v-row>
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
                    <td v-if="showUpdateFlag" class="pa-1">
                      <v-checkbox
                        v-if="canUseUpdateFlag(attr)"
                        v-model="attributes[i][updateFlagField]"
                        dense
                        hide-details
                        :readonly="readonly"
                        class="mt-0 pt-0"
                      />
                    </td>
                    <td class="pa-1 text-right">
                      <v-tooltip bottom v-if="canCopyMappingRow(i)">
                        <template v-slot:activator="{ on }">
                          <v-btn
                            icon
                            v-on="on"
                            :data-testid="`copy-mapping-row-${i}`"
                            @click.stop="openCopyDialog(i)"
                          >
                            <v-icon>mdi-content-copy</v-icon>
                          </v-btn>
                        </template>
                        <span>{{ $t('MappingConfigComponent.CopyAttribute.Action') }}</span>
                      </v-tooltip>
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
    <AttributeMappingCopyDialog
      v-model="copyDialogOpen"
      :source-label="copySourceLabel"
      :targets="copyTargets"
      @confirm="copyToCategories"
    />
  </div>
</template>
<script>
import { ref, onMounted, computed } from '@vue/composition-api'
import * as langStore from '../store/languages'
import OptionsTable from '../components/OptionsTable.vue'
import AttributeManageDialog from './AttributeManageDialog.vue'
import AttributeMappingCopyDialog from './AttributeMappingCopyDialog.vue'
import AttributeValuesDialog from './AttributeValuesDialog.vue'
import i18n from '../i18n'
import AttributeType from '../constants/attributeTypes'
import * as attrStore from '../store/attributes'
import * as errorStore from '../store/error'
import * as lovStore from '../store/lovs'
import * as chanStore from '../store/channels'

const COPYABLE_FIELDS = [
  'attrIdent',
  'expr',
  'mapping',
  'options',
  'useOzonOnUpdate',
  'useYandexOnUpdate'
]

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key)

function cloneJson (value) {
  if (value === undefined) return undefined
  return JSON.parse(JSON.stringify(value))
}

function getRowIdentity (row) {
  if (row?.value !== undefined && row?.value !== null && row.value !== '') {
    return { field: 'value', value: String(row.value) }
  }
  if (row?.id !== undefined && row?.id !== null) {
    return { field: 'id', value: String(row.id) }
  }
  return null
}

function hasSameIdentity (row, identity) {
  if (!identity) return false
  const candidate = getRowIdentity(row)
  return candidate?.field === identity.field && candidate.value === identity.value
}

function findSourceEntry (mappings, sourceCategory) {
  const entries = Object.entries(mappings || {})
  return entries.find(([, category]) => category === sourceCategory) ||
    entries.find(([key, category]) => sourceCategory?.key === key || category?.key === sourceCategory?.key)
}

function getSourceContext ({ mappings, sourceCategory, sourceIndex }) {
  const sourceEntry = findSourceEntry(mappings, sourceCategory)
  const sourceAttributes = sourceCategory?.attributes
  const sourceRow = Array.isArray(sourceAttributes) ? sourceAttributes[sourceIndex] : null
  const identity = getRowIdentity(sourceRow)
  if (!sourceEntry || !sourceRow || !identity) return null

  let ordinal = 0
  for (let index = 0; index < sourceIndex; index++) {
    if (hasSameIdentity(sourceAttributes[index], identity)) ordinal++
  }

  return {
    sourceKey: sourceEntry[0],
    sourceRow,
    identity,
    ordinal
  }
}

function getMatchingIndexes (category, identity) {
  if (!Array.isArray(category?.attributes)) return []
  const indexes = []
  category.attributes.forEach((row, index) => {
    if (hasSameIdentity(row, identity)) indexes.push(index)
  })
  return indexes
}

function applyCopiedSettings (targetRow, sourceRow) {
  for (const field of COPYABLE_FIELDS) {
    if (hasOwn(sourceRow, field)) targetRow[field] = cloneJson(sourceRow[field])
    else delete targetRow[field]
  }
  return targetRow
}

function getChannelIdentity (channel) {
  return String(channel?.internalId || channel?.id || '')
}

function getAttributeMappingCopyTargetsForChannels ({ channels, sourceChannel, sourceCategory, sourceIndex }) {
  const source = getSourceContext({ mappings: sourceChannel?.mappings, sourceCategory, sourceIndex })
  if (!source) return []

  const sourceIdentity = getChannelIdentity(sourceChannel)
  const targets = []

  for (const channel of channels || []) {
    if (!channel || !channel.mappings) continue
    const isSourceChannel = getChannelIdentity(channel) === sourceIdentity

    for (const [key, category] of Object.entries(channel.mappings)) {
      if (key === '_default' || !category || category.deleted) continue
      if (!Array.isArray(category.attributes)) continue
      if (isSourceChannel && key === source.sourceKey) continue

      const matchingIndexes = getMatchingIndexes(category, source.identity)
      const mode = matchingIndexes.length > source.ordinal ? 'overwrite' : 'insert'

      targets.push({
        id: (isSourceChannel ? 'self' : getChannelIdentity(channel)) + '::' + key,
        channelId: channel.internalId || channel.id,
        channel,
        key,
        category,
        mode,
        reason: null
      })
    }
  }

  return targets
}

function copyAttributeMappingToTargets ({ sourceChannel, sourceCategory, sourceIndex, targets }) {
  const result = { copied: 0, overwritten: 0, inserted: 0, skipped: [], changedChannels: [] }
  const source = getSourceContext({ mappings: sourceChannel?.mappings, sourceCategory, sourceIndex })
  if (!source) return result

  const readingTime = new Date(Date.now() + 1000).toISOString()
  const changedChannels = new Map()

  for (const target of targets || []) {
    const category = target?.category
    if (!category || !Array.isArray(category.attributes) || !target.channel) {
      result.skipped.push({ key: target?.id, reason: 'invalid-target' })
      continue
    }

    const matchingIndexes = getMatchingIndexes(category, source.identity)
    if (matchingIndexes.length === 0) {
      category.attributes.push(cloneJson(source.sourceRow))
      result.inserted++
    } else if (matchingIndexes.length > source.ordinal) {
      const targetIndex = matchingIndexes[source.ordinal]
      const replacement = applyCopiedSettings(cloneJson(category.attributes[targetIndex]), source.sourceRow)
      category.attributes.splice(targetIndex, 1, replacement)
      result.overwritten++
    } else {
      const lastMatchingIndex = matchingIndexes[matchingIndexes.length - 1]
      const newRow = applyCopiedSettings(cloneJson(category.attributes[lastMatchingIndex]), source.sourceRow)
      category.attributes.splice(lastMatchingIndex + 1, 0, newRow)
      result.inserted++
    }

    result.copied++
    category.readingTime = readingTime

    const channelIdentity = getChannelIdentity(target.channel)
    if (!changedChannels.has(channelIdentity)) changedChannels.set(channelIdentity, target.channel)
  }

  result.changedChannels = [...changedChannels.values()]
  return result
}

export default {
  components: { OptionsTable, AttributeManageDialog, AttributeMappingCopyDialog, AttributeValuesDialog },
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
    },
    supportMultiValues: {
      type: Boolean,
      required: false
    }
  },
  setup (props, { root }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier,
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
      getChannelAttributeValues,
      channels: allChannels,
      getAvailableChannels,
      loadAllChannelsWithMapping,
      saveChannel
    } = chanStore.useStore()

    const exprAttrRef = ref(null)
    const exprDialogRef = ref(null)
    const optAttrRef = ref(null)
    const optDialogRef = ref(null)
    const attrManageDialogRef = ref(null)
    const attrValuesDialogRef = ref(null)
    const copyDialogOpen = ref(false)
    const copySourceIndex = ref(-1)
    const copySourceLabel = ref('')
    const copyTargets = ref([])
    const updateFlagConfig = computed(() => {
      if (props.channel?.type === 3) {
        return {
          field: 'useOzonOnUpdate',
          label: 'Из Ozon при update'
        }
      }

      if (props.channel?.type === 9) {
        return {
          field: 'useYandexOnUpdate',
          label: 'Из Yandex при update'
        }
      }

      return null
    })

    const showUpdateFlag = computed(() => !!updateFlagConfig.value)
    const updateFlagField = computed(() => updateFlagConfig.value?.field || '')
    const updateFlagLabel = computed(() => updateFlagConfig.value?.label || '')

    function getAttribute (id) {
      return props.channelAttributes.find(elem => elem.id === id)
    }

    function categoryLabel (category, key) {
      if (typeof category?.name === 'string') return category.name
      return category?.name?.[currentLanguage.value?.identifier] ||
        category?.name?.[defaultLanguageIdentifier.value] ||
        Object.values(category?.name || {}).find(Boolean) || key
    }

    function channelLabel (channel) {
      if (!channel) return ''
      return channel.name?.[currentLanguage.value?.identifier] ||
        channel.name?.[defaultLanguageIdentifier.value] ||
        Object.values(channel.name || {}).find(Boolean) ||
        channel.identifier ||
        String(channel.internalId || channel.id || '')
    }

    function channelIdentity (channel) {
      return String(channel?.internalId || channel?.id || '')
    }

    function copyTargetChannels () {
      const type = props.channel?.type
      if (type == null) return [props.channel]

      const result = []
      const seen = new Set()
      const push = (channel, isSource) => {
        if (!channel || channel.group) return
        if (!isSource && !channel.internalId) return
        if (channel.type !== type) return
        const id = channelIdentity(channel)
        if (seen.has(id)) return
        seen.add(id)
        result.push(channel)
      }

      push(props.channel, true)
      for (const channel of getAvailableChannels(true)) push(channel, false)
      return result
    }

    function mappingCopyTargets (index) {
      return getAttributeMappingCopyTargetsForChannels({
        channels: copyTargetChannels(),
        sourceChannel: props.channel,
        sourceCategory: props.category,
        sourceIndex: index
      })
    }

    function canCopyMappingRow (index) {
      if (props.readonly || !props.category) return false
      return mappingCopyTargets(index).length > 0
    }

    async function openCopyDialog (index) {
      const row = props.attributes[index]
      copySourceIndex.value = index
      copySourceLabel.value = getAttribute(row?.id)?.name || row?.name || row?.value || row?.id || ''

      if (allChannels.length === 0) {
        try {
          await loadAllChannelsWithMapping()
        } catch (error) {
          console.error('Failed to load channels for mapping copy', error)
        }
      }

      copyTargets.value = mappingCopyTargets(index).map(target => ({
        ...target,
        channelLabel: channelLabel(target.channel),
        label: categoryLabel(target.category, target.key)
      }))
      copyDialogOpen.value = true
    }

    async function copyToCategories (targetIds) {
      const selectedTargets = copyTargets.value.filter(target => targetIds.includes(target.id))
      const result = copyAttributeMappingToTargets({
        sourceChannel: props.channel,
        sourceCategory: props.category,
        sourceIndex: copySourceIndex.value,
        targets: selectedTargets
      })

      const sourceIdentity = channelIdentity(props.channel)
      const channelsToSave = result.changedChannels.filter(channel => channel.internalId)

      let savedChannels = 0
      for (const channel of channelsToSave) {
        try {
          await saveChannel(channel)
          savedChannels++
        } catch (error) {
          showError(i18n.t('MappingConfigComponent.CopyAttribute.SaveChannelError', {
            name: channelLabel(channel),
            error: error?.message || String(error)
          }))
        }
      }

      const summary = i18n.t('MappingConfigComponent.CopyAttribute.Result', {
        copied: result.copied,
        overwrite: result.overwritten,
        insert: result.inserted,
        skipped: result.skipped.length
      })
      const currentChannelChanged = result.changedChannels.some(channel => channelIdentity(channel) === sourceIdentity)
      const messageParts = [summary]
      if (currentChannelChanged && !props.channel?.internalId) messageParts.push(i18n.t('MappingConfigComponent.CopyAttribute.SaveHint'))
      if (savedChannels) messageParts.push(i18n.t('MappingConfigComponent.CopyAttribute.SavedChannels', { count: savedChannels }))
      showInfo(messageParts.join(' '))
    }

    function canUseUpdateFlag (attr) {
      return showUpdateFlag.value && attr?.id && !attr.id.startsWith('#')
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
      attrValuesDialogRef.value.showDialog(identifier, props.category)
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
                  ;[json.result, json.values].forEach(arr => arr?.forEach(elem => {
                    const val = { [currentLanguage.value.identifier]: elem.value }
                    lov.values.push({ id: elem.id, value: val })
                  }))
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

    function addMapping (index) {
      const newAttr = JSON.parse(JSON.stringify(props.attributes[index]))
      newAttr.id = Date.now()
      const newArr = props.channelAttributes
      newArr.splice(index + 1, 0, newAttr)
    }

    function removeMapping (index) {
      const newArr = props.channelAttributes
      const isLastValue = newArr.every((attr, i) => i === index || attr.value !== newArr[index].value)
      if (isLastValue) {
        showError(i18n.t('MappingConfigComponent.CannotDeleteLastMapping'))
        return
      }
      newArr.splice(index, 1)
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
      showUpdateFlag,
      updateFlagField,
      updateFlagLabel,
      canUseUpdateFlag,
      up,
      down,
      remove,
      pimAttributesAll,
      addMapping,
      removeMapping,
      copyDialogOpen,
      copySourceLabel,
      copyTargets,
      canCopyMappingRow,
      openCopyDialog,
      copyToCategories
    }
  }
}
</script>
