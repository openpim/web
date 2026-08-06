const textFields = [
  'identifier',
  'parentIdentifier',
  'typeIdentifier',
  'itemIdentifier',
  'relationIdentifier',
  'targetIdentifier',
  'createdBy',
  'updatedBy',
  'fileOrigName',
  'mimeType'
]

export function parseRelationSearchValue (attr, value, trimSearchString) {
  if (textFields.includes(attr)) {
    return trimSearchString ? value.trim() : value
  }

  if (value.startsWith('"') && value.endsWith('"')) {
    return value.substring(1, value.length - 1)
  }

  return isNaN(value) ? value : (value.length > 0 ? parseFloat(value) : null)
}
