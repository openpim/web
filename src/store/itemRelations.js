import { reactive, provide, inject } from '@vue/composition-api'
import { serverFetch, objectToGraphgl } from './utils'
import * as relStore from './relations'
import * as attrStore from './attributes'
import * as userStore from './users'

const sourceRelations = reactive({})
const targetRelations = reactive({})

const sourceRelationsTotal = reactive({})
const targetRelationsTotal = reactive({})

const attrCache = {}

function isString (obj) {
  return (Object.prototype.toString.call(obj) === '[object String]')
}

function createLanguageDependentValues (relId, rows) {
  const attrs = actions.getAttributesForRelationId(relId)
  attrs.forEach(attr => {
    rows.forEach(itemRel => {
      if (!itemRel.values) itemRel.values = {}
      if (attr.languageDependent) {
        const attrValue = itemRel.values[attr.identifier] && !isString(itemRel.values[attr.identifier]) ? itemRel.values[attr.identifier] : {}
        itemRel.values[attr.identifier] = attrValue
      }
    })
  })
}

const actions = {
  loadSourceRelations: async (item, root, offset, limit) => {
    let relations = relStore.store.relations
    if (relations.length === 0) {
      await relStore.store.loadAllRelations()
    }
    relations = relations.filter(relation => userStore.store.canViewItemRelation(relation.internalId))
    relations.sort((a, b) => a.order - b.order)

    for (let i = 0; i < relations.length; i++) {
      const rel = relations[i]
      if (rel.sources.find(id => id === parseInt(item.typeId))) {
        const res = await serverFetch('query { getSourceRelations(itemId: ' + item.id +
        ', relationId:' + rel.id +
        ', offset:' + offset +
        ', limit:' + limit +
        `) 
        { count,
          rows 
          { 
            id 
            identifier
            relationId
            createdBy
            createdAt
            updatedBy
            updatedAt
            item {
              id
              identifier
              name
              updatedAt
            }
            target {
                id
                identifier
                name
                updatedAt
              }
            values
          }
        } }`)
        const itemRels = res.getSourceRelations
        if (itemRels && itemRels.count > 0) {
          createLanguageDependentValues(rel.id, itemRels.rows)
          root.$set(sourceRelations, rel.identifier, itemRels.rows)
          root.$set(sourceRelationsTotal, rel.identifier, itemRels.count)
        } else {
          root.$set(sourceRelations, rel.identifier, [])
          root.$set(sourceRelationsTotal, rel.identifier, 0)
        }
      } else {
        root.$delete(sourceRelations, rel.identifier)
        root.$delete(sourceRelationsTotal, rel.identifier)
      }
    }
  },
  loadSourcePage: async (item, root, identifier, offset, limit) => {
    const relations = relStore.store.relations
    const rel = relations.find(rel => rel.identifier === identifier)
    const res = await serverFetch('query { getSourceRelations(itemId: ' + item.id +
        ', relationId:' + rel.id +
        ', offset:' + offset +
        ', limit:' + limit +
        `) 
        { count,
          rows 
          { 
            id 
            identifier
            relationId
            createdBy
            createdAt
            updatedBy
            updatedAt
            item {
              id
              identifier
              name
              updatedAt
            }
            target {
                id
                identifier
                name
                updatedAt
              }
            values
          }
        } }`)
    const itemRels = res.getSourceRelations
    if (itemRels && itemRels.count > 0) {
      createLanguageDependentValues(rel.id, itemRels.rows)
      root.$set(sourceRelations, identifier, itemRels.rows)
    } else {
      root.$set(sourceRelations, identifier, [])
    }
  },
  loadTargetRelations: async (item, root, offset, limit) => {
    let relations = relStore.store.relations
    if (relations.length === 0) {
      await relStore.store.loadAllRelations()
    }
    relations = relations.filter(relation => userStore.store.canViewItemRelation(relation.internalId))
    relations.sort((a, b) => a.order - b.order)

    for (let i = 0; i < relations.length; i++) {
      const rel = relations[i]
      if (rel.targets.find(id => id === parseInt(item.typeId))) {
        const res = await serverFetch('query { getTargetRelations(itemId: ' + item.id +
        ', relationId:' + rel.id +
        ', offset:' + offset +
        ', limit:' + limit +
        `) 
        { count,
          rows 
          { 
            id 
            identifier
            relationId
            createdBy
            createdAt
            updatedBy
            updatedAt
            item {
              id
              identifier
              name
              updatedAt
            }
            target {
                id
                identifier
                name
                updatedAt
              }
            values
          }
        } }`)
        const itemRels = res.getTargetRelations
        if (itemRels && itemRels.count > 0) {
          createLanguageDependentValues(rel.id, itemRels.rows)
          root.$set(targetRelations, rel.identifier, itemRels.rows)
          root.$set(targetRelationsTotal, rel.identifier, itemRels.count)
        } else {
          root.$set(targetRelations, rel.identifier, [])
          root.$set(targetRelationsTotal, rel.identifier, 0)
        }
      } else {
        root.$delete(targetRelations, rel.identifier)
        root.$delete(targetRelationsTotal, rel.identifier)
      }
    }
  },
  loadTargetPage: async (item, root, identifier, offset, limit) => {
    const relations = relStore.store.relations
    const rel = relations.find(rel => rel.identifier === identifier)
    const res = await serverFetch('query { getTargetRelations(itemId: ' + item.id +
        ', relationId:' + rel.id +
        ', offset:' + offset +
        ', limit:' + limit +
        `) 
        { count,
          rows 
          { 
            id 
            identifier
            relationId
            createdBy
            createdAt
            updatedBy
            updatedAt
            item {
              id
              identifier
              name
              updatedAt
            }
            target {
                id
                identifier
                name
                updatedAt
              }
            values
          }
        } }`)
    const itemRels = res.getTargetRelations
    if (itemRels && itemRels.count > 0) {
      createLanguageDependentValues(rel.id, itemRels.rows)
      root.$set(targetRelations, identifier, itemRels.rows)
    } else {
      root.$set(targetRelations, identifier, [])
    }
  },
  getAttributesForRelationId (relationId) {
    const tst = attrCache[relationId]
    if (tst) return tst

    const attrs = []
    const groups = attrStore.store.groups
    for (var i = 0; i < groups.length; i++) {
      const group = groups[i]

      const roles = userStore.store.currentRoles
      let access = 2
      for (let i = 0; i < roles.length; i++) {
        const role = roles[i]
        if (role.relAccess.relations.find(id => id === relationId)) {
          const tst = role.relAccess.groups.find(data => data.groupId === group.id)
          if (tst && tst.access < access) access = tst.access
        }
      }

      for (var j = 0; j < group.attributes.length; j++) {
        const attr = group.attributes[j]
        if (attr.relations && attr.relations.find(relId => relId === relationId)) {
          const idx = attrs.findIndex(elem => elem.identifier === attr.identifier)
          if (idx === -1) {
            if (access > 0) {
              attr.readonly = (access === 1)
              attrs.push(attr)
            }
          } else {
            if (access === 0) {
              attrs.splice(idx, 1)
            } else {
              if (!attrs[idx].readonly) attrs[idx].readonly = (access === 1)
            }
          }
        }
      }
    }

    attrCache[relationId] = attrs
    return attrs
  },
  identifierExists: async (identifier) => {
    const data = await serverFetch('query { getItemRelationByIdentifier(identifier: "' + identifier + `") { 
      id 
    } }`)
    if (data.getItemRelationByIdentifier) {
      return true
    } else {
      return false
    }
  },
  saveItemRelation: async (itemRel) => {
    if (itemRel.id === -1) {
      const query = `
        mutation { createItemRelation(identifier: "` + itemRel.identifier + '", itemId: ' + itemRel.item.id +
        ', relationId: ' + itemRel.relationId +
        ', targetId: ' + itemRel.target.id +
        ', values: ' + objectToGraphgl(itemRel.values) +
        `)
      }`
      const data = await serverFetch(query)
      const newId = parseInt(data.createItemRelation)
      itemRel.id = newId
    } else {
      const query = `
        mutation { updateItemRelation(id: "` + itemRel.id +
        '", targetId: ' + itemRel.target.id +
        ', values: ' + objectToGraphgl(itemRel.values) +
        `)
      }`
      await serverFetch(query)
    }
  },
  removeItemRelation: async (componentType, identifier, id) => {
    const itemRels = componentType === 'source' ? sourceRelations : targetRelations
    const idx = itemRels[identifier].findIndex(elem => elem.id === id)
    const itemRel = itemRels[identifier][idx]

    if (itemRel.id !== -1) {
      const query = `
        mutation { removeItemRelation(id: "` + itemRel.id + `")
      }`
      await serverFetch(query)
    }
    itemRels[identifier].splice(idx, 1)
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  sourceRelations: sourceRelations,
  targetRelations: targetRelations,
  sourceRelationsTotal: sourceRelationsTotal,
  targetRelationsTotal: targetRelationsTotal,
  ...actions
}

export { store }

const StoreSymbol = Symbol('ItemRelatonsStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject ItemRelationsStore')
  }
  return tst
}
