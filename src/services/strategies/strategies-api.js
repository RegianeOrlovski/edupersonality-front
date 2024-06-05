import { get, post, put, destroy } from 'boot/axios'

export const getStrategies = async (params = { page: '', rowsPerPage: 0 }) => {
  params.perPage = params.rowsPerPage || 0
  const { data } = await get('/strategies', params)
  params.rowsNumber = data.total
  return data.data
}

export const getStrategy = async (id, params) => {
  const { data } = await get(`/strategies/${id}`, params)
  return data
}

export const createStrategy = async strategy => {
  const { data } = await post('/strategies', strategy)
  return data
}

export const updateStrategy = async (id, strategy) => {
  const { data } = await put(`/strategies/${id}`, strategy)
  return data
}

export const destroyStrategy = async id => {
  await destroy(`/strategies/${id}`)
}
