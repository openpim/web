const COMMENT_AUTHOR = 'OpenPIM'
const DEFAULT_LANG = 'en'

const BASE_COLUMN_TITLES = {
  groupIdentifier: 'group identifier',
  groupOrder: 'group order',
  groupVisible: 'group visible',
  groupOptions: 'group options',
  identifier: 'identifier',
  type: 'type',
  valid: 'valid',
  visible: 'visible',
  relations: 'relations',
  order: 'order',
  languageDependent: 'language dependent',
  pattern: 'pattern',
  lov: 'lov',
  richText: 'rich text',
  multiLine: 'multi line',
  options: 'options'
}

function normalizeLanguages (languages = [], defaultLanguageIdentifier = DEFAULT_LANG) {
  const result = []
  const add = lang => {
    const identifier = typeof lang === 'string' ? lang : lang && lang.identifier
    if (identifier && !result.includes(identifier)) {
      result.push(identifier)
    }
  }
  add(defaultLanguageIdentifier)
  for (const lang of languages || []) {
    add(lang)
  }
  return result.length > 0 ? result : [DEFAULT_LANG]
}

function localizedColumn (prefix, lang, title) {
  return {
    key: `${prefix}_${lang}`,
    title: `${title} (${lang})`
  }
}

export function createAttributeExcelColumns (languages = [], defaultLanguageIdentifier = DEFAULT_LANG) {
  const languageIds = normalizeLanguages(languages, defaultLanguageIdentifier)
  return [
    { key: 'groupIdentifier', title: BASE_COLUMN_TITLES.groupIdentifier },
    ...languageIds.map(lang => localizedColumn('groupName', lang, 'group name')),
    { key: 'groupOrder', title: BASE_COLUMN_TITLES.groupOrder },
    { key: 'groupVisible', title: BASE_COLUMN_TITLES.groupVisible },
    { key: 'groupOptions', title: BASE_COLUMN_TITLES.groupOptions },
    { key: 'identifier', title: BASE_COLUMN_TITLES.identifier },
    ...languageIds.map(lang => localizedColumn('name', lang, 'name')),
    { key: 'type', title: BASE_COLUMN_TITLES.type },
    { key: 'valid', title: BASE_COLUMN_TITLES.valid },
    { key: 'visible', title: BASE_COLUMN_TITLES.visible },
    { key: 'relations', title: BASE_COLUMN_TITLES.relations },
    { key: 'order', title: BASE_COLUMN_TITLES.order },
    { key: 'languageDependent', title: BASE_COLUMN_TITLES.languageDependent },
    { key: 'pattern', title: BASE_COLUMN_TITLES.pattern },
    ...languageIds.map(lang => localizedColumn('errorMessage', lang, 'error message')),
    { key: 'lov', title: BASE_COLUMN_TITLES.lov },
    { key: 'richText', title: BASE_COLUMN_TITLES.richText },
    { key: 'multiLine', title: BASE_COLUMN_TITLES.multiLine },
    { key: 'options', title: BASE_COLUMN_TITLES.options }
  ]
}

function typeNameByValue (value, attributeTypes = {}) {
  for (const [name, typeValue] of Object.entries(attributeTypes || {})) {
    if (Number(typeValue) === Number(value)) {
      return name
    }
  }
  return value === null || value === undefined ? '' : value
}

function stringifyOptions (options) {
  return Array.isArray(options) && options.length > 0 ? JSON.stringify(options) : ''
}

function joinIdentifiers (ids, resolver) {
  return (ids || [])
    .map(id => resolver ? resolver(id) : id)
    .filter(value => value !== null && value !== undefined && value !== '')
    .join(', ')
}

function readLocalizedValue (obj, lang) {
  if (!obj || typeof obj !== 'object') {
    return ''
  }
  return obj[lang] === null || obj[lang] === undefined ? '' : obj[lang]
}

function getExportValue (columnKey, group, attr, options) {
  const {
    attributeTypes,
    lovIdentifierById,
    relationIdentifierById,
    typeIdentifierById,
    visibleIdentifierById
  } = options

  if (columnKey === 'groupIdentifier') {
    return group.identifier || ''
  }
  if (columnKey === 'groupOrder') {
    return group.order === null || group.order === undefined ? '' : group.order
  }
  if (columnKey === 'groupVisible') {
    return group.visible === null || group.visible === undefined ? false : group.visible
  }
  if (columnKey === 'groupOptions') {
    return stringifyOptions(group.options)
  }
  if (columnKey === 'identifier') {
    return attr.identifier || ''
  }
  if (columnKey === 'type') {
    return typeNameByValue(attr.type, attributeTypes)
  }
  if (columnKey === 'valid') {
    return joinIdentifiers(attr.valid, typeIdentifierById)
  }
  if (columnKey === 'visible') {
    return joinIdentifiers(attr.visible, visibleIdentifierById)
  }
  if (columnKey === 'relations') {
    return joinIdentifiers(attr.relations, relationIdentifierById)
  }
  if (columnKey === 'order') {
    return attr.order === null || attr.order === undefined ? '' : attr.order
  }
  if (columnKey === 'languageDependent') {
    return attr.languageDependent === null || attr.languageDependent === undefined ? false : attr.languageDependent
  }
  if (columnKey === 'pattern') {
    return attr.pattern || ''
  }
  if (columnKey === 'lov') {
    return attr.lov ? (lovIdentifierById ? lovIdentifierById(attr.lov) : attr.lov) : ''
  }
  if (columnKey === 'richText') {
    return attr.richText === null || attr.richText === undefined ? false : attr.richText
  }
  if (columnKey === 'multiLine') {
    return attr.multiLine === null || attr.multiLine === undefined ? false : attr.multiLine
  }
  if (columnKey === 'options') {
    return stringifyOptions(attr.options)
  }

  if (columnKey.startsWith('groupName_')) {
    return readLocalizedValue(group.name, columnKey.slice('groupName_'.length))
  }
  if (columnKey.startsWith('name_')) {
    return readLocalizedValue(attr.name, columnKey.slice('name_'.length))
  }
  if (columnKey.startsWith('errorMessage_')) {
    return readLocalizedValue(attr.errorMessage, columnKey.slice('errorMessage_'.length))
  }

  return ''
}

export function buildAttributeExportTable (options) {
  const columns = createAttributeExcelColumns(options.languages, options.defaultLanguageIdentifier)
  const rows = [columns.map(column => column.title)]

  for (const group of options.groups || []) {
    for (const attr of group.attributes || []) {
      rows.push(columns.map(column => getExportValue(column.key, group, attr, options)))
    }
  }

  return { columns, rows }
}

export function applyAttributeHeaderComments (worksheet, XLSX, columns) {
  for (const [c, column] of columns.entries()) {
    const cell = worksheet[XLSX.utils.encode_cell({ c, r: 0 })]
    if (!cell) {
      continue
    }
    cell.c = [{ a: COMMENT_AUTHOR, t: column.key }]
    cell.c.hidden = true
  }
}

function readHeaderComment (cell) {
  if (!cell || !cell.c || cell.c.length === 0) {
    return ''
  }
  return (cell.c[0] && cell.c[0].t) || ''
}

function normalizeHeaderKey (value, defaultLanguageIdentifier = DEFAULT_LANG) {
  const raw = String(value || '').trim()
  if (!raw) {
    return ''
  }
  if (raw === '#delete#') {
    return 'delete'
  }

  const lower = raw.toLowerCase()
  const groupName = lower.match(/^group name\s*\(([^)]+)\)$/)
  if (groupName) {
    return `groupName_${groupName[1]}`
  }

  const name = lower.match(/^name\s*\(([^)]+)\)$/)
  if (name) {
    return `name_${name[1]}`
  }

  const errorMessage = lower.match(/^error message\s*\(([^)]+)\)$/)
  if (errorMessage) {
    return `errorMessage_${errorMessage[1]}`
  }

  const legacy = {
    'group identifier': 'groupIdentifier',
    'group name': `groupName_${defaultLanguageIdentifier}`,
    'group order': 'groupOrder',
    'group visible': 'groupVisible',
    'group options': 'groupOptions',
    identifier: 'identifier',
    name: `name_${defaultLanguageIdentifier}`,
    type: 'type',
    valid: 'valid',
    visible: 'visible',
    relations: 'relations',
    order: 'order',
    'language dependent': 'languageDependent',
    languagedependent: 'languageDependent',
    pattern: 'pattern',
    'error message': `errorMessage_${defaultLanguageIdentifier}`,
    errormessage: `errorMessage_${defaultLanguageIdentifier}`,
    lov: 'lov',
    'rich text': 'richText',
    richtext: 'richText',
    'multi line': 'multiLine',
    multiline: 'multiLine',
    options: 'options',
    groups: 'groups',
    delete: 'delete'
  }

  return legacy[lower] || raw
}

function readHeaderKey (cell, defaultLanguageIdentifier) {
  return readHeaderComment(cell) || normalizeHeaderKey(cell && cell.v, defaultLanguageIdentifier)
}

function hasValue (value) {
  return value !== null && value !== undefined && value !== ''
}

function shouldApplyValue (value, importEmptyValues) {
  return hasValue(value) || importEmptyValues
}

function asString (value) {
  if (value === null || value === undefined) {
    return ''
  }
  return String(value).trim()
}

function parseNumber (value) {
  if (!hasValue(value)) {
    return undefined
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseBoolean (value) {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'number') {
    return value !== 0
  }
  const normalized = asString(value).toLowerCase()
  if (!normalized) {
    return undefined
  }
  if (['true', '1', 'yes', 'y', 'да'].includes(normalized)) {
    return true
  }
  if (['false', '0', 'no', 'n', 'нет'].includes(normalized)) {
    return false
  }
  return undefined
}

function parseJson (value) {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return undefined
  }
  try {
    return JSON.parse(trimmed)
  } catch (e) {
    return undefined
  }
}

function parseLegacyOptions (value) {
  const raw = asString(value)
  if (!raw) {
    return []
  }
  return raw.split(',').map(part => {
    const idx = part.indexOf(':')
    if (idx === -1) {
      return null
    }
    const name = part.slice(0, idx).trim()
    const optionValue = part.slice(idx + 1).trim()
    return name ? { name, value: optionValue } : null
  }).filter(Boolean)
}

function parseOptions (value, importEmptyValues) {
  if (!hasValue(value)) {
    return importEmptyValues ? [] : undefined
  }
  const parsed = parseJson(value)
  if (Array.isArray(parsed)) {
    return parsed
  }
  return parseLegacyOptions(value)
}

function extractIdentifier (value) {
  const raw = asString(value)
  if (!raw) {
    return ''
  }
  const missingId = raw.match(/^\[\[\[\s*(.+?)\s*\]\]\]$/)
  if (missingId) {
    return missingId[1].trim()
  }
  const labelIdx = raw.indexOf(' (')
  return (labelIdx === -1 ? raw : raw.slice(0, labelIdx)).trim()
}

function parseIdentifierList (value, importEmptyValues) {
  if (!hasValue(value)) {
    return importEmptyValues ? [] : undefined
  }
  const parsed = parseJson(value)
  if (Array.isArray(parsed)) {
    return parsed.map(extractIdentifier).filter(Boolean)
  }
  return asString(value).split(',').map(extractIdentifier).filter(Boolean)
}

function parseAttributeType (value, attributeTypes = {}) {
  if (!hasValue(value)) {
    return undefined
  }
  const numeric = Number(value)
  if (Number.isFinite(numeric)) {
    return numeric
  }
  const raw = asString(value)
  for (const [name, typeValue] of Object.entries(attributeTypes || {})) {
    if (name.toLowerCase() === raw.toLowerCase()) {
      return Number(typeValue)
    }
  }
  throw new Error(`Unknown attribute type: ${raw}`)
}

function mergeOptions (existing = [], incoming = []) {
  const byName = new Map()
  for (const option of existing || []) {
    if (option && option.name) {
      byName.set(option.name, option)
    }
  }
  for (const option of incoming || []) {
    if (option && option.name) {
      byName.set(option.name, option)
    }
  }
  return Array.from(byName.values())
}

function readSheetRows (worksheet, XLSX, defaultLanguageIdentifier) {
  const ref = worksheet['!ref']
  if (!ref) {
    return { headers: [], rows: [] }
  }
  const range = XLSX.utils.decode_range(ref)
  const headers = []
  for (let c = range.s.c; c <= range.e.c; c++) {
    headers[c] = readHeaderKey(worksheet[XLSX.utils.encode_cell({ c, r: range.s.r })], defaultLanguageIdentifier)
  }

  const rows = []
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    const row = {}
    let empty = true
    for (let c = range.s.c; c <= range.e.c; c++) {
      const key = headers[c]
      if (!key) {
        continue
      }
      const cell = worksheet[XLSX.utils.encode_cell({ c, r })]
      const value = cell && cell.v
      if (hasValue(value)) {
        empty = false
      }
      row[key] = value
    }
    if (!empty) {
      rows.push(row)
    }
  }
  return { headers, rows }
}

function assignLocalized (target, prefix, row, importEmptyValues) {
  for (const [key, value] of Object.entries(row)) {
    if (!key.startsWith(prefix)) {
      continue
    }
    if (!shouldApplyValue(value, importEmptyValues)) {
      continue
    }
    const lang = key.slice(prefix.length)
    if (!lang) {
      continue
    }
    if (!target.name) {
      target.name = {}
    }
    target.name[lang] = asString(value)
  }
}

function assignErrorMessage (target, row, importEmptyValues) {
  for (const [key, value] of Object.entries(row)) {
    if (!key.startsWith('errorMessage_')) {
      continue
    }
    if (!shouldApplyValue(value, importEmptyValues)) {
      continue
    }
    const lang = key.slice('errorMessage_'.length)
    if (!lang) {
      continue
    }
    if (!target.errorMessage) {
      target.errorMessage = {}
    }
    target.errorMessage[lang] = asString(value)
  }
}

function setIfPresent (target, key, value, importEmptyValues, parser = data => data) {
  if (!shouldApplyValue(value, importEmptyValues)) {
    return
  }
  const parsed = parser(value, importEmptyValues)
  if (parsed !== undefined) {
    target[key] = parsed
  }
}

export function parseAttributeImportSheet (worksheet, XLSX, options = {}) {
  const {
    attributeTypes = {},
    defaultLanguageIdentifier = DEFAULT_LANG,
    importEmptyValues = false
  } = options
  const { rows } = readSheetRows(worksheet, XLSX, defaultLanguageIdentifier)
  const attrGroupsByIdentifier = new Map()
  const attributesByIdentifier = new Map()

  for (const row of rows) {
    const groupIdentifier = extractIdentifier(row.groupIdentifier)
    if (groupIdentifier) {
      const group = attrGroupsByIdentifier.get(groupIdentifier) || { identifier: groupIdentifier }
      assignLocalized(group, 'groupName_', row, importEmptyValues)
      setIfPresent(group, 'order', row.groupOrder, importEmptyValues, parseNumber)
      setIfPresent(group, 'visible', row.groupVisible, importEmptyValues, parseBoolean)
      setIfPresent(group, 'options', row.groupOptions, importEmptyValues, parseOptions)
      attrGroupsByIdentifier.set(groupIdentifier, group)
    }

    const identifier = extractIdentifier(row.identifier)
    if (!identifier) {
      continue
    }

    const attr = attributesByIdentifier.get(identifier) || { identifier }
    assignLocalized(attr, 'name_', row, importEmptyValues)
    assignErrorMessage(attr, row, importEmptyValues)
    setIfPresent(attr, 'type', row.type, importEmptyValues, value => parseAttributeType(value, attributeTypes))
    setIfPresent(attr, 'valid', row.valid, importEmptyValues, parseIdentifierList)
    setIfPresent(attr, 'visible', row.visible, importEmptyValues, parseIdentifierList)
    setIfPresent(attr, 'relations', row.relations, importEmptyValues, parseIdentifierList)
    setIfPresent(attr, 'order', row.order, importEmptyValues, parseNumber)
    setIfPresent(attr, 'languageDependent', row.languageDependent, importEmptyValues, parseBoolean)
    setIfPresent(attr, 'pattern', row.pattern, importEmptyValues, asString)
    setIfPresent(attr, 'lov', row.lov, importEmptyValues, extractIdentifier)
    setIfPresent(attr, 'richText', row.richText, importEmptyValues, parseBoolean)
    setIfPresent(attr, 'multiLine', row.multiLine, importEmptyValues, parseBoolean)
    setIfPresent(attr, 'delete', row.delete, importEmptyValues, parseBoolean)

    const optionsValue = parseOptions(row.options, importEmptyValues)
    if (optionsValue) {
      attr.options = mergeOptions(attr.options, optionsValue)
    }

    const groups = new Set(attr.groups || [])
    if (groupIdentifier) {
      groups.add(groupIdentifier)
    }
    const rowGroups = parseIdentifierList(row.groups, false)
    for (const group of rowGroups || []) {
      groups.add(group)
    }
    if (groups.size > 0) {
      attr.groups = Array.from(groups)
    }

    attributesByIdentifier.set(identifier, attr)
  }

  return {
    attrGroups: Array.from(attrGroupsByIdentifier.values()),
    attributes: Array.from(attributesByIdentifier.values())
  }
}
