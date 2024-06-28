import { getLoggedUserAbilities } from 'src/boot/user';
import { ABILITIES } from "src/constants/abilities";

const generalItems = [
  {
    label: 'O que é o sistema',
    icon: 'o_info',
    to: {
      name: 'system'
    },
    ability: 'allowed'
  },
  {
    label: 'Visão geral',
    icon: 'o_dashboard',
    to: {
      name: 'dashboard'
    },
    ability: 'allowed'
  },
  {
    label: 'Estratégias de ensino',
    icon: 'o_tune',
    to: {
      name: 'strategies'
    },
    ability: ABILITIES.VIEW_STRATEGIES
  },
  {
    label: 'Acesso ao Sistema',
    icon: 'o_manage_accounts',
    children: [
      {
        label: 'Usuários',
        icon: 'o_account_circle',
        to: {
          name: 'users'
        },
        ability: ABILITIES.USERS
      },
      {
        label: 'Permissões',
        icon: 'fingerprint',
        to: {
          name: 'permissions'
        },
        ability: ABILITIES.PERMISSIONS
      },
    ]
  },
]

export const generateMenu = () => {
  const filteredMenu = []
  const abilities = [
    'allowed',
    ...getLoggedUserAbilities()
  ]
  for (const menuItem of generalItems) {
    if (abilities.includes(menuItem.ability)) {
      filteredMenu.push(menuItem)
      continue
    }

    if (menuItem.children) {
      menuItem.children = menuItem.children.filter(children => abilities.includes(children.ability))

      if (menuItem.children.length > 0) {
        filteredMenu.push(menuItem)
      }
    }
  }
  return filteredMenu
}
