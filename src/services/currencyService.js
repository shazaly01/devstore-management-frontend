import apiClient from './apiClient'

const resource = '/exchange-rates'

export default {
  /**
   * جلب قائمة العملات المتاحة مع أحدث أسعار الصرف المسجلة
   */
  getCurrencies() {
    return apiClient.get(resource)
  },

  /**
   * تسجيل وتوثيق سعر صرف جديد لعملة معينة
   */
  storeExchangeRate(payload) {
    return apiClient.post(resource, payload)
  },

  /**
   * استعراض السجل التاريخي لحركات أسعار الصرف لعملة محددة
   */
  getHistory(currencyId, page = 1, filters = {}) {
    return apiClient.get(`${resource}/${currencyId}/history`, {
      params: {
        page,
        ...filters,
      },
    })
  },
}
