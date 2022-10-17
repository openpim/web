import { reactive, provide, inject } from '@vue/composition-api'
import i18n from '../i18n'
import { serverFetch, objectToGraphgl } from './utils'
import { currentLanguage } from './languages'

const actions = reactive([])

const actionList = {
  loadAllActions: async () => {
    if (actions.length > 0) return
    const data = await serverFetch('query { getActions {id identifier name code order triggers createdAt createdBy updatedAt updatedBy} }')
    if (actions.length > 0) return
    if (data.getActions) {
      data.getActions.forEach(element => {
        element.internalId = element.id
        actions.push(element)
      })
    }
  },
  addAction: () => {
    const name = {}
    name[currentLanguage.value.identifier] = i18n.t('Config.Actions.NewName')
    const act = { id: Date.now(), internalId: 0, order: 0, name: name, code: '', triggers: [] }
    actions.push(act)
    return act
  },
  saveAction: async (action) => {
    let code = action.code ? action.code : ''
    if (code.endsWith('\\')) code += ' '
    if (action.internalId === 0) {
      const query = `
        mutation { createAction(identifier: "` + action.identifier + '", name: ' + objectToGraphgl(action.name) +
        ', code: """' + code +
        '""", triggers: ' + (action.triggers ? objectToGraphgl(action.triggers) : '[]') +
        ', order: ' + action.order +
        `)
      }`
      const data = await serverFetch(query)
      const newId = parseInt(data.createAction)
      action.internalId = newId
    } else {
      const query = `
        mutation { updateAction(id: "` + action.internalId + '", name: ' + (action.name ? '' + objectToGraphgl(action.name) : '') +
        ', code: """' + code +
        '""", triggers: ' + (action.triggers ? objectToGraphgl(action.triggers) : '') +
        ', order: ' + action.order +
        `)
      }`
      await serverFetch(query)
    }
  },
  removeAction: async (id) => {
    const idx = actions.findIndex((elem) => elem.id === id)

    if (actions[idx].internalId !== 0) {
      const query = `
        mutation { removeAction(id: "` + actions[idx].internalId + `")
      }`
      await serverFetch(query)
    }
    actions.splice(idx, 1)
  },
  executeButtonAction: async (itemId, buttonText, data) => {
    const query = 'mutation { executeButtonAction(itemId: "' + itemId + '", buttonText: "' + buttonText + '" ' + (data ? ',data: """' + data + '"""' : '') + ') { error, compileError, message, data }}'
    const response = await serverFetch(query)
    return response.executeButtonAction
  },
  executeActionByIdentifier: async (itemId, actionIdentifier, data) => {
    const query = 'mutation { executeAction(itemId: "' + itemId + '", actionIdentifier: "' + actionIdentifier + '" ' + (data ? ',data: """' + data + '"""' : '') + ') { error, compileError, message, data }}'
    const response = await serverFetch(query)
    return response.executeAction
  },
  testAction: async (itemId, actionId) => {
    const query = 'mutation { testAction(itemId: "' + itemId + '", actionId: "' + actionId + '") { failed, log, error, compileError, message }}'
    const response = await serverFetch(query)
    return response.testAction
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  actions: actions,
  ...actionList
}

const StoreSymbol = Symbol('ActionsStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject ActionsStore')
  }
  return tst
}
