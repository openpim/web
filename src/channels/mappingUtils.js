export function getMappingStorageKey (mapping, fallbackKey) {
  const key = mapping?.key ?? fallbackKey ?? mapping?.id
  return key == null ? '' : String(key)
}

function getLocalizedName (name, currentLanguageIdentifier, defaultLanguageIdentifier, fallback = '') {
  if (typeof name === 'string') {
    return name
  }

  const currentName = currentLanguageIdentifier ? name?.[currentLanguageIdentifier] : null
  if (currentName) {
    return currentName
  }

  const defaultName = defaultLanguageIdentifier ? name?.[defaultLanguageIdentifier] : null
  if (defaultName) {
    return '[' + defaultName + ']'
  }

  return fallback
}

export function buildChannelMappingCopyItems (channels, currentLanguageIdentifier, defaultLanguageIdentifier) {
  const data = []

  for (const channel of channels || []) {
    const channelId = String(channel.id)
    const obj = {
      id: 'CHAN_' + channelId,
      name: getLocalizedName(channel.name, currentLanguageIdentifier, defaultLanguageIdentifier, channelId),
      channel: channel,
      children: []
    }

    if (channel.mappings) {
      for (const prop in channel.mappings) {
        const mapping = channel.mappings[prop]
        if (!mapping || mapping.deleted) continue
        const mappingKey = getMappingStorageKey(mapping, prop)
        obj.children.push({
          id: channelId + '_' + mappingKey,
          name: getLocalizedName(mapping.name, currentLanguageIdentifier, defaultLanguageIdentifier, mappingKey),
          mapping: mapping
        })
      }
    }

    data.push(obj)
  }

  return data
}

export function copyCategoryAttributeSettings (source, target) {
  if (!Array.isArray(source?.attributes) || !Array.isArray(target?.attributes)) return
  const identity = row => row?.value != null && row.value !== ''
    ? 'value:' + String(row.value)
    : row?.id != null ? 'id:' + String(row.id) : null
  const sources = new Map()
  for (const row of JSON.parse(JSON.stringify(source.attributes))) {
    const key = identity(row)
    if (!key) continue
    if (!sources.has(key)) sources.set(key, [])
    sources.get(key).push(row)
  }
  const ordinals = new Map()
  target.attributes.forEach((row, index) => {
    const key = identity(row)
    const ordinal = ordinals.get(key) || 0
    ordinals.set(key, ordinal + 1)
    const copied = sources.get(key)?.[ordinal]
    if (!copied) return
    const replacement = { ...row }
    for (const field of ['attrIdent', 'expr', 'mapping', 'options', 'useOzonOnUpdate', 'useYandexOnUpdate']) {
      if (Object.prototype.hasOwnProperty.call(copied, field)) replacement[field] = copied[field]
      else delete replacement[field]
    }
    target.attributes.splice(index, 1, replacement)
  })
}

export function findChannelMappingBySelection (items, selectedValue) {
  if (selectedValue == null) {
    return null
  }
  const selected = String(selectedValue)

  for (const channel of items || []) {
    for (const mappingNode of channel.children || []) {
      if (String(mappingNode.id) === selected) {
        return mappingNode.mapping
      }
    }
  }

  return null
}

export function getChannelAttributeCategoryId (channelType, categoryId) {
  if (channelType !== 9 || categoryId == null) {
    return categoryId
  }

  const match = String(categoryId).trim().match(/^ymcat_(\d+)(?:_\d+)?$/u)
  return match ? match[1] : categoryId
}
