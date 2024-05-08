import { reactive, provide, inject } from '@vue/composition-api'
import { serverFetch, objectToGraphgl } from './utils'
import * as userStore from './users'

const groups = reactive([])

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
  loadAllAttributes: async () => {
    if (!attrsPromise) attrsPromise = serverFetch('query { getAttributesInfo }')
    const data = await attrsPromise
    if (groups.length > 0) return
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
  getAttributesForItem: (typeId, path) => {
    typeId = parseInt(typeId)
    const groupsArr = []
    const pathArr = path.split('.').map(elem => parseInt(elem))
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
            if (attr.valid.includes(typeId)) {
              if (pathArr.some(r => attr.visible.indexOf(r) !== -1)) {
                attr.readonly = (access === 1)
                attrArr.push(attr)
              }
            }
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
  importAttributes: async (rows, mode) => {
    let query = `
      mutation { import(
        config: {
            mode: UPDATE_ONLY
            errors: PROCESS_WARN
        },
        attributes: [`
    rows.forEach(row => {
      query += objectToGraphgl(row)
    })
    query += `]
        ) {
        attributes {
        identifier
        result
        id
        errors { code message }
        warnings { code message }
      }}}
    `
    const data = await serverFetch(query)
    return data.import.attributes
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
