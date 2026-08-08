///src\services\priceListService.js
import apiClient from './apiClient'

const resource = '/price-lists'

export default {
  /**
   * جلب كافة فئات الأسعار المعتمدة في النظام (جمهور، جملة، موزعون...)
   */
  get(filters = {}) {
    return apiClient.get(resource, { params: filters })
  },

  /**
   * جلب تفاصيل فئة سعرية محددة
   */
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  /**
   * إنشاء فئة سعرية جديدة
   */
  create(payload) {
    return apiClient.post(resource, payload)
  },

  /**
   * تحديث فئة سعرية قائمة
   */
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  /**
   * حذف فئة سعرية ناعماً
   */
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
