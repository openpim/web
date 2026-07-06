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
        const mappingKey = getMappingStorageKey(mapping, prop)
        obj.children.push({
          id: channelId + '_' + mappingKey,
          name: mapping.name,
          mapping: mapping
        })
      }
    }

    data.push(obj)
  }

  return data
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
