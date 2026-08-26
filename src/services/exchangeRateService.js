// src/services/exchangeRateService.js
import apiClient from './apiClient'

const resource = '/exchange-rates'

export default {
  /**
   * جلب قائمة العملات النشطة مع أحدث سعر صرف مسجل
   */
  getCurrencies() {
    return apiClient.get(resource)
  },

  /**
   * تسجيل وتحديث سعر صرف جديد لعملة محددة
   */
  store(payload) {
    return apiClient.post(resource, payload)
  },

  /**
   * جلب السجل التاريخي لأسعار صرف عملة معينة مع الترقيم
   */
  getCurrencyHistory(currencyId, page = 1, filters = {}) {
    return apiClient.get(`${resource}/${currencyId}/history`, {
      params: {
        page,
        ...filters,
      },
    })
  },
}
