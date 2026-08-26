// src/services/pricingService.js
import apiClient from './apiClient'

const resource = '/pricing'

export default {
  /**
   * إرسال معايير التسعير لمعاينة النتائج المقترحة
   */
  preview(payload) {
    return apiClient.post(`${resource}/bulk-reprice/preview`, payload)
  },

  /**
   * تطبيق دفعة الأسعار الجديدة وتوثيقها
   */
  apply(payload) {
    return apiClient.post(`${resource}/bulk-reprice/apply`, payload)
  },

  /**
   * جلب بيانات رادار الأصناف المعرضة لتآكل الهامش
   */
  getRadar(filters = {}) {
    return apiClient.get(`${resource}/radar`, {
      params: filters,
    })
  },

  /**
   * التراجع عن دفعة تسعير كاملة
   */
  rollback(payload) {
    return apiClient.post(`${resource}/rollback`, payload)
  },

  /**
   * استعراض سجل تاريخ تغييرات الأسعار مع الفلترة والترقيم
   */
  getHistory(page = 1, filters = {}) {
    return apiClient.get(`${resource}/history`, {
      params: {
        page,
        ...filters,
      },
    })
  },

  /**
   * معاينة احتساب التكلفة بالعملة الأجنبية
   */
  previewForeignCost(payload) {
    return apiClient.post(`${resource}/foreign-cost/preview`, payload)
  },

  /**
   * تطبيق وتثبيت التكلفة الأجنبية وربط العملة المرجعية
   */
  applyForeignCost(payload) {
    return apiClient.post(`${resource}/foreign-cost/apply`, payload)
  },
}
