import { reactive, provide, inject } from '@vue/composition-api'
import { serverFetch, objectToGraphgl } from './utils'
import * as userStore from './users'

const groups = reactive([])

const RELATION_ATTRIBUTE_TYPE = 9

function parsePath (path) {
  if (!path) return []
  return path.split('.').map(elem => parseInt(elem)).filter(elem => !isNaN(elem))
}

function getStoredRelationPaths (item, relationId) {
  if (!item || !item.relations || typeof item.relations !== 'object') return []
  const rawPaths = item.relations[String(relationId)]
  if (!Array.isArray(rawPaths)) return []
  return rawPaths.map(parsePath).filter(pathArr => pathArr.length > 0)
}

function isAttributeVisibleForItem (attr, item, pathArr) {
  const typeId = parseInt(item.typeId)
  if (!attr.valid.includes(typeId)) return false
  if (!attr.visible || attr.visible.length === 0) return false

  let paths = [pathArr]
  if (attr.type !== RELATION_ATTRIBUTE_TYPE && attr.relations && attr.relations.length > 0) {
    paths = attr.relations.flatMap(relationId => getStoredRelationPaths(item, relationId))
    if (paths.length === 0) return false
  }

  return paths.some(path => path.some(id => attr.visible.indexOf(id) !== -1))
}

function findByComparator (id, comparator, onlyFirst, skipGroups) {
  const arr = []
  let item = null
  for (var i = 0; i < groups.length; i++) {
    const group = groups[i]
    if (!skipGroups && comparator(id, group)) {
      return { item: group, itemIdx: i }
    }
    for (var j = 0; j < group.attributes.length; j++) {
      const attr = group.attributes[j]
      if (comparator(id, attr)) {
        item = attr
        if (onlyFirst) return { item: item, groups: [group] }
        arr.push(group)
      }
    }
  }
  return item ? { item: item, groups: arr } : null
}
let attrsPromise
const actions = {
  loadAllAttributes: async (force) => {
    if (force) {
      attrsPromise = null
    }
    if (!attrsPromise) attrsPromise = serverFetch('query { getAttributesInfo }')
    const data = await attrsPromise
    if (!force && groups.length > 0) return
    if (force) {
      groups.splice(0, groups.length)
    }
    if (data.getAttributesInfo) {
      data.getAttributesInfo.forEach(element => {
        element.attributes = element.attributes.sort((a, b) => a.order - b.order)
        groups.push(element)
      })
      groups.sort((a, b) => a.order - b.order)
    }
  },
  findById: (id) => {
    return findByComparator(id, (id, item) => item.id === id)
  },
  findByInternalId: (internalId) => {
    return findByComparator(internalId, (internalId, item) => item.internalId === internalId, true, true)
  },
  findByIdentifier: (identifier, onlyFirst) => {
    return findByComparator(identifier, (identifier, item) => item.identifier === identifier, onlyFirst)
  },
  checkIdentifier: (identifier) => {
    return findByComparator(identifier, (identifier, item) => item.identifier === identifier && item.internalId !== 0)
  },
  saveData: async (item, groupId) => {
    if (item.internalId === 0) {
      let query
      let newId
      if (item.group) {
        query = `
          mutation { createAttributeGroup(identifier: "` + item.identifier + '", name: ' + objectToGraphgl(item.name) +
          ', visible: ' + item.visible +
          ', order: ' + item.order +
          ', options: ' + objectToGraphgl(item.options) + ` )
        }`
        const data = await serverFetch(query)
        newId = parseInt(data.createAttributeGroup)
      } else {
        let grpId = groupId
        if (!groupId) {
          const attrData = findByComparator(item.id, (id, item) => item.id === id)
          grpId = attrData.groups[0].internalId
        }
        query = `
          mutation { createAttribute(identifier: "` + item.identifier + '", name: ' + objectToGraphgl(item.name) +
          ', groupId: "' + grpId +
          '", order: ' + item.order +
          ', languageDependent: ' + item.languageDependent +
          ', type: ' + item.type +
          (typeof (item.pattern) !== 'undefined' ? ', pattern: """' + item.pattern + '"""' : '') +
          (item.errorMessage ? ', errorMessage: ' + objectToGraphgl(item.errorMessage) : '') +
          (typeof (item.richText) !== 'undefined' ? ', richText: ' + item.richText : '') +
          (typeof (item.multiLine) !== 'undefined' ? ', multiLine: ' + item.multiLine : '') +
          (item.lov ? ', lov: ' + item.lov : '') +
          ', valid: [' + (item.valid || []) +
          '], visible: [' + (item.visible || []) +
          '], relations: [' + (item.relations || []) +
          '], options: ' + objectToGraphgl(item.options) + ` )
        }`
        const data = await serverFetch(query)
        newId = parseInt(data.createAttribute)
      }
      item.internalId = newId
    } else {
      let query
      if (item.group) {
        query = `
          mutation { updateAttributeGroup(id: "` + item.internalId + '", name: ' + (item.name ? objectToGraphgl(item.name) : '') +
          ', visible: ' + item.visible +
          ', order: ' + item.order +
          ', options: ' + objectToGraphgl(item.options) + ` )
        }`
      } else {
        query = `
          mutation { updateAttribute(id: "` + item.internalId + '", name: ' + (item.name ? objectToGraphgl(item.name) : '') +
          ', order: ' + item.order +
          ', languageDependent: ' + item.languageDependent +
          ', type: ' + item.type +
          (typeof (item.pattern) !== 'undefined' ? ', pattern: """' + item.pattern + '"""' : '') +
          (item.errorMessage ? ', errorMessage: ' + objectToGraphgl(item.errorMessage) : '') +
          (typeof (item.richText) !== 'undefined' ? ', richText: ' + item.richText : '') +
          (typeof (item.multiLine) !== 'undefined' ? ', multiLine: ' + item.multiLine : '') +
          (item.lov ? ', lov: ' + item.lov : '') +
          ', valid: [' + (item.valid || []) +
          '], visible: [' + (item.visible || []) +
          '], relations: [' + (item.relations || []) +
          '], options: ' + objectToGraphgl(item.options) + ` )
        }`
      }
      await serverFetch(query)
    }
  },
  assignData: async (attr, group) => {
    const newAttr = {}
    Object.assign(newAttr, attr)
    newAttr.id = Date.now()
    group.attributes.push(newAttr)

    const query = `
    mutation { assignAttribute(id: "` + attr.internalId + '", groupId: "' + group.internalId +
      `")
    }`
    await serverFetch(query)
  },
  removeGroup: async (id) => {
    const data = findByComparator(id, (id, item) => item.id === id)
    if (data) {
      groups.splice(data.itemIdx, 1)
      if (data.item.internalId !== 0) {
        const query = `
          mutation { removeAttributeGroup(id: "` + data.item.internalId + `")
        }`
        await serverFetch(query)
      }
    }
  },
  removeAttribute: async (id, full) => {
    let data = findByComparator(id, (id, item) => item.id === id)
    const fullData = findByComparator(data.item.identifier, (identifier, item) => item.identifier === identifier)
    if (data.item.internalId !== 0) {
      if (!full && fullData.groups.length > 1) {
        const query = `
        mutation { unassignAttribute(id: "` + data.item.internalId + '", groupId: "' + data.groups[0].internalId +
          `")
        }`
        await serverFetch(query)
      } else {
        const query = `
          mutation { removeAttribute(id: "` + data.item.internalId + `")
        }`
        await serverFetch(query)
        data = fullData
      }
    }

    data.groups.forEach((grp) => {
      if (!full && fullData.groups.length > 1) {
        if (grp.id !== data.groups[0].internalId) return
      }
      const idx = grp.attributes.findIndex(item => item.identifier === data.item.identifier)
      grp.attributes.splice(idx, 1)
    })
  },
  getAttributesForSearch: () => {
    const res = []
    groups.forEach(group => {
      if (group.visible) {
        group.attributes.forEach(attr => {
          if (attr.options) {
            const tst = attr.options.find(elem => elem.name === 'search')
            if (tst && tst.value === 'true' && !res.find(elem => elem.id === attr.id)) res.push(attr)
          }
        })
      }
    })
    return res
  },
  getAttributesForItem: (item) => {
    const typeId = parseInt(item.typeId)
    const groupsArr = []
    const pathArr = parsePath(item.path)
    groups.forEach(group => {
      if (group.visible) {
        const roles = userStore.store.currentRoles
        let access = -1
        for (let i = 0; i < roles.length; i++) {
          const role = roles[i]
          if (role.itemAccess.valid.find(tId => tId === typeId)) {
            if (pathArr.some(r => role.itemAccess.fromItems.indexOf(r) !== -1)) {
              const tst = role.itemAccess.groups.find(data => data.groupId === group.id)
              if (tst && tst.access > access) access = tst.access
            }
          }
        }

        if (access === -1 || access > 0) {
          const attrArr = []
          group.attributes.forEach(attr => {
            if (!isAttributeVisibleForItem(attr, item, pathArr)) return
            attr.readonly = (access === 1)
            attrArr.push(attr)
          })
          if (attrArr.length > 0) {
            attrArr.sort((a, b) => a.order - b.order)
            group.itemAttributes = attrArr
            groupsArr.push(group)
          }
        }
      }
    })
    return groupsArr.sort((a, b) => a.order - b.order)
  },
  getAllItemsAttributes: () => {
    return actions.getAllItemsAttributes2(true)
  },
  getAllItemsAttributes2: (checkGroupVisible) => {
    const attrArr = []
    const addedAttrs = {}
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i]
      if (!checkGroupVisible || (checkGroupVisible && group.visible)) {
        for (let k = 0; k < group.attributes.length; k++) {
          const attr = group.attributes[k]
          if (attr.valid.length > 0) {
            if (!addedAttrs[attr.identifier]) {
              const tmp = { ...attr }
              tmp.linkToGroup = group
              attrArr.push(tmp)
              addedAttrs[attr.identifier] = true
            }
          }
        }
      }
    }
    if (attrArr.length > 0) {
      attrArr.sort((a, b) => a.order - b.order)
    }
    return attrArr
  },
  getAllItemRelationsAttributes: () => {
    const attrArr = []
    const addedAttrs = {}
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i]
      if (group.visible) {
        group.attributes.forEach(attr => {
          if (attr.relations.length > 0) {
            if (!addedAttrs[attr.identifier]) {
              const tmp = { ...attr }
              tmp.linkToGroup = group
              attrArr.push(tmp)
              addedAttrs[attr.identifier] = true
            }
          }
        })
      }
    }
    if (attrArr.length > 0) {
      attrArr.sort((a, b) => a.order - b.order)
    }
    return attrArr
  },
  importAttributeConfig: async ({ attrGroups = [], attributes = [] }, mode) => {
    const importMode = mode || 'UPDATE_ONLY'
    const toGraphqlValue = value => {
      const result = objectToGraphgl(value)
      return typeof result === 'string' ? result.replace(/,$/, '').replace(/,\s*]$/, ']') : result
    }
    let query = `
      mutation { import(
        config: {
            mode: ${importMode}
            errors: PROCESS_WARN
        }`
    if (attrGroups.length > 0) {
      query += `,
        attrGroups: ${toGraphqlValue(attrGroups)}`
    }
    if (attributes.length > 0) {
      query += `,
        attributes: ${toGraphqlValue(attributes)}`
    }
    query += `
        ) {
        `
    if (attrGroups.length > 0) {
      query += `attrGroups {
        identifier
        result
        id
        errors { code message }
        warnings { code message }
      }
        `
    }
    if (attributes.length > 0) {
      query += `
        attributes {
        identifier
        result
        id
        errors { code message }
        warnings { code message }
      }
        `
    }
    query += `}}
    `
    const data = await serverFetch(query)
    return {
      attrGroups: data.import.attrGroups || [],
      attributes: data.import.attributes || []
    }
  },
  importAttributes: async (rows, mode) => {
    const data = await actions.importAttributeConfig({ attributes: rows }, mode)
    return data.attributes
  },
  getAvailableItemsForRelationAttr: async (attr, val, searchStr, langIdentifier, limit, offset, order) => {
    let ids = []
    if (Array.isArray(val)) {
      ids = ids.concat(val)
    } else if (val && val !== '') {
      ids.push(val)
    }
    let data
    if (searchStr) {
      data = await serverFetch(`query { getItemsForRelationAttribute (attrIdentifier: "${attr.identifier}", value: [ ${ids} ], searchStr: "${searchStr}", langIdentifier: "${langIdentifier}", limit: ${limit}, offset: ${offset}, order: "${order}") { id, identifier, name, values } }`)
    } else {
      data = await serverFetch(`query { getItemsForRelationAttribute (attrIdentifier: "${attr.identifier}", value: [ ${ids} ], langIdentifier: "${langIdentifier}", limit: ${limit}, offset: ${offset}, order: "${order}") { id, identifier, name, values } }`)
    }
    data.getItemsForRelationAttribute = data.getItemsForRelationAttribute.map(el => ({ id: parseInt(el.id), identifier: el.identifier, name: el.name, values: el.values }))
    return data
  },
  getAttributeValues: async (attrIdentifier, limit, offset) => {
    const data = await serverFetch(`query { getAttributeValues (attrIdentifier: "${attrIdentifier}", limit: ${limit}, offset: ${offset}) { rows, total} }`)
    return data.getAttributeValues
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  groups,
  ...actions
}

export { store }

const StoreSymbol = Symbol('AttributesStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject AttributesStore')
  }
  return tst
}
