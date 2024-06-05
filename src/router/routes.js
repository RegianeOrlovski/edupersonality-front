import { checkIfLoggedUserHasAbility } from "boot/user";
import { ABILITIES } from "src/constants/abilities";

const redirectToDashboardIfLogged = (to, from, next) => {
  if (localStorage.getItem('isUserLogged')) {
    next('/')
  } else {
    next()
  }
}

const redirectToLoginIfNotLogged = (to, from, next) => {
  if (localStorage.getItem('isUserLogged')) {
    next()
  } else {
    next('/login')
  }
}

const checkLoggedUserAbility = (to, from, next) => {
  if (checkIfLoggedUserHasAbility(to.meta.ability)) {
    next()
  } else {
    next('/')
  }
}

const permissions = [
  {
    path: '/permissions',
    name: 'permissions',
    component: () => import('pages/Permissions/PermissionsList'),
    beforeEnter: checkLoggedUserAbility,
    meta: { ability: ABILITIES.PERMISSIONS }
  },
  {
    path: '/permissions/create',
    name: 'permissions_create',
    component: () => import('pages/Permissions/PermissionsForm'),
    beforeEnter: checkLoggedUserAbility,
    meta: { ability: ABILITIES.PERMISSIONS }
  },
  {
    path: '/permissions/update/:id',
    name: 'permissions_update',
    component: () => import('pages/Permissions/PermissionsForm'),
    beforeEnter: checkLoggedUserAbility,
    meta: { ability: ABILITIES.PERMISSIONS }
  }
]

const users = [
  {
    path: '/users',
    name: 'users',
    component: () => import('pages/Users/UsersList'),
    beforeEnter: checkLoggedUserAbility,
    meta: { ability: ABILITIES.USERS }
  },
  {
    path: '/users/create',
    name: 'users_create',
    component: () => import('pages/Users/UsersForm'),
    beforeEnter: checkLoggedUserAbility,
    meta: { ability: ABILITIES.USERS }
  },
  {
    path: '/users/update/:id',
    name: 'users_update',
    component: () => import('pages/Users/UsersForm'),
    beforeEnter: checkLoggedUserAbility,
    meta: { ability: ABILITIES.USERS }
  }
]

const strategies = [
  {
    path: '/strategies',
    name: 'strategies',
    component: () => import('pages/Strategies/StrategiesList.vue'),
    beforeEnter: checkLoggedUserAbility,
    meta: { ability: ABILITIES.STRATEGIES }
  },
  {
    path: '/strategies/create',
    name: 'strategy_create',
    component: () => import('pages/Strategies/StrategyForm.vue'),
    beforeEnter: checkLoggedUserAbility,
    meta: { ability: ABILITIES.STRATEGIES }
  },
  {
    path: '/strategies/update/:id',
    name: 'strategy_update',
    component: () => import('pages/Strategies/StrategyForm.vue'),
    beforeEnter: checkLoggedUserAbility,
    meta: { ability: ABILITIES.STRATEGIES }
  }
]

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout'),
    beforeEnter: redirectToLoginIfNotLogged,
    children: [
      {
        path: '',
        name: 'home',
        redirect: '/system'
      },
      {
        path: '/system',
        name: 'system',
        component: () => import('pages/System/SystemIndex.vue'),
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/Index')
      },
      ...permissions,
      ...users,
      ...strategies,
    ]
  },
  {
    path: '/login',
    name: 'login',
    beforeEnter: redirectToDashboardIfLogged,
    component: () => import('pages/Login/PageLogin')
  },
  {
    path: '/reset-password/:token',
    name: 'reset_password',
    beforeEnter: redirectToDashboardIfLogged,
    component: () => import('pages/Login/ResetPasswordPage')
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404')
  },
]

export default routes
