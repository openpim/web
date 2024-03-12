import Vue from 'vue'
import VueRouter from 'vue-router'
import * as userStore from '../store/users'
import * as rolesStore from '../store/roles'
import i18n from '../i18n'
// import jwtDecode from 'jwt-decode'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    props: { pathAfterLogin: '/' },
    component: () => import('../layouts/Empty.vue'),
    children: [
      { path: '', component: () => import('../views/Login.vue') }
    ],
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/export_login',
    props: { pathAfterLogin: '/export_search' },
    component: () => import('../layouts/Empty.vue'),
    children: [
      { path: '', component: () => import('../views/Login.vue') }
    ],
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/',
    component: () => import('../layouts/Main.vue'),
    props: { export: false },
    children: [
      {
        path: '',
        components: {
          menu: () => import('../components/HomeMenu.vue'),
          default: () => import('../views/Dashboards.vue')
        }
      }
    ],
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/selectUser',
    component: () => import('../layouts/Main.vue'),
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
    component: () => import('../layouts/Main.vue'),
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
    component: () => import('../layouts/Main.vue'),
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
    component: () => import('../layouts/Main.vue'),
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
    component: () => import('../layouts/Main.vue'),
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
    component: () => import('../layouts/Main.vue'),
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
    component: () => import('../layouts/Main.vue'),
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
    path: '/imports',
    component: () => import('../layouts/Main.vue'),
    props: { export: false },
    children: [
      {
        path: '',
        components: {
          menu: () => import('../components/ImportsMenu.vue'),
          default: () => import('../views/Import.vue')
        }
      }
    ],
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/imports/:id',
    component: () => import('../layouts/Main.vue'),
    props: { export: false },
    children: [
      {
        path: '',
        components: {
          menu: () => import('../components/ImportsMenu.vue'),
          default: () => import('../views/Import.vue')
        }
      }
    ],
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/config',
    component: () => import('../layouts/Main.vue'),
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
        path: 'imports',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/ImportConfigs.vue')
        }
      },
      {
        path: 'imports/:id',
        components: {
          menu: () => import('../components/ConfigMenu.vue'),
          default: () => import('../views/config/ImportConfigs.vue')
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

const router = new VueRouter({
  mode: 'hash',
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
  const tst = localStorage.getItem('locale')
  if (tst && i18n.locale !== tst) {
    i18n.locale = tst
  }
  if (Object.keys(router.preventRoute).length > 0) {
    let text = i18n.t('Router.Changed.NotSaved') + '\n'
    let idx = 1
    for (var prop in router.preventRoute) {
      text += (idx++) + '. ' + router.preventRoute[prop] + '\n'
    }
    text += i18n.t('Router.Changed.Continue')

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
        if (user.props?.startClean) user.startClean = user.props.startClean
        if (user.props?.cron) user.cron = user.props.cron
        if (user.props?.daysToSaveDeleted) user.daysToSaveDeleted = user.props.daysToSaveDeleted
        userStore.store.currentUserRef.value = user
        if (user.tenantId !== '0') {
          await rolesStore.store.loadAllRoles()
          if (userStore.store.currentRoles.length === 0) user.roles.forEach(roleId => userStore.store.currentRoles.push(rolesStore.store.roles.find(role => role.id === roleId)))
        }
        // console.log(userStore.store.currentRoles)
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
