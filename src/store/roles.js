import { reactive, provide, inject } from '@vue/composition-api'
import { serverFetch, objectToGraphgl } from './utils'

const roles = reactive([])

function roleId (role) {
  return role.internalId || role.id
}

function sameId (left, right) {
  return String(left) === String(right)
}

function sortRoles (items) {
  return items.sort((a, b) => {
    const order = (a.order || 0) - (b.order || 0)
    return order || a.name.localeCompare(b.name)
  })
}

function buildRoleTree (items, search) {
  const searchTerm = search ? search.toLowerCase() : ''
  const groups = items.filter(role => role.group).map(group => {
    const children = items.filter(role => !role.group && (role.parentIds || []).some(id => sameId(id, roleId(group))))
    return { ...group, children: sortRoles(children) }
  })

  const singles = items.filter(role => !role.group && (!(role.parentIds) || role.parentIds.length === 0))
  if (!searchTerm) return { groups: sortRoles(groups), singles: sortRoles(singles) }

  const matches = role => role.identifier.toLowerCase().includes(searchTerm) || role.name.toLowerCase().includes(searchTerm)
  const filteredGroups = groups.reduce((result, group) => {
    if (matches(group)) {
      result.push(group)
    } else {
      const children = group.children.filter(matches)
      if (children.length > 0) result.push({ ...group, children })
    }
    return result
  }, [])

  return {
    groups: sortRoles(filteredGroups),
    singles: sortRoles(singles.filter(matches))
  }
}

function expandRoleIds (selectedIds) {
  const result = []
  const add = id => {
    const role = roles.find(item => sameId(roleId(item), id))
    if (role && !role.group && !result.some(item => sameId(item, roleId(role)))) result.push(roleId(role))
  }

  selectedIds.forEach(id => {
    const role = roles.find(item => sameId(roleId(item), id))
    if (role && role.group) {
      roles.filter(item => !item.group && (item.parentIds || []).some(parentId => sameId(parentId, roleId(role)))).forEach(item => add(roleId(item)))
    } else {
      add(id)
    }
  })
  return result
}

let promise
const actions = {
  loadAllRoles: async () => {
    if (!promise) promise = serverFetch('query { getRoles {id, internalId, identifier, name, order, parentIds, group, configAccess, relAccess, itemAccess, channelAccess, otherAccess, options, updatedAt, updatedBy, createdAt, createdBy } }')
    const data = await promise
    if (roles.length > 0) return
    if (data && data.getRoles) {
      if (roles.length > 0) return
      data.getRoles.forEach(element => {
        roles.push(element)
      })
    } else {
      promise = null
    }
  },
  addRole: (group = false, parentIds = []) => {
    const newRole = {
      id: Date.now(),
      internalId: 0,
      name: '',
      order: 0,
      parentIds: group ? [] : parentIds,
      group,
      configAccess: { types: 0, attributes: 0, relations: 0, users: 0, roles: 0, languages: 0, lovs: 0, actions: 0, dashboards: 0, channels: 0, importConfigs: 0, templates: 0 },
      relAccess: { relations: [], access: 0, groups: [] },
      itemAccess: { valid: [], fromItems: [], access: 0, groups: [] },
      channelAccess: [],
      otherAccess: { audit: false, search: false, exportCSV: false, exportXLS: false, importXLS: false },
      options: []
    }
    roles.push(newRole)
    return newRole
  },
  saveRole: async (role) => {
    if (role.internalId === 0) {
      const query = `
        mutation { createRole(identifier: "` + role.identifier + '", name: "' + role.name +
        '", order: ' + role.order +
        ', parentIds: ' + JSON.stringify(role.parentIds || []) +
        ', group: ' + role.group +
        ', configAccess: ' + objectToGraphgl(role.configAccess) +
        ', relAccess: ' + objectToGraphgl(role.relAccess) +
        ', itemAccess: ' + objectToGraphgl(role.itemAccess) +
        ', channelAccess: ' + objectToGraphgl(role.channelAccess) +
        ', otherAccess: ' + objectToGraphgl(role.otherAccess) +
        ', options: ' + objectToGraphgl(role.options) + ` )
      }`
      const data = await serverFetch(query)
      const newId = parseInt(data.createRole)
      const oldId = role.id
      role.internalId = newId
      role.id = newId
      roles.forEach(item => {
        if (item.parentIds) item.parentIds = item.parentIds.map(id => sameId(id, oldId) ? newId : id)
      })
    } else {
      const query = `
        mutation { updateRole(id: "` + role.internalId + '", name: "' + role.name +
        '", order: ' + role.order +
        ', parentIds: ' + JSON.stringify(role.parentIds || []) +
        ', group: ' + role.group +
        ', configAccess: ' + (role.configAccess ? objectToGraphgl(role.configAccess) : '') +
        ', relAccess: ' + objectToGraphgl(role.relAccess) +
        ', itemAccess: ' + objectToGraphgl(role.itemAccess) +
        ', channelAccess: ' + objectToGraphgl(role.channelAccess) +
        ', otherAccess: ' + objectToGraphgl(role.otherAccess) +
        ', options: ' + objectToGraphgl(role.options) + ` )
      }`
      await serverFetch(query)
    }
    return role.internalId
  },
  removeRole: async (id) => {
    const idx = roles.findIndex((elem) => elem.id === id)

    if (roles[idx].internalId !== 0) {
      const query = `
        mutation { removeRole(id: "` + roles[idx].internalId + `")
      }`
      await serverFetch(query)
    }
    roles.splice(idx, 1)
  }
}

const store = {
  roles: roles,
  roleId,
  sameId,
  buildRoleTree,
  expandRoleIds,
  ...actions
}

export { store }

const StoreSymbol = Symbol('RolesStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject RolesStore')
  }
  return tst
}
