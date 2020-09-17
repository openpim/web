import Vue from 'vue'
import VueRouter from 'vue-router'
import * as userStore from '../store/users'
import * as rolesStore from '../store/roles'
// import jwtDecode from 'jwt-decode'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
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
    children: [
      {
        path: '',
        components: {
          menu: () => import('../components/SearchMenu.vue'),
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
    children: [
      {
        path: '',
        components: {
          menu: () => import('../components/SearchMenu.vue'),
          default: () => import('../views/SearchResults.vue')
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

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const item = localStorage.getItem('token')
    if (item) {
      if (!userStore.store.currentUserRef.value) {
        const user = JSON.parse(localStorage.getItem('user'))
        userStore.store.currentUserRef.value = user
        if (user.tenantId !== '0') {
          rolesStore.store.loadAllRoles().then(() => {
            user.roles.forEach(roleId => userStore.store.currentRoles.push(rolesStore.store.roles.find(role => role.id === roleId)))
          })
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
