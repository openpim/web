import { reactive, provide, inject } from '@vue/composition-api'
import i18n from '../i18n'
import { serverFetch, objectToGraphgl } from './utils'
import { currentUserRef } from './users'
import { currentLanguage } from './languages'

const dashboards = reactive([])

const actionList = {
  loadAllDashboards: async () => {
    if (dashboards.length > 0) return
    const data = await serverFetch('query { getDashboards {id identifier name users components createdAt createdBy updatedAt updatedBy} }')
    if (dashboards.length > 0) return
    const arr = data.getDashboards
    if (arr && arr.length > 0) {
      arr.sort((a, b) => a.name[currentLanguage.value.identifier].localeCompare(b.name[currentLanguage.value.identifier]))
      arr.forEach(element => {
        element.internalId = element.id
        element.usersStr = element.users.join()
        dashboards.push(element)
      })
    }
  },
  getDashboardsForCurrentUser: () => {
    return dashboards.filter(dashboard => dashboard.users.length === 0 || dashboard.users.includes(currentUserRef.value.login))
  },
  addDashboard: () => {
    const name = {}
    name[currentLanguage.value.identifier] = i18n.t('Config.Dashboards.NewName')
    const act = { id: Date.now(), internalId: 0, name: name, components: [], users: '' }
    dashboards.push(act)
    return act
  },
  saveDashboard: async (dash) => {
    const users = dash.usersStr ? dash.usersStr.split(',') : []
    if (dash.internalId === 0) {
      const query = `
        mutation($components:JSON!) { createDashboard(identifier: "` + dash.identifier + '", name: ' + objectToGraphgl(dash.name) +
        ', users: ' + objectToGraphgl(users) +
        ', components: $components' +
        `)
      }`
      const data = await serverFetch(query, { components: dash.components || [] })
      const newId = parseInt(data.createDashboard)
      dash.internalId = newId
    } else {
      const query = `
        mutation($components:JSON!) { 
          updateDashboard(id: "` + dash.internalId + '", name: ' + (dash.name ? '' + objectToGraphgl(dash.name) : '') +
        ', users: ' + objectToGraphgl(users) +
        ', components: $components' +
        `)
      }`
      await serverFetch(query, { components: dash.components || [] })
    }
  },
  removeDashboard: async (id) => {
    const idx = dashboards.findIndex((elem) => elem.id === id)

    if (dashboards[idx].internalId !== 0) {
      const query = `
        mutation { removeDashboard(id: "` + dashboards[idx].internalId + `")
      }`
      await serverFetch(query)
    }
    dashboards.splice(idx, 1)
  },
  getDashboardComponentData: async (dashboardId, componentId) => {
    const data = await serverFetch('query { getDashboardComponentData(dashboardId: ' + dashboardId + ', componentId: ' + componentId + ') }')
    return data.getDashboardComponentData
  }
}

const store = {
  dashboards: dashboards,
  ...actionList
}

const StoreSymbol = Symbol('DashboardsStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject DashboardsStore')
  }
  return tst
}
