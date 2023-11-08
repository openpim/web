import { reactive, provide, inject } from '@vue/composition-api'
import i18n from '../i18n'
import { serverFetch, objectToGraphgl } from './utils'
import { currentLanguage } from './languages'

const importConfigs = reactive([])
const actions = {
  loadAllImportConfigs: async () => {
    if (importConfigs.length > 0) return importConfigs
    const data = await serverFetch('query { getImportConfigs {id identifier name type filedata config mappings createdAt createdBy updatedAt updatedBy} }')
    if (importConfigs.length > 0) return importConfigs
    if (data.getImportConfigs) {
      data.getImportConfigs.forEach(element => {
        element.internalId = element.id
        importConfigs.push(element)
      })
    }
    return importConfigs
  },
  saveImportConfig: async (importsConfig) => {
    const variables = {
      config: importsConfig.config,
      mappings: importsConfig.mappings,
      filedata: importsConfig.filedata
    }
    if (importsConfig.internalId === 0) {
      const query = `
        mutation($config: JSONObject, $mappings: JSON, $filedata: JSONObject) { createImportConfig(identifier: "` + importsConfig.identifier + '", name: ' + objectToGraphgl(importsConfig.name) +
        ', type: ' + importsConfig.type +
        ', mappings: $mappings, filedata: $filedata, config: $config' +
        `)
      }`

      const data = await serverFetch(query, variables)
      const newId = parseInt(data.createImportConfig)
      importsConfig.internalId = newId
      importsConfig.id = newId
    } else {
      const query = `
        mutation($config: JSONObject, $mappings: JSON, $filedata: JSONObject) { updateImportConfig(id: "` + importsConfig.internalId + '", name: ' + (importsConfig.name ? '' + objectToGraphgl(importsConfig.name) : '') +
        ', type: ' + importsConfig.type +
        ', mappings: $mappings, filedata: $filedata, config: $config' +
        `)
      }`
      await serverFetch(query, variables)
    }
  },
  removeImportConfig: async (id) => {
    const idx = importConfigs.findIndex((elem) => elem.id === id)
    if (importConfigs[idx].internalId !== 0) {
      const query = `
        mutation { removeImportConfig(id: "` + importConfigs[idx].internalId + `")
      }`
      await serverFetch(query)
    }
    importConfigs.splice(idx, 1)
  },
  getImportConfigTemplateData: async (id) => {
    const resp = await fetch((window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/') + 'import-config-data/' + id, {
      method: 'GET',
      headers: {
        'x-token': localStorage.getItem('token')
      }
    })
    return resp
  },
  testImportConfig: async function (importsConfig) {
    const data = new FormData()
    data.append('language', currentLanguage.value.identifier)

    const resp = await fetch((window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/') + 'import-config-test/' + importsConfig.id, {
      method: 'POST',
      headers: {
        'x-token': localStorage.getItem('token')
      },
      body: data
    })
    return resp
  },
  uploadImportConfigTemplate: async (file) => {
    const data = new FormData()
    data.append('file', file)

    const resp = await fetch((window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/') + 'import-config-template-upload', {
      method: 'POST',
      headers: {
        'x-token': localStorage.getItem('token')
      },
      body: data
    })

    if (!resp.ok) {
      // err.store.showError(i18n.t('File.UploadFailed'))
      alert('File.UploadFailed')
      return false
    } else {
      return await resp.json()
    }
  },
  uploadImportFile: async (id, file) => {
    const data = new FormData()
    data.append('file', file)
    data.append('mappingId', id)
    data.append('language', currentLanguage.value.identifier)

    const resp = await fetch((window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/') + 'import-upload', {
      method: 'POST',
      headers: {
        'x-token': localStorage.getItem('token')
      },
      body: data
    })
    if (!resp.ok) {
      // err.store.showError(i18n.t('File.UploadFailed'))
      alert(i18n.t('File.UploadFailed'))
      return false
    } else {
      return await resp.json()
    }
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  importConfigs,
  ...actions
}

const StoreSymbol = Symbol('ImportConfigsStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject ImportConfigsStore')
  }
  return tst
}
