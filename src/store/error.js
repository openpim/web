import { toRefs, reactive, computed, provide, inject } from '@vue/composition-api'

const state = reactive({
  error: '',
  hasError: computed(() => (state.error !== '')),
  info: '',
  hasInfo: computed(() => (state.info !== ''))
})

const actions = {
  clearError: () => { state.error = '' },
  showError: (msg) => {
    state.error = msg
    setTimeout(() => { state.error = '' }, 6000000)
  },
  clearInfo: () => { state.info = '' },
  showInfo: (msg) => {
    state.info = msg
    setTimeout(() => { state.info = '' }, 60000)
  }
}

// eslint-disable-next-line no-unused-vars
const store = {
  state: toRefs(state),
  ...actions
}

export { store }

const StoreSymbol = Symbol('ErrorStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject ErrorStore')
  }
  return tst
}
