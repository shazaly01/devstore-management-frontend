import apiClient from './apiClient'

const resource = '/settings'

export default {
  /**
   * جلب جميع الإعدادات مع إمكانية التصفية بحسب التبويب (group)
   */
  getSettings(group = null) {
    return apiClient.get(resource, {
      params: group ? { group } : {},
    })
  },

  /**
   * جلب إعداد محدد بواسطة المفتاح
   */
  getSettingByKey(key) {
    return apiClient.get(`${resource}/${key}`)
  },

  /**
   * تحديث حزمة من الإعدادات دفعة واحدة
   */
  updateSettings(payload) {
    return apiClient.put(resource, payload)
  },
}
