import { createRouter, createWebHashHistory } from 'vue-router'
import * as userStore from '../store/users'
import * as rolesStore from '../store/roles'
import i18n, { loadLocaleMessages, setI18nLanguage } from '../i18n'

// layouts
import Empty from '../layouts/Empty.vue'
import Main from '../layouts/Main.vue'

// views
import Login from '../views/Login.vue'
import Dashboards from '../views/Dashboards.vue'

// components
import HomeMenu from '../components/HomeMenu.vue'

const routes = [
  {
    path: '/login',
    props: { pathAfterLogin: '/' },
    component: Empty,
    children: [
      { path: '', component: Login }
    ],
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/export_login',
    props: { pathAfterLogin: '/export_search' },
    component: Empty,
    children: [
      { path: '', component: Login }
    ],
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/',
    component: Main,
    props: { export: false },
    children: [
      {
        path: '',
        components: {
          menu: HomeMenu,
          default: Dashboards
        }
      }
    ],
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/selectUser',
    component: Main,
    props: { export: false },
    children: [
      {
        path: '',
        components: {
          default: () => import('../views/SelectUser.vue')
        }
      }
    ],
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/item/:id',
    component: Main,
    props: { export: false },
    children: [
      {
        path: '',
        components: {
          menu: () => import('../components/HomeMenu.vue'),
          default: () => import('../views/Item.vue')
        }
      }
    ],
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/search',
    component: Main,
    props: { export: false },
    children: [
      {
        path: '',
        components: {
          menu: () => import('../components/SearchPanel.vue'),
          default: () => import('../views/SearchResults.vue')
        }
      }
    ],
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/export_search',
    component: Main,
    props: { export: true },
    children: [
      {
        path: '',
        components: {
          menu: () => import('../components/SearchItem.vue'),
          default: () => import('../views/SearchResults.vue')
        }
      }
    ],
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/search/:id',
    component: Main,
    props: { export: false },
    children: [
      {
        path: '',
        components: {
          menu: () => import('../components/SearchPanel.vue'),
          default: () => import('../views/SearchResults.vue')
        }
      }
    ],
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/channels',
    component: Main,
    props: { export: false },
    children: [
      {
        path: '',
        components: {
          menu: () => import('../components/ChannelsMenu.vue'),
          default: () => import('../views/Channel.vue')
        }
      }
    ],
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/channels/:id',
    component: Main,
    props: { export: false },
    children: [
      {
        path: '',
        components: {
          menu: () => import('../components/ChannelsMenu.vue'),
          default: () => import('../views/Channel.vue')
        }
      }
    ],
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/config',
    component: Main,
    props: { export: false },
    children: [
      {
        path: 'home',
        components: {
          menu: () => import('../components/ConfigMenu.vue')
        }
      },
      {
        path: 'types',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Types.vue')
        }
      },
      {
        path: 'types/:id',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Types.vue')
        }
      },
      {
        path: 'attributes',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Attributes.vue')
        }
      },
      {
        path: 'attributes/:id',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Attributes.vue')
        }
      },
      {
        path: 'relations',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Relations.vue')
        }
      },
      {
        path: 'relations/:id',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Relations.vue')
        }
      },
      {
        path: 'languages',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Languages.vue')
        }
      },
      {
        path: 'users',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Users.vue')
        }
      },
      {
        path: 'users/:id',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Users.vue')
        }
      },
      {
        path: 'roles',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Roles.vue')
        }
      },
      {
        path: 'roles/:id',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Roles.vue')
        }
      },
      {
        path: 'lovs',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/LOVs.vue')
        }
      },
      {
        path: 'lovs/:id',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/LOVs.vue')
        }
      },
      {
        path: 'channels',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Channels.vue')
        }
      },
      {
        path: 'channels/:id',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Channels.vue')
        }
      },
      {
        path: 'actions',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Actions.vue')
        }
      },
      {
        path: 'actions/:id',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Actions.vue')
        }
      },
      {
        path: 'dashboards',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Dashboards.vue')
        }
      },
      {
        path: 'dashboards/:id',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/Dashboards.vue')
        }
      }
    ],
    meta: {
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.preventRoute = {}
router.dataChanged = function (dataId, text) {
  router.preventRoute[dataId] = text
}
router.clearDataChanged = function (dataId) {
  delete router.preventRoute[dataId]
}

router.beforeEach(async (to, from, next) => {
  const paramsLocale = localStorage.getItem('locale')
  if (paramsLocale && i18n.locale !== paramsLocale) {
    // load locale messages
    if (!i18n.global.availableLocales.includes(paramsLocale)) {
      await loadLocaleMessages(i18n, paramsLocale)
    }

    // set i18n language
    setI18nLanguage(i18n, paramsLocale)
  }
  const preventedRoutes = Object.keys(router.preventRoute)
  if (preventedRoutes.length > 0) {
    let text = i18n.global.t('Router.Changed.NotSaved') + '\n'
    let idx = 1
    preventedRoutes.forEach(prop => {
      text += (idx++) + '. ' + router.preventRoute[prop] + '\n'
    })
    text += i18n.global.t('Router.Changed.Continue')

    if (!window.confirm(text)) {
      next(false)
      return
    } else {
      router.preventRoute = {}
    }
  }
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('token')
    if (token) {
      if (!userStore.store.currentUserRef.value) {
        const user = JSON.parse(localStorage.getItem('user'))
        userStore.store.currentUserRef.value = user
        if (user.tenantId !== '0') {
          await rolesStore.store.loadAllRoles()
          user.roles.forEach(roleId => userStore.store.currentRoles.push(rolesStore.store.roles.find(role => role.id === roleId)))
        }
      }
      next()
    } else {
      next({
        path: '/login',
        params: { nextUrl: to.fullPath }
      })
    }
  } else {
    next()
  }
})

export default router
