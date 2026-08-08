import apiClient from './apiClient'

const resource = '/material-consumptions'

export default {
  get(page = 1, filters = {}) {
    return apiClient.get(resource, {
      params: {
        page,
        ...filters,
      },
    })
  },

  create(payload) {
    return apiClient.post(resource, payload)
  },

  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
