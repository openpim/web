import { reactive, provide, inject } from '@vue/composition-api'
import { serverFetch } from './utils'

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
