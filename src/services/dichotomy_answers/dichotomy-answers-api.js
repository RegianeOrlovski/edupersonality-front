import { get, post, put, destroy } from 'boot/axios'

export const getDichotomyAnswers = async (params = { page: '', rowsPerPage: 0 }) => {
  params.perPage = params.rowsPerPage || 0
  const { data } = await get('/dichotomy_answers', params)
  params.rowsNumber = data.total
  return data.data
}

export const getDichotomyAnswer = async (id, params) => {
  const { data } = await get(`/dichotomy_answers/${id}`, params)
  return data
}

export const createDichotomyAnswer = async dichotomyAnswer => {
  const { data } = await post('/dichotomy_answers', dichotomyAnswer)
  return data
}

export const updateDichotomyAnswer = async (id, dichotomyAnswer) => {
  const { data } = await put(`/dichotomy_answers/${id}`, dichotomyAnswer)
  return data
}

export const destroyDichotomyAnswer = async id => {
  await destroy(`/dichotomy_answers/${id}`)
}
