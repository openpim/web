import { reactive, provide, inject } from '@vue/composition-api'
import i18n from '../i18n'
import { serverFetch } from './utils'
import { currentLanguage } from './languages'

const templates = reactive([])
const actions = {
  loadAllTemplates: async () => {
    if (templates.length > 0) return templates
    const variables = {
      where: {},
      order: '',
      offset: 0,
      limit: 100000
    }
    const query = `query GetTemplates(
      $where: JSONObject
      $order: JSON!
      $offset: Int!
      $limit: Int!
    ) {
      getTemplates(where: $where, order: $order, offset: $offset, limit: $limit) {
        count
        rows {
          id
          identifier
          name
          template
          order
          valid
          visible
          createdBy
          createdAt
          updatedBy
          updatedAt
        }
      }
    }`
    const data = await serverFetch(query, variables)
    if (templates.length > 0) return templates
    if (data.getTemplates && data.getTemplates.rows) {
      data.getTemplates.rows.forEach(element => {
        element.internalId = element.id
        templates.push(element)
      })
    }
    return templates
  },
  addTemplate: () => {
    const name = {}
    name[currentLanguage.value.identifier] = i18n.t('Config.Template.NewName')
    const newTemplate = { id: Date.now(), internalId: 0, name: name, valid: [], visible: [] }
    templates.push(newTemplate)
    return newTemplate
  },
  saveTemplate: async (template) => {
    const variables = {
      id: template.id,
      identifier: template.identifier,
      name: template.name,
      template: template.template,
      order: parseInt(template.order),
      valid: template.valid.map(num => num.toString()),
      visible: template.visible.map(num => num.toString())
    }
    if (template.internalId === 0) {
      const query = `
      mutation CreateTemplate(
        $identifier: String!,
        $name: LanguageDependentString!,
        $template: String!,
        $order: Int!,
        $valid: [String],
        $visible: [String]
      ) {
        createTemplate(identifier: $identifier, name: $name, template: $template, order: $order, valid: $valid, visible: $visible) {
            id
            identifier
            name
            template
            order
            valid
            visible
            createdBy
            createdAt
            updatedBy
            updatedAt
        }
      }`
      const data = await serverFetch(query, variables)
      const newId = parseInt(data.createTemplate)
      template.internalId = newId
      template.id = newId
    } else {
      const query = `
      mutation UpdateProcess(
        $id: ID!,
        $name: LanguageDependentString!,
        $template: String!,
        $order: Int!,
        $valid: [String],
        $visible: [String]
      ) {
        updateTemplate(id: $id, name: $name, template: $template, order: $order, valid: $valid, visible: $visible) {
            id
            identifier
            name
            template
            order
            valid
            visible
            createdBy
            createdAt
            updatedBy
            updatedAt
        }
      }`
      await serverFetch(query, variables)
    }
  },
  removeTemplate: async (id) => {
    const variables = {
      id
    }
    const idx = templates.findIndex((elem) => elem.id === id)
    if (templates[idx].internalId !== 0) {
      const query = `
        mutation RemoveTemplate(
          $id: ID!
        ) {
          removeTemplate(id: $id)
        }`
      await serverFetch(query, variables)
    }
    templates.splice(idx, 1)
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  templates,
  ...actions
}

const StoreSymbol = Symbol('TemplatesStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject TemplatesStore')
  }
  return tst
}
