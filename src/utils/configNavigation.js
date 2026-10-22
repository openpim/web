// Vue Router 3 rejects repeated navigation instead of resolving it.
function navigateConfig (router, path) {
  if (router.currentRoute.path === path) return Promise.resolve()
  return router.push(path).catch(error => {
    if (error.name !== 'NavigationDuplicated') throw error
  })
}

module.exports = { navigateConfig }
