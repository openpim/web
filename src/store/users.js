import { reactive, ref, provide, inject } from '@vue/composition-api'
import router from '../router'
import * as err from './error'
import { serverFetch, objectToGraphgl } from './utils'
import * as rolesStore from './roles'
import i18n from '../i18n'

const users = reactive([])
const currentUserRef = ref(null)
const currentRoles = reactive([])

async function userLogin (token, user, pathAfterLogin) {
  if (user.props?.startClean) user.startClean = user.props.startClean
  if (user.props?.cron) user.cron = user.props.cron
  if (user.props?.daysToSaveDeleted) user.daysToSaveDeleted = user.props.daysToSaveDeleted
  currentUserRef.value = user
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))

  if (user.tenantId === '0') {
    // super user
    router.push({ path: '/selectUser', query: null })
  } else {
    await rolesStore.store.loadAllRoles()
    currentRoles.splice(0) // clear current roles
    user.roles.forEach(roleId => currentRoles.push(rolesStore.store.roles.find(role => role.id === roleId)))
    router.push({ path: pathAfterLogin, query: null })
  }
}

let promise
let serverConfig = null
const actions = {
  getServerConfig: async () => {
    if (!serverConfig) {
      try {
        const serverUrl = window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_SERVER_URL : window.OPENPIM_SERVER_URL + '/graphql'
        const resp = await fetch(serverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({ query: 'query { serverConfig }' })
        })
        if (resp.ok) {
          const data = (await resp.json()).data
          serverConfig = data.serverConfig
        }
      } catch (e) {
        console.error(e)
        err.store.showError('' + e)
      }
    }
    return serverConfig
  },
  loadAllUsers: async () => {
    if (!promise) promise = serverFetch('query { getUsers {id internalId login name email roles options props external createdAt createdBy updatedAt updatedBy } }')
    const data = await promise
    if (data.getUsers) {
      data.getUsers.forEach(element => {
        users.push(element)
      })
    }
  },
  addUser: () => {
    const newUser = { id: Date.now(), internalId: 0, name: '', roles: [], options: [], props: {} }
    users.push(newUser)
    return newUser
  },
  saveUser: async (user) => {
    if (user.internalId === 0) {
      const query = `
        mutation { createUser(login: "` + user.login + '", name: "' + user.name +
        '", roles: [' + user.roles +
        '], password: "' + (user.password1 ? user.password1 : '') +
        '", email: "' + (user.email ? user.email : '') +
        '", options: ' + objectToGraphgl(user.options) +
        ' props: ' + objectToGraphgl(user.props) + `
      )}`
      const data = await serverFetch(query)
      const newId = parseInt(data.createUser)
      user.internalId = newId
    } else {
      const query = `
        mutation { updateUser(id: "` + user.internalId + '", name: "' + (user.name ? user.name : '') + '"' +
        (user.roles ? ', roles: [' + user.roles + ']' : '') +
        ', password: "' + (user.password1 ? user.password1 : '') +
        '", email: "' + (user.email ? user.email : '') +
        '", options: ' + objectToGraphgl(user.options) +
        ' props: ' + objectToGraphgl(user.props) + `
      )}`
      await serverFetch(query)
    }
  },
  removeUser: async (id) => {
    const idx = users.findIndex((elem) => elem.id === id)

    if (users[idx].internalId !== 0) {
      const query = `
        mutation { removeUser(id: "` + users[idx].internalId + `")
      }`
      await serverFetch(query)
    }
    users.splice(idx, 1)
  },
  hasLogin: async (login) => {
    const data = await serverFetch('query { hasLogin(login: "' + login + '") }')
    return data.hasLogin
  },
  getTenants: async () => {
    const data = await serverFetch('query { getTenants }')
    return data.getTenants
  },
  getTenantUsers: async (tenantId) => {
    const data = await serverFetch('query { getTenantUsers(tenantId: "' + tenantId + '") { id name login roles } }')
    return data.getTenantUsers
  },
  signIn: async (login, password, pathAfterLogin) => {
    try {
      const serverUrl = window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_SERVER_URL : window.OPENPIM_SERVER_URL + '/graphql'
      const resp = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ query: 'mutation {signIn(login: "' + login + '", password: "' + password + '") { token, user {id internalId login name email roles tenantId options props external} }}' })
      })
      if (resp.ok) {
        localStorage.setItem('locale', i18n.locale)
        const data = (await resp.json()).data
        await userLogin(data.signIn.token, data.signIn.user, pathAfterLogin)
      } else {
        localStorage.setItem('token', '')
        const data = await resp.json()
        err.store.showError(data.errors[0].message)
      }
    } catch (e) {
      console.error(e)
      err.store.showError('' + e)
    }
  },
  signInAs: async (id) => {
    const data = await serverFetch('mutation {signInAs(id: "' + id + '") { token, user {id internalId login name email roles tenantId options props external} }}')
    await userLogin(data.signInAs.token, data.signInAs.user, '/')
  },
  reloadModel: async () => {
    await serverFetch('mutation {reloadModel(tenantId: "' + currentUserRef.value.tenantId + '") }')
  },
  isAdmin: () => {
    if (!currentUserRef.value) return false
    if (currentRoles.length === 0) {
      console.error('isAdmin: Roles are not loaded !!!')
      return false
    }
    return !!currentRoles.find(role => role.identifier === 'admin')
  },
  hasAccess: (item) => {
    if (!currentUserRef.value) return false
    if (currentRoles.length === 0) {
      console.error('hasAccess: Roles are not loaded !!!')
      return false
    }
    for (let i = 0; i < currentRoles.length; i++) {
      const role = currentRoles[i]
      if (role && role.otherAccess[item]) return true
    }
    return false
  },
  canViewConfig: (item) => {
    if (!currentUserRef.value) return false
    if (currentRoles.length === 0) {
      console.error('canViewConfig: Roles are not loaded !!!')
      return false
    }
    for (let i = 0; i < currentRoles.length; i++) {
      const role = currentRoles[i]
      if (role && (role.configAccess[item] === 1 || role.configAccess[item] === 2)) return true
    }
    return false
  },
  canEditConfig: (item) => {
    if (!currentUserRef.value) return false
    if (currentRoles.length === 0) {
      console.error('canEditConfig: Roles are not loaded !!!')
      return false
    }
    for (let i = 0; i < currentRoles.length; i++) {
      const role = currentRoles[i]
      if (role && (role.configAccess[item] === 2)) return true
    }
    return false
  },
  canViewItemRelation: (relationId) => {
    if (!currentUserRef.value) return false
    if (currentRoles.length === 0) {
      console.error('canViewItemRelation: Roles are not loaded !!!')
      return false
    }

    let access = -1
    for (let i = 0; i < currentRoles.length; i++) {
      const role = currentRoles[i]
      if (role.relAccess.relations.find(id => id === relationId)) {
        if (role.relAccess.access > access) access = role.relAccess.access
      }
    }
    return access === -1 || access > 0
  },
  canEditItemRelation: (relationId) => {
    if (!currentUserRef.value) return false
    if (currentRoles.length === 0) {
      console.error('canEditItemRelation: Roles are not loaded !!!')
      return false
    }

    let access = -1
    for (let i = 0; i < currentRoles.length; i++) {
      const role = currentRoles[i]
      if (role.relAccess.relations.find(id => id === relationId)) {
        if (role.relAccess.access > access) access = role.relAccess.access
      }
    }
    return access === -1 || access > 1
  },
  canEditItem: (typeId, path) => {
    if (!currentUserRef.value) return false
    if (currentRoles.length === 0) {
      console.error('canEditItem: Roles are not loaded !!!')
      return false
    }

    let access = -1
    typeId = parseInt(typeId)
    for (let i = 0; i < currentRoles.length; i++) {
      const role = currentRoles[i]
      if (role.itemAccess.valid.find(tId => tId === typeId)) {
        if (path) {
          const pathArr = path.split('.').map(elem => parseInt(elem))
          const tst = pathArr.find(id => role.itemAccess.fromItems.includes(id))
          if (tst && (role.itemAccess.access > access)) access = role.itemAccess.access
        } else {
          if (role.itemAccess.access > access) access = role.itemAccess.access
        }
      }
    }
    return access === -1 || access > 1
  },
  canEditAttrGroup: (attrGroupId) => {
    if (!currentUserRef.value) return false
    if (currentRoles.length === 0) {
      console.error('canEditAttrGroup: Roles are not loaded !!!')
      return false
    }

    let access = -1
    for (let i = 0; i < currentRoles.length; i++) {
      const role = currentRoles[i]
      if (role.itemAccess.groups) {
        role.itemAccess.groups.forEach(grp => {
          if (grp.groupId === attrGroupId && grp.access > access) access = grp.access
        })
      }
    }
    return access === -1 || access > 1
  }

}

const store = {
  currentUserRef: currentUserRef,
  users: users,
  currentRoles: currentRoles,
  ...actions
}

export { store, currentUserRef, currentRoles }

const StoreSymbol = Symbol('UserStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject UserStore')
  }
  return tst
}
