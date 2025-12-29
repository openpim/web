import { reactive, provide, inject } from '@vue/composition-api'
import { serverFetch } from './utils'
import * as err from './error'
import i18n from '../i18n'

const staticFonts = reactive([])
const staticImages = reactive([])

let promise
const actions = {
  loadAllFonts: async () => {
    const query = `query {
      getFonts {
        count
        rows {
          name
          url
        }
      }
    }`
    if (!promise) promise = await serverFetch(query)
    const data = await promise
    if (staticFonts.length > 0) return staticFonts
    if (data.getFonts && data.getFonts.rows) {
      data.getFonts.rows.forEach(element => {
        staticFonts.push(element)
      })
    }
    return staticFonts
  },
  loadAllImages: async () => {
    const query = `query {
      getImages {
        count
        rows {
          name
          url
        }
      }
    }`
    if (!promise) promise = await serverFetch(query)
    const data = await promise
    if (staticImages.length > 0) return staticImages
    if (data.getImages && data.getImages.rows) {
      data.getImages.rows.forEach(element => {
        staticImages.push(element)
      })
    }
    return staticImages
  },
  uploadImage: async (file) => {
    const data = new FormData()
    data.append('file', file)

    const resp = await fetch((window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/') + 'image-upload', {
      method: 'POST',
      headers: {
        'x-token': localStorage.getItem('token')
      },
      body: data
    })
    if (!resp.ok) {
      err.store.showError(i18n.t('File.UploadFailed') + ' ' + (await resp.text()))
      return false
    } else {
      const result = await resp.json()
      staticImages.length = 0
      promise = null
      return result
    }
  }
}

const store = {
  staticFonts,
  staticImages,
  ...actions
}

const StoreSymbol = Symbol('MediaStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject MediaStore')
  }
  return tst
}
