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
import SearchResults from '../views/SearchResults.vue'
import Item from '../views/Item.vue'
import SelectUser from '../views/SelectUser.vue'
import Types from '../views/config/Types.vue'
import Attributes from '../views/config/Attributes.vue'
import Relations from '../views/config/Relations.vue'
import Languages from '../views/config/Languages.vue'
import Users from '../views/config/Users.vue'
import Roles from '../views/config/Roles.vue'
import LOVs from '../views/config/LOVs.vue'
import Channels from '../views/config/Channels.vue'
import Actions from '../views/config/Actions.vue'
import DashboardsConfig from '../views/config/Dashboards.vue'

// components
import HomeMenu from '../components/HomeMenu.vue'
import SearchPanel from '../components/SearchPanel.vue'
import SearchItem from '../components/SearchItem.vue'
import ConfigMenu from '../components/ConfigMenu.vue'

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
          default: SelectUser
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
          menu: HomeMenu,
          default: Item
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
          menu: SearchPanel,
          default: SearchResults
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
          menu: SearchItem,
          default: SearchResults
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
          menu: SearchPanel,
          default: SearchResults
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
    path: '/collections',
    component: () => import('../layouts/Main.vue'),
    props: { export: false },
    children: [
      {
        path: '',
        components: {
          menu: () => import('../components/CollectionsMenu.vue'),
          default: () => import('../views/Collections.vue')
        }
      }
    ],
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/collections/:id',
    component: () => import('../layouts/Main.vue'),
    props: { export: false },
    children: [
      {
        path: '',
        components: {
          menu: () => import('../components/CollectionsMenu.vue'),
          default: () => import('../views/Collections.vue')
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
          menu: ConfigMenu
        }
      },
      {
        path: 'types',
        components: {
          menu: ConfigMenu,
          default: Types
        }
      },
      {
        path: 'types/:id',
        components: {
          menu: ConfigMenu,
          default: Types
        }
      },
      {
        path: 'attributes',
        components: {
          menu: ConfigMenu,
          default: Attributes
        }
      },
      {
        path: 'attributes/:id',
        components: {
          menu: ConfigMenu,
          default: Attributes
        }
      },
      {
        path: 'relations',
        components: {
          menu: ConfigMenu,
          default: Relations
        }
      },
      {
        path: 'relations/:id',
        components: {
          menu: ConfigMenu,
          default: Relations
        }
      },
      {
        path: 'languages',
        components: {
          menu: ConfigMenu,
          default: Languages
        }
      },
      {
        path: 'users',
        components: {
          menu: ConfigMenu,
          default: Users
        }
      },
      {
        path: 'users/:id',
        components: {
          menu: ConfigMenu,
          default: Users
        }
      },
      {
        path: 'roles',
        components: {
          menu: ConfigMenu,
          default: Roles
        }
      },
      {
        path: 'roles/:id',
        components: {
          menu: ConfigMenu,
          default: Roles
        }
      },
      {
        path: 'lovs',
        components: {
          menu: ConfigMenu,
          default: LOVs
        }
      },
      {
        path: 'lovs/:id',
        components: {
          menu: ConfigMenu,
          default: LOVs
        }
      },
      {
        path: 'channels',
        components: {
          menu: ConfigMenu,
          default: Channels
        }
      },
      {
        path: 'channels/:id',
        components: {
          menu: ConfigMenu,
          default: Channels
        }
      },
      {
        path: 'actions',
        components: {
          menu: ConfigMenu,
          default: Actions
        }
      },
      {
        path: 'actions/:id',
        components: {
          menu: ConfigMenu,
          default: Actions
        }
      },
      {
        path: 'dashboards',
        components: {
          menu: ConfigMenu,
          default: DashboardsConfig
        }
      },
      {
        path: 'dashboards/:id',
        components: {
          menu: ConfigMenu,
          default: DashboardsConfig
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
