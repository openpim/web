const itemIdentifierColumns = ['identifier', 'parentIdentifier']
const itemRelationIdentifierColumns = [
  'identifier',
  'itemIdentifier',
  'relationIdentifier',
  'targetIdentifier'
]

export function isCopyableIdentifierColumn (searchEntity, headerIdentifier) {
  if (searchEntity === 'ITEM_RELATION') {
    return itemRelationIdentifierColumns.includes(headerIdentifier)
  }

  return itemIdentifierColumns.includes(headerIdentifier)
}

export function buildUniqueColumnValueList (rows, columnIdentifier) {
  const uniqueValues = new Set()

  rows.forEach(row => {
    const value = row[columnIdentifier]
    if (value !== null && value !== undefined && value !== '') {
      const textValue = String(value)
      uniqueValues.add(textValue)
    }
  })

  return Array.from(uniqueValues).join('\n')
}

export async function loadAllUniqueColumnValues (loadPage, columnIdentifier, sorting, itemsPerPage = 1000) {
  const rows = []
  let page = 0
  let total = 0

  do {
    page++
    const data = await loadPage({
      page,
      itemsPerPage,
      sortBy: sorting.sortBy,
      sortDesc: sorting.sortDesc
    })
    rows.push(...data.rows)
    total = data.count
  } while (page * itemsPerPage < total)

  return buildUniqueColumnValueList(rows, columnIdentifier)
}
