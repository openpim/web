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

export function getAttributeMappingCopyTargets ({ mappings, sourceCategory, sourceIndex }) {
  const source = getSourceContext({ mappings, sourceCategory, sourceIndex })
  if (!source) return []

  return Object.entries(mappings || {})
    .filter(([key, category]) => key !== '_default' && key !== source.sourceKey && !category?.deleted)
    .map(([key, category]) => {
      const matchingIndexes = getMatchingIndexes(category, source.identity)
      let mode = 'insert'
      if (matchingIndexes.length > source.ordinal) mode = 'overwrite'

      return {
        key,
        category,
        mode,
        reason: null
      }
    })
}

export function copyAttributeMappingToCategories ({ mappings, sourceCategory, sourceIndex, targetKeys }) {
  const result = { copied: 0, overwritten: 0, inserted: 0, skipped: [] }
  const source = getSourceContext({ mappings, sourceCategory, sourceIndex })
  if (!source) return result

  const uniqueTargetKeys = [...new Set(targetKeys || [])]
  for (const key of uniqueTargetKeys) {
    const category = mappings?.[key]
    if (key === '_default' || key === source.sourceKey || !category || category.deleted) {
      result.skipped.push({ key, reason: 'invalid-target' })
      continue
    }

    const matchingIndexes = getMatchingIndexes(category, source.identity)
    if (matchingIndexes.length === 0) {
      category.attributes.push(cloneJson(source.sourceRow))
      result.inserted++
      result.copied++
      continue
    }

    if (matchingIndexes.length > source.ordinal) {
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
  }

  return result
}
