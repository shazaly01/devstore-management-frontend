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
   * تطبيق دفعة الأسعار الجديدة وتوثيقها وإنشاء رأس الدفعة
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
   * استعراض أرشيف مجموعات التسعير (Batches) مع الفلترة والترقيم
   * الفلاتر المدعومة: (batch_code, category_id, currency_id, exchange_rate, is_rolled_back, from_date, to_date)
   */
  getBatches(page = 1, filters = {}) {
    return apiClient.get(`${resource}/batches`, {
      params: {
        page,
        ...filters,
      },
    })
  },

  /**
   * جلب التفاصيل الكاملة لمجموعة تسعير محددة مع كافة أصنافها ووحداتها
   */
  getBatchDetails(id) {
    return apiClient.get(`${resource}/batches/${id}`)
  },

  /**
   * التراجع عن مجموعة تسعير كاملة (عبر تمرير main_id أو batch_code مع الملاحظات)
   */
  rollback(payload) {
    return apiClient.post(`${resource}/rollback`, payload)
  },

  /**
   * استعراض سجل تاريخ تغييرات الأسعار الفردي مع الفلترة والترقيم
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
