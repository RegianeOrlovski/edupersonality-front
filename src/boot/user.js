import { getLoggedUser } from 'src/services/user/user-api'

let loggedUser = {}

const resetLoggedUser = () => {
  loggedUser = {}
}

const resetUserInLocalStorage = () => {
  localStorage.removeItem('isUserLogged')
  localStorage.removeItem('userToken')
}

const loadLoggedUser = async () => {
  resetLoggedUser()

  try {
    const userToken = localStorage.getItem('userToken')

    if (userToken) {
      loggedUser = await getLoggedUser()
    } else {
      resetUserInLocalStorage()
    }
  } catch (e) {
    resetUserInLocalStorage()
  }
}

const getLoggedUserAbilities = () => {
  return loggedUser?.permission?.abilities || []
}

const checkIfLoggedUserHasAbility = (ability) => {
  return (loggedUser?.permission?.abilities || []).includes(ability)
}

export default async ({ app }) => {
  await loadLoggedUser()
}

export {
  loggedUser,
  loadLoggedUser,
  getLoggedUserAbilities,
  checkIfLoggedUserHasAbility,
  resetLoggedUser,
  resetUserInLocalStorage
}
