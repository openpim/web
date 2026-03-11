<template>
  <div class="bulk-config-editor">
    <v-alert border="left" colored-border type="info" elevation="1" class="mb-6">
      <div class="text-subtitle-2 mb-1">{{ $t('BulkUpload.DataOnlyTitle') }}</div>
      <div class="text-body-2">{{ $t('BulkUpload.DataOnlySummary') }}</div>
    </v-alert>

    <v-row>
      <v-col cols="12" md="4">
        <v-text-field
          v-model.number="config.maxFiles"
          :label="$t('BulkUpload.MaxFiles')"
          type="number"
          min="1"
          :readonly="readonly"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="config.logMode"
          :items="logModeOptions"
          item-text="text"
          item-value="value"
          :label="$t('BulkUpload.LogMode')"
          hide-details="auto"
          :readonly="readonly"
          @change="updateConfig"
        />
        <div class="text-caption grey--text text--darken-1 mt-1">{{ $t('BulkUpload.LogModeHint') }}</div>
      </v-col>
    </v-row>

    <v-card outlined class="section-card mb-6">
      <v-card-title class="section-card__title px-4 py-4">
        <div>
          <div class="text-subtitle-1 font-weight-medium">{{ $t('BulkUpload.MappingSection') }}</div>
          <div class="text-body-2 grey--text text--darken-1">{{ $t('BulkUpload.MappingSummary') }}</div>
        </div>
        <v-spacer />
        <v-btn small text color="primary" :disabled="readonly" @click="addRow">
          <v-icon left small>mdi-plus</v-icon>
          {{ $t('Add') }}
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <div v-if="!mappings.length" class="section-empty-state">
          <div class="text-subtitle-2 mb-1">{{ $t('BulkUpload.NoMappingsConfigured') }}</div>
          <div class="text-body-2 grey--text text--darken-1">{{ $t('BulkUpload.MappingSummary') }}</div>
        </div>

        <v-card v-for="(mapping, idx) in mappings" :key="'mapping-' + idx" outlined class="mapping-card mb-3">
          <v-card-text class="px-4 py-4">
            <div class="d-flex align-center mb-3">
              <div>
                <div class="text-subtitle-2">{{ $t('BulkUpload.MappingCardTitle', { index: idx + 1 }) }}</div>
                <div class="text-caption grey--text text--darken-1">{{ getDataHint(mapping.column) }}</div>
              </div>
              <v-spacer />
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" icon :disabled="readonly" @click="deleteRow(idx)"><v-icon>mdi-delete-outline</v-icon></v-btn>
                </template>
                <span>{{ $t('Remove') }}</span>
              </v-tooltip>
            </div>

            <v-row dense>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="mapping.attribute"
                  :items="getFilteredAttributes(mapping)"
                  item-text="text"
                  item-value="value"
                  :label="$t('ImportConfig.OptionsTable.Attribute')"
                  clearable
                  hide-details="auto"
                  :readonly="readonly"
                  @change="updateConfig"
                  @click:clear="updateConfig"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="mapping.column"
                  :items="fileColumns"
                  item-text="text"
                  item-value="value"
                  :label="$t('BulkUpload.FileField')"
                  clearable
                  hide-details="auto"
                  :readonly="readonly"
                  @change="updateConfig"
                  @click:clear="updateConfig"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="mapping.expression"
                  :label="$t('ImportConfig.OptionsTable.Expression')"
                  :placeholder="$t('BulkUpload.MappingExpressionPlaceholder')"
                  hide-details="auto"
                  append-outer-icon="mdi-message-outline"
                  :readonly="readonly"
                  @input="updateConfig"
                  @click:append-outer="showExpression(mapping, 'expression', 'BulkUpload.ExpressionsHelpText')"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>

    <v-card outlined class="section-card">
      <v-card-title class="section-card__title px-4 py-4">
        <div>
          <div class="text-subtitle-1 font-weight-medium">{{ $t('BulkUpload.RelationsSection') }}</div>
          <div class="text-body-2 grey--text text--darken-1">{{ $t('BulkUpload.RelationsSummary') }}</div>
        </div>
        <v-spacer />
        <v-btn small text color="primary" :disabled="readonly" @click="addRelation">
          <v-icon left small>mdi-plus</v-icon>
          {{ $t('Add') }}
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <div v-if="!relations.length" class="section-empty-state">
          <div class="text-subtitle-2 mb-1">{{ $t('BulkUpload.NoRelationsConfigured') }}</div>
          <div class="text-body-2 grey--text text--darken-1">{{ $t('BulkUpload.RelationsSummary') }}</div>
        </div>

        <v-card v-for="(relation, idx) in relations" :key="'relation-' + idx" outlined class="relation-card mb-4">
          <v-card-text class="px-4 py-4">
            <div class="d-flex align-center mb-3">
              <div>
                <div class="text-subtitle-2">{{ $t('BulkUpload.RelationCardTitle', { index: idx + 1 }) }}</div>
                <div class="text-caption grey--text text--darken-1">{{ getDataHint(relation.column) }}</div>
              </div>
              <v-spacer />
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" icon :disabled="readonly" @click="removeRelation(idx)"><v-icon>mdi-delete-outline</v-icon></v-btn>
                </template>
                <span>{{ $t('Remove') }}</span>
              </v-tooltip>
            </div>

            <v-row dense>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="relation.column"
                  :items="fileColumns"
                  item-text="text"
                  item-value="value"
                  :label="$t('BulkUpload.FileField')"
                  clearable
                  hide-details="auto"
                  :readonly="readonly"
                  @change="updateConfig"
                  @click:clear="updateConfig"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-combobox
                  v-model="relation.relationIdentifierExpression"
                  :items="availableRelations"
                  item-text="text"
                  item-value="value"
                  :return-object="false"
                  :label="$t('BulkUpload.RelationType')"
                  :placeholder="$t('BulkUpload.RelationTypePlaceholder')"
                  clearable
                  hide-details="auto"
                  append-outer-icon="mdi-message-outline"
                  :readonly="readonly"
                  @change="normalizeRelationLiteralField(relation, 'relationIdentifierExpression')"
                  @blur="normalizeRelationLiteralField(relation, 'relationIdentifierExpression')"
                  @click:clear="clearRelationField(relation, 'relationIdentifierExpression')"
                  @click:append-outer="showExpression(relation, 'relationIdentifierExpression', 'BulkUpload.RelationTypeHelpText')"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="relation.identifierExpression"
                  :label="$t('BulkUpload.RelationIdentifier')"
                  :placeholder="$t('BulkUpload.RelationIdentifierPlaceholder')"
                  clearable
                  hide-details="auto"
                  append-outer-icon="mdi-message-outline"
                  :readonly="readonly"
                  @input="updateConfig"
                  @blur="normalizeRelationLiteralField(relation, 'identifierExpression')"
                  @click:clear="clearRelationField(relation, 'identifierExpression')"
                  @click:append-outer="showExpression(relation, 'identifierExpression', 'BulkUpload.RelationIdentifierHelpText')"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="relation.sourceExpression"
                  :label="$t('BulkUpload.Source')"
                  :placeholder="$t('BulkUpload.SourceExpressionPlaceholder')"
                  hide-details="auto"
                  append-outer-icon="mdi-message-outline"
                  :readonly="readonly"
                  @input="updateConfig"
                  @click:append-outer="showExpression(relation, 'sourceExpression', 'BulkUpload.RelationExpressionsHelpText')"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="relation.targetIdentifierExpression"
                  :label="$t('BulkUpload.Target')"
                  :placeholder="$t('BulkUpload.TargetExpressionPlaceholder')"
                  hide-details="auto"
                  append-outer-icon="mdi-message-outline"
                  :readonly="readonly"
                  @input="updateConfig"
                  @click:append-outer="showExpression(relation, 'targetIdentifierExpression', 'BulkUpload.RelationExpressionsHelpText')"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="relation.valuesExpression"
                  :label="$t('BulkUpload.Values')"
                  :placeholder="$t('BulkUpload.ValuesExpressionPlaceholder')"
                  auto-grow
                  rows="2"
                  hide-details="auto"
                  append-outer-icon="mdi-message-outline"
                  :readonly="readonly"
                  @input="updateConfig"
                  @click:append-outer="showExpression(relation, 'valuesExpression', 'BulkUpload.RelationValuesHelpText')"
                />
              </v-col>
            </v-row>

            <div class="text-caption grey--text text--darken-1 mt-3">{{ $t('BulkUpload.TargetFallbackHint') }}</div>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>

    <v-dialog v-if="exprAttrRef" v-model="exprDialogRef" persistent max-width="90%">
      <v-card>
        <v-card-title class="px-6 py-4">{{ $t('BulkUpload.ExpressionEditorTitle') }}</v-card-title>
        <v-divider />
        <v-card-text>
          <v-container>
            <v-alert border="bottom" colored-border type="info" elevation="2" class="mt-6">{{ $t(exprHelpKeyRef) }}</v-alert>
            <v-row>
              <v-col cols="12">
                <v-textarea v-model="exprAttrRef[exprFieldRef]" :rows="12" />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="blue darken-1" text @click="closeExpressionDialog">{{ $t('Close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { toRefs, computed, ref, watch, onMounted } from '@vue/composition-api'
import * as attrStore from '@/store/attributes'
import * as langStore from '@/store/languages'
import * as relStore from '@/store/relations'
import i18n from '@/i18n'

const DEFAULT_FILE_FIELD = '$fileName'

export default {
  props: {
    importConfig: {
      type: Object,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  setup (props) {
    const { importConfig } = toRefs(props)

    const {
      groups,
      loadAllAttributes
    } = attrStore.useStore()

    const {
      languages,
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages
    } = langStore.useStore()

    const {
      relations: storeRelations,
      loadAllRelations
    } = relStore.useStore()

    const getLocalizedValue = (value, fallback = '') => {
      if (!value) return fallback
      if (typeof value === 'object') {
        const currentLanguageValue = currentLanguage.value?.identifier ? value[currentLanguage.value.identifier] : null
        const defaultLanguageValue = defaultLanguageIdentifier.value ? value[defaultLanguageIdentifier.value] : null
        return currentLanguageValue || defaultLanguageValue || fallback
      }
      return value || fallback
    }

    const fileColumns = computed(() => ([
      { value: '$fileName', text: i18n.t('BulkUpload.FileColumn.fileName') },
      { value: '$fileNameFull', text: i18n.t('BulkUpload.FileColumn.fileNameFull') },
      { value: '$fileExt', text: i18n.t('BulkUpload.FileColumn.fileExt') },
      { value: '$fileMimeType', text: i18n.t('BulkUpload.FileColumn.fileMimeType') },
      { value: '$fileSize', text: i18n.t('BulkUpload.FileColumn.fileSize') },
      { value: '$fileIndex', text: i18n.t('BulkUpload.FileColumn.fileIndex') }
    ]))

    const logModeOptions = computed(() => ([
      { value: 'info', text: i18n.t('BulkUpload.LogMode.info') },
      { value: 'debug', text: i18n.t('BulkUpload.LogMode.debug') }
    ]))

    const toLiteralExpression = (value) => {
      if (value == null) return ''
      const trimmedValue = ('' + value).trim()
      if (!trimmedValue) return ''
      return JSON.stringify(trimmedValue)
    }

    const normalizeStringExpression = (value, wrapSimpleLiteral = false) => {
      if (value == null) return ''
      const normalizedValue = typeof value === 'object'
        ? (value.value || value.identifier || value.text || '')
        : '' + value
      const trimmedValue = normalizedValue.trim()
      if (!trimmedValue) return ''
      if (!wrapSimpleLiteral) return trimmedValue
      if (/^".*"$/.test(trimmedValue) || /^'.*'$/.test(trimmedValue)) return trimmedValue
      if (/^[A-Za-z0-9_-]+$/.test(trimmedValue)) return JSON.stringify(trimmedValue)
      return trimmedValue
    }

    const extractLiteralString = (expression) => {
      if (!expression) return null
      const trimmedValue = ('' + expression).trim()
      if (!trimmedValue) return null
      try {
        const parsed = JSON.parse(trimmedValue)
        return typeof parsed === 'string' ? parsed : null
      } catch (error) {
        if (/^[A-Za-z0-9_-]+$/.test(trimmedValue)) return trimmedValue
        return null
      }
    }

    const normalizeMappingConfig = (mapping = {}) => {
      const normalizedMapping = { ...mapping }
      if (!normalizedMapping.column && normalizedMapping.expression) {
        normalizedMapping.column = DEFAULT_FILE_FIELD
      }
      return normalizedMapping
    }

    const normalizeRelationConfig = (relation = {}) => {
      const normalizedRelation = { ...relation }
      const sourceField = relation.sourceField || relation.targetSource || null
      const targetField = relation.targetField || null
      const hasRelationContent = Boolean(
        relation.column ||
        relation.relationIdentifier ||
        relation.relationIdentifierExpression ||
        relation.identifier ||
        relation.identifierExpression ||
        relation.sourceExpression ||
        relation.targetExpression ||
        relation.targetIdentifierExpression ||
        relation.valuesExpression ||
        relation.values ||
        sourceField ||
        targetField
      )

      normalizedRelation.column = relation.column || sourceField || targetField || (hasRelationContent ? DEFAULT_FILE_FIELD : null)
      normalizedRelation.relationIdentifierExpression = normalizeStringExpression(
        relation.relationIdentifierExpression || relation.relationIdentifier,
        true
      )
      normalizedRelation.identifierExpression = normalizeStringExpression(
        relation.identifierExpression || relation.identifier,
        true
      )
      normalizedRelation.sourceExpression = relation.sourceExpression || relation.targetExpression || (sourceField ? 'data' : '')
      normalizedRelation.targetIdentifierExpression = relation.targetIdentifierExpression || (targetField ? 'data' : '')
      normalizedRelation.valuesExpression = relation.valuesExpression != null
        ? relation.valuesExpression
        : (typeof relation.values === 'string'
          ? relation.values
          : (relation.values && typeof relation.values === 'object' ? JSON.stringify(relation.values) : ''))

      delete normalizedRelation.sourceField
      delete normalizedRelation.targetField
      delete normalizedRelation.targetSource
      delete normalizedRelation.targetExpression
      delete normalizedRelation.values
      return normalizedRelation
    }

    const availableAttributes = computed(() => {
      const attrs = [
        { value: 'identifier', text: i18n.t('ImportConfig.Attribute.identifier') },
        { value: 'typeIdentifier', text: i18n.t('ImportConfig.Attribute.typeIdentifier') },
        { value: 'parentIdentifier', text: i18n.t('ImportConfig.Attribute.parentIdentifier') },
        { value: 'image_type', text: i18n.t('BulkUpload.Attribute.image_type') },
        { value: 'image_width', text: i18n.t('BulkUpload.Attribute.image_width') },
        { value: 'image_height', text: i18n.t('BulkUpload.Attribute.image_height') },
        { value: 'file_type', text: i18n.t('BulkUpload.Attribute.file_type') },
        { value: 'file_name', text: i18n.t('BulkUpload.Attribute.file_name') },
        { value: 'file_size', text: i18n.t('BulkUpload.Attribute.file_size') },
        { value: 'extURL', text: i18n.t('BulkUpload.Attribute.extURL') }
      ]

      languages.forEach(lang => {
        const langName = getLocalizedValue(lang.name, lang.identifier)
        attrs.push({
          value: '$name#' + lang.identifier,
          text: i18n.t('ItemRelation.itemName') + ' (' + langName + ')'
        })
      })

      const addedAttrs = {}
      groups.forEach(group => {
        group.attributes.forEach(attr => {
          if (addedAttrs[attr.identifier]) return
          attrs.push({
            value: attr.identifier,
            text: getLocalizedValue(attr.name, attr.identifier)
          })
          addedAttrs[attr.identifier] = true
        })
      })

      return attrs
    })

    const availableRelations = computed(() => {
      return storeRelations.map(relation => ({
        value: toLiteralExpression(relation.identifier),
        text: getLocalizedValue(relation.name, relation.identifier) + ' (' + relation.identifier + ')'
      }))
    })

    const mappings = ref(Array.isArray(importConfig.value.mappings)
      ? importConfig.value.mappings.map(normalizeMappingConfig)
      : [])

    const config = ref({
      maxFiles: importConfig.value.config?.maxFiles || 100,
      logMode: importConfig.value.config?.logMode || 'info'
    })

    const relations = ref(Array.isArray(importConfig.value.config?.relations)
      ? importConfig.value.config.relations.map(normalizeRelationConfig)
      : [])
    if (importConfig.value.config?.relation) {
      relations.value.push(normalizeRelationConfig(importConfig.value.config.relation))
      delete importConfig.value.config.relation
    }

    const exprDialogRef = ref(false)
    const exprAttrRef = ref(null)
    const exprFieldRef = ref('expression')
    const exprHelpKeyRef = ref('BulkUpload.ExpressionsHelpText')

    const getFilteredAttributes = (fieldMapping) => {
      const result = []
      const selected = availableAttributes.value.find(el => el.value === fieldMapping.attribute)
      if (fieldMapping && fieldMapping.attribute && selected) {
        result.push(selected)
      }

      availableAttributes.value.forEach((el) => {
        if (!mappings.value.some(mapping => mapping.attribute === el.value)) {
          result.push(el)
        }
      })
      return result
    }

    const getFileColumnLabel = (value) => {
      const found = fileColumns.value.find(item => item.value === value)
      return found ? found.text : i18n.t('BulkUpload.FileFieldNotSelected')
    }

    const getDataHint = (column) => {
      return i18n.t('BulkUpload.DataHint', { field: getFileColumnLabel(column) })
    }

    function normalizeRelationLiteralField (relation, field) {
      relation[field] = normalizeStringExpression(relation[field], true)
      updateConfig()
    }

    function clearRelationField (relation, field) {
      relation[field] = ''
      updateConfig()
    }

    function updateConfig () {
      importConfig.value.mappings = mappings.value.map(normalizeMappingConfig)
      importConfig.value.config = {
        ...importConfig.value.config,
        ...config.value,
        relations: relations.value.map(relation => {
          const normalizedRelation = normalizeRelationConfig(relation)
          const literalRelationIdentifier = extractLiteralString(normalizedRelation.relationIdentifierExpression)
          const literalIdentifier = extractLiteralString(normalizedRelation.identifierExpression)
          normalizedRelation.relationIdentifier = literalRelationIdentifier || null
          normalizedRelation.identifier = literalIdentifier || null
          return normalizedRelation
        })
      }
    }

    function addRow () {
      mappings.value.push({ attribute: null, column: DEFAULT_FILE_FIELD, expression: '' })
      updateConfig()
    }

    function deleteRow (idx) {
      if (confirm(i18n.t('ImportConfig.AreYouSure'))) {
        mappings.value.splice(idx, 1)
        updateConfig()
      }
    }

    function addRelation () {
      relations.value.push({
        column: DEFAULT_FILE_FIELD,
        relationIdentifier: null,
        relationIdentifierExpression: '',
        identifierExpression: '',
        sourceExpression: '',
        targetIdentifierExpression: '',
        valuesExpression: ''
      })
      updateConfig()
    }

    function removeRelation (idx) {
      if (confirm(i18n.t('ImportConfig.AreYouSure'))) {
        relations.value.splice(idx, 1)
        updateConfig()
      }
    }

    function showExpression (attr, field = 'expression', helpKey = 'BulkUpload.ExpressionsHelpText') {
      exprAttrRef.value = attr
      exprFieldRef.value = field
      exprHelpKeyRef.value = helpKey
      exprDialogRef.value = true
    }

    function closeExpressionDialog () {
      exprDialogRef.value = false
      updateConfig()
    }

    onMounted(async () => {
      await loadAllLanguages()
      await Promise.all([
        loadAllAttributes(),
        loadAllRelations()
      ])
    })

    watch([mappings, config, relations], () => {
      updateConfig()
    }, { deep: true })

    return {
      fileColumns,
      logModeOptions,
      availableRelations,
      mappings,
      config,
      relations,
      exprDialogRef,
      exprAttrRef,
      exprFieldRef,
      exprHelpKeyRef,
      getFilteredAttributes,
      getDataHint,
      normalizeRelationLiteralField,
      clearRelationField,
      updateConfig,
      addRow,
      deleteRow,
      addRelation,
      removeRelation,
      showExpression,
      closeExpressionDialog
    }
  }
}
</script>

<style scoped>
.bulk-config-editor {
  width: 100%;
}

.section-card__title {
  align-items: flex-start;
  gap: 16px;
}

.section-empty-state {
  padding: 20px;
  border: 1px dashed rgba(0, 0, 0, 0.18);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
}

.mapping-card,
.relation-card {
  border-color: rgba(0, 0, 0, 0.12);
  box-shadow: none;
}
</style>
